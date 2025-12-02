'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  type: 'scrap' | 'data'
  size: number
}

interface LootExplosionProps {
  trigger: boolean
  scrapAmount: number
  dataAmount: number
  onComplete?: () => void
}

export function LootExplosion({ trigger, scrapAmount, dataAmount, onComplete }: LootExplosionProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    if (trigger && (scrapAmount > 0 || dataAmount > 0)) {
      // Generate particles
      const newParticles: Particle[] = []
      const scrapCount = Math.min(Math.ceil(scrapAmount / 10), 15)
      const dataCount = Math.min(Math.ceil(dataAmount / 5), 10)

      for (let i = 0; i < scrapCount; i++) {
        newParticles.push({
          id: i,
          x: 50 + (Math.random() - 0.5) * 20,
          y: 50 + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 100,
          vy: -Math.random() * 80 - 20,
          type: 'scrap',
          size: 8 + Math.random() * 8,
        })
      }

      for (let i = 0; i < dataCount; i++) {
        newParticles.push({
          id: scrapCount + i,
          x: 50 + (Math.random() - 0.5) * 20,
          y: 50 + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 100,
          vy: -Math.random() * 80 - 20,
          type: 'data',
          size: 6 + Math.random() * 6,
        })
      }

      setParticles(newParticles)
      setShowText(true)

      // Clear after animation
      const timer = setTimeout(() => {
        setParticles([])
        setShowText(false)
        onComplete?.()
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [trigger, scrapAmount, dataAmount, onComplete])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className={`absolute rounded-full ${
              particle.type === 'scrap'
                ? 'bg-yellow-400 shadow-yellow-400/50'
                : 'bg-cyan-400 shadow-cyan-400/50'
            }`}
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              boxShadow: `0 0 ${particle.size}px currentColor`,
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{
              x: particle.vx,
              y: particle.vy + 100,
              scale: [0, 1.5, 0],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>

      {/* Reward text */}
      <AnimatePresence>
        {showText && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            {scrapAmount > 0 && (
              <motion.div
                className="text-2xl font-bold font-mono text-yellow-400 drop-shadow-lg"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3 }}
              >
                +{scrapAmount} SCRAP
              </motion.div>
            )}
            {dataAmount > 0 && (
              <motion.div
                className="text-xl font-bold font-mono text-cyan-400 drop-shadow-lg"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                +{dataAmount} DATA
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
