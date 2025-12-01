# Gone Off - Database & API Documentation

## Overview

This document describes the MySQL database schema and API endpoints for the Gone Off incremental RPG game. The database handles user authentication, game state persistence, inventory management, and progression tracking.

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│    users     │────<│    game_state    │     │    items     │
└──────────────┘     └──────────────────┘     └──────────────┘
       │                     │                       │
       │                     │                       │
       ▼                     ▼                       ▼
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  inventory   │────>│     machines     │     │   upgrades   │
└──────────────┘     └──────────────────┘     └──────────────┘
       │                                             │
       │                                             │
       ▼                                             ▼
┌──────────────┐                            ┌──────────────────┐
│ achievements │                            │  prestige_stats  │
└──────────────┘                            └──────────────────┘
```

---

## Table Definitions

### users

Primary user account table.

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    session_token VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_username (username),
    INDEX idx_session (session_token)
);
```

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| username | VARCHAR(30) | Unique display name |
| session_token | VARCHAR(64) | Auth token for session |
| created_at | TIMESTAMP | Account creation time |
| last_active | TIMESTAMP | Last game activity |

---

### game_state

Core game progress and currency storage.

```sql
CREATE TABLE game_state (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,

    -- Progress
    current_stage INT DEFAULT 1,
    highest_stage INT DEFAULT 1,

    -- Currencies
    scrap BIGINT DEFAULT 0,
    data_points BIGINT DEFAULT 0,
    core_fragments INT DEFAULT 0,

    -- Offline system
    offline_cap_level INT DEFAULT 1,
    last_save TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_offline_claim TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Combat state
    current_boss_hp BIGINT DEFAULT 100,
    current_boss_max_hp BIGINT DEFAULT 100,

    -- Stats
    total_taps BIGINT DEFAULT 0,
    total_damage_dealt BIGINT DEFAULT 0,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
);
```

| Column | Type | Description |
|--------|------|-------------|
| user_id | INT | Foreign key to users |
| current_stage | INT | Current stage number |
| highest_stage | INT | Max stage reached (for prestige calc) |
| scrap | BIGINT | Primary currency |
| data_points | BIGINT | Secondary currency |
| core_fragments | INT | Prestige currency |
| offline_cap_level | INT | Storage upgrade level |
| last_save | TIMESTAMP | Last game state save |
| last_offline_claim | TIMESTAMP | When offline earnings were last claimed |
| current_boss_hp | BIGINT | Current boss remaining HP |
| current_boss_max_hp | BIGINT | Current boss total HP |
| total_taps | BIGINT | Lifetime tap count |
| total_damage_dealt | BIGINT | Lifetime damage |

---

### items

Static item definitions (weapons, armor, consumables).

```sql
CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type ENUM('weapon', 'armor', 'accessory', 'consumable') NOT NULL,
    description TEXT,

    -- Stats
    damage_bonus INT DEFAULT 0,
    crit_chance_bonus DECIMAL(5,2) DEFAULT 0,
    crit_damage_bonus DECIMAL(5,2) DEFAULT 0,
    scrap_bonus DECIMAL(5,2) DEFAULT 0,
    data_bonus DECIMAL(5,2) DEFAULT 0,

    -- Requirements
    unlock_stage INT DEFAULT 1,
    cost_scrap BIGINT DEFAULT 0,
    cost_data BIGINT DEFAULT 0,

    -- Consumable specific
    effect_duration INT DEFAULT 0,  -- seconds
    effect_value DECIMAL(5,2) DEFAULT 0,

    tier INT DEFAULT 1,

    INDEX idx_type (type),
    INDEX idx_unlock (unlock_stage)
);
```

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| name | VARCHAR(50) | Item display name |
| type | ENUM | Item category |
| damage_bonus | INT | Flat damage increase |
| crit_chance_bonus | DECIMAL | % crit chance |
| unlock_stage | INT | Stage required to purchase |
| cost_scrap | BIGINT | Scrap price |
| cost_data | BIGINT | Data price |
| tier | INT | Item tier level |

---

### inventory

