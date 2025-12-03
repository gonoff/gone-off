# Gone Off - Game Mechanics Documentation

## Overview

Gone Off is an incremental clicker RPG where players fight robot bosses in an AGI dystopia. This document covers all game mechanics, formulas, and systems.

---

## Combat System

### Base Damage Calculation

**Formula**: `floor((BASE_DAMAGE + weaponDmg + armorDmg + accessoryDmg) × tapPowerMult × permDamageMult × effectMult × critMult)`

**Components**:
- `BASE_DAMAGE` = 1 (constant)
- `weaponDmg` = equipped weapon's damage at current upgrade level
- `armorDmg` = equipped armor's damageBonus (if any)
- `accessoryDmg` = equipped accessory's damageBonus (if any)
- `tapPowerMult` = 1 + (tapPowerLevel × 0.10)
- `permDamageMult` = 1 + (permDamageLevel × 0.25)
- `effectMult` = active damage boost multiplier (default 1.0)
- `critMult` = critical hit multiplier (1.0 if not crit)

**Location**: `src/lib/game/formulas.ts:97-128`

### Weapon Damage Scaling

**Formula**: `floor(baseDamage × (1 + 0.2 × upgradeLevel))`

Each upgrade level adds +20% to the weapon's base damage.

**Location**: `src/lib/game/formulas.ts:130-133`

### Critical Hits

**Crit Chance**: `BASE_CRIT_CHANCE + (critChanceLevel × 0.01) + equipmentCritBonus`
- `BASE_CRIT_CHANCE` = 0.05 (5%)
- Max crit chance level = 25 (+25% → 30% total)
- Equipment crit bonus from armor/accessories

**Crit Multiplier**: `BASE_CRIT_MULTIPLIER + (critDamageLevel × 0.10)`
- `BASE_CRIT_MULTIPLIER` = 2.0 (2x damage)
- Max crit damage level = 30 (+3.0x → 5.0x total)

**Location**: `src/lib/game/formulas.ts:117-121`

---

## Boss System

### Boss HP Scaling

**Formula**: `floor(BASE_BOSS_HP × HP_SCALE_PER_STAGE^(stage-1) × bossMultiplier)`

**Constants**:
- `BASE_BOSS_HP` = 100
- `HP_SCALE_PER_STAGE` = 1.12 (+12% per stage)

**Boss Multipliers**:
| Stage Condition | Multiplier | Boss Type |
|-----------------|------------|-----------|
| Regular stage | 1.0x | Normal |
| Every 10 stages | 2.0x | Mini-boss |
| Every 50 stages | 5.0x | Named boss |
| Every 100 stages | 10.0x | Major boss (Admin) |

**Location**: `src/lib/game/formulas.ts:21-33`

### Boss Rewards

**Scrap**: `floor(10 × REWARD_SCALE_PER_STAGE^(stage-1) × bossMultiplier × dropMult × scrapBoost × (1 + equipmentScrapBonus))`

**Data** (stage 10+): `floor(5 × 1.06^(stage-10) × 1.5 × bossMultiplier × dropMult × dataBoost × (1 + equipmentDataBonus))`

**Variables**:
- `REWARD_SCALE_PER_STAGE` = 1.08 (+8% per stage)
- `dropMult` = 1 + (dropRateLevel × 0.05)
- `scrapBoost` / `dataBoost` = active consumable effects
- Equipment bonuses from armor/accessories (percentage based)

**Location**: `src/lib/game/formulas.ts:35-49`, `src/contexts/GameContext.tsx:240-276`

### Named Bosses

| Stage | Name | Flavor Text |
|-------|------|-------------|
| 50 | SECTOR-50 GUARDIAN | First line of defense |
| 100 | ADMIN-1 | THE ADMINISTRATOR is watching... |
| 150 | SECTOR-150 GUARDIAN | Advanced security protocols |
| 200 | ADMIN-2 | THE ADMINISTRATOR grows impatient... |

**Location**: `src/lib/game/constants.ts`

---

## Equipment System

### Item Types

