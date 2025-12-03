// Game State Types

export interface User {
  id: number
  username: string
  sessionToken: string | null
  createdAt: Date
  lastActive: Date
}

export interface GameState {
  currentStage: number
  highestStage: number
  scrap: bigint
  dataPoints: bigint
  coreFragments: number
  offlineCapLevel: number
  currentBossHp: bigint
  currentBossMaxHp: bigint
  totalTaps: bigint
  totalDamageDealt: bigint
  equippedWeaponId: number | null
  equippedArmorId: number | null
  equippedAccessoryId: number | null
}

export interface ClientGameState {
  currentStage: number
  highestStage: number
  scrap: number
  dataPoints: number
  coreFragments: number
  offlineCapLevel: number
  currentBossHp: number
  currentBossMaxHp: number
  totalTaps: number
  totalDamageDealt: number
  equippedWeaponId: number | null
  equippedArmorId: number | null
  equippedAccessoryId: number | null
}

export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable'

export interface Item {
  id: number
  name: string
  type: ItemType
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
}

export interface InventoryItem extends Item {
  inventoryId: number // The Inventory row's primary key (used for equip/upgrade)
  quantity: number
  upgradeLevel: number
  isEquipped: boolean
}

export type MachineType = 'scrap_collector' | 'data_miner' | 'auto_turret' | 'efficiency_bot'

export interface Machine {
  id: number
  machineType: MachineType
  level: number
  lastCollected: Date
}

export interface MachineConfig {
  type: MachineType
  name: string
  description: string
  baseProduction: number
  baseCost: number
  costCurrency: 'scrap' | 'data'
  costScale: number
  unlockStage: number
  icon: string
}

export interface Upgrade {
  id: number
  upgradeType: string
  level: number
  isPermanent: boolean
}

export interface UpgradeConfig {
  type: string
  name: string
  description: string
  effect: number
  baseCost: number
  costCurrency: 'scrap' | 'data' | 'core_fragments'
  costScale: number
  maxLevel: number | null
  isPermanent: boolean
}

export interface PrestigeStats {
  totalPrestiges: number
  lifetimeScrap: number
  lifetimeData: number
  lifetimeCoreFragments: number
  lifetimeBossesKilled: number
  lifetimeTaps: number
  fastestStage100: number | null
  highestDamageHit: number
}

export interface Achievement {
  key: string
  unlockedAt: Date
}

export interface Boss {
  name: string
  flavor: string
  hp: number
  maxHp: number
  stage: number
  rewards: {
    scrap: number
    data: number
  }
  isMini: boolean
  isNamed: boolean
  isMajor: boolean
}

export interface DamageResult {
  damage: number
  isCritical: boolean
  killed: boolean
  rewards?: {
    scrap: number
    data: number
  }
}

export interface OfflineEarnings {
  scrap: number
  data: number
  dps: number // Total damage dealt to boss while offline
  timeAway: number
  cappedAt: number
  wasCapped: boolean
}

// Active effects from consumables and skills
export interface ActiveEffect {
  type: 'damage_boost' | 'auto_tap' | 'data_boost' | 'scrap_boost' | 'crit_boost' | 'reward_boost'
  value: number
  endsAt: number
}

// Full player data for API responses
export interface PlayerData {
  user: User
  gameState: ClientGameState
  inventory: InventoryItem[]
  machines: Machine[]
  upgrades: Upgrade[]
  prestigeStats: PrestigeStats
  achievements: Achievement[]
}
