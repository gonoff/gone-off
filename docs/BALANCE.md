# Gone Off - Balance & Progression

## Overview

This document defines the mathematical formulas, progression curves, and balance parameters for Gone Off. All numbers are starting values and should be tuned through playtesting.

---

## Core Constants

```typescript
// Base values
const BASE_DAMAGE = 1;
const BASE_CRIT_CHANCE = 0.05;  // 5%
const BASE_CRIT_MULTIPLIER = 2.0;
const BASE_BOSS_HP = 100;

// Scaling factors
const HP_SCALE_PER_STAGE = 1.12;  // +12% per stage
const REWARD_SCALE_PER_STAGE = 1.08;  // +8% per stage
const COST_SCALE_FACTOR = 1.15;  // Machines, upgrades

// Time constants (in seconds)
const OFFLINE_CAP_BASE = 7200;  // 2 hours
const OFFLINE_CAP_PER_LEVEL = 3600;  // +1 hour per upgrade
const AUTO_SAVE_INTERVAL = 2;  // Save every 2 seconds
```

---

## Boss HP Scaling

### Formula

```typescript
function getBossHP(stage: number): number {
  const baseHP = BASE_BOSS_HP;
  const scaled = baseHP * Math.pow(HP_SCALE_PER_STAGE, stage - 1);

  // Mini-boss multiplier (every 10 stages)
  const miniBosMult = stage % 10 === 0 ? 2.0 : 1.0;

  // Named boss multiplier (every 50 stages)
  const namedBossMult = stage % 50 === 0 ? 5.0 : 1.0;

  // Major boss multiplier (every 100 stages)
  const majorBossMult = stage % 100 === 0 ? 10.0 : 1.0;

  // Take the highest multiplier
  const bossMultiplier = Math.max(miniBosMult, namedBossMult, majorBossMult);

  return Math.floor(scaled * bossMultiplier);
}
```

### Example Values

| Stage | Base HP | Type | Final HP |
|-------|---------|------|----------|
| 1 | 100 | Normal | 100 |
| 5 | 157 | Normal | 157 |
| 10 | 311 | Mini-boss | 622 |
| 25 | 1,700 | Normal | 1,700 |
| 50 | 28,900 | Named | 144,500 |
| 75 | 490,000 | Normal | 490,000 |
| 100 | 8.3M | Major | 83M |
| 150 | 1.4B | Named | 7B |
| 200 | 238B | Major | 2.38T |

---

## Reward Scaling

### Scrap Rewards

```typescript
function getScrapReward(stage: number): number {
  const baseScrap = 10;
  const scaled = baseScrap * Math.pow(REWARD_SCALE_PER_STAGE, stage - 1);

  // Boss multipliers (same as HP)
  const bossMultiplier = getBossMultiplier(stage);

  return Math.floor(scaled * bossMultiplier);
}
```

### Data Rewards

```typescript
function getDataReward(stage: number): number {
  // Data only drops from bosses (every 10+ stages)
  if (stage < 10) return 0;

  const baseData = 5;
  const scaled = baseData * Math.pow(1.06, stage - 10);

  // Higher boss multiplier for data
  const bossMultiplier = getBossMultiplier(stage) * 1.5;

  return Math.floor(scaled * bossMultiplier);
}
```

### Example Rewards

| Stage | Scrap | Data |
|-------|-------|------|
| 1 | 10 | 0 |
| 10 | 43 (x2) = 86 | 10 |
| 25 | 136 | 28 |
| 50 | 931 (x5) = 4,655 | 200 |
| 100 | 63,800 (x10) = 638,000 | 5,000 |
| 200 | 4.4M (x10) = 44M | 150,000 |

---

## Damage Calculation

### Tap Damage Formula

```typescript
function calculateTapDamage(state: GameState): number {
  // Base components
  const baseDamage = BASE_DAMAGE;
  const weaponDamage = getEquippedWeaponDamage(state);

  // Multipliers (additive within category, multiplicative between)
  const tempMultiplier = 1 + getTempDamageBonus(state);  // e.g., 1.5 for +50%
  const permMultiplier = 1 + getPermDamageBonus(state);  // e.g., 1.25 for +25%
  const prestigeMultiplier = getPrestigeMultiplier(state);

  // Critical hit
  const isCrit = Math.random() < getCritChance(state);
  const critMultiplier = isCrit ? getCritDamage(state) : 1.0;

  const damage = (baseDamage + weaponDamage)
    * tempMultiplier
    * permMultiplier
    * prestigeMultiplier
    * critMultiplier;

  return Math.floor(damage);
}
```

