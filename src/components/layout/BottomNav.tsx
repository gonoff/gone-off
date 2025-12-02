'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Crosshair, ShoppingCart, Cog, TrendingUp, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', icon: Crosshair, label: 'Fight' },
  { href: '/shop', icon: ShoppingCart, label: 'Shop' },
  { href: '/machines', icon: Cog, label: 'Machines' },
  { href: '/upgrades', icon: TrendingUp, label: 'Upgrades' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-bottom">
      <div className="h-20 px-2 flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors',
                'active:scale-95 touch-manipulation',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 bg-primary/10 rounded-lg"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              <Icon
                className={cn(
                  'w-6 h-6 relative z-10 transition-all',
                  isActive && 'text-glow-primary'
                )}
              />

              <span
                className={cn(
                  'text-xs font-medium relative z-10',
                  isActive && 'text-glow-primary'
                )}
              >
                {item.label}
              </span>

              {/* Glow effect for active item */}
              {isActive && (
                <motion.div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
