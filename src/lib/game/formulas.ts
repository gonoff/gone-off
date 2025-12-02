import {
  BASE_DAMAGE,
  BASE_CRIT_CHANCE,
  BASE_CRIT_MULTIPLIER,
  BASE_BOSS_HP,
  HP_SCALE_PER_STAGE,
  REWARD_SCALE_PER_STAGE,
  REGULAR_BOSS_NAMES,
  NAMED_BOSSES,
  MACHINE_CONFIGS,
  TEMP_UPGRADE_CONFIGS,
  PERM_UPGRADE_CONFIGS,
  OFFLINE_CAP_HOURS,
} from './constants'
import { Boss, Machine, Upgrade, ClientGameState, MachineType, OfflineEarnings } from './types'

// ============================================
// BOSS CALCULATIONS
// ============================================

export function getBossMultiplier(stage: number): number {
  if (stage % 100 === 0) return 10.0 // Major boss
  if (stage % 50 === 0) return 5.0   // Named boss
  if (stage % 10 === 0) return 2.0   // Mini-boss
  return 1.0
}

export function getBossHP(stage: number): number {
  const baseHP = BASE_BOSS_HP
  const scaled = baseHP * Math.pow(HP_SCALE_PER_STAGE, stage - 1)
  const bossMultiplier = getBossMultiplier(stage)
  return Math.floor(scaled * bossMultiplier)
}

export function getScrapReward(stage: number): number {
  const baseScrap = 10
  const scaled = baseScrap * Math.pow(REWARD_SCALE_PER_STAGE, stage - 1)
  const bossMultiplier = getBossMultiplier(stage)
  return Math.floor(scaled * bossMultiplier)
}

export function getDataReward(stage: number): number {
  if (stage < 10) return 0 // Data only from stage 10+

  const baseData = 5
  const scaled = baseData * Math.pow(1.06, stage - 10)
  const bossMultiplier = getBossMultiplier(stage) * 1.5
  return Math.floor(scaled * bossMultiplier)
}

export function getBossInfo(stage: number): Boss {
  const isMajor = stage % 100 === 0
  const isNamed = stage % 50 === 0
  const isMini = stage % 10 === 0 && !isNamed && !isMajor

  let name: string
  let flavor: string

  if (NAMED_BOSSES[stage]) {
    name = NAMED_BOSSES[stage].name
    flavor = NAMED_BOSSES[stage].flavor
  } else if (isMajor) {
    name = `ADMIN-${Math.floor(stage / 100)}`
    flavor = 'THE ADMINISTRATOR is watching...'
  } else if (isMini) {
    const bossIndex = Math.floor(stage / 10) % REGULAR_BOSS_NAMES.length
    name = REGULAR_BOSS_NAMES[bossIndex].name
    flavor = REGULAR_BOSS_NAMES[bossIndex].flavor
  } else {
    const randomIndex = stage % REGULAR_BOSS_NAMES.length
    name = `${REGULAR_BOSS_NAMES[randomIndex].name}`
    flavor = REGULAR_BOSS_NAMES[randomIndex].flavor
  }

  const maxHp = getBossHP(stage)

  return {
    name,
    flavor,
    hp: maxHp,
    maxHp,
    stage,
    rewards: {
      scrap: getScrapReward(stage),
      data: getDataReward(stage),
    },
    isMini,
    isNamed,
    isMajor,
  }
}

// ============================================
// DAMAGE CALCULATIONS
// ============================================

export function calculateTapDamage(
  equippedWeaponDamage: number,
  upgrades: Upgrade[],
  activeEffects: { damageBoost?: number } = {}
): { damage: number; isCritical: boolean } {
  // Get upgrade levels
  const tapPowerLevel = upgrades.find(u => u.upgradeType === 'tap_power')?.level ?? 0
  const critChanceLevel = upgrades.find(u => u.upgradeType === 'crit_chance')?.level ?? 0
  const critDamageLevel = upgrades.find(u => u.upgradeType === 'crit_damage')?.level ?? 0
  const permDamageLevel = upgrades.find(u => u.upgradeType === 'perm_starting_damage')?.level ?? 0

  // Calculate multipliers
  const tapPowerMult = 1 + (tapPowerLevel * 0.10)
  const permDamageMult = 1 + (permDamageLevel * 0.25)
  const effectMult = activeEffects.damageBoost ?? 1

  // Calculate crit
  const critChance = BASE_CRIT_CHANCE + (critChanceLevel * 0.01)
  const isCritical = Math.random() < critChance
  const critMult = isCritical ? BASE_CRIT_MULTIPLIER + (critDamageLevel * 0.10) : 1

  // Final damage
  const baseDmg = BASE_DAMAGE + equippedWeaponDamage
  const damage = Math.floor(baseDmg * tapPowerMult * permDamageMult * effectMult * critMult)

  return { damage: Math.max(1, damage), isCritical }
}

export function getWeaponDamageAtLevel(baseDamage: number, upgradeLevel: number): number {
  // +20% per upgrade level
  return Math.floor(baseDamage * (1 + 0.2 * upgradeLevel))
}

export function getWeaponUpgradeCost(baseCost: number, level: number): number {
  return Math.floor(baseCost * Math.pow(1.5, level))
}

