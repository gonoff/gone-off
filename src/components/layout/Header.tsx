'use client'

import { useGame } from '@/contexts/GameContext'
import { formatNumber } from '@/lib/game/formulas'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Cog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export function Header() {
  const { gameState, isAuthenticated } = useGame()
  const [prevScrap, setPrevScrap] = useState(gameState.scrap)
  const [prevData, setPrevData] = useState(gameState.dataPoints)
  const [scrapAnimation, setScrapAnimation] = useState<'up' | 'down' | null>(null)
  const [dataAnimation, setDataAnimation] = useState<'up' | 'down' | null>(null)

  // Animate currency changes
  useEffect(() => {
    if (gameState.scrap > prevScrap) {
      setScrapAnimation('up')
      setTimeout(() => setScrapAnimation(null), 300)
    } else if (gameState.scrap < prevScrap) {
      setScrapAnimation('down')
      setTimeout(() => setScrapAnimation(null), 300)
    }
    setPrevScrap(gameState.scrap)
  }, [gameState.scrap, prevScrap])

  useEffect(() => {
    if (gameState.dataPoints > prevData) {
      setDataAnimation('up')
      setTimeout(() => setDataAnimation(null), 300)
    } else if (gameState.dataPoints < prevData) {
      setDataAnimation('down')
      setTimeout(() => setDataAnimation(null), 300)
    }
    setPrevData(gameState.dataPoints)
  }, [gameState.dataPoints, prevData])

  if (!isAuthenticated) return null

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/80 backdrop-blur-md border-b border-border safe-top">
      <div className="h-full px-4 flex items-center justify-between max-w-md mx-auto">
        {/* Currency Display */}
        <div className="flex items-center gap-4">
          {/* Scrap */}
          <motion.div
            className={`flex items-center gap-1.5 ${
              scrapAnimation === 'up' ? 'animate-currency-up' :
              scrapAnimation === 'down' ? 'animate-currency-down' : ''
            }`}
            animate={scrapAnimation ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <span className="text-lg" role="img" aria-label="Scrap">
              <Cog className="w-5 h-5 text-scrap" />
            </span>
            <span className="font-mono font-bold text-scrap">
              {formatNumber(gameState.scrap)}
            </span>
          </motion.div>

          {/* Data */}
          <motion.div
            className={`flex items-center gap-1.5 ${
              dataAnimation === 'up' ? 'animate-currency-up' :
              dataAnimation === 'down' ? 'animate-currency-down' : ''
            }`}
            animate={dataAnimation ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <span className="text-lg">💾</span>
            <span className="font-mono font-bold text-data">
              {formatNumber(gameState.dataPoints)}
            </span>
          </motion.div>

          {/* Core Fragments (only show if > 0) */}
          <AnimatePresence>
            {gameState.coreFragments > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5"
              >
                <span className="text-lg">💠</span>
                <span className="font-mono font-bold text-core">
                  {gameState.coreFragments}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings Button */}
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
