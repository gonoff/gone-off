'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { formatNumber } from '@/lib/game/formulas'

interface DamageNumber {
  id: string
  damage: number
  isCritical: boolean
  x: number
  y: number
}

interface DamageNumbersProps {
  damages: DamageNumber[]
}

export function DamageNumbers({ damages }: DamageNumbersProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {damages.map((dmg) => (
          <motion.div
            key={dmg.id}
            className={`absolute font-mono font-bold select-none ${
              dmg.isCritical
                ? 'text-3xl text-yellow-400 text-glow-secondary'
                : 'text-2xl text-red-400'
            }`}
            style={{
              left: dmg.x,
              top: dmg.y,
            }}
            initial={{
              opacity: 1,
              scale: dmg.isCritical ? 1.5 : 1,
              y: 0,
            }}
            animate={{
              opacity: 0,
              scale: dmg.isCritical ? 1 : 0.8,
              y: -80,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {dmg.isCritical && (
              <span className="text-xs block text-center">CRIT!</span>
            )}
            -{formatNumber(dmg.damage)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