1. **Weapons** - Provide damage bonus, can be upgraded
2. **Armor** - Provide various stat bonuses
3. **Accessories** - Provide various stat bonuses
4. **Consumables** - Instant-use temporary effects

### Equipment Bonuses Applied

| Bonus Type | Applied To |
|------------|------------|
| damageBonus | Base tap damage |
| critChanceBonus | Critical hit chance |
| scrapBonus | Boss scrap rewards (%) |
| dataBonus | Boss data rewards (%) |

### Weapon Upgrade Cost

**Formula**: `floor(baseCost × tierMultiplier × 1.5^level)`

**Tier Multiplier**: `2^(tier-1)` → 1x, 2x, 4x, 8x, 16x, 32x, 64x, 128x

**Base Cost**: 500 scrap

| Tier | Multiplier | Base Upgrade Cost |
|------|------------|-------------------|
| 1 | 1x | 500 |
| 2 | 2x | 1,000 |
| 3 | 4x | 2,000 |
| 4 | 8x | 4,000 |
| 5 | 16x | 8,000 |
| 6 | 32x | 16,000 |
| 7 | 64x | 32,000 |
| 8 | 128x | 64,000 |

**Location**: `src/app/api/shop/upgrade-weapon/route.ts:52-56`

---

## Machine System (Idle Production)

### Machine Types

| Machine | Base Production | Base Cost | Cost Scale | Currency |
|---------|-----------------|-----------|------------|----------|
| Scrap Collector | 1/sec | 1,000 | 1.15x | Scrap |
| Data Miner | 0.1/sec | 500 | 1.15x | Data |
| Auto-Turret | 1 DPS | 5,000 | 1.12x | Scrap |
| Efficiency Bot | +1% all | 10,000 | 1.20x | Data |

### Production Formula

`production = baseProduction × 2^(level-1)`

Each level doubles the machine's output.

### Total Idle Production

```
totalProduction = machineProduction × idleMult × efficiencyMult

idleMult = 1 + (idlePowerLevel × 0.10) + (permIdleLevel × 0.10)
efficiencyMult = 1 + (efficiencyBotProduction)
```

### Auto-Turret Visual Feedback

When an auto-turret is active, a pulsing crosshair indicator appears in the top-left corner of the fight screen showing the current DPS:

```
[🎯] X DPS
```

The turret deals passive damage to the boss every second during the idle tick.

**Location**: `src/lib/game/formulas.ts:139-194`, `src/app/page.tsx`

---

## Upgrade System

### Temporary Upgrades (Reset on Prestige)

| Upgrade | Effect | Base Cost | Currency | Max Level |
|---------|--------|-----------|----------|-----------|
| Tap Power | +10% damage | 100 | Scrap | ∞ |
| Crit Chance | +1% crit | 500 | Scrap | 25 |
| Crit Damage | +10% crit mult | 50 | Data | 30 |
| Idle Power | +10% machine prod | 1,000 | Scrap | ∞ |
| Drop Rate | +5% boss rewards | 100 | Data | 20 |

### Permanent Upgrades (Keep on Prestige)

| Upgrade | Effect | Base Cost | Currency | Max Level |
|---------|--------|-----------|----------|-----------|
| Starting Damage | +25% damage | 1 | Core Fragments | 20 |
| Starting Scrap | +1000 scrap | 2 | Core Fragments | 10 |
| Idle Efficiency | +10% machine prod | 1 | Core Fragments | 30 |
| Storage Boost | +1hr offline cap | 5 | Core Fragments | 10 |
| Prestige Bonus | +10% fragments | 3 | Core Fragments | 20 |

### Upgrade Cost Formula

`cost = floor(baseCost × costScale^currentLevel)`

**Location**: `src/lib/game/formulas.ts:196-222`

---

## Prestige System

### Core Fragment Calculation

**Formula**: `floor(sqrt(highestStage / 10) × (1 + prestigeBonusLevel × 0.10))`

**Minimum Stage**: 10 (no fragments below stage 10)