// ============================================
// MACHINE CALCULATIONS
// ============================================

export function getMachineProduction(type: MachineType, level: number): number {
  const config = MACHINE_CONFIGS[type]
  if (level === 0) return 0
  // Each level doubles production
  return config.baseProduction * Math.pow(2, level - 1)
}

export function getMachineCost(type: MachineType, currentLevel: number): number {
  const config = MACHINE_CONFIGS[type]
  if (currentLevel === 0) return config.baseCost
  return Math.floor(config.baseCost * Math.pow(config.costScale, currentLevel))
}

export function getTotalIdleProduction(
  machines: Machine[],
  upgrades: Upgrade[]
): { scrap: number; data: number; dps: number } {
  const idlePowerLevel = upgrades.find(u => u.upgradeType === 'idle_power')?.level ?? 0
  const permIdleLevel = upgrades.find(u => u.upgradeType === 'perm_idle_efficiency')?.level ?? 0

  const idleMult = 1 + (idlePowerLevel * 0.10) + (permIdleLevel * 0.10)

  // Get efficiency bot bonus
  const efficiencyBot = machines.find(m => m.machineType === 'efficiency_bot')
  const efficiencyMult = 1 + (efficiencyBot ? getMachineProduction('efficiency_bot', efficiencyBot.level) : 0)

  let scrap = 0
  let data = 0
  let dps = 0

  for (const machine of machines) {
    const production = getMachineProduction(machine.machineType, machine.level)

    switch (machine.machineType) {
      case 'scrap_collector':
        scrap += production
        break
      case 'data_miner':
        data += production
        break
      case 'auto_turret':
        dps += production
        break
    }
  }

  return {
    scrap: scrap * idleMult * efficiencyMult,
    data: data * idleMult * efficiencyMult,
    dps: dps * idleMult * efficiencyMult,
  }
}

// ============================================
// UPGRADE CALCULATIONS
// ============================================

export function getUpgradeCost(
  upgradeType: string,
  currentLevel: number,
  isPermanent: boolean
): number {
  const configs = isPermanent ? PERM_UPGRADE_CONFIGS : TEMP_UPGRADE_CONFIGS
  const config = configs.find(c => c.type === upgradeType)
  if (!config) return Infinity

  return Math.floor(config.baseCost * Math.pow(config.costScale, currentLevel))
}

export function getUpgradeEffect(
  upgradeType: string,
  level: number,
  isPermanent: boolean
): number {
  const configs = isPermanent ? PERM_UPGRADE_CONFIGS : TEMP_UPGRADE_CONFIGS
  const config = configs.find(c => c.type === upgradeType)
  if (!config) return 0

  return config.effect * level
}

// ============================================
// OFFLINE EARNINGS
// ============================================

export function getOfflineCapSeconds(
  storageLevel: number,
  permStorageLevel: number
): number {
  const baseHours = OFFLINE_CAP_HOURS[Math.min(storageLevel - 1, OFFLINE_CAP_HOURS.length - 1)]
  const permHours = permStorageLevel // +1 hour per level
  return (baseHours + permHours) * 3600
}

export function calculateOfflineEarnings(
  lastOnline: Date,
  machines: Machine[],
  upgrades: Upgrade[],
  storageLevel: number
): OfflineEarnings {
  const now = new Date()
  const secondsAway = Math.floor((now.getTime() - lastOnline.getTime()) / 1000)

  const permStorageLevel = upgrades.find(u => u.upgradeType === 'perm_storage_boost')?.level ?? 0
  const capSeconds = getOfflineCapSeconds(storageLevel, permStorageLevel)
  const cappedSeconds = Math.min(secondsAway, capSeconds)

  const { scrap, data } = getTotalIdleProduction(machines, upgrades)

  return {
    scrap: Math.floor(scrap * cappedSeconds),
    data: Math.floor(data * cappedSeconds),
    timeAway: secondsAway,
    cappedAt: cappedSeconds,
    wasCapped: secondsAway > capSeconds,
  }
}

// ============================================
// PRESTIGE CALCULATIONS
// ============================================

export function calculateCoreFragments(
  highestStage: number,
  prestigeBonusLevel: number
): number {
  if (highestStage < 10) return 0

  // Base formula: sqrt(stage / 10)
  const base = Math.floor(Math.sqrt(highestStage / 10))

  // Apply prestige bonus
  const bonusMult = 1 + (prestigeBonusLevel * 0.10)

  return Math.floor(base * bonusMult)
}

export function getPrestigeRewards(
  gameState: ClientGameState,
  upgrades: Upgrade[]
): { coreFragments: number; totalCoreFragments: number } {
  const prestigeBonusLevel = upgrades.find(u => u.upgradeType === 'perm_prestige_bonus')?.level ?? 0
  const earned = calculateCoreFragments(gameState.highestStage, prestigeBonusLevel)

  return {
    coreFragments: earned,
    totalCoreFragments: gameState.coreFragments + earned,
  }
}

// ============================================
// FORMATTING UTILITIES
// ============================================

export function formatNumber(num: number): string {
  if (num >= 1e15) return `${(num / 1e15).toFixed(2)}Q`
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
  return num.toLocaleString()
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}
