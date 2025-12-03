# Gone Off - Architecture Documentation

## Overview

Gone Off is built with Next.js 16 (App Router), React 19, and uses a client-side state management pattern with server-side persistence.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 with App Router |
| Frontend | React 19 with TypeScript |
| 3D Graphics | Three.js via @react-three/fiber |
| Animations | Framer Motion |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Database | MySQL |
| ORM | Prisma |
| PWA | Custom service worker |

---

## Directory Structure

```
gone-off/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Item/data seeding
├── public/
│   ├── sw.js              # Service worker
│   └── manifest.json      # PWA manifest
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/           # API routes
│   │   ├── machines/      # Machine shop page
│   │   ├── profile/       # Profile/prestige page
│   │   ├── shop/          # Item shop page
│   │   ├── upgrades/      # Upgrades page
│   │   └── page.tsx       # Main fight page
│   ├── components/        # React components
│   │   ├── game/          # Game-specific components
│   │   ├── ui/            # shadcn/ui components
│   │   └── pwa/           # PWA components
│   ├── contexts/          # React contexts
│   │   └── GameContext.tsx # Main game state
│   └── lib/
│       ├── game/          # Game logic
│       │   ├── constants.ts
│       │   ├── formulas.ts
│       │   └── types.ts
│       ├── auth.ts        # Auth utilities
│       └── prisma.ts      # Prisma client
└── docs/                  # Documentation
```

---

## State Management

### GameContext Architecture

The game uses React Context with `useReducer` for state management.

**File**: `src/contexts/GameContext.tsx`

```typescript
interface GameState {
  // Core game state
  gameState: ClientGameState
  inventory: InventoryItem[]
  machines: Machine[]
  upgrades: Upgrade[]
  prestigeStats: PrestigeStats

  // UI state
  activeEffects: ActiveEffect[]
  damageNumbers: DamageNumber[]

  // Status
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}
```

### Action Types

| Action | Purpose |
|--------|---------|
| `SET_STATE` | Load full state from server |
| `LOAD_GAME_DATA` | Load game with null safety checks |
| `TAP` | Process tap damage |
| `BOSS_DEFEATED` | Award rewards, advance stage |
| `TICK_IDLE` | Apply per-second machine production + auto-turret DPS |
| `PURCHASE_COMPLETE` | Atomic shop purchase (item + currencies) |
| `UPGRADE_COMPLETE` | Atomic upgrade purchase (upgrade + currencies) |
| `MACHINE_COMPLETE` | Atomic machine purchase (machine + currencies) |
| `WEAPON_UPGRADE_COMPLETE` | Atomic weapon upgrade (level + currencies) |
| `EQUIP_ITEM` | Equip weapon/armor/accessory |
| `PRESTIGE` | Trigger prestige reset |
| `COLLECT_OFFLINE` | Apply offline earnings |

### Atomic Purchase Pattern

All purchase operations use atomic actions to prevent race conditions:

```typescript
// Instead of two separate dispatches that can race:
dispatch({ type: 'BUY_UPGRADE', payload: { ... } })
dispatch({ type: 'UPDATE_CURRENCIES', payload: { ... } }) // Can fail!

// Use single atomic dispatch:
dispatch({
  type: 'UPGRADE_COMPLETE',
  payload: {
    upgradeType,
    isPermanent,
    newLevel: data.newLevel,
    newScrap: data.newScrap,
    newData: data.newData,
    newCoreFragments: data.newCoreFragments,
  },
})
```

### Purchase Protection

Uses `purchaseInProgressRef` to prevent `beforeunload` from overwriting server state:

```typescript
const buyUpgrade = useCallback(async (...) => {
  purchaseInProgressRef.current = true  // Block saves during purchase
  try {
    const response = await fetch('/api/upgrades/buy', ...)
    // ... parse response with error handling
    dispatch({ type: 'UPGRADE_COMPLETE', payload: { ... } })
    return true
  } finally {
    purchaseInProgressRef.current = false
  }
}, [])

// In beforeunload handler:
if (purchaseInProgressRef.current) {
  console.log('Skipping save - purchase in progress')
  return  // Don't overwrite server state with stale client state
}
```

### Null Safety in State Loading