User's owned items and equipment.

```sql
CREATE TABLE inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT DEFAULT 1,
    upgrade_level INT DEFAULT 0,
    is_equipped BOOLEAN DEFAULT FALSE,
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id),
    UNIQUE KEY unique_user_item (user_id, item_id),
    INDEX idx_user (user_id),
    INDEX idx_equipped (user_id, is_equipped)
);
```

| Column | Type | Description |
|--------|------|-------------|
| user_id | INT | Foreign key to users |
| item_id | INT | Foreign key to items |
| quantity | INT | Count (for consumables) |
| upgrade_level | INT | Weapon upgrade level (0-10) |
| is_equipped | BOOLEAN | Currently equipped |

---

### machines

User's idle income generators.

```sql
CREATE TABLE machines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    machine_type ENUM('scrap_collector', 'data_miner', 'auto_turret', 'efficiency_bot') NOT NULL,
    level INT DEFAULT 1,
    last_collected TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_machine (user_id, machine_type),
    INDEX idx_user (user_id)
);
```

| Column | Type | Description |
|--------|------|-------------|
| user_id | INT | Foreign key to users |
| machine_type | ENUM | Type of machine |
| level | INT | Current upgrade level |
| last_collected | TIMESTAMP | Last collection time |

---

### upgrades

User's purchased upgrades (temporary and permanent).

```sql
CREATE TABLE upgrades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    upgrade_type VARCHAR(30) NOT NULL,
    level INT DEFAULT 0,
    is_permanent BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_upgrade (user_id, upgrade_type),
    INDEX idx_user (user_id),
    INDEX idx_permanent (user_id, is_permanent)
);
```

**Upgrade Types:**

Temporary (reset on prestige):
- `tap_power`, `crit_chance`, `crit_damage`, `idle_power`, `drop_rate`

Permanent (persist):
- `perm_starting_damage`, `perm_starting_scrap`, `perm_idle_efficiency`, `perm_storage_boost`, `perm_prestige_bonus`

---

### prestige_stats

Lifetime statistics and prestige tracking.

