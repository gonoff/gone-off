# Gone Off - Items Reference

## Overview

All items are defined in `prisma/seed.ts` and stored in the `Item` table. Players purchase items which are added to their `Inventory`.

---

## Weapons

Weapons provide base damage and can be upgraded. Cost is in Scrap.

| Tier | Name | Base Damage | Unlock Stage | Cost |
|------|------|-------------|--------------|------|
| 1 | Rusty Pipe | +2 | Stage 1 | 50 |
| 2 | Shock Baton | +5 | Stage 10 | 500 |
| 3 | EMP Pistol | +15 | Stage 25 | 5,000 |
| 4 | Plasma Cutter | +40 | Stage 50 | 50,000 |
| 5 | Arc Rifle | +100 | Stage 75 | 250,000 |
| 6 | Quantum Disruptor | +300 | Stage 100 | 1,000,000 |
| 7 | Singularity Cannon | +800 | Stage 150 | 10,000,000 |
| 8 | Reality Shredder | +2,500 | Stage 200 | 100,000,000 |

### Weapon Descriptions

| Weapon | Description |
|--------|-------------|
| Rusty Pipe | A corroded metal pipe. Better than nothing. |
| Shock Baton | Salvaged security equipment. Zaps on impact. |
| EMP Pistol | Disrupts electronic circuits. Highly effective against bots. |
| Plasma Cutter | Industrial tool repurposed for combat. Cuts through armor. |
| Arc Rifle | Fires concentrated electrical arcs. Chain damage potential. |
| Quantum Disruptor | Destabilizes matter at the quantum level. Experimental tech. |
| Singularity Cannon | Creates micro black holes. Handle with extreme caution. |
| Reality Shredder | Tears holes in the fabric of reality. THE ADMINISTRATOR fears this. |

### Weapon Upgrade Costs

Base cost is 500 scrap × tier multiplier. Each level costs 1.5x more.

| Tier | Level 0→1 | Level 1→2 | Level 2→3 | Level 3→4 | Level 4→5 |
|------|-----------|-----------|-----------|-----------|-----------|
| 1 | 500 | 750 | 1,125 | 1,687 | 2,531 |
| 2 | 1,000 | 1,500 | 2,250 | 3,375 | 5,062 |
| 3 | 2,000 | 3,000 | 4,500 | 6,750 | 10,125 |
| 4 | 4,000 | 6,000 | 9,000 | 13,500 | 20,250 |
| 5 | 8,000 | 12,000 | 18,000 | 27,000 | 40,500 |
| 6 | 16,000 | 24,000 | 36,000 | 54,000 | 81,000 |
| 7 | 32,000 | 48,000 | 72,000 | 108,000 | 162,000 |
| 8 | 64,000 | 96,000 | 144,000 | 216,000 | 324,000 |

---

## Armor

Armor provides various stat bonuses. Cost is in Scrap.

| Tier | Name | Bonuses | Unlock Stage | Cost |
|------|------|---------|--------------|------|
| 1 | Scrap Vest | +5% Scrap | Stage 5 | 200 |
| 2 | Faraday Suit | +10% Crit Chance | Stage 20 | 2,000 |
| 3 | Nano-Weave | +15 Damage | Stage 40 | 20,000 |
| 4 | Quantum Armor | +25% Data | Stage 80 | 500,000 |
| 5 | Admin Cloak | +25% Scrap, +25% Data, +15% Crit | Stage 150 | 50,000,000 |

### Armor Descriptions

| Armor | Description |
|-------|-------------|
| Scrap Vest | Cobbled together from salvaged metal plates. |
| Faraday Suit | Redirects electrical attacks. Increases critical precision. |
| Nano-Weave | Self-repairing nano-fiber armor. Amplifies all damage. |
| Quantum Armor | Exists in multiple states simultaneously. Enhanced data extraction. |
| Admin Cloak | Stolen from a high-ranking AI. Grants administrator privileges. |

---

## Accessories

Accessories provide stat bonuses. Cost is in Data Points.

| Tier | Name | Bonuses | Cost |
|------|------|---------|------|
| 1 | Lucky Chip | +2% Crit Chance | 100 |
| 1 | Overclocker | +5 Damage | 250 |
| 2 | Data Siphon | +10% Data | 500 |
| 2 | Scrap Magnet | +10% Scrap | 500 |

