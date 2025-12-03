'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/contexts/GameContext'
import { ShoppingBag, Sword, Shield, Gem, Beaker, Lock, Check, Sparkles } from 'lucide-react'
import { formatNumber } from '@/lib/game/formulas'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ShopItem {
  id: number
  name: string
  type: 'weapon' | 'armor' | 'accessory' | 'consumable'
  description: string | null
  damageBonus: number
  critChanceBonus: number
  critDamageBonus: number
  scrapBonus: number
  dataBonus: number
  unlockStage: number
  costScrap: number
  costData: number
  effectDuration: number
  effectValue: number
  tier: number
  owned: boolean
  locked: boolean
}

interface CategorizedItems {
  weapons: ShopItem[]
  armor: ShopItem[]
  accessories: ShopItem[]
  consumables: ShopItem[]
}

type Category = 'weapons' | 'armor' | 'accessories' | 'consumables'

const categoryIcons: Record<Category, React.ReactNode> = {
  weapons: <Sword className="w-4 h-4" />,
  armor: <Shield className="w-4 h-4" />,
  accessories: <Gem className="w-4 h-4" />,
  consumables: <Beaker className="w-4 h-4" />,
}

const tierColors: Record<number, string> = {
  1: 'border-gray-500',
  2: 'border-green-500',
  3: 'border-blue-500',
  4: 'border-purple-500',
  5: 'border-orange-500',
  6: 'border-red-500',
  7: 'border-pink-500',
  8: 'border-yellow-400',
}

const tierGlows: Record<number, string> = {
  1: '',
  2: 'shadow-green-500/20',
  3: 'shadow-blue-500/30',
  4: 'shadow-purple-500/40',
  5: 'shadow-orange-500/50',
  6: 'shadow-red-500/50',
  7: 'shadow-pink-500/60',
  8: 'shadow-yellow-400/70 animate-pulse',
}