```sql
CREATE TABLE prestige_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,

    total_prestiges INT DEFAULT 0,
    lifetime_scrap BIGINT DEFAULT 0,
    lifetime_data BIGINT DEFAULT 0,
    lifetime_core_fragments INT DEFAULT 0,
    lifetime_bosses_killed INT DEFAULT 0,
    lifetime_taps BIGINT DEFAULT 0,

    fastest_stage_100 INT DEFAULT NULL,  -- seconds
    highest_damage_hit BIGINT DEFAULT 0,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

### achievements

User's earned achievements.

```sql
CREATE TABLE achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_key VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_key),
    INDEX idx_user (user_id)
);
```

**Achievement Keys:**
- `first_blood`, `bot_basher`, `machine_slayer`, `exterminator`
- `stage_10`, `stage_50`, `stage_100`, `stage_500`, `stage_1000`
- `scrappy`, `data_hoarder`, `automated`, `industrialist`

---

## Static Data

### Machine Base Stats

```sql
INSERT INTO machine_stats (type, base_production, base_cost, cost_currency) VALUES
('scrap_collector', 1.0, 1000, 'scrap'),
('data_miner', 0.1, 500, 'data'),
('auto_turret', 1.0, 5000, 'scrap'),
('efficiency_bot', 0.01, 10000, 'data');
```

### Offline Cap Levels

```sql
INSERT INTO offline_cap_levels (level, hours, cost_scrap) VALUES
(1, 2, 0),
(2, 3, 10000),
(3, 4, 50000),
(4, 6, 200000),
(5, 8, 1000000),
(6, 12, 5000000),
(7, 18, 25000000),
(8, 24, 100000000);
```

---

## API Endpoints

### Authentication

#### POST /api/auth/register
Create new user account.

**Request:**
```json
{
  "username": "player123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "player123"
  },
  "sessionToken": "abc123..."
}
```

**Errors:**
- `400` - Username taken or invalid
- `500` - Server error

---

#### POST /api/auth/login
Login with existing username.

**Request:**
```json
{
  "username": "player123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "player123"
  },
  "sessionToken": "abc123..."
}
```

---

#### POST /api/auth/check-username
Check if username is available.

**Request:**
```json
{
  "username": "player123"
}
```

**Response:**
```json
{
  "available": true
}
```

---

### Game State

#### GET /api/game/state
Get full game state for current user.

**Headers:**
```
Authorization: Bearer <sessionToken>
```

**Response:**
```json
{
  "gameState": {
    "currentStage": 45,
    "highestStage": 67,
    "scrap": 125000,
    "dataPoints": 3400,
    "coreFragments": 5,
    "offlineCapLevel": 3,
    "currentBossHp": 4500,
    "currentBossMaxHp": 10000
  },
  "inventory": [...],
  "machines": [...],
  "upgrades": [...],
  "offlineEarnings": {
    "scrap": 5000,
    "data": 200,
    "timeAway": 7200,
    "capped": false
  }
}
```

---

#### POST /api/game/save
Save current game state.

**Request:**
```json
{
  "gameState": {
    "currentStage": 46,
    "scrap": 130000,
    "dataPoints": 3600,
    "currentBossHp": 8000,
    "currentBossMaxHp": 12000,
    "totalTaps": 15000
  }
}
```

**Response:**
```json
{
  "success": true,
  "savedAt": "2024-01-15T10:30:00Z"
}
```

---

#### POST /api/game/tap
Register tap damage (batched).

**Request:**
```json
{
  "taps": 10,
  "totalDamage": 450,
  "critCount": 2
}
```

**Response:**
```json
{
  "success": true,
  "bossDefeated": false,
  "newBossHp": 7550
}
```

---

#### POST /api/game/boss-defeated
Called when boss is defeated.

**Request:**
```json
{
  "stage": 45,
  "rewards": {
    "scrap": 5000,
    "data": 100
  }
}
```

**Response:**
```json
{
  "success": true,
  "newStage": 46,
  "newBoss": {
    "name": "Patrol Unit MK-IV",
    "hp": 12000,
    "rewards": {
      "scrap": 5500,
      "data": 110
    }
  }
}
```

---

### Shop

#### GET /api/shop/items
Get available items for purchase.

**Response:**
```json
{
  "weapons": [
    {
      "id": 1,
      "name": "Rusty Pipe",
      "damageBonus": 2,
      "costScrap": 50,
      "unlockStage": 1,
      "owned": true,
      "equipped": false,
      "upgradeLevel": 3
    }
  ],
  "armor": [...],
  "consumables": [...]
}
```

---

#### POST /api/shop/buy
Purchase an item.

**Request:**
```json
{
  "itemId": 3,
  "quantity": 1
}
```

**Response:**
```json
{
  "success": true,
  "newScrap": 45000,
  "newData": 3400,
  "item": {
    "id": 3,
    "name": "EMP Pistol"
  }
}
```

---

#### POST /api/shop/equip
Equip a weapon or armor.

**Request:**
```json
{
  "itemId": 3
}
```

**Response:**
```json
{
  "success": true,
  "equipped": {
    "weapon": 3,
    "armor": 2
  }
}
```

---

#### POST /api/shop/upgrade-weapon
Upgrade a weapon level.

**Request:**
```json
{
  "itemId": 3
}
```

**Response:**
```json
{
  "success": true,
  "newLevel": 4,
  "newDamageBonus": 19,
  "nextUpgradeCost": 11250
}
```

---

### Machines

#### GET /api/machines
Get user's machines.

**Response:**
```json
{
  "machines": [
    {
      "type": "scrap_collector",
      "level": 5,
      "production": 32,
      "nextLevelCost": 2011
    },
    {
      "type": "data_miner",
      "level": 3,
      "production": 0.8,
      "nextLevelCost": 760
    }
  ]
}
```

---

#### POST /api/machines/buy
Purchase or upgrade a machine.

**Request:**
```json
{
  "machineType": "scrap_collector",
  "levels": 1
}
```

**Response:**
```json
{
  "success": true,
  "newLevel": 6,
  "newProduction": 64,
  "newScrap": 43000
}
```

---

### Upgrades

#### GET /api/upgrades
Get available upgrades.

**Response:**
```json
{
  "temporary": [
    {
      "type": "tap_power",
      "level": 5,
      "effect": "+50% tap damage",
      "nextCost": 800
    }
  ],
  "permanent": [
    {
      "type": "perm_starting_damage",
      "level": 2,
      "effect": "+50% starting damage",
      "nextCost": 3
    }
  ]
}
```

---

#### POST /api/upgrades/buy
Purchase an upgrade level.

**Request:**
```json
{
  "upgradeType": "tap_power"
}
```

**Response:**
```json
{
  "success": true,
  "newLevel": 6,
  "newEffect": "+60% tap damage",
  "newScrap": 42200
}
```

---

### Prestige

#### GET /api/prestige/preview
Preview prestige rewards without committing.

**Response:**
```json
{
  "currentStage": 150,
  "coreFragmentsToEarn": 4,
  "totalCoreFragments": 9,
  "permanentUpgrades": [...],
  "willLose": {
    "scrap": 5000000,
    "data": 50000,
    "temporaryUpgrades": true,
    "machinesReset": true
  }
}
```

---

#### POST /api/prestige/reboot
Execute prestige reset.

**Response:**
```json
{
  "success": true,
  "coreFragmentsEarned": 4,
  "totalCoreFragments": 9,
  "prestigeCount": 3,
  "newGameState": {
    "currentStage": 1,
    "scrap": 0,
    "dataPoints": 0,
    "bonuses": {
      "startingDamage": 1.5,
      "idleEfficiency": 1.2
    }
  }
}
```

---

### Profile

#### GET /api/profile
Get user profile and stats.

**Response:**
```json
{
  "user": {
    "username": "player123",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "stats": {
    "highestStage": 150,
    "totalPrestiges": 3,
    "lifetimeScrap": 50000000,
    "lifetimeData": 500000,
    "lifetimeBossesKilled": 5000,
    "lifetimeTaps": 250000
  },
  "achievements": [
    { "key": "stage_100", "unlockedAt": "2024-01-10T..." }
  ]
}
```

---

#### PUT /api/profile/username
Change username.

**Request:**
```json
{
  "newUsername": "newname123"
}
```

**Response:**
```json
{
  "success": true,
  "username": "newname123"
}
```

---

## Data Flow

### Game Save Flow

```
Client State Change
       │
       ▼
Debounce (2 seconds)
       │
       ▼
POST /api/game/save
       │
       ▼
Validate & Update DB
       │
       ▼
Return Confirmation
```

### Offline Earnings Flow

```
User Returns to Game
       │
       ▼
GET /api/game/state
       │
       ▼
Calculate Time Away
       │
       ▼
Calculate Machine Output
       │
       ▼
Apply Offline Cap
       │
       ▼
Return State + Earnings
       │
       ▼
Display Welcome Back Modal
```

---

## Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_game_state_user ON game_state(user_id);
CREATE INDEX idx_inventory_user_equipped ON inventory(user_id, is_equipped);
CREATE INDEX idx_machines_user ON machines(user_id);
CREATE INDEX idx_upgrades_user_permanent ON upgrades(user_id, is_permanent);

-- Username lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_session ON users(session_token);
```

---

## Migrations

### Initial Setup

```sql
-- Run in order:
-- 1. Create users table
-- 2. Create game_state table
-- 3. Create items table (with seed data)
-- 4. Create inventory table
-- 5. Create machines table
-- 6. Create upgrades table
-- 7. Create prestige_stats table
-- 8. Create achievements table
-- 9. Seed items data
-- 10. Create indexes
```

---

## Environment Variables

```env
# Database
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=gone_off
MYSQL_USER=app_user
MYSQL_PASSWORD=secure_password

# Session
SESSION_SECRET=random_secret_key
SESSION_EXPIRY_DAYS=30

# API
API_RATE_LIMIT=100
SAVE_DEBOUNCE_MS=2000
```
