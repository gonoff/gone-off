'use client'

import { useCallback, useRef } from 'react'
import { motion } from 'framer-motion'

interface TapZoneProps {
  onTap: (x: number, y: number) => void
  disabled?: boolean
}

export function TapZone({ onTap, disabled = false }: TapZoneProps) {
  const containerRef = useRef<HTMLDivElement>(null)

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

      onTap(x, y)
    },
    [onTap, disabled]
  )

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full h-48 rounded-xl border-2 border-dashed border-primary/30
                 bg-gradient-to-b from-primary/5 to-transparent cursor-pointer
                 active:border-primary active:bg-primary/10 transition-colors
                 flex items-center justify-center touch-manipulation select-none"
      onMouseDown={handleTap}
      onTouchStart={handleTap}
      whileTap={{ scale: 0.98 }}
    >
      {/* Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-20 h-20">
          {/* Horizontal line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-primary/30 -translate-y-1/2" />
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-primary/30 -translate-x-1/2" />
          {/* Center dot */}
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/50" />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/50" />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/50" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/50" />
        </div>
      </div>

      {/* Tap instruction */}
      <motion.p
        className="absolute bottom-4 text-sm text-muted-foreground font-medium"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        TAP TO ATTACK
      </motion.p>

      {/* Corner decorations */}
      <div className="absolute top-2 left-2 w-8 h-8 border-t border-l border-primary/20" />
      <div className="absolute top-2 right-2 w-8 h-8 border-t border-r border-primary/20" />
      <div className="absolute bottom-2 left-2 w-8 h-8 border-b border-l border-primary/20" />
      <div className="absolute bottom-2 right-2 w-8 h-8 border-b border-r border-primary/20" />
    </motion.div>
  )
}
