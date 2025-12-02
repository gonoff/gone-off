'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface FloatingParticle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
  type: 'dot' | 'line' | 'square'
}

export function BackgroundEffects() {
  const [particles, setParticles] = useState<FloatingParticle[]>([])

  useEffect(() => {
    // Generate random floating particles - reduced for performance
    const newParticles: FloatingParticle[] = []
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 15 + Math.random() * 15,
        delay: Math.random() * 5,
        type: ['dot', 'line', 'square'][Math.floor(Math.random() * 3)] as 'dot' | 'line' | 'square',
      })
    }
    setParticles(newParticles)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute text-primary/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, Math.sin(particle.id) * 30, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {particle.type === 'dot' && (
            <div
              className="rounded-full bg-current"
              style={{ width: particle.size, height: particle.size }}
            />
          )}
          {particle.type === 'line' && (
            <div
              className="bg-current"
              style={{ width: 1, height: particle.size * 4 }}
            />
          )}
          {particle.type === 'square' && (
            <div
              className="border border-current"
              style={{ width: particle.size * 2, height: particle.size * 2 }}
            />
          )}
        </motion.div>
      ))}

      {/* Scanline effect */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-primary/10"
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      {/* Random glitch lines */}
      <GlitchLines />
    </div>
  )
}

function GlitchLines() {
  const [lines, setLines] = useState<{ id: number; y: number; width: number }[]>([])

  useEffect(() => {
    // Reduced frequency for performance - check every 500ms instead of 100ms
    const interval = setInterval(() => {
      if (Math.random() > 0.92) {
        const newLines = Array.from({ length: Math.floor(Math.random() * 2) + 1 }, (_, i) => ({
          id: Date.now() + i,
          y: Math.random() * 100,
          width: 20 + Math.random() * 60,
        }))
        setLines(newLines)
        setTimeout(() => setLines([]), 80)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {lines.map((line) => (
        <div
          key={line.id}
          className="absolute left-0 h-0.5 bg-primary/30"
          style={{
            top: `${line.y}%`,
            width: `${line.width}%`,
          }}
        />
      ))}
    </>
  )
}
