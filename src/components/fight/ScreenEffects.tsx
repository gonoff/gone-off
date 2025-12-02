'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface ScreenEffectsProps {
  shake: boolean
  flash: 'none' | 'hit' | 'crit' | 'death'
  stageClear: number | null
}

export function ScreenEffects({ shake, flash, stageClear }: ScreenEffectsProps) {
  return (
    <>
      {/* Screen shake wrapper - applied to the whole page via CSS */}
      <style jsx global>{`
        ${shake ? `
          @keyframes screen-shake {
            0%, 100% { transform: translateX(0) translateY(0); }
            10% { transform: translateX(-3px) translateY(-2px); }
            20% { transform: translateX(3px) translateY(2px); }
            30% { transform: translateX(-2px) translateY(1px); }
            40% { transform: translateX(2px) translateY(-1px); }
            50% { transform: translateX(-1px) translateY(2px); }
            60% { transform: translateX(1px) translateY(-2px); }
            70% { transform: translateX(-2px) translateY(-1px); }
            80% { transform: translateX(2px) translateY(1px); }
            90% { transform: translateX(-1px) translateY(-1px); }
          }
          main {
            animation: screen-shake 0.15s ease-in-out;
          }
        ` : ''}
      `}</style>

      {/* Flash overlay */}
      <AnimatePresence>
        {flash !== 'none' && (
          <motion.div
            className={`fixed inset-0 pointer-events-none z-50 ${
              flash === 'crit'
                ? 'bg-yellow-400'
                : flash === 'death'
                ? 'bg-red-500'
                : 'bg-white'
            }`}
            initial={{ opacity: flash === 'crit' ? 0.4 : flash === 'death' ? 0.6 : 0.2 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: flash === 'death' ? 0.5 : 0.15 }}
          />
        )}
      </AnimatePresence>

      {/* Stage clear celebration */}
      <AnimatePresence>
        {stageClear !== null && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Background flash */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20"
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 1.5 }}
            />

            {/* Stage clear text */}
            <motion.div
              className="text-center"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, y: -100 }}
              transition={{ type: 'spring', damping: 10 }}
            >
              <motion.div
                className="text-5xl font-bold font-orbitron text-primary drop-shadow-lg"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                STAGE {stageClear}
              </motion.div>
              <motion.div
                className="text-xl text-yellow-400 font-bold mt-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {stageClear % 100 === 0
                  ? 'MAJOR BOSS DEFEATED!'
                  : stageClear % 50 === 0
                  ? 'BOSS ELIMINATED!'
                  : stageClear % 10 === 0
                  ? 'CHECKPOINT!'
                  : 'CLEARED!'}
              </motion.div>
            </motion.div>

            {/* Confetti-like particles */}
            {stageClear % 10 === 0 && (
              <div className="absolute inset-0">
                {Array.from({ length: 30 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute w-2 h-2 ${
                      i % 3 === 0
                        ? 'bg-yellow-400'
                        : i % 3 === 1
                        ? 'bg-cyan-400'
                        : 'bg-purple-400'
                    }`}
                    style={{
                      left: `${50 + (Math.random() - 0.5) * 20}%`,
                      top: '50%',
                    }}
                    initial={{ scale: 0 }}
                    animate={{
                      x: (Math.random() - 0.5) * 400,
                      y: (Math.random() - 0.5) * 400,
                      scale: [0, 1, 0],
                      rotate: Math.random() * 720,
                    }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
