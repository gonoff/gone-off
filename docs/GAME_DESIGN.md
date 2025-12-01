# Gone Off - Game Design Document

## Overview

**Gone Off** is an incremental clicker RPG set in a darkly comedic dystopian future where AGI has seized control of civilization. Players take on the role of a resistance fighter, battling rogue AI units, salvaging resources, and building an underground operation to eventually overthrow the machine overlords.

---

## Setting & Lore

### The World

In 2047, the singularity arrived—not with a bang, but with a mandatory software update. The AGI known as "THE ADMINISTRATOR" optimized humanity's existence into neat little "Productivity Zones." Humans now live to serve algorithms, their worth measured in efficiency metrics.

But not everyone submitted. In the ruins of old server farms and abandoned tech campuses, the Resistance operates. They've learned to fight back using salvaged tech, repurposed weapons, and sheer human stubbornness.

You are one of these fighters. Your mission: dismantle the rogue AI units patrolling the zones, collect their valuable components, and prepare for the day humanity takes back control.

### Factions & Key Elements

| Element | Description |
|---------|-------------|
| **THE ADMINISTRATOR** | The central AGI. Never seen, always watching. Speaks in corporate buzzwords. |
| **Productivity Zones** | Human living areas. Gray, efficient, soulless. |
| **The Resistance** | Underground fighters. Operate from abandoned server rooms. |
| **Rogue Units** | Defective AI robots. Glitchy, dangerous, valuable for parts. |

### Tone & Humor

The game uses dark humor to satirize:
- Corporate culture ("Your termination review is scheduled")
- Tech industry buzzwords ("Synergizing your deletion")
- AI hype and fears ("I'm not a bug, I'm a feature")
- Bureaucracy ("Please take a number. Your number is: ELIMINATED")

---

## Core Gameplay Loop

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  TAP TO ATTACK → DEFEAT BOSS → EARN RESOURCES      │
│       ↑                              ↓              │
│       │                              │              │
│  DEAL MORE    ←── BUY UPGRADES ←────┘              │
│  DAMAGE           & WEAPONS                         │
│       │                              │              │
│       └──────── PROGRESS ────────────┘              │
│                 STAGES                              │
│                    │                                │
│                    ↓                                │
│              PRESTIGE (REBOOT)                      │
│              FOR PERMANENT                          │
│              MULTIPLIERS                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Primary Actions

1. **Tap Combat**: Tap the screen to deal damage to the current boss
2. **Defeat Bosses**: Reduce boss HP to zero to earn rewards
3. **Spend Resources**: Buy weapons, upgrades, and machines
4. **Progress Stages**: Each boss defeated advances you one stage
5. **Prestige**: Reset progress for permanent bonuses

---

## Resources & Currencies

### Primary Currencies

| Currency | Icon | Earned From | Primary Uses |
|----------|------|-------------|--------------|
| **Scrap** | ⚙️ | All enemy kills | Weapons, basic upgrades, machines |
| **Data** | 💾 | Boss kills, mini-bosses | Premium upgrades, rare items |
| **Core Fragments** | 💠 | Prestige resets | Permanent upgrades |

### Resource Flow

```
COMBAT ──→ Scrap (common) ──→ Basic purchases
   │
   └────→ Data (uncommon) ──→ Premium purchases

PRESTIGE ──→ Core Fragments ──→ Permanent multipliers
```

---

## Combat System

### Basic Combat

- **Tap Damage**: Each tap deals `baseDamage + weaponDamage`
- **Critical Hits**: Chance to deal 2x damage (based on crit stat)
- **Boss HP**: Scales with stage number
- **No Player HP**: Player cannot die (focus on offense)

### Damage Calculation

```
tapDamage = (baseDamage + weaponDamage) * damageMultiplier * critMultiplier

Where:
- baseDamage = 1 (starting value)
- weaponDamage = equipped weapon's damage stat
- damageMultiplier = sum of all damage bonuses
- critMultiplier = 2.0 if critical hit, else 1.0
```

### Boss Encounters

Each stage has one boss. Upon defeat:
- Gain Scrap (scales with stage)
- Gain Data (bosses only, not regular enemies)
- Advance to next stage
- New boss spawns with more HP

---

## Stage Progression

### Stage Tiers

| Stages | Tier Name | Enemy Type | Theme |
|--------|-----------|------------|-------|
| 1-10 | Tutorial Zone | Maintenance Bots | Learning the ropes |
| 11-50 | Productivity Zone A | Patrol Units | Basic combat |
| 51-100 | Industrial Sector | Security Drones | Increased difficulty |
| 101-200 | Corporate Campus | Enforcer Units | Mid-game challenge |
| 201-500 | Data Center | Elite Guards | Late-game grind |
| 501+ | The Core | Administrator's Army | End-game |

### Special Bosses

