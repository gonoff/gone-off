'use client'

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react'
import {
  ClientGameState,
  InventoryItem,
  Machine,
  Upgrade,
  PrestigeStats,
  Achievement,
  Boss,
  ActiveEffect,
  MachineType,
} from '@/lib/game/types'
import {
  getBossInfo,
  calculateTapDamage,
  getScrapReward,
  getDataReward,
  getTotalIdleProduction,
  getWeaponDamageAtLevel,
} from '@/lib/game/formulas'
import { AUTO_SAVE_INTERVAL_MS, BASE_DAMAGE } from '@/lib/game/constants'

// ============================================
// STATE TYPES
// ============================================

interface GameContextState {
  // User
  userId: number | null
  username: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Game State
  gameState: ClientGameState
  boss: Boss

  // Collections
  inventory: InventoryItem[]
  machines: Machine[]
  upgrades: Upgrade[]
  prestigeStats: PrestigeStats
  achievements: Achievement[]

  // Active effects
  activeEffects: ActiveEffect[]

  // UI State
  damageNumbers: DamageNumber[]
  showWelcomeBack: boolean
  offlineEarnings: { scrap: number; data: number; dps: number; timeAway: number } | null
}

interface DamageNumber {
  id: string
  damage: number
  isCritical: boolean
  x: number
  y: number
}

// ============================================
// ACTIONS
// ============================================

type GameAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { userId: number; username: string } }
  | { type: 'LOGOUT' }
  | { type: 'LOAD_GAME_DATA'; payload: Partial<GameContextState> }
  | { type: 'TAP'; payload: { x: number; y: number } }
  | { type: 'BOSS_DEFEATED' }
  | { type: 'REMOVE_DAMAGE_NUMBER'; payload: string }
  | { type: 'UPDATE_CURRENCIES'; payload: { scrap?: number; dataPoints?: number; coreFragments?: number } }
  | { type: 'BUY_ITEM'; payload: { item: InventoryItem } }
  | { type: 'PURCHASE_COMPLETE'; payload: { item: InventoryItem; newScrap: number; newData: number } }
  | { type: 'EQUIP_ITEM'; payload: { itemId: number; type: 'weapon' | 'armor' | 'accessory' } }
  | { type: 'UPGRADE_WEAPON'; payload: { itemId: number } }
  | { type: 'BUY_MACHINE'; payload: { machineType: MachineType } }
  | { type: 'BUY_UPGRADE'; payload: { upgradeType: string; isPermanent: boolean; newLevel: number } }
  | { type: 'PRESTIGE' }
  | { type: 'TICK_IDLE' }
  | { type: 'DISMISS_WELCOME_BACK' }
  | { type: 'SET_OFFLINE_EARNINGS'; payload: { scrap: number; data: number; dps: number; timeAway: number } | null }
  | { type: 'COLLECT_OFFLINE' }
  | { type: 'USE_SKILL'; payload: { skillId: string; effect: { type: string; value: number; duration?: number } } }
  | { type: 'CLEAN_EXPIRED_EFFECTS' }

// ============================================
// INITIAL STATE
// ============================================

const initialGameState: ClientGameState = {
  currentStage: 1,
  highestStage: 1,
  scrap: 0,
  dataPoints: 0,
  coreFragments: 0,
  offlineCapLevel: 1,
  currentBossHp: 100,
  currentBossMaxHp: 100,
  totalTaps: 0,
  totalDamageDealt: 0,
  equippedWeaponId: null,
  equippedArmorId: null,
  equippedAccessoryId: null,
}

const initialPrestigeStats: PrestigeStats = {
  totalPrestiges: 0,
  lifetimeScrap: 0,
  lifetimeData: 0,
  lifetimeCoreFragments: 0,
  lifetimeBossesKilled: 0,
  lifetimeTaps: 0,
  fastestStage100: null,
  highestDamageHit: 0,
}

const initialState: GameContextState = {
  userId: null,
  username: null,
  isAuthenticated: false,
  isLoading: true,
  gameState: initialGameState,
  boss: getBossInfo(1),
  inventory: [],
  machines: [],
  upgrades: [],
  prestigeStats: initialPrestigeStats,
  achievements: [],
  activeEffects: [],
  damageNumbers: [],
  showWelcomeBack: false,
  offlineEarnings: null,
}

