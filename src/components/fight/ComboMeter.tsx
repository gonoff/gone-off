'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Flame } from 'lucide-react'

interface ComboMeterProps {
  combo: number
  multiplier: number
  isActive: boolean
}

export function ComboMeter({ combo, multiplier, isActive }: ComboMeterProps) {
  if (!isActive || combo < 2) return null

  const getComboColor = () => {
    if (combo >= 50) return 'from-purple-500 to-pink-500'
    if (combo >= 30) return 'from-red-500 to-orange-500'
    if (combo >= 15) return 'from-orange-500 to-yellow-500'
    if (combo >= 5) return 'from-yellow-500 to-green-500'
    return 'from-cyan-500 to-blue-500'
  }

  const getComboText = () => {
    if (combo >= 50) return 'UNSTOPPABLE!'
    if (combo >= 30) return 'RAMPAGE!'
    if (combo >= 15) return 'ON FIRE!'
    if (combo >= 5) return 'COMBO!'
    return ''
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5, x: 50 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.5, x: 50 }}
        className="absolute top-4 right-4 z-20"
      >
        <div className={`relative px-4 py-2 rounded-xl bg-gradient-to-r ${getComboColor()} shadow-lg`}>
          {/* Fire effect for high combos */}
          {combo >= 15 && (
            <motion.div
              className="absolute -top-2 left-1/2 -translate-x-1/2"
              animate={{ y: [-2, -6, -2], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 0.3, repeat: Infinity }}
            >
              <Flame className="w-6 h-6 text-orange-300" />
            </motion.div>
          )}

          <div className="flex items-center gap-2">
            <motion.span
              key={combo}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold font-mono text-white drop-shadow-lg"
            >
              {combo}x
            </motion.span>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                {getComboText()}
              </span>
              <span className="text-xs font-mono text-white/90">
                {multiplier.toFixed(1)}x DMG
              </span>
            </div>
          </div>

          {/* Combo bar decay */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-b-xl overflow-hidden"
          >
            <motion.div
              className="h-full bg-white"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 2, ease: 'linear' }}
            />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