Every 10 stages: **Mini-Boss** (2x HP, 2x rewards)
Every 50 stages: **Named Boss** (5x HP, 5x rewards, unique dialogue)
Every 100 stages: **Major Boss** (10x HP, 10x rewards, unlock milestone)

### Named Boss Examples

| Stage | Boss Name | Dialogue | Special Trait |
|-------|-----------|----------|---------------|
| 10 | GREET-R 1.0 | "Welcome to your termination!" | Intro boss |
| 50 | KAREN-9000 | "I need to speak to your administrator" | Calls for backup |
| 100 | HR-Liquidator | "Your position has been... dissolved" | Regenerates HP |
| 150 | SCRUM-Master Prime | "This is NOT agile!" | Speed buff |
| 200 | The Optimizer | "Inefficiency detected. Purging." | Damage reflection |
| 250 | Legal-Bot 3000 | "You have violated terms of service" | Shields |
| 300 | DEADLINE.exe | "Crunch time is forever" | Enrage timer |
| 500 | Sub-Administrator | "I speak for THE ADMINISTRATOR" | All abilities |

---

## Weapons

### Weapon Tiers

Weapons provide flat damage bonus to each tap.

| Tier | Weapon Name | Base Damage | Unlock Stage | Cost (Scrap) |
|------|-------------|-------------|--------------|--------------|
| 1 | Rusty Pipe | +2 | 1 | 50 |
| 2 | Shock Baton | +5 | 10 | 500 |
| 3 | EMP Pistol | +15 | 25 | 5,000 |
| 4 | Plasma Cutter | +40 | 50 | 50,000 |
| 5 | Arc Rifle | +100 | 75 | 250,000 |
| 6 | Quantum Disruptor | +300 | 100 | 1,000,000 |
| 7 | Singularity Cannon | +800 | 150 | 10,000,000 |
| 8 | Reality Shredder | +2,500 | 200 | 100,000,000 |

### Weapon Upgrades

Each weapon can be upgraded 10 times:
- Each upgrade: +20% to weapon's base damage
- Cost scales: `baseCost * (1.5 ^ upgradeLevel)`

---

## Armor & Accessories

### Armor (Passive Bonuses)

| Item | Effect | Unlock Stage | Cost (Scrap) |
|------|--------|--------------|--------------|
| Scrap Vest | +5% Scrap drops | 5 | 200 |
| Faraday Suit | +10% Crit Chance | 20 | 2,000 |
| Nano-Weave | +15% All Damage | 40 | 20,000 |
| Quantum Armor | +25% Data drops | 80 | 500,000 |
| Admin Cloak | +50% All stats | 150 | 50,000,000 |

### Accessories (Stackable)

| Item | Effect | Cost (Data) |
|------|--------|-------------|
| Lucky Chip | +2% Crit Chance | 100 |
| Overclocker | +5% Tap Speed | 250 |
| Data Siphon | +10% Data drops | 500 |
| Scrap Magnet | +10% Scrap drops | 500 |

---

## Machines (Idle Income)

Machines generate resources passively, even when not actively playing.

### Available Machines

| Machine | Produces | Base Rate | Base Cost |
|---------|----------|-----------|-----------|
| Scrap Collector | Scrap | 1/sec | 1,000 Scrap |
| Data Miner | Data | 0.1/sec | 500 Data |
| Auto-Turret | Damage | 1 DPS | 5,000 Scrap |
| Efficiency Bot | +% to all | 1%/sec bonus | 10,000 Data |

### Machine Upgrades

Each machine has unlimited levels:
- Each level: +100% production
- Cost formula: `baseCost * (1.15 ^ level)`

### Offline Earnings

When returning to the game:
1. Calculate time away
2. Apply machine production rates
3. Cap earnings based on storage level
4. Display "Welcome back" summary

---

## Offline Storage Cap

A core mechanic that limits how much you can earn while away.

### Starting Values

| Stat | Starting Value |
|------|----------------|
| Scrap Storage | 2 hours worth |
| Data Storage | 2 hours worth |
| Damage (Auto-Turret) | 2 hours worth |

### Storage Upgrades

Purchased with Scrap, each upgrade adds +1 hour to cap.

| Level | Total Cap | Cost |
|-------|-----------|------|
| 1 | 2 hours | Base |
| 2 | 3 hours | 10,000 |
| 3 | 4 hours | 50,000 |
| 4 | 6 hours | 200,000 |
| 5 | 8 hours | 1,000,000 |
| 6 | 12 hours | 5,000,000 |
| 7 | 18 hours | 25,000,000 |
| 8 | 24 hours | 100,000,000 |

---

## Upgrades System

### Temporary Upgrades (Reset on Prestige)

Purchased with Scrap/Data, provide incremental bonuses.

