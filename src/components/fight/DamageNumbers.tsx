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
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      <AnimatePresence>
        {damages.map((dmg) => {
          // Random horizontal drift
          const xDrift = (Math.random() - 0.5) * 60
          // Random rotation for more dynamic feel
          const rotation = (Math.random() - 0.5) * 30

          return (
            <motion.div
              key={dmg.id}
              className="absolute"
              style={{
                left: dmg.x,
                top: dmg.y,
                transformStyle: 'preserve-3d',
                perspective: '500px',
              }}
              initial={{
                opacity: 1,
                scale: dmg.isCritical ? 0 : 0.5,
                y: 0,
                x: 0,
                rotateX: dmg.isCritical ? -30 : 0,
                rotateZ: 0,
              }}
              animate={{
                opacity: 0,
                scale: dmg.isCritical ? 1.2 : 0.9,
                y: dmg.isCritical ? -120 : -80,
                x: xDrift,
                rotateX: 0,
                rotateZ: rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: dmg.isCritical ? 0.8 : 0.6,
                ease: 'easeOut',
                scale: {
                  type: 'spring',
                  damping: 10,
                  stiffness: 200,
                },
              }}
            >
              {dmg.isCritical ? (
                <div className="relative">
                  {/* Crit burst background */}
                  <motion.div
                    className="absolute inset-0 -m-4 rounded-full bg-yellow-400"
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ filter: 'blur(15px)' }}
                  />

                  {/* Star burst effect */}
                  {[0, 45, 90, 135].map((angle) => (
                    <motion.div
                      key={angle}
                      className="absolute top-1/2 left-1/2 w-1 h-8 bg-gradient-to-t from-transparent via-yellow-300 to-transparent"
                      style={{
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: 'center center',
                      }}
                      initial={{ scaleY: 0, opacity: 1 }}
                      animate={{ scaleY: 2, opacity: 0 }}
                      transition={{ duration: 0.4, delay: 0.05 }}
                    />
                  ))}

                  {/* CRIT! label */}
                  <motion.span
                    className="block text-center text-sm font-bold text-orange-300 tracking-widest"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.05 }}
                    style={{
                      textShadow: '0 0 10px rgba(251, 191, 36, 0.8), 0 0 20px rgba(251, 191, 36, 0.5)',
                    }}
                  >
                    CRIT!
                  </motion.span>

                  {/* Damage number */}
                  <motion.span
                    className="block text-center font-mono font-black text-4xl text-yellow-400"
                    style={{
                      textShadow: `
                        0 0 10px rgba(251, 191, 36, 1),
                        0 0 20px rgba(251, 191, 36, 0.8),
                        0 0 30px rgba(251, 191, 36, 0.6),
                        0 2px 0 rgba(0, 0, 0, 0.5),
                        0 4px 0 rgba(0, 0, 0, 0.3)
                      `,
                      WebkitTextStroke: '1px rgba(255, 220, 100, 0.5)',
                    }}
                    initial={{ scale: 2 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 8, stiffness: 300 }}
                  >
                    -{formatNumber(dmg.damage)}
                  </motion.span>
                </div>
              ) : (
                <div className="relative">
                  {/* Small hit burst */}
                  <motion.div
                    className="absolute inset-0 -m-2 rounded-full bg-red-500"
                    initial={{ scale: 0, opacity: 0.6 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ filter: 'blur(8px)' }}
                  />

                  {/* Damage number */}
                  <motion.span
                    className="block font-mono font-bold text-2xl"
                    style={{
                      color: '#f87171',
                      textShadow: `
                        0 0 8px rgba(248, 113, 113, 0.8),
                        0 0 15px rgba(248, 113, 113, 0.5),
                        0 2px 0 rgba(0, 0, 0, 0.5)
                      `,
                    }}
                  >
                    -{formatNumber(dmg.damage)}
                  </motion.span>
                </div>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* Floating hit particles layer */}
      <AnimatePresence>
        {damages
          .filter((d) => d.isCritical)
          .slice(-3)
          .map((dmg) =>
            Array.from({ length: 6 }).map((_, i) => {
              const angle = (i / 6) * Math.PI * 2
              const distance = 40 + Math.random() * 40
              return (
                <motion.div
                  key={`${dmg.id}-particle-${i}`}
                  className="absolute w-2 h-2 rounded-full bg-yellow-400"
                  style={{
                    left: dmg.x,
                    top: dmg.y,
                    boxShadow: '0 0 8px rgba(251, 191, 36, 1)',
                  }}
                  initial={{
                    x: 0,
                    y: 0,
                    scale: 1,
                    opacity: 1,
                  }}
                  animate={{
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance - 50,
                    scale: 0,
                    opacity: 0,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: 'easeOut',
                    delay: i * 0.02,
                  }}
                />
              )
            })
          )}
      </AnimatePresence>
    </div>
  )
}
