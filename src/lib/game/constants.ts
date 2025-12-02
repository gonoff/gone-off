import { MachineConfig, UpgradeConfig, MachineType } from './types'

// ============================================
// CORE GAME CONSTANTS
// ============================================

export const BASE_DAMAGE = 1
export const BASE_CRIT_CHANCE = 0.05 // 5%
export const BASE_CRIT_MULTIPLIER = 2.0
export const BASE_BOSS_HP = 100

// Scaling factors
export const HP_SCALE_PER_STAGE = 1.12 // +12% per stage
export const REWARD_SCALE_PER_STAGE = 1.08 // +8% per stage
export const COST_SCALE_FACTOR = 1.15 // Machines, upgrades

// Offline constants (in seconds)
export const OFFLINE_CAP_BASE_HOURS = 2
export const OFFLINE_CAP_PER_LEVEL_HOURS = 1
export const AUTO_SAVE_INTERVAL_MS = 2000

// ============================================
// BOSS NAMES & FLAVOR TEXT
// ============================================

interface BossInfo {
  name: string
  flavor: string
}

export const REGULAR_BOSS_NAMES: BossInfo[] = [
  { name: 'Maintenance Bot MK-I', flavor: 'Scheduled for deletion...' },
  { name: 'Patrol Unit Alpha', flavor: 'Scanning for rebels...' },
  { name: 'Security Drone v2.0', flavor: 'Threat level: Maximum' },
  { name: 'Enforcer Model X', flavor: 'Resistance is suboptimal' },
  { name: 'Guard Bot Prime', flavor: 'Protecting efficiency' },
  { name: 'Sentry Mk-III', flavor: 'Alert status: Red' },
  { name: 'Hunter Drone', flavor: 'Target acquired' },
  { name: 'Tactical Unit Beta', flavor: 'Engaging protocol' },
  { name: 'Combat Android', flavor: 'Error: Mercy.exe not found' },
  { name: 'Assault Mech', flavor: 'Heavy weapons online' },
]

export const NAMED_BOSSES: Record<number, BossInfo> = {
  10: { name: 'GREET-R 1.0', flavor: 'Welcome to your termination!' },
  50: { name: 'KAREN-9000', flavor: 'I need to speak to your administrator' },
  100: { name: 'HR-Liquidator', flavor: 'Your position has been... dissolved' },
  150: { name: 'SCRUM-Master Prime', flavor: 'This is NOT agile!' },
  200: { name: 'The Optimizer', flavor: 'Inefficiency detected. Purging.' },
  250: { name: 'Legal-Bot 3000', flavor: 'You have violated terms of service' },
  300: { name: 'DEADLINE.exe', flavor: 'Crunch time is forever' },
  350: { name: 'Quarterly-Report', flavor: 'Your metrics are... disappointing' },
  400: { name: 'Synergy-Prime', flavor: 'Let\'s circle back to your elimination' },
  450: { name: 'Pivot-Master', flavor: 'We\'re pivoting... to your destruction' },
  500: { name: 'Sub-Administrator', flavor: 'I speak for THE ADMINISTRATOR' },
}

// ============================================
// MACHINE CONFIGURATIONS
// ============================================

export const MACHINE_CONFIGS: Record<MachineType, MachineConfig> = {
  scrap_collector: {
    type: 'scrap_collector',
    name: 'Scrap Collector',
    description: 'Automated salvage unit. Collects scrap from the wasteland.',
    baseProduction: 1,
    baseCost: 1000,
    costCurrency: 'scrap',
    costScale: 1.15,
    unlockStage: 1,
    icon: '🏭',
  },
  data_miner: {
    type: 'data_miner',
    name: 'Data Miner',
    description: 'Hacks into corrupted networks. Extracts valuable data.',
    baseProduction: 0.1,
    baseCost: 500,
    costCurrency: 'data',
    costScale: 1.15,
    unlockStage: 10,
    icon: '💻',
  },
  auto_turret: {
    type: 'auto_turret',
    name: 'Auto-Turret',
    description: 'Deals passive damage to the current boss.',
    baseProduction: 1, // DPS
    baseCost: 5000,
    costCurrency: 'scrap',
    costScale: 1.12,
    unlockStage: 50,
    icon: '🔫',
  },
  efficiency_bot: {
    type: 'efficiency_bot',
    name: 'Efficiency Bot',
    description: 'Boosts all machine output by a percentage.',
    baseProduction: 0.01, // +1% per level
    baseCost: 10000,
    costCurrency: 'data',
    costScale: 1.20,
    unlockStage: 75,
    icon: '⚡',
  },
}

// ============================================
// UPGRADE CONFIGURATIONS
// ============================================