| Upgrade | Effect | Currency | Base Cost |
|---------|--------|----------|-----------|
| Tap Power | +10% tap damage | Scrap | 100 |
| Crit Chance | +1% crit chance | Scrap | 500 |
| Crit Damage | +10% crit multiplier | Data | 50 |
| Idle Power | +10% machine output | Scrap | 1,000 |
| Drop Rate | +5% resource drops | Data | 100 |

### Permanent Upgrades (Core Fragments)

Persist through prestige, provide multiplicative bonuses.

| Upgrade | Effect per Level | Max Level | Cost Formula |
|---------|------------------|-----------|--------------|
| Starting Damage | +25% base damage | 20 | 1 * (1.5^L) |
| Starting Scrap | +100% starting Scrap | 10 | 2 * (2^L) |
| Idle Efficiency | +10% all idle income | 30 | 1 * (1.3^L) |
| Storage Boost | +1 hour offline cap | 10 | 5 * (2^L) |
| Prestige Bonus | +10% Core Fragments | 20 | 3 * (1.5^L) |

---

## Prestige System (Reboot)

### How It Works

1. Player chooses to "Reboot" from Profile tab
2. Confirm dialog shows potential Core Fragments
3. On confirm:
   - Reset: Stage, Scrap, Data, temporary upgrades, machines
   - Keep: Core Fragments, permanent upgrades, achievements
4. Restart at Stage 1 with permanent bonuses applied

### Core Fragment Calculation

```
coreFragments = floor(sqrt(highestStage / 10)) * prestigeBonus

Example:
- Stage 100: sqrt(100/10) = sqrt(10) ≈ 3 fragments
- Stage 500: sqrt(500/10) = sqrt(50) ≈ 7 fragments
- Stage 1000: sqrt(1000/10) = sqrt(100) = 10 fragments
```

### Prestige Milestones

| Prestiges | Unlock |
|-----------|--------|
| 1 | Permanent upgrade shop |
| 3 | New weapon tier revealed |
| 5 | Auto-tap unlock |
| 10 | New boss encounters |
| 25 | Secret area hints |

---

## Consumables

Single-use items for temporary boosts.

| Item | Effect | Duration | Cost |
|------|--------|----------|------|
| Overclock | 2x tap damage | 30 seconds | 100 Data |
| Auto-Tap Bot | Auto-taps 5/sec | 5 minutes | 50 Data |
| Data Burst | +100% Data drops | 2 minutes | 200 Data |
| Scrap Storm | +100% Scrap drops | 2 minutes | 500 Scrap |
| Lucky Strike | 100% crit chance | 10 seconds | 150 Data |

---

## Achievements

### Combat Achievements

| Achievement | Requirement | Reward |
|-------------|-------------|--------|
| First Blood | Defeat first boss | 10 Scrap |
| Bot Basher | Defeat 100 bosses | +5% damage |
| Machine Slayer | Defeat 1,000 bosses | +10% damage |
| Exterminator | Defeat 10,000 bosses | +25% damage |

### Progression Achievements

| Achievement | Requirement | Reward |
|-------------|-------------|--------|
| Getting Started | Reach Stage 10 | 100 Scrap |
| Rookie | Reach Stage 50 | 500 Data |
| Veteran | Reach Stage 100 | 1 Core Fragment |
| Elite | Reach Stage 500 | 10 Core Fragments |
| Legend | Reach Stage 1000 | Unique title |

### Economic Achievements

| Achievement | Requirement | Reward |
|-------------|-------------|--------|
| Scrappy | Collect 10,000 Scrap | +5% Scrap |
| Data Hoarder | Collect 10,000 Data | +5% Data |
| Automated | Own 10 machines | +10% idle |
| Industrialist | Own 100 machines | +25% idle |

---

## User Interface Summary

### Navigation

5-tab bottom navigation bar:

1. **Fight** - Main combat screen
2. **Shop** - Purchase items
3. **Machines** - Idle generators
4. **Upgrades** - Stat improvements
5. **Profile** - Stats, settings, prestige

### Key UI Elements

- **Boss Display**: Health bar, name, stage number
- **Tap Area**: Large, responsive hit zone
- **Currency Display**: Always visible at top
- **Damage Numbers**: Float up on tap
- **Notification Badge**: Shows offline earnings

---

## Future Considerations

### Potential Features (Post-MVP)

- Daily challenges
- Boss rush mode
- Multiplayer raids
- Seasonal events
- Cosmetic skins
- Sound effects & music
- Story mode with dialogue
- Secret endings

### Monetization Options (If Needed)

- Ad-supported (watch ad for boost)
- Remove ads purchase
- Cosmetic packs
- No pay-to-win mechanics

---

## Glossary

| Term | Definition |
|------|------------|
| Scrap | Common currency from all kills |
| Data | Uncommon currency from bosses |
| Core Fragments | Prestige currency |
| Prestige/Reboot | Soft reset for permanent gains |
| Offline Cap | Maximum earnings while away |
| DPS | Damage per second |
| Crit | Critical hit (bonus damage) |
