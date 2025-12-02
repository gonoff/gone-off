'use client'

import dynamic from 'next/dynamic'
import { useGame } from '@/contexts/GameContext'
import { LoginScreen } from '@/components/game/LoginScreen'
import { WelcomeBackModal } from '@/components/game/WelcomeBackModal'
import { HPBar } from '@/components/fight/HPBar'
import { TapZone } from '@/components/fight/TapZone'
import { DamageNumbers } from '@/components/fight/DamageNumbers'
import { formatNumber } from '@/lib/game/formulas'
import { motion } from 'framer-motion'
import { useState, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Zap, Target, Gift } from 'lucide-react'

// Dynamic import for 3D boss (SSR disabled)
const Boss3D = dynamic(
  () => import('@/components/fight/Boss3D').then((mod) => mod.Boss3D),
  { ssr: false, loading: () => <BossPlaceholder /> }
)

function BossPlaceholder() {
  return (
    <div className="w-full h-64 flex items-center justify-center">
      <div className="w-24 h-24 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  )
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
  } = useGame()

  const [isHit, setIsHit] = useState(false)
  const [isDead, setIsDead] = useState(false)

  const handleTap = useCallback(
    (x: number, y: number) => {
      tap(x, y)
      setIsHit(true)
      setTimeout(() => setIsHit(false), 100)

      // Check if boss will die
      if (boss.hp <= 0) {
        setIsDead(true)
        setTimeout(() => setIsDead(false), 500)
      }
    },
    [tap, boss.hp]
  )

  // Get equipped weapon for stats display
  const equippedWeapon = inventory.find(
    (i) => i.id === gameState.equippedWeaponId && i.type === 'weapon'
  )

  // Calculate displayed stats
  const tapPowerLevel = upgrades.find((u) => u.upgradeType === 'tap_power')?.level ?? 0
  const critChanceLevel = upgrades.find((u) => u.upgradeType === 'crit_chance')?.level ?? 0
  const baseDamage = 1 + (equippedWeapon?.damageBonus ?? 0)
  const displayDamage = Math.floor(baseDamage * (1 + tapPowerLevel * 0.1))
  const critChance = Math.floor((5 + critChanceLevel) * 100) / 100

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
      <WelcomeBackModal />

      <div className="h-full flex flex-col p-4 relative">
        {/* Stage Info */}
        <div className="text-center mb-2">
          <div className="flex items-center justify-center gap-2">
            <Badge
              variant="outline"
              className={`font-mono ${
                boss.isMajor
                  ? 'border-purple-500 text-purple-400'
                  : boss.isNamed
                  ? 'border-red-500 text-red-400'
                  : boss.isMini
                  ? 'border-yellow-500 text-yellow-400'
                  : 'border-primary text-primary'
              }`}
            >
              STAGE {gameState.currentStage}
            </Badge>
            {boss.isMajor && (
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500">
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

        {/* 3D Boss */}
        <div className="relative flex-shrink-0">
          <Boss3D
            stage={gameState.currentStage}
            isHit={isHit}
            isDead={isDead}
            hpPercent={boss.hp / boss.maxHp}
          />
          <DamageNumbers damages={damageNumbers} />
        </div>

        {/* Boss Info */}
        <div className="text-center mb-3 space-y-1">
          <motion.h2
            key={boss.name}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-display font-bold text-primary text-glow-primary"
          >
            {boss.name}
          </motion.h2>
          <motion.p
            key={boss.flavor}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-muted-foreground italic"
          >
            &quot;{boss.flavor}&quot;
          </motion.p>
        </div>

        {/* HP Bar */}
        <div className="mb-4">
          <HPBar current={boss.hp} max={boss.maxHp} />
        </div>

        {/* Tap Zone */}
        <div className="flex-1 min-h-0 flex flex-col justify-center">
          <TapZone onTap={handleTap} />
        </div>

        {/* Stats Bar */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/30 rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
              <Zap className="w-3 h-3" /> DMG
            </div>
            <div className="font-mono font-bold text-foreground">
              {formatNumber(displayDamage)}
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
              <Target className="w-3 h-3" /> CRIT
            </div>
            <div className="font-mono font-bold text-foreground">{critChance}%</div>
          </div>

          <div className="bg-muted/30 rounded-lg p-2">
            <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
              <Gift className="w-3 h-3" /> REWARD
            </div>
            <div className="font-mono font-bold text-scrap">
              {formatNumber(boss.rewards.scrap)}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