// ============================================
// REDUCER
// ============================================

function gameReducer(state: GameContextState, action: GameAction): GameContextState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }

    case 'SET_USER':
      return {
        ...state,
        userId: action.payload.userId,
        username: action.payload.username,
        isAuthenticated: true,
      }

    case 'LOGOUT':
      return { ...initialState, isLoading: false }

    case 'LOAD_GAME_DATA': {
      const newState = { ...state, ...action.payload, isLoading: false }
      // Regenerate boss info based on loaded stage
      if (action.payload.gameState) {
        newState.boss = getBossInfo(action.payload.gameState.currentStage)
        newState.boss.hp = action.payload.gameState.currentBossHp
      }
      return newState
    }

    case 'TAP': {
      // Get equipped weapon damage
      const equippedWeapon = state.inventory.find(
        i => i.id === state.gameState.equippedWeaponId && i.type === 'weapon'
      )
      const weaponDamage = equippedWeapon
        ? getWeaponDamageAtLevel(equippedWeapon.damageBonus, equippedWeapon.upgradeLevel)
        : 0

      // Get equipped armor and accessory bonuses
      const equippedArmor = state.inventory.find(
        i => i.id === state.gameState.equippedArmorId && i.type === 'armor'
      )
      const equippedAccessory = state.inventory.find(
        i => i.id === state.gameState.equippedAccessoryId && i.type === 'accessory'
      )

      // Calculate total equipment damage bonus
      const armorDamageBonus = equippedArmor?.damageBonus ?? 0
      const accessoryDamageBonus = equippedAccessory?.damageBonus ?? 0
      const totalWeaponDamage = weaponDamage + armorDamageBonus + accessoryDamageBonus

      // Calculate equipment crit chance bonus
      const armorCritBonus = equippedArmor?.critChanceBonus ?? 0
      const accessoryCritBonus = equippedAccessory?.critChanceBonus ?? 0
      const equipmentCritBonus = armorCritBonus + accessoryCritBonus

      // Get active damage boost
      const now = Date.now()
      const damageBoost = state.activeEffects
        .filter(e => e.type === 'damage_boost' && e.endsAt > now)
        .reduce((mult, e) => mult * e.value, 1)

      // Get active crit boost (forces 100% crit)
      const hasCritBoost = state.activeEffects
        .some(e => e.type === 'crit_boost' && e.endsAt > now)

      const { damage, isCritical } = calculateTapDamage(totalWeaponDamage, state.upgrades, {
        damageBoost,
        equipmentCritBonus,
        forceCrit: hasCritBoost,
      })

      const newBossHp = Math.max(0, state.boss.hp - damage)
      const damageId = `${Date.now()}-${Math.random()}`

      const newDamageNumber: DamageNumber = {
        id: damageId,
        damage,
        isCritical,
        x: action.payload.x + (Math.random() - 0.5) * 50,
        y: action.payload.y,
      }

      return {
        ...state,
        boss: { ...state.boss, hp: newBossHp },
        gameState: {
          ...state.gameState,
          currentBossHp: newBossHp,
          totalTaps: state.gameState.totalTaps + 1,
          totalDamageDealt: state.gameState.totalDamageDealt + damage,
        },
        prestigeStats: {
          ...state.prestigeStats,
          lifetimeTaps: state.prestigeStats.lifetimeTaps + 1,
          highestDamageHit: Math.max(state.prestigeStats.highestDamageHit, damage),
        },
        damageNumbers: [...state.damageNumbers, newDamageNumber],
      }
    }

    case 'BOSS_DEFEATED': {
      const rewards = state.boss.rewards
      const dropBonus = state.upgrades.find(u => u.upgradeType === 'drop_rate')?.level ?? 0
      const dropMult = 1 + (dropBonus * 0.05)

      // Get equipped armor and accessory for resource bonuses
      const equippedArmor = state.inventory.find(
        i => i.id === state.gameState.equippedArmorId && i.type === 'armor'
      )
      const equippedAccessory = state.inventory.find(
        i => i.id === state.gameState.equippedAccessoryId && i.type === 'accessory'
      )

      // Equipment resource bonuses (percentages)
      const armorScrapBonus = (equippedArmor?.scrapBonus ?? 0) / 100
      const armorDataBonus = (equippedArmor?.dataBonus ?? 0) / 100
      const accessoryScrapBonus = (equippedAccessory?.scrapBonus ?? 0) / 100
      const accessoryDataBonus = (equippedAccessory?.dataBonus ?? 0) / 100
      const equipScrapMult = 1 + armorScrapBonus + accessoryScrapBonus
      const equipDataMult = 1 + armorDataBonus + accessoryDataBonus

      // Check for active effects
      const now = Date.now()
      const rewardBoost = state.activeEffects
        .filter(e => e.type === 'reward_boost' && e.endsAt > now)
        .reduce((mult, e) => mult * e.value, 1)

      // Check for scrap/data boost effects from consumables
      const scrapBoost = state.activeEffects
        .filter(e => e.type === 'scrap_boost' && e.endsAt > now)
        .reduce((mult, e) => mult * e.value, 1)
      const dataBoost = state.activeEffects
        .filter(e => e.type === 'data_boost' && e.endsAt > now)
        .reduce((mult, e) => mult * e.value, 1)

      const scrapGain = Math.floor(rewards.scrap * dropMult * equipScrapMult * rewardBoost * scrapBoost)
      const dataGain = Math.floor(rewards.data * dropMult * equipDataMult * rewardBoost * dataBoost)

      const nextStage = state.gameState.currentStage + 1
      const newBoss = getBossInfo(nextStage)

      // Remove reward boost after it's been used (it's a one-time effect)
      const remainingEffects = state.activeEffects.filter(
        e => !(e.type === 'reward_boost' && e.endsAt > now)
      )

      return {
        ...state,
        gameState: {
          ...state.gameState,
          currentStage: nextStage,
          highestStage: Math.max(state.gameState.highestStage, nextStage),
          scrap: state.gameState.scrap + scrapGain,
          dataPoints: state.gameState.dataPoints + dataGain,
          currentBossHp: newBoss.maxHp,
          currentBossMaxHp: newBoss.maxHp,
        },
        boss: newBoss,
        prestigeStats: {
          ...state.prestigeStats,
          lifetimeScrap: state.prestigeStats.lifetimeScrap + scrapGain,
          lifetimeData: state.prestigeStats.lifetimeData + dataGain,
          lifetimeBossesKilled: state.prestigeStats.lifetimeBossesKilled + 1,
        },
        activeEffects: remainingEffects,
      }
    }

    case 'REMOVE_DAMAGE_NUMBER':
      return {
        ...state,
        damageNumbers: state.damageNumbers.filter(d => d.id !== action.payload),
      }

    case 'UPDATE_CURRENCIES':
      return {
        ...state,
        gameState: {
          ...state.gameState,
          scrap: action.payload.scrap ?? state.gameState.scrap,
          dataPoints: action.payload.dataPoints ?? state.gameState.dataPoints,
          coreFragments: action.payload.coreFragments ?? state.gameState.coreFragments,
        },
      }

    case 'BUY_ITEM': {
      const item = action.payload.item

      // For consumables, activate the effect immediately and DON'T add to inventory
      if (item.type === 'consumable' && item.effectDuration > 0) {
        // Map item name to effect type (using description keywords as fallback)
        const effectTypeMap: Record<string, ActiveEffect['type']> = {
          'Overclock Boost': 'damage_boost',
          'Auto-Tap Bot': 'auto_tap',
          'Data Burst': 'data_boost',
          'Scrap Storm': 'scrap_boost',
          'Lucky Strike': 'crit_boost',
          'Jackpot Module': 'reward_boost',
        }

        const effectType = effectTypeMap[item.name]
        if (effectType) {
          const newEffect: ActiveEffect = {
            type: effectType,
            value: item.effectValue,
            endsAt: Date.now() + item.effectDuration * 1000,
          }
          return {
            ...state,
            activeEffects: [...state.activeEffects, newEffect],
          }
        }
        // Unknown consumable, just return state without adding to inventory
        return state
      }

      // For non-consumables, add to inventory
      const existingItem = state.inventory.find(i => i.id === item.id)
      let newInventory: InventoryItem[]

      if (existingItem) {
        newInventory = state.inventory.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      } else {
        newInventory = [...state.inventory, item]
      }

      return { ...state, inventory: newInventory }
    }

    case 'PURCHASE_COMPLETE': {
      const { item, newScrap, newData } = action.payload

      // Update currencies first
      const updatedGameState = {
        ...state.gameState,
        scrap: newScrap,
        dataPoints: newData,
      }

      // For consumables, activate the effect immediately and DON'T add to inventory
      if (item.type === 'consumable' && item.effectDuration > 0) {
        const effectTypeMap: Record<string, ActiveEffect['type']> = {
          'Overclock Boost': 'damage_boost',
          'Auto-Tap Bot': 'auto_tap',
          'Data Burst': 'data_boost',
          'Scrap Storm': 'scrap_boost',
          'Lucky Strike': 'crit_boost',
          'Jackpot Module': 'reward_boost',
        }

        const effectType = effectTypeMap[item.name]
        if (effectType) {
          const newEffect: ActiveEffect = {
            type: effectType,
            value: item.effectValue,
            endsAt: Date.now() + item.effectDuration * 1000,
          }
          return {
            ...state,
            gameState: updatedGameState,
            activeEffects: [...state.activeEffects, newEffect],
          }
        }
        // Unknown consumable, just update currencies
        return { ...state, gameState: updatedGameState }
      }

      // For non-consumables, add to inventory
      const existingItem = state.inventory.find(i => i.id === item.id)
      let newInventory: InventoryItem[]

      if (existingItem) {
        newInventory = state.inventory.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      } else {
        newInventory = [...state.inventory, item]
      }

      return {
        ...state,
        gameState: updatedGameState,
        inventory: newInventory,
      }
    }

    case 'EQUIP_ITEM': {
      const newInventory = state.inventory.map(i => ({
        ...i,
        isEquipped: i.id === action.payload.itemId
          ? true
          : i.type === action.payload.type ? false : i.isEquipped,
      }))

      let equippedId: Partial<ClientGameState> = {}
      if (action.payload.type === 'weapon') {
        equippedId = { equippedWeaponId: action.payload.itemId }
      } else if (action.payload.type === 'armor') {
        equippedId = { equippedArmorId: action.payload.itemId }
      } else if (action.payload.type === 'accessory') {
        equippedId = { equippedAccessoryId: action.payload.itemId }
      }

      return {
        ...state,
        inventory: newInventory,
        gameState: { ...state.gameState, ...equippedId },
      }
    }

    case 'UPGRADE_WEAPON': {
      const newInventory = state.inventory.map(i =>
        i.id === action.payload.itemId
          ? { ...i, upgradeLevel: i.upgradeLevel + 1 }
          : i
      )
      return { ...state, inventory: newInventory }
    }

    case 'BUY_MACHINE': {
      const existingMachine = state.machines.find(m => m.machineType === action.payload.machineType)

      if (existingMachine) {
        const newMachines = state.machines.map(m =>
          m.machineType === action.payload.machineType
            ? { ...m, level: m.level + 1 }
            : m
        )
        return { ...state, machines: newMachines }
      } else {
        const newMachine: Machine = {
          id: Date.now(),
          machineType: action.payload.machineType,
          level: 1,
          lastCollected: new Date(),
        }
        return { ...state, machines: [...state.machines, newMachine] }
      }
    }

    case 'BUY_UPGRADE': {
      const { upgradeType, isPermanent, newLevel } = action.payload
      const existingUpgrade = state.upgrades.find(
        u => u.upgradeType === upgradeType
      )

      if (existingUpgrade) {
        const newUpgrades = state.upgrades.map(u =>
          u.upgradeType === upgradeType
            ? { ...u, level: newLevel }
            : u
        )
        return { ...state, upgrades: newUpgrades }
      } else {
        const newUpgrade: Upgrade = {
          id: Date.now(),
          upgradeType,
          level: newLevel,
          isPermanent,
        }
        return { ...state, upgrades: [...state.upgrades, newUpgrade] }
      }
    }

    case 'TICK_IDLE': {
      const now = Date.now()
      const { scrap, data, dps } = getTotalIdleProduction(state.machines, state.upgrades)

      // Calculate auto-tap damage from Auto-Tap Bot effect
      let autoTapDamage = 0
      const autoTapEffect = state.activeEffects.find(
        e => e.type === 'auto_tap' && e.endsAt > now
      )
      if (autoTapEffect) {
        // Get equipped weapon damage
        const equippedWeapon = state.inventory.find(
          i => i.id === state.gameState.equippedWeaponId && i.type === 'weapon'
        )
        const weaponDamage = equippedWeapon
          ? getWeaponDamageAtLevel(equippedWeapon.damageBonus, equippedWeapon.upgradeLevel)
          : 0

        // Get tap power upgrade
        const tapPowerLevel = state.upgrades.find(u => u.upgradeType === 'tap_power')?.level ?? 0
        const tapPowerMult = 1 + tapPowerLevel * 0.1

        // Get permanent damage upgrade
        const permDamageLevel = state.upgrades.find(u => u.upgradeType === 'perm_starting_damage')?.level ?? 0
        const permDamageMult = 1 + permDamageLevel * 0.25

        // Base damage calculation (similar to TAP action but without crits)
        const baseDamage = (BASE_DAMAGE + weaponDamage) * tapPowerMult * permDamageMult

        // Auto-tap effect value = taps per second
        autoTapDamage = Math.floor(baseDamage * autoTapEffect.value)
      }

      // Apply DPS from machines + auto-tap to boss
      const totalDps = dps + autoTapDamage
      let newBossHp = state.boss.hp
      if (totalDps > 0) {
        newBossHp = Math.max(0, state.boss.hp - totalDps)
      }

      return {
        ...state,
        boss: { ...state.boss, hp: newBossHp },
        gameState: {
          ...state.gameState,
          scrap: state.gameState.scrap + scrap,
          dataPoints: state.gameState.dataPoints + data,
          currentBossHp: newBossHp,
          totalDamageDealt: state.gameState.totalDamageDealt + autoTapDamage,
          totalTaps: state.gameState.totalTaps + (autoTapEffect ? Math.floor(autoTapEffect.value) : 0),
        },
        prestigeStats: {
          ...state.prestigeStats,
          lifetimeScrap: state.prestigeStats.lifetimeScrap + scrap,
          lifetimeData: state.prestigeStats.lifetimeData + data,
        },
      }
    }

    case 'PRESTIGE': {
      // Reset temporary state, keep permanent upgrades
      const permUpgrades = state.upgrades.filter(u => u.isPermanent)

      // Calculate starting scrap from permanent upgrade (+1000 scrap per level)
      const startingScrapLevel = state.upgrades.find(u => u.upgradeType === 'perm_starting_scrap')?.level ?? 0
      const startingScrap = startingScrapLevel * 1000

      return {
        ...state,
        gameState: {
          ...initialGameState,
          scrap: startingScrap,
          coreFragments: state.gameState.coreFragments,
        },
        boss: getBossInfo(1),
        inventory: [],
        machines: [],
        upgrades: permUpgrades,
        activeEffects: [], // Clear all active effects on prestige
        prestigeStats: {
          ...state.prestigeStats,
          totalPrestiges: state.prestigeStats.totalPrestiges + 1,
        },
      }
    }

    case 'SET_OFFLINE_EARNINGS':
      return {
        ...state,
        offlineEarnings: action.payload,
        showWelcomeBack: action.payload !== null,
      }

    case 'DISMISS_WELCOME_BACK':
      return { ...state, showWelcomeBack: false }

    case 'COLLECT_OFFLINE': {
      if (!state.offlineEarnings) return state

      // Apply offline DPS damage to boss
      const offlineDamage = state.offlineEarnings.dps || 0
      const newBossHp = Math.max(0, state.boss.hp - offlineDamage)

      return {
        ...state,
        boss: { ...state.boss, hp: newBossHp },
        gameState: {
          ...state.gameState,
          scrap: state.gameState.scrap + state.offlineEarnings.scrap,
          dataPoints: state.gameState.dataPoints + state.offlineEarnings.data,
          currentBossHp: newBossHp,
          totalDamageDealt: state.gameState.totalDamageDealt + offlineDamage,
        },
        prestigeStats: {
          ...state.prestigeStats,
          lifetimeScrap: state.prestigeStats.lifetimeScrap + state.offlineEarnings.scrap,
          lifetimeData: state.prestigeStats.lifetimeData + state.offlineEarnings.data,
        },
        offlineEarnings: null,
        showWelcomeBack: false,
      }
    }

    case 'USE_SKILL': {
      const { effect } = action.payload
      const now = Date.now()

      // Handle instant damage (EMP Burst - 10% of boss max HP)
      if (effect.type === 'instant_damage') {
        const instantDamage = Math.floor(state.boss.maxHp * effect.value)
        const newBossHp = Math.max(0, state.boss.hp - instantDamage)

        return {
          ...state,
          boss: { ...state.boss, hp: newBossHp },
          gameState: {
            ...state.gameState,
            currentBossHp: newBossHp,
            totalDamageDealt: state.gameState.totalDamageDealt + instantDamage,
          },
        }
      }

      // Handle buff effects (damage_boost, reward_boost)
      if (effect.duration) {
        const newEffect: ActiveEffect = {
          type: effect.type as ActiveEffect['type'],
          value: effect.value,
          endsAt: now + effect.duration,
        }

        return {
          ...state,
          activeEffects: [...state.activeEffects, newEffect],
        }
      }

      return state
    }

    case 'CLEAN_EXPIRED_EFFECTS': {
      const now = Date.now()
      const activeEffects = state.activeEffects.filter(e => e.endsAt > now)
      if (activeEffects.length === state.activeEffects.length) return state
      return { ...state, activeEffects }
    }

    default:
      return state
  }
}