### Expected Taps to Kill

Target: Players should kill early bosses in ~50 taps, scaling up.

| Stage | Boss HP | Expected Damage | Taps to Kill |
|-------|---------|-----------------|--------------|
| 1 | 100 | 3 | 33 |
| 10 | 622 | 8 | 78 |
| 25 | 1,700 | 20 | 85 |
| 50 | 144,500 | 50 | 2,890 |
| 100 | 83M | 500 | 166,000 |

*Note: High stage taps assume active play + idle damage*

---

## Weapon Progression

### Weapon Stats

```typescript
const WEAPONS = [
  { tier: 1, name: "Rusty Pipe", damage: 2, cost: 50, unlockStage: 1 },
  { tier: 2, name: "Shock Baton", damage: 5, cost: 500, unlockStage: 10 },
  { tier: 3, name: "EMP Pistol", damage: 15, cost: 5000, unlockStage: 25 },
  { tier: 4, name: "Plasma Cutter", damage: 40, cost: 50000, unlockStage: 50 },
  { tier: 5, name: "Arc Rifle", damage: 100, cost: 250000, unlockStage: 75 },
  { tier: 6, name: "Quantum Disruptor", damage: 300, cost: 1000000, unlockStage: 100 },
  { tier: 7, name: "Singularity Cannon", damage: 800, cost: 10000000, unlockStage: 150 },
  { tier: 8, name: "Reality Shredder", damage: 2500, cost: 100000000, unlockStage: 200 },
];
```

### Weapon Upgrade Formula

Each weapon has 10 upgrade levels.

```typescript
function getWeaponUpgradeCost(baseCost: number, level: number): number {
  return Math.floor(baseCost * Math.pow(1.5, level));
}

function getWeaponDamageAtLevel(baseDamage: number, level: number): number {
  // +20% per level
  return Math.floor(baseDamage * (1 + 0.2 * level));
}
```

### Example: Plasma Cutter Upgrades

| Level | Damage | Upgrade Cost |
|-------|--------|--------------|
| 0 | 40 | - |
| 1 | 48 | 50,000 |
| 2 | 56 | 75,000 |
| 3 | 64 | 112,500 |
| 5 | 80 | 253,125 |
| 10 | 120 | 2,878,125 |

---

## Machine Economy

### Machine Base Stats

```typescript
const MACHINES = {
  scrap_collector: {
    name: "Scrap Collector",
    baseProduction: 1,  // per second
    baseCost: 1000,
    costCurrency: "scrap",
    costScale: 1.15,
  },
  data_miner: {
    name: "Data Miner",
    baseProduction: 0.1,  // per second
    baseCost: 500,
    costCurrency: "data",
    costScale: 1.15,
  },
  auto_turret: {
    name: "Auto-Turret",
    baseProduction: 1,  // DPS
    baseCost: 5000,
    costCurrency: "scrap",
    costScale: 1.12,
  },
  efficiency_bot: {
    name: "Efficiency Bot",
    baseProduction: 0.01,  // +1% to all per level
    baseCost: 10000,
    costCurrency: "data",
    costScale: 1.20,
  },
};
```

### Machine Formulas

```typescript
function getMachineProduction(type: string, level: number): number {
  const machine = MACHINES[type];
  // Each level doubles production
  return machine.baseProduction * Math.pow(2, level - 1);
}

function getMachineCost(type: string, currentLevel: number): number {
  const machine = MACHINES[type];
  return Math.floor(machine.baseCost * Math.pow(machine.costScale, currentLevel));
}
```

### Scrap Collector Progression

| Level | Production/sec | Cost | ROI (seconds) |
|-------|----------------|------|---------------|
| 1 | 1 | 1,000 | 1,000 |
| 5 | 16 | 1,749 | 109 |
| 10 | 512 | 4,046 | 8 |
| 20 | 524,288 | 21,645 | 0.04 |
| 50 | 5.6e14 | 6.2M | 0.00001 |

---

## Upgrade Costs

### Temporary Upgrades

