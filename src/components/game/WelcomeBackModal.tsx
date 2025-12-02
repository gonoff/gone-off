'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/contexts/GameContext'
import { formatNumber, formatTime } from '@/lib/game/formulas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cog, Clock, Package } from 'lucide-react'

export function WelcomeBackModal() {
  const { showWelcomeBack, offlineEarnings, collectOffline, dismissWelcomeBack } = useGame()

  if (!showWelcomeBack || !offlineEarnings) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <Card className="w-full max-w-sm border-primary/30 bg-card/95">
            <CardHeader className="text-center pb-2">
              <motion.div
                className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <Cog className="w-8 h-8 text-primary" />
              </motion.div>
              <CardTitle className="text-2xl font-display">WELCOME BACK</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Time Away */}
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>You were away for {formatTime(offlineEarnings.timeAway)}</span>
              </div>

              {/* Earnings */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                  <Package className="w-4 h-4" />
                  <span>Your machines collected:</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Scrap */}
                  <motion.div
                    className="text-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="text-2xl font-mono font-bold text-scrap">
                      +{formatNumber(offlineEarnings.scrap)}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                      <Cog className="w-3 h-3" /> Scrap
                    </div>
                  </motion.div>

                  {/* Data */}
                  <motion.div
                    className="text-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="text-2xl font-mono font-bold text-data">
                      +{formatNumber(offlineEarnings.data)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      💾 Data
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Collect Button */}
              <Button
                onClick={collectOffline}
                className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 glow-primary"
              >
                COLLECT
              </Button>

              <button
                onClick={dismissWelcomeBack}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip
              </button>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
