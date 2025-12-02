'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/contexts/GameContext'
import {
  User,
  Trophy,
  Skull,
  Zap,
  RotateCcw,
  AlertTriangle,
  LogOut,
  TrendingUp,
  Clock,
  Target,
  Sparkles,
} from 'lucide-react'
import { formatNumber, calculateCoreFragments } from '@/lib/game/formulas'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const { username, gameState, prestigeStats, upgrades, prestige, logout } = useGame()
  const [showPrestigeConfirm, setShowPrestigeConfirm] = useState(false)
  const [isPrestiging, setIsPrestiging] = useState(false)

  const prestigeBonusLevel = upgrades.find((u) => u.upgradeType === 'perm_prestige_bonus')?.level ?? 0
  const potentialReward = calculateCoreFragments(gameState.highestStage, prestigeBonusLevel)
  const canPrestige = gameState.highestStage >= 50

  const handlePrestige = async () => {
    if (!canPrestige || isPrestiging) return
    setIsPrestiging(true)
    const success = await prestige()
    setIsPrestiging(false)
    if (success) {
      setShowPrestigeConfirm(false)
    }
  }

  const stats = [
    { icon: <Trophy className="w-5 h-5 text-yellow-400" />, label: 'Highest Stage', value: gameState.highestStage },
    { icon: <Skull className="w-5 h-5 text-red-400" />, label: 'Bosses Destroyed', value: formatNumber(prestigeStats.lifetimeBossesKilled) },
    { icon: <Zap className="w-5 h-5 text-cyan-400" />, label: 'Total Taps', value: formatNumber(prestigeStats.lifetimeTaps) },
    { icon: <Target className="w-5 h-5 text-orange-400" />, label: 'Highest Hit', value: formatNumber(prestigeStats.highestDamageHit) },
    { icon: <RotateCcw className="w-5 h-5 text-purple-400" />, label: 'Total Reboots', value: prestigeStats.totalPrestiges },
    { icon: <Clock className="w-5 h-5 text-green-400" />, label: 'Fastest to 100', value: prestigeStats.fastestStage100 ? `${Math.floor(prestigeStats.fastestStage100 / 60)}m ${prestigeStats.fastestStage100 % 60}s` : 'N/A' },
  ]

  const lifetimeStats = [
    { label: 'Lifetime Scrap', value: formatNumber(prestigeStats.lifetimeScrap), color: 'text-yellow-400' },
    { label: 'Lifetime Data', value: formatNumber(prestigeStats.lifetimeData), color: 'text-cyan-400' },
    { label: 'Lifetime Core Fragments', value: formatNumber(prestigeStats.lifetimeCoreFragments), color: 'text-purple-400' },
  ]

  return (
    <div className="flex flex-col h-full p-4 space-y-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-orbitron font-bold text-primary">OPERATIVE</h1>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* User Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/50"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-2xl font-bold text-black">
            {username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="text-xl font-bold font-orbitron">{username}</h2>
            <p className="text-sm text-muted-foreground">Resistance Fighter</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full border border-primary/30">
                Stage {gameState.currentStage}
              </span>
              <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                {prestigeStats.totalPrestiges} Reboots
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 rounded-lg bg-card/80 border border-border/30"
            >
              <div className="flex items-center gap-2 mb-1">
                {stat.icon}
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-lg font-bold font-mono">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Lifetime Stats */}
        <div className="p-4 rounded-xl bg-card/80 border border-border/30">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Lifetime Earnings
          </h3>
          <div className="space-y-2">
            {lifetimeStats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className={cn('font-mono font-bold', stat.color)}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prestige Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'p-4 rounded-xl border-2',
            canPrestige
              ? 'bg-gradient-to-br from-purple-500/20 to-red-500/20 border-purple-500/50'
              : 'bg-card/50 border-border/30'
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <RotateCcw className={cn('w-5 h-5', canPrestige ? 'text-purple-400' : 'text-muted-foreground')} />
            <h3 className="font-bold">SYSTEM REBOOT</h3>
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            Reset your progress to gain Core Fragments. Keep permanent upgrades and unlock new power.
          </p>

          {!canPrestige ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span>Reach Stage 50 to unlock (Current: {gameState.highestStage})</span>
            </div>
          ) : (
            <>
              <div className="p-3 rounded-lg bg-background/50 border border-purple-500/30 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reward:</span>
                  <span className="font-mono font-bold text-purple-400 flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    +{formatNumber(potentialReward)} Core Fragments
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowPrestigeConfirm(true)}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-red-600 text-white font-bold hover:from-purple-500 hover:to-red-500 transition-all"
              >
                INITIATE REBOOT
              </button>
            </>
          )}
        </motion.div>
      </div>

      {/* Prestige Confirm Modal */}
      <AnimatePresence>
        {showPrestigeConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm p-6 rounded-2xl bg-card border-2 border-red-500/50"
            >
              <div className="flex items-center gap-2 text-red-400 mb-4">
                <AlertTriangle className="w-6 h-6" />
                <h2 className="text-xl font-bold font-orbitron">CONFIRM REBOOT</h2>
              </div>

              <div className="space-y-3 mb-6 text-sm">
                <p className="text-muted-foreground">
                  This will reset:
                </p>
                <ul className="list-disc list-inside text-red-400 space-y-1">
                  <li>Current stage progress</li>
                  <li>All Scrap and Data</li>
                  <li>Temporary upgrades</li>
                  <li>Machines</li>
                  <li>Inventory items</li>
                </ul>

                <p className="text-muted-foreground">
                  You will keep:
                </p>
                <ul className="list-disc list-inside text-green-400 space-y-1">
                  <li>Permanent upgrades</li>
                  <li>Core Fragments</li>
                  <li>Achievements</li>
                </ul>

                <div className="p-3 rounded-lg bg-purple-500/20 border border-purple-500/50 text-center">
                  <span className="text-muted-foreground">You will receive:</span>
                  <p className="text-xl font-bold text-purple-400 font-mono mt-1">
                    +{formatNumber(potentialReward)} Core Fragments
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowPrestigeConfirm(false)}
                  className="flex-1 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/80 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePrestige}
                  disabled={isPrestiging}
                  className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-red-600 text-white font-bold hover:from-purple-500 hover:to-red-500 transition-all"
                >
                  {isPrestiging ? 'Rebooting...' : 'CONFIRM'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