// ============================================
// CONTEXT
// ============================================

interface GameContextValue extends GameContextState {
  // Actions
  tap: (x: number, y: number) => void
  login: (username: string) => Promise<boolean>
  logout: () => void
  buyItem: (itemId: number) => Promise<boolean>
  equipItem: (itemId: number, type: 'weapon' | 'armor' | 'accessory') => Promise<boolean>
  upgradeWeapon: (itemId: number) => Promise<boolean>
  buyMachine: (machineType: MachineType) => Promise<boolean>
  buyUpgrade: (upgradeType: string, isPermanent: boolean) => Promise<boolean>
  prestige: () => Promise<boolean>
  collectOffline: () => void
  dismissWelcomeBack: () => void
  useSkill: (skillId: string, effect: { type: string; value: number; duration?: number }) => void
}

const GameContext = createContext<GameContextValue | null>(null)

// ============================================
// PROVIDER
// ============================================

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const idleIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const scheduledRemovals = useRef<Set<string>>(new Set())
  const purchaseInProgressRef = useRef(false)
  const lastDefeatedStageRef = useRef(0)

  // Check for boss defeat - with guard to prevent multiple dispatches
  useEffect(() => {
    if (
      state.boss.hp <= 0 &&
      state.isAuthenticated &&
      state.gameState.currentStage > lastDefeatedStageRef.current
    ) {
      // Mark this stage as being processed to prevent duplicate dispatches
      lastDefeatedStageRef.current = state.gameState.currentStage
      dispatch({ type: 'BOSS_DEFEATED' })
    }
  }, [state.boss.hp, state.isAuthenticated, state.gameState.currentStage])

  // Remove damage numbers after animation
  useEffect(() => {
    state.damageNumbers.forEach(dmg => {
      if (!scheduledRemovals.current.has(dmg.id)) {
        scheduledRemovals.current.add(dmg.id)
        setTimeout(() => {
          dispatch({ type: 'REMOVE_DAMAGE_NUMBER', payload: dmg.id })
          scheduledRemovals.current.delete(dmg.id)
        }, 600)
      }
    })
  }, [state.damageNumbers])

  // Idle tick (every second)
  useEffect(() => {
    if (state.isAuthenticated && state.machines.length > 0) {
      idleIntervalRef.current = setInterval(() => {
        dispatch({ type: 'TICK_IDLE' })
      }, 1000)
    }

    return () => {
      if (idleIntervalRef.current) {
        clearInterval(idleIntervalRef.current)
      }
    }
  }, [state.isAuthenticated, state.machines.length])

  // Save game function with retry
  const saveGame = useCallback(async (retries = 2): Promise<boolean> => {
    const sessionToken = localStorage.getItem('sessionToken')
    if (!sessionToken) return false

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch('/api/game/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({ gameState: state.gameState }),
        })

        if (response.ok) {
          return true
        }
        // If server error, retry
        if (response.status >= 500 && attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }
        return false
      } catch (error) {
        console.error(`Save attempt ${attempt + 1} failed:`, error)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }
    return false
  }, [state.gameState])

  // Auto-save
  useEffect(() => {
    if (state.isAuthenticated && !state.isLoading) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(async () => {
        const success = await saveGame()
        if (!success) {
          console.error('Auto-save failed after retries')
        }
      }, AUTO_SAVE_INTERVAL_MS)
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [state.gameState, state.isAuthenticated, state.isLoading, saveGame])

  // Save on page close/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!state.isAuthenticated) return

      // Don't save stale state if a purchase is in progress
      // Let the server's state (which has the completed transaction) be the source of truth
      if (purchaseInProgressRef.current) {
        console.log('Skipping beforeunload save - purchase in progress')
        return
      }

      const sessionToken = localStorage.getItem('sessionToken')
      if (!sessionToken) return

      // Use synchronous XHR for reliable save on page close (only way to send auth header)
      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/game/save', false) // false = synchronous
      xhr.setRequestHeader('Content-Type', 'application/json')
      xhr.setRequestHeader('Authorization', `Bearer ${sessionToken}`)
      try {
        xhr.send(JSON.stringify({ gameState: state.gameState }))
      } catch {
        // Ignore errors on page close
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [state.isAuthenticated, state.gameState])

  // Load game on mount
  useEffect(() => {
    const loadGame = async () => {
      try {
        const sessionToken = localStorage.getItem('sessionToken')
        if (!sessionToken) {
          dispatch({ type: 'SET_LOADING', payload: false })
          return
        }

        const response = await fetch('/api/game/state', {
          headers: { Authorization: `Bearer ${sessionToken}` },
        })

        if (response.ok) {
          const data = await response.json()
          dispatch({
            type: 'LOAD_GAME_DATA',
            payload: {
              userId: data.user.id,
              username: data.user.username,
              isAuthenticated: true,
              gameState: data.gameState,
              inventory: data.inventory,
              machines: data.machines,
              upgrades: data.upgrades,
              prestigeStats: data.prestigeStats,
              achievements: data.achievements,
            },
          })

          if (data.offlineEarnings && (data.offlineEarnings.scrap > 0 || data.offlineEarnings.data > 0)) {
            dispatch({
              type: 'SET_OFFLINE_EARNINGS',
              payload: data.offlineEarnings,
            })
          }
        } else {
          localStorage.removeItem('sessionToken')
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.error('Failed to load game:', error)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    loadGame()
  }, [])

  // Actions
  const tap = useCallback((x: number, y: number) => {
    dispatch({ type: 'TAP', payload: { x, y } })
  }, [])

  const login = useCallback(async (username: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('sessionToken', data.sessionToken)
        dispatch({
          type: 'SET_USER',
          payload: { userId: data.user.id, username: data.user.username },
        })
        dispatch({
          type: 'LOAD_GAME_DATA',
          payload: {
            gameState: data.gameState ?? initialGameState,
            inventory: data.inventory ?? [],
            machines: data.machines ?? [],
            upgrades: data.upgrades ?? [],
            prestigeStats: data.prestigeStats ?? initialPrestigeStats,
            achievements: data.achievements ?? [],
          },
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('sessionToken')
    dispatch({ type: 'LOGOUT' })
  }, [])

  const buyItem = useCallback(async (itemId: number): Promise<boolean> => {
    purchaseInProgressRef.current = true
    try {
      const sessionToken = localStorage.getItem('sessionToken')
      const response = await fetch('/api/shop/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ itemId }),
      })

      if (!response.ok) {
        return false
      }

      // Parse response with error handling
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        // API succeeded but response parsing failed
        // Force reload to get correct state from server
        console.error('Response parsing failed after successful purchase:', parseError)
        window.location.reload()
        return false
      }

      // Single atomic dispatch to update both inventory and currencies
      dispatch({
        type: 'PURCHASE_COMPLETE',
        payload: {
          item: data.item,
          newScrap: data.newScrap,
          newData: data.newData,
        },
      })
      return true
    } catch (error) {
      console.error('Buy failed:', error)
      return false
    } finally {
      purchaseInProgressRef.current = false
    }
  }, [])

  const equipItem = useCallback(async (itemId: number, type: 'weapon' | 'armor' | 'accessory'): Promise<boolean> => {
    try {
      // Find the inventory item to get its inventoryId
      const inventoryItem = state.inventory.find(i => i.id === itemId)
      if (!inventoryItem) {
        console.error('Item not found in inventory')
        return false
      }

      const sessionToken = localStorage.getItem('sessionToken')
      const response = await fetch('/api/game/equip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ inventoryId: inventoryItem.inventoryId }),
      })

      if (response.ok) {
        dispatch({ type: 'EQUIP_ITEM', payload: { itemId, type } })
        return true
      }
      return false
    } catch (error) {
      console.error('Equip failed:', error)
      return false
    }
  }, [state.inventory])

  const upgradeWeapon = useCallback(async (itemId: number): Promise<boolean> => {
    try {
      // Find the inventory item to get its inventoryId
      const inventoryItem = state.inventory.find(i => i.id === itemId)
      if (!inventoryItem) {
        console.error('Item not found in inventory')
        return false
      }

      const sessionToken = localStorage.getItem('sessionToken')
      const response = await fetch('/api/shop/upgrade-weapon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ inventoryId: inventoryItem.inventoryId }),
      })

      if (response.ok) {
        const data = await response.json()
        dispatch({ type: 'UPGRADE_WEAPON', payload: { itemId } })
        dispatch({
          type: 'UPDATE_CURRENCIES',
          payload: { scrap: data.newScrap },
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Upgrade failed:', error)
      return false
    }
  }, [state.inventory])

  const buyMachine = useCallback(async (machineType: MachineType): Promise<boolean> => {
    try {
      const sessionToken = localStorage.getItem('sessionToken')
      const response = await fetch('/api/machines/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ machineType }),
      })

      if (response.ok) {
        const data = await response.json()
        dispatch({ type: 'BUY_MACHINE', payload: { machineType } })
        dispatch({
          type: 'UPDATE_CURRENCIES',
          payload: { scrap: data.newScrap, dataPoints: data.newData },
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Buy machine failed:', error)
      return false
    }
  }, [])

  const buyUpgrade = useCallback(async (upgradeType: string, isPermanent: boolean): Promise<boolean> => {
    try {
      const sessionToken = localStorage.getItem('sessionToken')
      const response = await fetch('/api/upgrades/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ upgradeType }),
      })

      if (response.ok) {
        const data = await response.json()
        dispatch({ type: 'BUY_UPGRADE', payload: { upgradeType, isPermanent, newLevel: data.newLevel } })
        dispatch({
          type: 'UPDATE_CURRENCIES',
          payload: {
            scrap: data.newScrap,
            dataPoints: data.newData,
            coreFragments: data.newCoreFragments,
          },
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Buy upgrade failed:', error)
      return false
    }
  }, [])

  const prestige = useCallback(async (): Promise<boolean> => {
    try {
      const sessionToken = localStorage.getItem('sessionToken')
      const response = await fetch('/api/prestige/reboot', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        dispatch({ type: 'PRESTIGE' })
        dispatch({
          type: 'UPDATE_CURRENCIES',
          payload: { coreFragments: data.totalCoreFragments },
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Prestige failed:', error)
      return false
    }
  }, [])

  const collectOffline = useCallback(() => {
    dispatch({ type: 'COLLECT_OFFLINE' })
  }, [])

  const dismissWelcomeBack = useCallback(() => {
    dispatch({ type: 'DISMISS_WELCOME_BACK' })
  }, [])

  const useSkill = useCallback((skillId: string, effect: { type: string; value: number; duration?: number }) => {
    dispatch({ type: 'USE_SKILL', payload: { skillId, effect } })
  }, [])

  // Clean up expired effects periodically
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch({ type: 'CLEAN_EXPIRED_EFFECTS' })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const value: GameContextValue = {
    ...state,
    tap,
    login,
    logout,
    buyItem,
    equipItem,
    upgradeWeapon,
    buyMachine,
    buyUpgrade,
    prestige,
    collectOffline,
    dismissWelcomeBack,
    useSkill,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

// ============================================
// HOOK
// ============================================

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
