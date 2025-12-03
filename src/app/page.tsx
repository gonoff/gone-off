'use client'

import dynamic from 'next/dynamic'
import { useGame } from '@/contexts/GameContext'
import { LoginScreen } from '@/components/game/LoginScreen'
import { WelcomeBackModal } from '@/components/game/WelcomeBackModal'
import { HPBar } from '@/components/fight/HPBar'
import { TapZone } from '@/components/fight/TapZone'
import { DamageNumbers } from '@/components/fight/DamageNumbers'
import { ComboMeter } from '@/components/fight/ComboMeter'
import { SkillBar, SKILLS } from '@/components/fight/SkillBar'
import { LootExplosion } from '@/components/fight/LootExplosion'
import { BackgroundEffects } from '@/components/fight/BackgroundEffects'
import { ScreenEffects } from '@/components/fight/ScreenEffects'
import { formatNumber } from '@/lib/game/formulas'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useCallback, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Zap, Target, Gift, Flame, Sparkles, Crosshair } from 'lucide-react'

// Dynamic import for 3D boss (SSR disabled)
const Boss3D = dynamic(
  () => import('@/components/fight/Boss3D').then((mod) => mod.Boss3D),
  { ssr: false, loading: () => <BossPlaceholder /> }
)

function BossPlaceholder() {
  return (
    <div className="w-full h-56 flex items-center justify-center">
      <div className="w-24 h-24 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )
}

// Combo config
const COMBO_TIMEOUT = 2000 // 2 seconds to maintain combo
const getComboMultiplier = (combo: number) => {
  if (combo < 5) return 1
  if (combo < 15) return 1 + (combo - 5) * 0.1 // 1.0 - 2.0
  if (combo < 30) return 2 + (combo - 15) * 0.1 // 2.0 - 3.5
  if (combo < 50) return 3.5 + (combo - 30) * 0.1 // 3.5 - 5.5
  return 5.5 + (combo - 50) * 0.05 // 5.5+
}

export default function FightPage() {
  const {
    isAuthenticated,
    isLoading,
    gameState,
    boss,
    damageNumbers,
    tap,
    upgrades,
    inventory,
    machines,
    activeEffects,
    useSkill,
  } = useGame()

  // Combat state
  const [isHit, setIsHit] = useState(false)
  const [isDead, setIsDead] = useState(false)
  const [combo, setCombo] = useState(0)
  const [lastTapTime, setLastTapTime] = useState(0)
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set())

  // Screen effects state
  const [screenShake, setScreenShake] = useState(false)
  const [screenFlash, setScreenFlash] = useState<'none' | 'hit' | 'crit' | 'death'>('none')
  const [stageClear, setStageClear] = useState<number | null>(null)
  const [lootTrigger, setLootTrigger] = useState(false)
  const [lastRewards, setLastRewards] = useState({ scrap: 0, data: 0 })

  // Skills state
  const [skillCooldowns, setSkillCooldowns] = useState<Record<string, number>>({})

  // Helper to create tracked timeouts that are cleaned up on unmount
  const safeTimeout = useCallback((callback: () => void, delay: number) => {
    const id = setTimeout(() => {
      timeoutsRef.current.delete(id)
      callback()
    }, delay)
    timeoutsRef.current.add(id)
    return id
  }, [])

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      if (comboTimeoutRef.current) {
        clearTimeout(comboTimeoutRef.current)
      }
      timeoutsRef.current.forEach((id) => clearTimeout(id))
      timeoutsRef.current.clear()
    }
  }, [])

  // Derive active buffs from context activeEffects
  const now = Date.now()
  const activeBuffs = {
    damageBoost: activeEffects
      .filter(e => e.type === 'damage_boost' && e.endsAt > now)
      .reduce((mult, e) => mult * e.value, 1),
    rewardBoost: activeEffects
      .filter(e => e.type === 'reward_boost' && e.endsAt > now)
      .reduce((mult, e) => mult * e.value, 1),
    scrapBoost: activeEffects
      .filter(e => e.type === 'scrap_boost' && e.endsAt > now)
      .reduce((mult, e) => mult * e.value, 1),
    dataBoost: activeEffects
      .filter(e => e.type === 'data_boost' && e.endsAt > now)
      .reduce((mult, e) => mult * e.value, 1),
  }

  // Track previous stage for stage clear detection
  const prevStageRef = useRef(gameState.currentStage)
  // Track current boss rewards (to show correct loot on defeat)
  const currentBossRewardsRef = useRef(boss.rewards)

  // Skill cooldown tick
  useEffect(() => {
    const interval = setInterval(() => {
      setSkillCooldowns((prev) => {
        const newCooldowns: Record<string, number> = {}
        for (const [id, cd] of Object.entries(prev)) {
          if (cd > 0) {
            newCooldowns[id] = Math.max(0, cd - 0.1)
          }
        }
        return newCooldowns
      })
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // Detect stage changes for celebration
  useEffect(() => {
    if (gameState.currentStage > prevStageRef.current) {
      const newStage = gameState.currentStage

      // Save rewards for loot explosion (use ref which has PREVIOUS boss rewards)
      setLastRewards({
        scrap: currentBossRewardsRef.current?.scrap ?? 0,
        data: currentBossRewardsRef.current?.data ?? 0,
      })

      // Trigger loot explosion
      setLootTrigger(true)

      // Stage clear celebration for milestones
      if ((newStage - 1) % 10 === 0) {
        setStageClear(newStage - 1)
        safeTimeout(() => setStageClear(null), 2000)
      }

      prevStageRef.current = newStage
      // Update ref to new boss rewards for next defeat
      currentBossRewardsRef.current = boss.rewards
    }
  }, [gameState.currentStage, boss.rewards, safeTimeout])

  const handleTap = useCallback(
    (x: number, y: number) => {
      const now = Date.now()

      // Update combo
      if (now - lastTapTime < COMBO_TIMEOUT) {
        setCombo((c) => c + 1)
      } else {
        setCombo(1)
      }
      setLastTapTime(now)

      // Reset combo timeout
      if (comboTimeoutRef.current) {
        clearTimeout(comboTimeoutRef.current)
      }
      comboTimeoutRef.current = setTimeout(() => {
        setCombo(0)
      }, COMBO_TIMEOUT)

      // Perform tap
      tap(x, y)

      // Hit effects
      setIsHit(true)
      safeTimeout(() => setIsHit(false), 100)

      // Check if this was a crit (we can check from the latest damage number)
      const lastDamage = damageNumbers[damageNumbers.length - 1]
      if (lastDamage?.isCritical) {
        setScreenFlash('crit')
        setScreenShake(true)
        safeTimeout(() => {
          setScreenFlash('none')
          setScreenShake(false)
        }, 150)
      }

      // Check if boss will die
      if (boss.hp <= 0) {
        setIsDead(true)
        setScreenFlash('death')
        setScreenShake(true)
        safeTimeout(() => {
          setIsDead(false)
          setScreenFlash('none')
          setScreenShake(false)
        }, 500)
      }
    },
    [tap, boss.hp, lastTapTime, damageNumbers, safeTimeout]
  )

  const handleLootComplete = useCallback(() => {
    setLootTrigger(false)
  }, [])

  const handleUseSkill = useCallback((skillId: string) => {
    const skill = SKILLS.find((s) => s.id === skillId)
    if (!skill || (skillCooldowns[skillId] ?? 0) > 0) return

    // Put skill on cooldown
    setSkillCooldowns((prev) => ({
      ...prev,
      [skillId]: skill.cooldown,
    }))

    // Apply skill effect via context
    useSkill(skillId, skill.effect)

    // Visual feedback based on skill type
    if (skill.effect.type === 'damage_boost') {
      setScreenFlash('crit')
      safeTimeout(() => setScreenFlash('none'), 200)
    } else if (skill.effect.type === 'instant_damage') {
      setScreenShake(true)
      setScreenFlash('hit')
      setIsHit(true)
      safeTimeout(() => {
        setScreenShake(false)
        setScreenFlash('none')
        setIsHit(false)
      }, 300)
    } else if (skill.effect.type === 'reward_boost') {
      setScreenFlash('crit')
      safeTimeout(() => setScreenFlash('none'), 200)
    }
  }, [skillCooldowns, useSkill, safeTimeout])

  // Get equipped weapon for stats display
  const equippedWeapon = inventory.find(
    (i) => i.id === gameState.equippedWeaponId && i.type === 'weapon'
  )

  // Calculate displayed stats
  const tapPowerLevel = upgrades.find((u) => u.upgradeType === 'tap_power')?.level ?? 0
  const critChanceLevel = upgrades.find((u) => u.upgradeType === 'crit_chance')?.level ?? 0
  const baseDamage = 1 + (equippedWeapon?.damageBonus ?? 0)
  const comboMult = getComboMultiplier(combo)
  const displayDamage = Math.floor(baseDamage * (1 + tapPowerLevel * 0.1) * comboMult * activeBuffs.damageBoost)
  const critChance = Math.floor((5 + critChanceLevel) * 100) / 100

  // Skills with current cooldowns
  const skillsWithCooldowns = SKILLS.map((skill) => ({
    ...skill,
    currentCooldown: skillCooldowns[skill.id] ?? 0,
  }))

  if (!isAuthenticated && !isLoading) {
    return <LoginScreen />
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <BackgroundEffects />
      <ScreenEffects shake={screenShake} flash={screenFlash} stageClear={stageClear} />
      <WelcomeBackModal />

      <div className="h-full flex flex-col p-2 relative z-10">
        {/* Stage Info */}
        <div className="text-center mb-1">
          <div className="flex items-center justify-center gap-2">
            <Badge
              variant="outline"
              className={`font-mono text-sm ${
                boss.isMajor
                  ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                  : boss.isNamed
                  ? 'border-red-500 text-red-400 bg-red-500/10'
                  : boss.isMini
                  ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                  : 'border-primary text-primary bg-primary/10'
              }`}
            >
              STAGE {gameState.currentStage}
            </Badge>
            {boss.isMajor && (
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500 animate-pulse">
                MAJOR BOSS
              </Badge>
            )}
            {boss.isNamed && !boss.isMajor && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500">
                NAMED BOSS
              </Badge>
            )}
            {boss.isMini && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500">
                MINI BOSS
              </Badge>
            )}
          </div>
        </div>

        {/* Combo Meter */}
        <ComboMeter
          combo={combo}
          multiplier={comboMult}
          isActive={combo >= 2}
        />

        {/* Active Buffs Indicator */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-1">
          <AnimatePresence>
            {activeBuffs.damageBoost > 1 && (
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-500 rounded-lg flex items-center gap-2"
              >
                <Flame className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-bold text-yellow-400">{activeBuffs.damageBoost}x DMG</span>
              </motion.div>
            )}
            {activeBuffs.scrapBoost > 1 && (
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="px-3 py-1.5 bg-green-500/20 border border-green-500 rounded-lg flex items-center gap-2"
              >
                <Gift className="w-4 h-4 text-green-400" />
                <span className="text-sm font-bold text-green-400">{activeBuffs.scrapBoost}x SCRAP</span>
              </motion.div>
            )}
            {activeBuffs.dataBoost > 1 && (
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="px-3 py-1.5 bg-cyan-500/20 border border-cyan-500 rounded-lg flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-cyan-400">{activeBuffs.dataBoost}x DATA</span>
              </motion.div>
            )}
            {/* Auto Turret DPS Indicator */}
            {(() => {
              if (!machines || machines.length === 0) return null
              const autoTurret = machines.find(m => m.machineType === 'auto_turret')
              if (!autoTurret || autoTurret.level === 0) return null
              const turretDps = Math.pow(2, autoTurret.level - 1) // Same formula as getMachineProduction
              return (
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="px-3 py-1.5 bg-red-500/20 border border-red-500 rounded-lg flex items-center gap-2"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                  >
                    <Crosshair className="w-4 h-4 text-red-400" />
                  </motion.div>
                  <span className="text-sm font-bold text-red-400">{turretDps} DPS</span>
                </motion.div>
              )
            })()}
          </AnimatePresence>
        </div>

        {/* 3D Boss */}
        <div className="relative flex-shrink-0">
          <Boss3D
            stage={gameState.currentStage}
            isHit={isHit}
            isDead={isDead}
            hpPercent={boss.hp / boss.maxHp}
          />
          <DamageNumbers damages={damageNumbers} />
          <LootExplosion
            trigger={lootTrigger}
            scrapAmount={lastRewards.scrap}
            dataAmount={lastRewards.data}
            onComplete={handleLootComplete}
          />
        </div>

        {/* Boss Info */}
        <div className="text-center mb-1 space-y-0">
          <motion.h2
            key={boss.name}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-display font-bold text-primary text-glow-primary"
          >
            {boss.name}
          </motion.h2>
          <motion.p
            key={boss.flavor}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xs text-muted-foreground italic"
          >
            &quot;{boss.flavor}&quot;
          </motion.p>
        </div>

        {/* HP Bar */}
        <div className="mb-2">
          <HPBar current={boss.hp} max={boss.maxHp} />
        </div>

        {/* Skills */}
        <SkillBar skills={skillsWithCooldowns} onUseSkill={handleUseSkill} />

        {/* Tap Zone */}
        <div className="flex-1 min-h-0 flex flex-col justify-center mt-1">
          <TapZone onTap={handleTap} comboActive={combo >= 5} />
        </div>

        {/* Stats Bar */}
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <motion.div
            className="bg-muted/40 rounded-xl p-2 border border-border/30"
            animate={activeBuffs.damageBoost > 1 ? { borderColor: ['#facc15', '#fbbf24', '#facc15'] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-0.5">
              <Zap className="w-3 h-3" /> DMG
            </div>
            <div className={`font-mono font-bold ${
              activeBuffs.damageBoost > 1 ? 'text-yellow-400' : combo >= 5 ? 'text-orange-400' : 'text-foreground'
            }`}>
              {formatNumber(displayDamage)}
            </div>
          </motion.div>

          <div className="bg-muted/40 rounded-xl p-2 border border-border/30">
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-0.5">
              <Target className="w-3 h-3" /> CRIT
            </div>
            <div className="font-mono font-bold text-foreground">{critChance}%</div>
          </div>

          <motion.div
            className="bg-muted/40 rounded-xl p-2 border border-border/30"
            animate={(activeBuffs.rewardBoost > 1 || activeBuffs.scrapBoost > 1) ? { borderColor: ['#22c55e', '#16a34a', '#22c55e'] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-0.5">
              <Gift className="w-3 h-3" /> REWARD
              {activeBuffs.scrapBoost > 1 && <span className="text-green-400 text-[10px]">x{activeBuffs.scrapBoost}</span>}
            </div>
            <div className={`font-mono font-bold ${
              (activeBuffs.rewardBoost > 1 || activeBuffs.scrapBoost > 1) ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {formatNumber(Math.floor(boss.rewards.scrap * activeBuffs.rewardBoost * activeBuffs.scrapBoost))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