**Example Yields**:
| Highest Stage | Base Fragments | With 10 Prestige Bonus |
|---------------|----------------|------------------------|
| 10 | 1 | 2 |
| 40 | 2 | 4 |
| 90 | 3 | 6 |
| 160 | 4 | 8 |
| 250 | 5 | 10 |

### What Resets on Prestige

**Reset**:
- Current stage (back to 1)
- Scrap currency
- Data points currency
- Inventory items
- Machine levels
- Temporary upgrades
- Active effects

**Kept**:
- Core fragments (earned + existing)
- Permanent upgrades
- Highest stage achieved
- Lifetime statistics
- Achievements

### Starting Bonuses on Prestige

When prestiging, the following bonuses are applied:
- **Starting Scrap**: `permStartingScrapLevel × 1000` scrap

**Location**: `src/lib/game/formulas.ts:262-292`, `src/contexts/GameContext.tsx` PRESTIGE action

---

## Consumable Effects

### Effect Types

| Item | Effect Type | Duration | Value |
|------|-------------|----------|-------|
| Overclock Boost | damage_boost | 30s | 2.0x |
| Auto-Tap Bot | auto_tap | 300s | 5 taps/sec |
| Data Burst | data_boost | 120s | 2.0x |
| Scrap Storm | scrap_boost | 120s | 2.0x |
| Lucky Strike | crit_boost | 10s | 100% crit |
| Jackpot Module | reward_boost | 300s | 3.0x |

### Effect Implementation

- `damage_boost`: Multiplies tap damage
- `crit_boost`: Forces 100% critical hit chance
- `scrap_boost`: Multiplies scrap rewards from bosses
- `data_boost`: Multiplies data rewards from bosses
- `reward_boost`: Multiplies all boss rewards
- `auto_tap`: Automatic taps per second (deals calculated damage every tick)

### Visual Indicators

Active effects show in the top-left corner of the fight screen:
- **Damage Boost**: Orange flame icon with multiplier
- **Scrap Boost**: Green gift icon with multiplier
- **Data Boost**: Cyan sparkle icon with multiplier
- **Auto-Turret**: Red crosshair icon with DPS value

**Location**: `src/contexts/GameContext.tsx:325-371`, `src/app/page.tsx`

---

## Offline Earnings

### Offline Cap

**Formula**: `(baseHours + permStorageLevel) × 3600 seconds`

**Base Hours by Storage Level**:
| Level | Hours |
|-------|-------|
| 1 | 1 |
| 2 | 2 |
| 3 | 4 |
| 4 | 8 |
| 5 | 12 |

### Offline Calculation

```
cappedSeconds = min(secondsAway, offlineCapSeconds)
offlineScrap = scrapPerSecond × cappedSeconds
offlineData = dataPerSecond × cappedSeconds
offlineDamage = dpsPerSecond × cappedSeconds
```

**Location**: `src/lib/game/formulas.ts:224-260`

---

## Save System

### Auto-Save

- Triggers on state change after 2000ms debounce
- Retries up to 2 times on failure
- Saves via POST to `/api/game/save`

### Page Close Save

- `beforeunload` event triggers synchronous save
- Uses XMLHttpRequest (synchronous) for reliability
- Prevents data loss on accidental navigation

**Location**: `src/contexts/GameContext.tsx:651-730`

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Login/register with username |
| `/api/game/state` | GET | Load game state + offline earnings |
| `/api/game/save` | POST | Save current game state |
| `/api/game/equip` | POST | Equip/unequip items |
| `/api/shop/buy` | POST | Purchase items |
| `/api/shop/upgrade-weapon` | POST | Upgrade weapon level |
| `/api/machines/buy` | POST | Buy/upgrade machines |
| `/api/upgrades/buy` | POST | Buy upgrades |
| `/api/prestige/reboot` | POST | Trigger prestige reset |

---

## File Locations

| System | Primary File |
|--------|--------------|
| Game State | `src/contexts/GameContext.tsx` |
| Formulas | `src/lib/game/formulas.ts` |
| Constants | `src/lib/game/constants.ts` |
| Types | `src/lib/game/types.ts` |
| Database Schema | `prisma/schema.prisma` |
| Item Definitions | `prisma/seed.ts` |
