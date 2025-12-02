'use client'

import { motion } from 'framer-motion'
import { WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Glowing background */}
        <motion.div
          className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        <WifiOff className="w-24 h-24 text-red-400 relative z-10" />
      </motion.div>

      <motion.h1
        className="text-3xl font-bold mt-8 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Connection Lost
      </motion.h1>

      <motion.p
        className="text-muted-foreground mt-4 max-w-xs"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        The rogue AI has disrupted your network connection. Check your signal and try again.
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <Button onClick={handleRetry} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Reconnect
        </Button>
      </motion.div>

      {/* Decorative glitch lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-0 h-px bg-red-500/30"
            style={{ top: `${30 + i * 20}%`, width: `${20 + Math.random() * 40}%` }}
            animate={{ x: ['-100%', '200%'], opacity: [0, 1, 0] }}
            transition={{
              duration: 2,
              delay: i * 0.5,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
        ))}
      </div>
    </div>
  )
}
