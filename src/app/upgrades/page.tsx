'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '@/contexts/GameContext'
import { ArrowUp, Zap, Sparkles, Lock, Star, Infinity } from 'lucide-react'
import { formatNumber, getUpgradeCost } from '@/lib/game/formulas'
import { TEMP_UPGRADE_CONFIGS, PERM_UPGRADE_CONFIGS } from '@/lib/game/constants'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Tab = 'temporary' | 'permanent'

export default function UpgradesPage() {
  const { gameState, upgrades, buyUpgrade } = useGame()
  const [activeTab, setActiveTab] = useState<Tab>('temporary')
  const [purchasing, setPurchasing] = useState<string | null>(null)

  const handleBuy = async (upgradeType: string, isPermanent: boolean) => {
    if (purchasing) return
    setPurchasing(upgradeType)

    const success = await buyUpgrade(upgradeType, isPermanent)
    if (success) {
      toast.success('Upgrade purchased!')
    } else {
      toast.error('Purchase failed', {
        description: 'Please check your balance and try again.',
      })
    }
    setPurchasing(null)
  }

  const getUpgradeLevel = (type: string) => {
    return upgrades?.find((u) => u.upgradeType === type)?.level ?? 0
  }

  const canAfford = (type: string, isPermanent: boolean) => {
    const level = getUpgradeLevel(type)
    const cost = getUpgradeCost(type, level, isPermanent)
    const configs = isPermanent ? PERM_UPGRADE_CONFIGS : TEMP_UPGRADE_CONFIGS
    const config = configs.find((c) => c.type === type)

    if (!config) return false

    if (config.costCurrency === 'scrap') return gameState.scrap >= cost
    if (config.costCurrency === 'data') return gameState.dataPoints >= cost
    return gameState.coreFragments >= cost
  }

  const isMaxLevel = (type: string, isPermanent: boolean) => {
    const level = getUpgradeLevel(type)
    const configs = isPermanent ? PERM_UPGRADE_CONFIGS : TEMP_UPGRADE_CONFIGS
    const config = configs.find((c) => c.type === type)
    return config?.maxLevel !== null && level >= (config?.maxLevel ?? 0)
  }

  const currentConfigs = activeTab === 'permanent' ? PERM_UPGRADE_CONFIGS : TEMP_UPGRADE_CONFIGS
  const isPermanent = activeTab === 'permanent'

  return (
    <div className="flex flex-col h-full p-4 space-y-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ArrowUp className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-orbitron font-bold text-primary">UPGRADES</h1>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 bg-background/50 rounded-lg border border-border/30">
        <button
          onClick={() => setActiveTab('temporary')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all',
            activeTab === 'temporary'
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          )}
        >
          <Zap className="w-4 h-4" />
          Temporary
        </button>
        <button
          onClick={() => setActiveTab('permanent')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all',
            activeTab === 'permanent'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          )}
        >
          <Sparkles className="w-4 h-4" />
          Permanent
        </button>
      </div>

      {/* Info Box */}
      <div className={cn(
        'p-3 rounded-lg border',
        isPermanent
          ? 'bg-purple-500/10 border-purple-500/30'
          : 'bg-yellow-500/10 border-yellow-500/30'
      )}>
        <p className="text-xs text-muted-foreground">
          {isPermanent
            ? 'Permanent upgrades persist through System Reboot (prestige). Buy with Core Fragments.'
            : 'Temporary upgrades reset on System Reboot. Buy with Scrap or Data.'}
        </p>
      </div>

      {/* Upgrades List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {currentConfigs.map((config, index) => {
          const level = getUpgradeLevel(config.type)
          const cost = getUpgradeCost(config.type, level, isPermanent)
          const affordable = canAfford(config.type, isPermanent)
          const maxed = isMaxLevel(config.type, isPermanent)
          const totalEffect = level * config.effect

          return (
            <motion.div
              key={config.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'p-4 rounded-xl border-2 bg-card/80 backdrop-blur-sm transition-all',
                isPermanent
                  ? 'border-purple-500/30 hover:border-purple-500/60'
                  : 'border-yellow-500/30 hover:border-yellow-500/60'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{config.name}</h3>
                    {config.maxLevel === null ? (
                      <Infinity className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <span className="text-xs font-mono text-muted-foreground">
                        {level}/{config.maxLevel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {config.description}
                  </p>

                  {/* Effect Display */}
                  <div className="mt-2 flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Effect:</span>
                      <span className={cn(
                        'font-mono font-bold',
                        isPermanent ? 'text-purple-400' : 'text-yellow-400'
                      )}>
                        +{totalEffect}% {config.name.split(' ')[0]}
                      </span>
                    </div>
                    {!maxed && (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Next:</span>
                        <span className="font-mono text-green-400">
                          +{totalEffect + config.effect}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Level Indicator */}
                <div className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center border-2',
                  isPermanent ? 'border-purple-500/50' : 'border-yellow-500/50',
                  'bg-background/50'
                )}>
                  <span className="text-lg font-bold font-mono">{level}</span>
                </div>
              </div>

              {/* Buy Section */}
              <div className="mt-3 flex items-center justify-between pt-3 border-t border-border/30">
                {maxed ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <Star className="w-4 h-4" />
                    <span className="text-sm font-medium">MAX LEVEL</span>
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-mono">
                      <span className={cn(
                        config.costCurrency === 'scrap' && (gameState.scrap >= cost ? 'text-yellow-400' : 'text-red-400'),
                        config.costCurrency === 'data' && (gameState.dataPoints >= cost ? 'text-cyan-400' : 'text-red-400'),
                        config.costCurrency === 'core_fragments' && (gameState.coreFragments >= cost ? 'text-purple-400' : 'text-red-400'),
                      )}>
                        {formatNumber(cost)}{' '}
                        {config.costCurrency === 'scrap' && 'Scrap'}
                        {config.costCurrency === 'data' && 'Data'}
                        {config.costCurrency === 'core_fragments' && 'Core Fragments'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleBuy(config.type, isPermanent)}
                      disabled={!affordable || purchasing === config.type}
                      className={cn(
                        'flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-sm transition-all',
                        affordable
                          ? isPermanent
                            ? 'bg-purple-600 text-white hover:bg-purple-500'
                            : 'bg-yellow-600 text-black hover:bg-yellow-500'
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                      )}
                    >
                      {purchasing === config.type ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        <>
                          <ArrowUp className="w-4 h-4" />
                          Upgrade
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
