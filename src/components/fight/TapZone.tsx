'use client'

import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TapRipple {
  id: number
  x: number
  y: number
}

interface TapZoneProps {
  onTap: (x: number, y: number) => void
  disabled?: boolean
  comboActive?: boolean
}

export function TapZone({ onTap, disabled = false, comboActive = false }: TapZoneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ripples, setRipples] = useState<TapRipple[]>([])
  const rippleIdRef = useRef(0)

  const handleTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return

      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      let clientX: number
      let clientY: number

      if ('touches' in e) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        clientX = e.clientX
        clientY = e.clientY
      }

      const x = clientX - rect.left
      const y = clientY - rect.top

      // Add ripple effect
      const rippleId = rippleIdRef.current++
      setRipples((prev) => [...prev, { id: rippleId, x, y }])

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== rippleId))
      }, 600)

      onTap(x, y)
    },
    [onTap, disabled]
  )

  return (
    <motion.div
      ref={containerRef}
      className={`relative w-full h-28 rounded-2xl border-2 overflow-hidden
                 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent cursor-pointer
                 transition-all duration-150 touch-manipulation select-none
                 ${comboActive
                   ? 'border-yellow-500 shadow-lg shadow-yellow-500/30'
                   : 'border-primary/40 hover:border-primary/60'
                 }
                 active:bg-primary/20 active:border-primary`}
      onMouseDown={handleTap}
      onTouchStart={handleTap}
      whileTap={{ scale: 0.98 }}
    >
      {/* Animated border glow when combo active */}
      {comboActive && (
        <motion.div
          className="absolute inset-0 border-2 border-yellow-400 rounded-2xl"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}

      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
            }}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <div className={`w-16 h-16 -ml-8 -mt-8 rounded-full border-2 ${
              comboActive ? 'border-yellow-400' : 'border-primary'
            }`} />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Center crosshair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="relative w-20 h-20"
          animate={comboActive ? { rotate: 360 } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        >
          {/* Outer ring */}
          <motion.div
            className={`absolute inset-0 rounded-full border-2 ${
              comboActive ? 'border-yellow-400' : 'border-primary/40'
            }`}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />

          {/* Inner ring */}
          <div className={`absolute inset-4 rounded-full border ${
            comboActive ? 'border-yellow-400/60' : 'border-primary/30'
          }`} />

          {/* Crosshair lines */}
          <div className={`absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 ${
            comboActive ? 'bg-yellow-400/50' : 'bg-primary/30'
          }`} />
          <div className={`absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 ${
            comboActive ? 'bg-yellow-400/50' : 'bg-primary/30'
          }`} />

          {/* Center dot */}
          <motion.div
            className={`absolute top-1/2 left-1/2 w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 ${
              comboActive ? 'bg-yellow-400' : 'bg-primary'
            }`}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />

          {/* Corner markers */}
          <div className={`absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 rounded-tl ${
            comboActive ? 'border-yellow-400' : 'border-primary/50'
          }`} />
          <div className={`absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 rounded-tr ${
            comboActive ? 'border-yellow-400' : 'border-primary/50'
          }`} />
          <div className={`absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 rounded-bl ${
            comboActive ? 'border-yellow-400' : 'border-primary/50'
          }`} />
          <div className={`absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 rounded-br ${
            comboActive ? 'border-yellow-400' : 'border-primary/50'
          }`} />
        </motion.div>
      </div>

      {/* Tap instruction */}
      <motion.p
        className={`absolute bottom-3 left-0 right-0 text-center text-sm font-bold tracking-wider ${
          comboActive ? 'text-yellow-400' : 'text-muted-foreground'
        }`}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {comboActive ? 'KEEP TAPPING!' : 'TAP TO ATTACK'}
      </motion.p>

      {/* Scanning line effect */}
      <motion.div
        className={`absolute left-0 right-0 h-px ${
          comboActive ? 'bg-yellow-400/30' : 'bg-primary/20'
        }`}
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />

      {/* Corner decorations */}
      <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-primary/30" />
      <div className="absolute top-3 right-3 w-6 h-6 border-t border-r border-primary/30" />
      <div className="absolute bottom-3 left-3 w-6 h-6 border-b border-l border-primary/30" />
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-primary/30" />
    </motion.div>
  )
}
