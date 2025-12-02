'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Target, Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface Skill {
  id: string
  name: string
  icon: React.ReactNode
  cooldown: number // seconds
  currentCooldown: number
  color: string
  description: string
}

interface SkillBarProps {
  skills: Skill[]
  onUseSkill: (skillId: string) => void
}

export function SkillBar({ skills, onUseSkill }: SkillBarProps) {
  const [activatingSkill, setActivatingSkill] = useState<string | null>(null)

  const handleUseSkill = (skillId: string) => {
    setActivatingSkill(skillId)
    onUseSkill(skillId)
    setTimeout(() => setActivatingSkill(null), 500)
  }

  return (
    <div className="flex justify-center gap-4 py-3">
      {skills.map((skill) => {
        const isReady = skill.currentCooldown <= 0
        const cooldownPercent = isReady ? 0 : (skill.currentCooldown / skill.cooldown) * 100
        const isActivating = activatingSkill === skill.id

        return (
          <motion.div
            key={skill.id}
            className="relative"
            initial={{ y: 0 }}
            animate={isActivating ? { y: -10 } : { y: 0 }}
          >
            {/* Activation burst effect */}
            <AnimatePresence>
              {isActivating && (
                <motion.div
                  className={cn(
                    'absolute inset-0 rounded-2xl',
                    skill.id === 'overclock' && 'bg-yellow-400',
                    skill.id === 'emp_burst' && 'bg-cyan-400',
                    skill.id === 'data_surge' && 'bg-purple-400'
                  )}
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ filter: 'blur(10px)' }}
                />
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => isReady && handleUseSkill(skill.id)}
              disabled={!isReady}
              className={cn(
                'relative w-16 h-16 rounded-2xl border-2 overflow-hidden transition-all',
                isReady
                  ? `${skill.color} border-current shadow-xl hover:scale-110`
                  : 'border-gray-700 text-gray-700 bg-gray-900/50'
              )}
              whileTap={isReady ? { scale: 0.9 } : {}}
              whileHover={isReady ? { y: -3 } : {}}
            >
              {/* Skill Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={isActivating ? { scale: [1, 1.5, 1], rotate: [0, 180, 360] } : isReady ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: isActivating ? 0.3 : 1, repeat: isReady && !isActivating ? Infinity : 0 }}
                >
                  {skill.icon}
                </motion.div>
              </div>

              {/* Cooldown overlay */}
              {!isReady && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/60"
                  style={{
                    clipPath: `polygon(0 ${100 - cooldownPercent}%, 100% ${100 - cooldownPercent}%, 100% 100%, 0 100%)`,
                  }}
                  initial={false}
                />
              )}

              {/* Cooldown text */}
              {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span
                    className="text-lg font-bold font-mono text-white drop-shadow-lg"
                    key={Math.ceil(skill.currentCooldown)}
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    {Math.ceil(skill.currentCooldown)}
                  </motion.span>
                </div>
              )}

              {/* Ready pulse glow */}
              {isReady && (
                <motion.div
                  className={cn(
                    'absolute -inset-1 rounded-2xl',
                    skill.id === 'overclock' && 'bg-yellow-400',
                    skill.id === 'emp_burst' && 'bg-cyan-400',
                    skill.id === 'data_surge' && 'bg-purple-400'
                  )}
                  style={{ filter: 'blur(12px)', zIndex: -1 }}
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}

              {/* Scanning line effect when ready */}
              {isReady && (
                <motion.div
                  className={cn(
                    'absolute left-0 right-0 h-0.5',
                    skill.id === 'overclock' && 'bg-yellow-300',
                    skill.id === 'emp_burst' && 'bg-cyan-300',
                    skill.id === 'data_surge' && 'bg-purple-300'
                  )}
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              )}

              {/* Corner accents */}
              <div className={cn(
                'absolute top-1 left-1 w-2 h-2 border-t border-l rounded-tl',
                isReady ? 'border-current' : 'border-gray-600'
              )} />
              <div className={cn(
                'absolute top-1 right-1 w-2 h-2 border-t border-r rounded-tr',
                isReady ? 'border-current' : 'border-gray-600'
              )} />
              <div className={cn(
                'absolute bottom-1 left-1 w-2 h-2 border-b border-l rounded-bl',
                isReady ? 'border-current' : 'border-gray-600'
              )} />
              <div className={cn(
                'absolute bottom-1 right-1 w-2 h-2 border-b border-r rounded-br',
                isReady ? 'border-current' : 'border-gray-600'
              )} />
            </motion.button>

            {/* Skill name with glow */}
            <motion.span
              className={cn(
                'absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap',
                isReady ? 'text-foreground' : 'text-muted-foreground'
              )}
              animate={isReady ? { opacity: [0.7, 1, 0.7] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {skill.name}
            </motion.span>
          </motion.div>
        )
      })}
    </div>
  )
}

// Skill configurations
export const SKILLS = [
  {
    id: 'overclock',
    name: 'Overclock',
    icon: <Zap className="w-6 h-6" />,
    cooldown: 30,
    color: 'text-yellow-400 bg-yellow-500/20',
    description: '2x damage for 5 seconds',
    effect: { type: 'damage_boost', value: 2, duration: 5000 },
  },
  {
    id: 'emp_burst',
    name: 'EMP Burst',
    icon: <Target className="w-6 h-6" />,
    cooldown: 45,
    color: 'text-cyan-400 bg-cyan-500/20',
    description: 'Instant 10% boss HP damage',
    effect: { type: 'instant_damage', value: 0.1 },
  },
  {
    id: 'data_surge',
    name: 'Data Surge',
    icon: <Database className="w-6 h-6" />,
    cooldown: 60,
    color: 'text-purple-400 bg-purple-500/20',
    description: '3x rewards for next kill',
    effect: { type: 'reward_boost', value: 3, duration: 30000 },
  },
]