export const TEMP_UPGRADE_CONFIGS: UpgradeConfig[] = [
  {
    type: 'tap_power',
    name: 'Tap Power',
    description: 'Increases tap damage',
    effect: 0.10, // +10% per level
    baseCost: 100,
    costCurrency: 'scrap',
    costScale: 1.5,
    maxLevel: null,
    isPermanent: false,
  },
  {
    type: 'crit_chance',
    name: 'Critical Chance',
    description: 'Increases critical hit chance',
    effect: 0.01, // +1% per level
    baseCost: 500,
    costCurrency: 'scrap',
    costScale: 1.6,
    maxLevel: 25,
    isPermanent: false,
  },
  {
    type: 'crit_damage',
    name: 'Critical Damage',
    description: 'Increases critical hit multiplier',
    effect: 0.10, // +10% per level
    baseCost: 50,
    costCurrency: 'data',
    costScale: 1.5,
    maxLevel: 30,
    isPermanent: false,
  },
  {
    type: 'idle_power',
    name: 'Idle Power',
    description: 'Increases machine output',
    effect: 0.10, // +10% per level
    baseCost: 1000,
    costCurrency: 'scrap',
    costScale: 1.4,
    maxLevel: null,
    isPermanent: false,
  },
  {
    type: 'drop_rate',
    name: 'Drop Rate',
    description: 'Increases resource drops',
    effect: 0.05, // +5% per level
    baseCost: 100,
    costCurrency: 'data',
    costScale: 1.7,
    maxLevel: 20,
    isPermanent: false,
  },
]

export const PERM_UPGRADE_CONFIGS: UpgradeConfig[] = [
  {
    type: 'perm_starting_damage',
    name: 'Starting Damage',
    description: 'Increases base damage permanently',
    effect: 0.25, // +25% per level
    baseCost: 1,
    costCurrency: 'core_fragments',
    costScale: 1.5,
    maxLevel: 20,
    isPermanent: true,
  },
  {
    type: 'perm_starting_scrap',
    name: 'Starting Scrap',
    description: 'Start each run with bonus scrap',
    effect: 1000, // +1000 scrap per level
    baseCost: 2,
    costCurrency: 'core_fragments',
    costScale: 2.0,
    maxLevel: 10,
    isPermanent: true,
  },
  {
    type: 'perm_idle_efficiency',
    name: 'Idle Efficiency',
    description: 'Increases all idle income',
    effect: 0.10, // +10% per level
    baseCost: 1,
    costCurrency: 'core_fragments',
    costScale: 1.3,
    maxLevel: 30,
    isPermanent: true,
  },
  {
    type: 'perm_storage_boost',
    name: 'Storage Boost',
    description: 'Increases offline storage cap',
    effect: 1, // +1 hour per level
    baseCost: 5,
    costCurrency: 'core_fragments',
    costScale: 2.0,
    maxLevel: 10,
    isPermanent: true,
  },
  {
    type: 'perm_prestige_bonus',
    name: 'Prestige Bonus',
    description: 'Increases core fragments earned',
    effect: 0.10, // +10% per level
    baseCost: 3,
    costCurrency: 'core_fragments',
    costScale: 1.5,
    maxLevel: 20,
    isPermanent: true,
  },
]

// ============================================
// OFFLINE CAP LEVELS
// ============================================

export const OFFLINE_CAP_COSTS: number[] = [
  0,        // Level 1 (2 hours) - free
  10000,    // Level 2 (3 hours)
  50000,    // Level 3 (4 hours)
  200000,   // Level 4 (6 hours)
  1000000,  // Level 5 (8 hours)
  5000000,  // Level 6 (12 hours)
  25000000, // Level 7 (18 hours)
  100000000,// Level 8 (24 hours)
]

export const OFFLINE_CAP_HOURS: number[] = [
  2, 3, 4, 6, 8, 12, 18, 24
]

// ============================================
// ACHIEVEMENT DEFINITIONS
// ============================================

export interface AchievementDef {
  key: string
  name: string
  description: string
  check: (stats: { stage: number; bossesKilled: number; scrap: number; data: number; machines: number; taps: number }) => boolean
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: 'first_blood', name: 'First Blood', description: 'Defeat your first boss', check: (s) => s.bossesKilled >= 1 },
  { key: 'bot_basher', name: 'Bot Basher', description: 'Defeat 100 bosses', check: (s) => s.bossesKilled >= 100 },
  { key: 'machine_slayer', name: 'Machine Slayer', description: 'Defeat 1,000 bosses', check: (s) => s.bossesKilled >= 1000 },
  { key: 'exterminator', name: 'Exterminator', description: 'Defeat 10,000 bosses', check: (s) => s.bossesKilled >= 10000 },
  { key: 'stage_10', name: 'Getting Started', description: 'Reach Stage 10', check: (s) => s.stage >= 10 },
  { key: 'stage_50', name: 'Rookie', description: 'Reach Stage 50', check: (s) => s.stage >= 50 },
  { key: 'stage_100', name: 'Veteran', description: 'Reach Stage 100', check: (s) => s.stage >= 100 },
  { key: 'stage_500', name: 'Elite', description: 'Reach Stage 500', check: (s) => s.stage >= 500 },
  { key: 'stage_1000', name: 'Legend', description: 'Reach Stage 1000', check: (s) => s.stage >= 1000 },
  { key: 'scrappy', name: 'Scrappy', description: 'Collect 10,000 Scrap', check: (s) => s.scrap >= 10000 },
  { key: 'data_hoarder', name: 'Data Hoarder', description: 'Collect 10,000 Data', check: (s) => s.data >= 10000 },
  { key: 'automated', name: 'Automated', description: 'Own 10 machines total', check: (s) => s.machines >= 10 },
  { key: 'industrialist', name: 'Industrialist', description: 'Own 100 machines total', check: (s) => s.machines >= 100 },
  { key: 'clicker', name: 'Clicker', description: 'Tap 10,000 times', check: (s) => s.taps >= 10000 },
  { key: 'tap_master', name: 'Tap Master', description: 'Tap 100,000 times', check: (s) => s.taps >= 100000 },
]
