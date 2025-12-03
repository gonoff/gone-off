'use client'

import { motion } from 'framer-motion'
import { useGame } from '@/contexts/GameContext'
import { Cog, Lock, Cpu, Database, Crosshair, Zap, Plus } from 'lucide-react'
import { formatNumber, getMachineCost, getMachineProduction } from '@/lib/game/formulas'
import { MACHINE_CONFIGS } from '@/lib/game/constants'
import { MachineType } from '@/lib/game/types'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'sonner'

const machineIcons: Record<MachineType, React.ReactNode> = {
  scrap_collector: <Cog className="w-8 h-8" />,
  data_miner: <Database className="w-8 h-8" />,
  auto_turret: <Crosshair className="w-8 h-8" />,
  efficiency_bot: <Zap className="w-8 h-8" />,
}

const machineColors: Record<MachineType, string> = {
  scrap_collector: 'text-yellow-400 border-yellow-400/50',
  data_miner: 'text-cyan-400 border-cyan-400/50',
  auto_turret: 'text-red-400 border-red-400/50',
  efficiency_bot: 'text-purple-400 border-purple-400/50',
}

export default function MachinesPage() {
  const { gameState, machines, upgrades, buyMachine } = useGame()
  const [purchasing, setPurchasing] = useState<MachineType | null>(null)

  const handleBuy = async (machineType: MachineType) => {
    if (purchasing) return
    setPurchasing(machineType)

    const success = await buyMachine(machineType)
    if (success) {
      toast.success('Machine upgraded!')
    } else {
      toast.error('Purchase failed', {
        description: 'Please check your balance and try again.',
      })
    }
    setPurchasing(null)
  }

  const getMachineLevel = (type: MachineType) => {
    return machines?.find((m) => m.machineType === type)?.level ?? 0
  }

  const canAfford = (type: MachineType) => {
    const config = MACHINE_CONFIGS[type]
    const level = getMachineLevel(type)
    const cost = getMachineCost(type, level)

    if (config.costCurrency === 'scrap') {
      return gameState.scrap >= cost
    }
    return gameState.dataPoints >= cost
  }

  const isUnlocked = (type: MachineType) => {
    return gameState.highestStage >= MACHINE_CONFIGS[type].unlockStage
  }

  return (
    <div className="flex flex-col h-full p-4 space-y-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Cpu className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-orbitron font-bold text-primary">MACHINES</h1>
      </div>

      {/* Info */}
      <div className="p-3 rounded-lg bg-accent/30 border border-border/30">
        <p className="text-xs text-muted-foreground">
          Build autonomous machines to generate resources while you're away.
          Higher levels produce more resources per second.
        </p>
      </div>

      {/* Machines Grid */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {(Object.keys(MACHINE_CONFIGS) as MachineType[]).map((type, index) => {
          const config = MACHINE_CONFIGS[type]
          const level = getMachineLevel(type)
          const cost = getMachineCost(type, level)
          const production = getMachineProduction(type, level)
          const nextProduction = getMachineProduction(type, level + 1)
          const unlocked = isUnlocked(type)
          const affordable = canAfford(type)

          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'relative p-4 rounded-xl border-2 bg-card/80 backdrop-blur-sm transition-all',
                unlocked ? machineColors[type] : 'border-border/30 opacity-50'
              )}
            >
              {/* Locked Overlay */}
              {!unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl z-10">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Lock className="w-5 h-5" />
                    <span className="font-mono text-sm">Unlocks at Stage {config.unlockStage}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={cn(
                  'w-16 h-16 rounded-xl flex items-center justify-center border-2 bg-background/50',
                  machineColors[type]
                )}>
                  <motion.div
                    animate={level > 0 ? { rotate: 360 } : {}}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    {machineIcons[type]}
                  </motion.div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">{config.name}</h3>
                    <span className="text-sm font-mono text-muted-foreground">
                      Lv. {level}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {config.description}
                  </p>

                  {/* Production Stats */}
                  <div className="mt-2 flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Current:</span>
                      <span className={cn(
                        'font-mono font-bold',
                        type === 'scrap_collector' && 'text-yellow-400',
                        type === 'data_miner' && 'text-cyan-400',
                        type === 'auto_turret' && 'text-red-400',
                        type === 'efficiency_bot' && 'text-purple-400',
                      )}>
                        {formatNumber(production)}/s
                      </span>
                    </div>
                    {level > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Next:</span>
                        <span className="font-mono text-green-400">
                          {formatNumber(nextProduction)}/s
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Buy Button */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm font-mono">
                  <span className={cn(
                    config.costCurrency === 'scrap'
                      ? (gameState.scrap >= cost ? 'text-yellow-400' : 'text-red-400')
                      : (gameState.dataPoints >= cost ? 'text-cyan-400' : 'text-red-400')
                  )}>
                    {formatNumber(cost)} {config.costCurrency === 'scrap' ? 'Scrap' : 'Data'}
                  </span>
                </div>

                <button
                  onClick={() => handleBuy(type)}
                  disabled={!unlocked || !affordable || purchasing === type}
                  className={cn(
                    'flex items-center gap-1 px-4 py-2 rounded-lg font-medium text-sm transition-all',
                    affordable && unlocked
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  {purchasing === type ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      {level === 0 ? 'Build' : 'Upgrade'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