`LOAD_GAME_DATA` ensures critical state objects are never null:

```typescript
case 'LOAD_GAME_DATA': {
  const newState = { ...state, ...action.payload }
  // Ensure critical state objects are never null
  if (!newState.prestigeStats) newState.prestigeStats = initialPrestigeStats
  if (!newState.inventory) newState.inventory = []
  if (!newState.machines) newState.machines = []
  if (!newState.upgrades) newState.upgrades = []
  if (!newState.activeEffects) newState.activeEffects = []
  return newState
}
```

### State Flow

```
User Action → dispatch(action) → gameReducer → new state
                                      ↓
                              (after 2000ms debounce)
                                      ↓
                              POST /api/game/save
                                      ↓
                              Database update
```

---

## Authentication System

### Session-Based Auth

Uses simple username-based authentication with session tokens.

**Flow**:
1. User enters username at login
2. Server creates/retrieves user, generates session token
3. Token stored in `localStorage.sessionToken`
4. Token sent as `Authorization: Bearer <token>` header
5. Server validates token against `users.session_token`

**No password protection** - designed for casual play.

### Auth Utilities

**File**: `src/lib/auth.ts`

```typescript
// Validate session token from header
async function getSessionUserFromHeader(authHeader: string | null)

// Convert BigInt to Number for JSON serialization
function convertBigIntToNumber(obj: any)
```

---

## API Architecture

### Route Pattern

All API routes follow Next.js App Router conventions:

```
src/app/api/[route]/route.ts
```

Each route exports HTTP method handlers (`GET`, `POST`, etc.).

### Common Pattern

```typescript
export async function POST(request: NextRequest) {
  // 1. Validate auth
  const authHeader = request.headers.get('Authorization')
  const user = await getSessionUserFromHeader(authHeader)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Parse and validate body
  const body = await request.json()

  // 3. Business logic (often in transaction)
  const result = await prisma.$transaction(async (tx) => {
    // ... database operations
  })

  // 4. Return response (convert BigInt)
  return NextResponse.json(convertBigIntToNumber(result))
}
```

### API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/login` | POST | No | Login/register |
| `/api/game/state` | GET | Yes | Load game + offline |
| `/api/game/save` | POST | Yes | Save game state |
| `/api/game/equip` | POST | Yes | Equip/unequip items |
| `/api/shop/buy` | POST | Yes | Purchase items |
| `/api/shop/items` | GET | Yes | List available items |
| `/api/shop/upgrade-weapon` | POST | Yes | Upgrade weapon |
| `/api/machines/buy` | POST | Yes | Buy/upgrade machines |
| `/api/upgrades/buy` | POST | Yes | Buy upgrades |
| `/api/prestige/reboot` | POST | Yes | Trigger prestige |

---

## Database Schema

### Entity Relationship

```
User (1) ─────────── (1) GameState
  │
  ├── (1) ─────────── (n) Inventory
  │                         │
  │                         └── (n) ─── (1) Item
  │
  ├── (1) ─────────── (n) Machine
  │
  ├── (1) ─────────── (n) Upgrade
  │
  ├── (1) ─────────── (1) PrestigeStats
  │
  └── (1) ─────────── (n) Achievement
```

### Key Models

**GameState** - Core progression data:
- Stage tracking (current, highest)
- Currencies (scrap, dataPoints, coreFragments)
- Boss state (HP, maxHP)
- Equipped items (weapon, armor, accessory)
- Statistics (totalTaps, totalDamageDealt)
- Timestamps (lastSave, lastOfflineClaim)

**Inventory** - Player's owned items:
- Links User to Item
- Tracks upgradeLevel for weapons
- Tracks quantity (unused for consumables)

**Machine** - Idle generators:
- Type (scrap_collector, data_miner, auto_turret, efficiency_bot)
- Level (affects production)

**Upgrade** - Purchased upgrades:
- Type (tap_power, crit_chance, etc.)
- Level (affects bonus)
- isPermanent flag

---

## Save System

### Auto-Save with Retry