export default function ShopPage() {
  const router = useRouter()
  const { gameState, inventory, buyItem, equipItem } = useGame()
  const [items, setItems] = useState<CategorizedItems | null>(null)
  const [activeCategory, setActiveCategory] = useState<Category>('weapons')
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<number | null>(null)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const sessionToken = localStorage.getItem('sessionToken')
        const response = await fetch('/api/shop/items', {
          headers: { Authorization: `Bearer ${sessionToken}` },
        })
        if (response.ok) {
          const data = await response.json()
          setItems(data)
        }
      } catch (error) {
        console.error('Failed to fetch items:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [])

  const handleBuy = async (item: ShopItem) => {
    if (purchasing) return
    setPurchasing(item.id)

    const success = await buyItem(item.id)
    if (success) {
      // For consumables, redirect to fight page to use the effect
      if (item.type === 'consumable') {
        toast.success(`${item.name} activated!`, {
          description: 'Effect is now active. Redirecting to fight...',
        })
        router.push('/')
        return
      }

      toast.success(`Purchased ${item.name}!`)

      // Update local state for non-consumables
      setItems((prev) => {
        if (!prev) return prev
        const category = `${item.type}s` as Category
        return {
          ...prev,
          [category]: prev[category].map((i) =>
            i.id === item.id ? { ...i, owned: true } : i
          ),
        }
      })
    } else {
      toast.error('Purchase failed', {
        description: 'Please check your balance and try again.',
      })
    }
    setPurchasing(null)
  }

  const handleEquip = async (item: ShopItem) => {
    if (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') {
      await equipItem(item.id, item.type)
    }
  }

  const canAfford = (item: ShopItem) => {
    return gameState.scrap >= item.costScrap && gameState.dataPoints >= item.costData
  }

  const isEquipped = (item: ShopItem) => {
    return inventory.find((i) => i.id === item.id)?.isEquipped ?? false
  }

  const getItemStats = (item: ShopItem) => {
    const stats: string[] = []
    if (item.damageBonus > 0) stats.push(`+${item.damageBonus} DMG`)
    if (item.critChanceBonus > 0) stats.push(`+${item.critChanceBonus}% CRIT`)
    if (item.critDamageBonus > 0) stats.push(`+${item.critDamageBonus}% CRIT DMG`)
    if (item.scrapBonus > 0) stats.push(`+${item.scrapBonus}% SCRAP`)
    if (item.dataBonus > 0) stats.push(`+${item.dataBonus}% DATA`)
    if (item.effectDuration > 0) stats.push(`${item.effectDuration}s`)
    return stats
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const currentItems = items?.[activeCategory] ?? []

  return (
    <div className="flex flex-col h-full p-4 space-y-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ShoppingBag className="w-6 h-6 text-primary" />
        <h1 className="text-xl font-orbitron font-bold text-primary">BLACK MARKET</h1>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 p-1 bg-background/50 rounded-lg border border-border/30">
        {(Object.keys(categoryIcons) as Category[]).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-md text-xs font-medium transition-all',
              activeCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            )}
          >
            {categoryIcons[category]}
            <span className="hidden sm:inline capitalize">{category}</span>
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-track-background scrollbar-thumb-primary/20">
        <AnimatePresence mode="popLayout">
          {currentItems.map((item, index) => {
            const owned = item.owned || inventory.some((i) => i.id === item.id)
            const equipped = isEquipped(item)
            const affordable = canAfford(item)

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'relative p-3 rounded-lg border-2 bg-card/80 backdrop-blur-sm',
                  tierColors[item.tier] || 'border-border',
                  tierGlows[item.tier] && `shadow-lg ${tierGlows[item.tier]}`,
                  item.locked && 'opacity-50'
                )}
              >
                {/* Locked Overlay */}
                {item.locked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg z-10">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Lock className="w-5 h-5" />
                      <span className="font-mono text-sm">Stage {item.unlockStage}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center border',
                    tierColors[item.tier] || 'border-border',
                    'bg-background/50'
                  )}>
                    {item.type === 'weapon' && <Sword className="w-6 h-6 text-red-400" />}
                    {item.type === 'armor' && <Shield className="w-6 h-6 text-blue-400" />}
                    {item.type === 'accessory' && <Gem className="w-6 h-6 text-purple-400" />}
                    {item.type === 'consumable' && <Beaker className="w-6 h-6 text-green-400" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                      {item.tier >= 5 && <Sparkles className="w-3 h-3 text-yellow-400" />}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {getItemStats(item).map((stat, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 text-[10px] font-mono bg-accent/50 rounded text-accent-foreground"
                        >
                          {stat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex flex-col items-end gap-1">
                    {owned && item.type !== 'consumable' ? (
                      <button
                        onClick={() => handleEquip(item)}
                        disabled={equipped}
                        className={cn(
                          'px-3 py-1.5 rounded text-xs font-medium transition-all',
                          equipped
                            ? 'bg-green-600 text-white'
                            : 'bg-accent hover:bg-accent/80 text-accent-foreground'
                        )}
                      >
                        {equipped ? (
                          <span className="flex items-center gap-1">
                            <Check className="w-3 h-3" /> Equipped
                          </span>
                        ) : (
                          'Equip'
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(item)}
                        disabled={!affordable || item.locked || purchasing === item.id}
                        className={cn(
                          'px-3 py-1.5 rounded text-xs font-medium transition-all min-w-[80px]',
                          affordable && !item.locked
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                        )}
                      >
                        {purchasing === item.id ? (
                          <span className="animate-pulse">...</span>
                        ) : (
                          'Buy'
                        )}
                      </button>
                    )}

                    {/* Cost */}
                    {(!owned || item.type === 'consumable') && (
                      <div className="flex flex-col items-end text-[10px] font-mono">
                        {item.costScrap > 0 && (
                          <span className={cn(
                            gameState.scrap >= item.costScrap ? 'text-yellow-400' : 'text-red-400'
                          )}>
                            {formatNumber(item.costScrap)} Scrap
                          </span>
                        )}
                        {item.costData > 0 && (
                          <span className={cn(
                            gameState.dataPoints >= item.costData ? 'text-cyan-400' : 'text-red-400'
                          )}>
                            {formatNumber(item.costData)} Data
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {currentItems.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            No items available
          </div>
        )}
      </div>
    </div>
  )
}
