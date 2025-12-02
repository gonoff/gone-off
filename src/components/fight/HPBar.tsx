'use client'

import { motion } from 'framer-motion'
import { formatNumber } from '@/lib/game/formulas'
import { useMemo } from 'react'

interface HPBarProps {
  current: number
  max: number
  showValues?: boolean
}

export function HPBar({ current, max, showValues = true }: HPBarProps) {
  const percent = useMemo(() => Math.max(0, Math.min(100, (current / max) * 100)), [current, max])

  const barColor = useMemo(() => {
    if (percent > 60) return 'bg-green-500'
    if (percent > 30) return 'bg-yellow-500'
    return 'bg-red-500'
  }, [percent])

  const glowColor = useMemo(() => {
    if (percent > 60) return 'shadow-green-500/50'
    if (percent > 30) return 'shadow-yellow-500/50'
    return 'shadow-red-500/50'
  }, [percent])

  return (
    <div className="w-full space-y-1">
      <div className="relative h-6 bg-muted rounded-full overflow-hidden border border-border">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />

        {/* HP Fill */}
        <motion.div
          className={`absolute inset-y-0 left-0 ${barColor} shadow-lg ${glowColor}`}
          initial={{ width: '100%' }}
          
          animate={{ width: `${percent}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-black/20" />

          {/* Animated shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>

        {/* HP Text */}
        {showValues && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-sm font-bold text-white drop-shadow-lg">
              {formatNumber(current)} / {formatNumber(max)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