```typescript
const saveGame = useCallback(async (retries = 2): Promise<boolean> => {
  try {
    const response = await fetch('/api/game/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
      },
      body: JSON.stringify({ gameState: state.gameState }),
    })
    return response.ok
  } catch (error) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, 1000))
      return saveGame(retries - 1)
    }
    return false
  }
}, [state.gameState])
```

### Debounced Trigger

```typescript
useEffect(() => {
  const timeoutId = setTimeout(() => {
    saveGame()
  }, 2000) // 2 second debounce

  return () => clearTimeout(timeoutId)
}, [state.gameState])
```

### Page Close Save

Uses synchronous XHR for reliability:

```typescript
window.addEventListener('beforeunload', () => {
  const xhr = new XMLHttpRequest()
  xhr.open('POST', '/api/game/save', false) // synchronous
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.setRequestHeader('Authorization', `Bearer ${token}`)
  xhr.send(JSON.stringify({ gameState }))
})
```

---

## Idle System

### Tick Loop

Runs every 1000ms when machines exist:

```typescript
useEffect(() => {
  if (state.machines.length === 0) return

  const interval = setInterval(() => {
    dispatch({ type: 'TICK_IDLE' })
  }, 1000)

  return () => clearInterval(interval)
}, [state.machines.length])
```

### TICK_IDLE Action

1. Calculate total production from all machines
2. Apply upgrade multipliers (idlePower, permIdle)
3. Apply efficiency bot bonus
4. Add scrap/data to currencies
5. Apply auto-turret DPS to boss

---

## Offline Earnings

### Calculation Flow

1. On game load, compare `lastOfflineClaim` to now
2. Calculate seconds away (capped by storage level)
3. Multiply by per-second production
4. Show offline earnings modal
5. Add earnings to currencies
6. Update `lastOfflineClaim` on next save

### Anti-Exploit Protection

`lastOfflineClaim` is updated on every save to prevent:
- Repeated claiming by re-logging
- Time manipulation exploits

---

## 3D Rendering

### Three.js Integration

Uses `@react-three/fiber` with dynamic imports:

```typescript
const Boss3D = dynamic(() => import('./Boss3D'), {
  ssr: false, // Disable SSR for WebGL
})
```

### Single Canvas Pattern

Only one WebGL Canvas to avoid context limits:

```typescript
<Canvas>
  <ambientLight />
  <Boss3DModel />
  <ParticleEffects />
  <DamageNumbers />
</Canvas>
```

### Performance Optimizations

- Reduced particle counts (< 20)
- Background effects at 500ms intervals
- Mobile-optimized models

---

## PWA Setup

### Service Worker

**File**: `public/sw.js`

- Network-first caching strategy
- Offline fallback page
- Manual cache update on new version

### Manifest

**File**: `public/manifest.json`

```json
{
  "name": "Gone Off",
  "short_name": "GoneOff",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#22d3ee"
}
```

### Registration

**File**: `src/components/pwa/ServiceWorkerRegistration.tsx`

Registers SW on mount, handles updates.

---

## Styling

### Theme

- Dark cyberpunk aesthetic
- Background: `#0a0a0f`
- Primary accent: Cyan `#22d3ee`
- Secondary accent: Purple `#a855f7`

### Fonts

| Font | Usage |
|------|-------|
| Orbitron | Display headings |
| JetBrains Mono | Numbers, stats |
| Rajdhani | UI text |

### Layout

- Mobile-first design
- Max-width: 448px
- Centered container

---

## Common Patterns

### BigInt Handling

Database stores currencies as BigInt. Convert before JSON:

```typescript
function convertBigIntToNumber(obj: any): any {
  if (typeof obj === 'bigint') return Number(obj)
  if (Array.isArray(obj)) return obj.map(convertBigIntToNumber)
  if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, convertBigIntToNumber(v)])
    )
  }
  return obj
}
```

### Transaction Pattern

Always use transactions for multi-step operations:

```typescript
await prisma.$transaction(async (tx) => {
  // Deduct currency
  await tx.gameState.update({ ... })
  // Add item
  await tx.inventory.create({ ... })
})
```

### Error Handling

Wrap API handlers in try-catch:

```typescript
export async function POST(request: NextRequest) {
  try {
    // ... logic
  } catch (error) {
    console.error('Operation error:', error)
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    )
  }
}
```