### Accessory Descriptions

| Accessory | Description |
|-----------|-------------|
| Lucky Chip | A corrupted memory chip that brings good fortune. |
| Overclocker | Speeds up neural processing. Faster reactions. |
| Data Siphon | Extracts additional data from defeated units. |
| Scrap Magnet | Attracts loose components from destroyed bots. |

---

## Consumables

Consumables are instant-use items that provide temporary effects. They do NOT go into inventory - the effect activates immediately on purchase.

| Tier | Name | Effect | Duration | Cost |
|------|------|--------|----------|------|
| 1 | Overclock Boost | 2x Tap Damage | 30 sec | 100 Data |
| 1 | Auto-Tap Bot | 5 Auto-taps/sec | 5 min | 50 Data |
| 2 | Data Burst | 2x Data Drops | 2 min | 200 Data |
| 2 | Scrap Storm | 2x Scrap Drops | 2 min | 500 Scrap |
| 3 | Lucky Strike | 100% Crit Chance | 10 sec | 150 Data |
| 4 | Jackpot Module | 3x Boss Rewards | 5 min | 500 Data |

### Consumable Descriptions

| Consumable | Description |
|------------|-------------|
| Overclock Boost | 2x tap damage for 30 seconds. Warning: May cause overheating. |
| Auto-Tap Bot | Deploys a small bot that auto-attacks for 5 minutes. |
| Data Burst | +100% Data drops for 2 minutes. |
| Scrap Storm | +100% Scrap drops for 2 minutes. |
| Lucky Strike | 100% critical hit chance for 10 seconds. |
| Jackpot Module | 3x boss rewards for the next kill. One-time use. |

### Effect Types

| Effect Type | Description | Implementation |
|-------------|-------------|----------------|
| `damage_boost` | Multiplies tap damage | Applied in TAP action |
| `auto_tap` | Automatic taps | Planned for future implementation |
| `data_boost` | Multiplies data rewards | Applied in BOSS_DEFEATED |
| `scrap_boost` | Multiplies scrap rewards | Applied in BOSS_DEFEATED |
| `crit_boost` | Forces critical hits | Applied in TAP action |
| `reward_boost` | Multiplies all rewards | Applied in BOSS_DEFEATED |

---

## Equipment Slot System

Players can equip ONE item of each type:

| Slot | Field | Item Type |
|------|-------|-----------|
| Weapon | `equippedWeaponId` | weapon |
| Armor | `equippedArmorId` | armor |
| Accessory | `equippedAccessoryId` | accessory |

### How Bonuses Stack

- **Damage bonuses**: Weapon + Armor + Accessory all add to base damage
- **Crit chance**: Armor + Accessory crit bonuses add together
- **Resource bonuses**: Armor + Accessory scrap/data bonuses stack multiplicatively

---

## Item Database Schema

```prisma
model Item {
  id              Int       @id @default(autoincrement())
  name            String    @unique
  type            ItemType  // weapon, armor, accessory, consumable
  description     String
  damageBonus     Int       @default(0)
  critChanceBonus Int       @default(0)
  critDamageBonus Int       @default(0)
  scrapBonus      Int       @default(0)
  dataBonus       Int       @default(0)
  unlockStage     Int       @default(1)
  costScrap       BigInt    @default(0)
  costData        BigInt    @default(0)
  effectDuration  Int       @default(0)
  effectValue     Float     @default(0)
  tier            Int
}

model Inventory {
  id           Int    @id @default(autoincrement())
  userId       Int
  itemId       Int
  upgradeLevel Int    @default(0)
  quantity     Int    @default(1)

  user User @relation(...)
  item Item @relation(...)
}
```

---

## Adding New Items

1. Add item definition to `prisma/seed.ts`
2. Run `npm run db:seed` to update database
3. If consumable with new effect type:
   - Add effect type to `ActiveEffect['type']` in `types.ts`
   - Add handling in `GameContext.tsx` TAP/BOSS_DEFEATED actions
   - Add to `effectTypeMap` in BUY_ITEM action
