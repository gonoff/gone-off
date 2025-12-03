'use client'

import { useGame } from '@/contexts/GameContext'
import { formatNumber } from '@/lib/game/formulas'
import { motion, AnimatePresence } from 'framer-motion'
import { Cog, Database, Gem } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Header() {
  const { gameState, isAuthenticated } = useGame()
  const [prevScrap, setPrevScrap] = useState(gameState.scrap)
  const [prevData, setPrevData] = useState(gameState.dataPoints)
  const [prevCore, setPrevCore] = useState(gameState.coreFragments)
  const [scrapAnimation, setScrapAnimation] = useState<'up' | 'down' | null>(null)
  const [dataAnimation, setDataAnimation] = useState<'up' | 'down' | null>(null)
  const [coreAnimation, setCoreAnimation] = useState<'up' | 'down' | null>(null)

  // Animate currency changes
  useEffect(() => {
    if (gameState.scrap > prevScrap) {
      setScrapAnimation('up')
      setTimeout(() => setScrapAnimation(null), 500)
    } else if (gameState.scrap < prevScrap) {
      setScrapAnimation('down')
      setTimeout(() => setScrapAnimation(null), 500)
    }
    setPrevScrap(gameState.scrap)
  }, [gameState.scrap, prevScrap])

  useEffect(() => {
    if (gameState.dataPoints > prevData) {
      setDataAnimation('up')
      setTimeout(() => setDataAnimation(null), 500)
    } else if (gameState.dataPoints < prevData) {
      setDataAnimation('down')
      setTimeout(() => setDataAnimation(null), 500)
    }
    setPrevData(gameState.dataPoints)
  }, [gameState.dataPoints, prevData])

  useEffect(() => {
    if (gameState.coreFragments > prevCore) {
      setCoreAnimation('up')
      setTimeout(() => setCoreAnimation(null), 500)
    } else if (gameState.coreFragments < prevCore) {
      setCoreAnimation('down')
      setTimeout(() => setCoreAnimation(null), 500)
    }
    setPrevCore(gameState.coreFragments)
  }, [gameState.coreFragments, prevCore])

  if (!isAuthenticated) return null

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/90 backdrop-blur-md border-b border-border/50 safe-top overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.1), transparent)'
        }}
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      <div className="h-full px-4 flex items-center justify-between max-w-md mx-auto relative z-10">
        {/* Currency Display */}
        <div className="flex items-center gap-3">
          {/* Scrap */}
          <motion.div
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
            animate={scrapAnimation ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={scrapAnimation ? { rotate: 360 } : {}}
              transition={{ duration: 0.5 }}
            >
              <Cog className="w-5 h-5 text-yellow-400" />
            </motion.div>
            <span className="font-mono font-bold text-scrap text-sm">
              {formatNumber(gameState.scrap)}
            </span>
          </motion.div>

          {/* Data */}
          <motion.div
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20"
            animate={dataAnimation ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={dataAnimation ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <Database className="w-5 h-5 text-cyan-400" />
            </motion.div>
            <span className="font-mono font-bold text-data text-sm">
              {formatNumber(gameState.dataPoints)}
            </span>
          </motion.div>

          {/* Core Fragments (only show if > 0) */}
          <AnimatePresence>
            {gameState.coreFragments > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5, x: -20 }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20"
              >
                <motion.div
                  animate={coreAnimation ? { rotate: [0, 360] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <Gem className="w-5 h-5 text-purple-400" />
                </motion.div>
                <span className="font-mono font-bold text-core text-sm">
                  {gameState.coreFragments}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </header>
  )
}