```typescript
const TEMP_UPGRADES = {
  tap_power: {
    name: "Tap Power",
    effect: 0.10,  // +10% per level
    baseCost: 100,
    costCurrency: "scrap",
    costScale: 1.5,
    maxLevel: null,  // Unlimited
  },
  crit_chance: {
    name: "Crit Chance",
    effect: 0.01,  // +1% per level
    baseCost: 500,
    costCurrency: "scrap",
    costScale: 1.6,
    maxLevel: 25,  // Cap at 30% bonus (35% total)
  },
  crit_damage: {
    name: "Crit Damage",
    effect: 0.10,  // +10% per level
    baseCost: 50,
    costCurrency: "data",
    costScale: 1.5,
    maxLevel: 30,  // Cap at 5x crit damage
  },
  idle_power: {
    name: "Idle Power",
    effect: 0.10,  // +10% machine output
    baseCost: 1000,
    costCurrency: "scrap",
    costScale: 1.4,
    maxLevel: null,
  },
  drop_rate: {
    name: "Drop Rate",
    effect: 0.05,  // +5% resource drops
    baseCost: 100,
    costCurrency: "data",
    costScale: 1.7,
    maxLevel: 20,  // Cap at +100%
  },
};
```

### Permanent Upgrades

```typescript
const PERM_UPGRADES = {
  starting_damage: {
    name: "Starting Damage",
    effect: 0.25,  // +25% per level
    baseCost: 1,
    costCurrency: "core_fragments",
    costScale: 1.5,
    maxLevel: 20,  // Cap at 6x starting damage
  },
  starting_scrap: {
    name: "Starting Scrap",
    effect: 1.0,  // +100% starting scrap per level
    baseCost: 2,
    costCurrency: "core_fragments",
    costScale: 2.0,
    maxLevel: 10,
  },
  idle_efficiency: {
    name: "Idle Efficiency",
    effect: 0.10,  // +10% all idle per level
    baseCost: 1,
    costCurrency: "core_fragments",
    costScale: 1.3,
    maxLevel: 30,
  },
  storage_boost: {
    name: "Storage Boost",
    effect: 3600,  // +1 hour per level
    baseCost: 5,
    costCurrency: "core_fragments",
    costScale: 2.0,
    maxLevel: 10,
  },
  prestige_bonus: {
    name: "Prestige Bonus",
    effect: 0.10,  // +10% core fragments per level
    baseCost: 3,
    costCurrency: "core_fragments",
    costScale: 1.5,
    maxLevel: 20,
  },
};
```

---

## Offline Earnings

### Storage Cap Formula

```typescript
function getOfflineCapHours(level: number, permBonus: number): number {
  const base = 2;  // 2 hours at level 1
  const fromUpgrades = (level - 1) * 1;  // +1 hour per upgrade level
  const fromPerm = permBonus;  // From permanent upgrades

  return base + fromUpgrades + fromPerm;
}

function getOfflineCapSeconds(level: number, permBonus: number): number {
  return getOfflineCapHours(level, permBonus) * 3600;
}
```

### Storage Upgrade Costs

| Level | Cap (hours) | Cost (Scrap) |
|-------|-------------|--------------|
| 1 | 2 | - (base) |
| 2 | 3 | 10,000 |
| 3 | 4 | 50,000 |
| 4 | 6 | 200,000 |
| 5 | 8 | 1,000,000 |
| 6 | 12 | 5,000,000 |
| 7 | 18 | 25,000,000 |
| 8 | 24 | 100,000,000 |

### Offline Calculation

```typescript
function calculateOfflineEarnings(
  lastOnline: Date,
  machines: Machine[],
  offlineCapSeconds: number
): OfflineEarnings {
  const now = new Date();
  const secondsAway = Math.floor((now - lastOnline) / 1000);
  const cappedSeconds = Math.min(secondsAway, offlineCapSeconds);

  let scrapEarned = 0;
  let dataEarned = 0;

  for (const machine of machines) {
    const production = getMachineProduction(machine.type, machine.level);

    if (machine.type === "scrap_collector") {
      scrapEarned += production * cappedSeconds;
    } else if (machine.type === "data_miner") {
      dataEarned += production * cappedSeconds;
    }
  }

  return {
    scrap: Math.floor(scrapEarned),
    data: Math.floor(dataEarned),
    timeAway: secondsAway,
    cappedAt: cappedSeconds,
    wasCapped: secondsAway > offlineCapSeconds,
  };
}
```

---

## Prestige System

### Core Fragment Formula

```typescript
function calculateCoreFragments(
  highestStage: number,
  prestigeBonus: number
): number {
  // Base formula: sqrt(stage / 10)
  const base = Math.floor(Math.sqrt(highestStage / 10));

  // Apply prestige bonus (from permanent upgrades)
  const withBonus = base * (1 + prestigeBonus);

  return Math.floor(withBonus);
}
```

### Expected Core Fragments

| Highest Stage | Base CF | With +50% Bonus |
|---------------|---------|-----------------|
| 10 | 1 | 1 |
| 40 | 2 | 3 |
| 90 | 3 | 4 |
| 160 | 4 | 6 |
| 250 | 5 | 7 |
| 500 | 7 | 10 |
| 1000 | 10 | 15 |
| 2500 | 15 | 22 |

### Prestige Milestones

| Prestiges | Unlock |
|-----------|--------|
| 1 | Permanent upgrade shop |
| 3 | Tier 6 weapons visible |
| 5 | Auto-tap ability |
| 10 | Tier 7 weapons visible |
| 15 | New boss variants |
| 25 | Tier 8 weapons visible |
| 50 | Secret ending hint |

---

## Progression Timeline

### Expected Player Progression

**New Player (0-30 minutes)**
- Reach Stage 10-15
- Buy first weapon upgrade
- Understand tap mechanics
- ~500 Scrap earned

**Early Game (30 min - 2 hours)**
- Reach Stage 30-50
- Buy Tier 2-3 weapons
- First machine purchase
- ~50,000 Scrap earned

**Mid Game (2-8 hours)**
- Reach Stage 75-100
- First prestige possible
- Multiple machines
- ~5M Scrap earned

**Late Game (8-24 hours)**
- Reach Stage 150-200
- 3-5 prestiges
- Permanent upgrades invested
- ~500M Scrap earned

**End Game (24+ hours)**
- Stage 300+
- 10+ prestiges
- Near-max weapons
- Billions of Scrap

---

## Balance Levers

### If Game Is Too Easy

1. Increase `HP_SCALE_PER_STAGE` (1.12 → 1.15)
2. Decrease weapon damage values
3. Increase machine cost scaling
4. Reduce offline cap base hours

### If Game Is Too Hard

1. Decrease `HP_SCALE_PER_STAGE` (1.12 → 1.10)
2. Increase `REWARD_SCALE_PER_STAGE` (1.08 → 1.10)
3. Increase weapon damage values
4. Reduce upgrade costs

### If Prestige Feels Unrewarding

1. Increase Core Fragment formula coefficient
2. Add more powerful permanent upgrades
3. Unlock content faster with prestiges
4. Increase starting bonuses

### If Offline Is Too Strong/Weak

1. Adjust machine production rates
2. Change offline cap progression
3. Modify storage upgrade costs
4. Add efficiency multiplier caps

---

## Formulas Quick Reference

```typescript
// Boss HP
bossHP = 100 * 1.12^(stage-1) * bossMultiplier

// Scrap Reward
scrap = 10 * 1.08^(stage-1) * bossMultiplier

// Tap Damage
damage = (1 + weaponDmg) * tempMult * permMult * critMult

// Machine Production
production = baseProd * 2^(level-1)

// Machine Cost
cost = baseCost * 1.15^level

// Upgrade Cost
cost = baseCost * scale^level

// Core Fragments
fragments = sqrt(highestStage / 10) * (1 + prestigeBonus)

// Offline Cap
capHours = 2 + (storageLevel - 1) + permStorageBonus
```

---

## Playtesting Notes

### Key Metrics to Track

1. **Time to first prestige** - Target: 2-4 hours
2. **Taps per boss at Stage 50** - Target: 1,000-3,000
3. **Offline earnings vs active** - Offline should be ~30% of active
4. **Core Fragments per prestige** - Target: 3-7 average
5. **Session length** - Target: 10-30 minutes per session

### Red Flags

- Players hitting walls (can't progress for 30+ min)
- Prestige feeling mandatory too early
- Offline earnings exceeding active play value
- Players skipping entire weapon tiers
- Core Fragments accumulating with nothing to spend on
