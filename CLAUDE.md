# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gone Off is an incremental clicker RPG built with Next.js 16. Players tap to fight 3D animated robot bosses, collect resources, and upgrade their character in a dark humor AGI dystopia setting.

## Tech Stack

- **Next.js 16** with App Router and Turbopack
- **React 19** with TypeScript
- **Three.js** via @react-three/fiber and @react-three/drei for 3D graphics
- **Framer Motion** for 2D animations
- **Tailwind CSS 4** with shadcn/ui components
- **MySQL** with Prisma ORM
- **PWA** with service worker for offline support

## Common Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # Run ESLint
npm run db:push      # Push Prisma schema to database
npm run db:seed      # Seed database with items (tsx prisma/seed.ts)
npm run db:studio    # Open Prisma Studio
npm run db:migrate   # Run Prisma migrations
npm run pwa:icons    # Regenerate PWA icons from SVG
```

## Architecture

### State Management
- `src/contexts/GameContext.tsx` - Central game state using `useReducer` with typed actions
- State includes: currencies (scrap, dataPoints, coreFragments), stage, boss HP, upgrades, inventory, machines, active effects
- Auto-saves to database via debounced POST to `/api/game/save` (configured in `AUTO_SAVE_INTERVAL_MS`)
- Idle tick runs every 1 second when machines exist, applying production and auto-turret DPS
- Session-based auth via localStorage `sessionToken` validated against `users.session_token`

### 3D Components
- All Three.js components use dynamic imports with `ssr: false`
- Single Canvas in `Boss3D.tsx` to avoid WebGL context limits
- Performance-optimized with reduced particle counts for mobile

### Game Logic
- `src/lib/game/formulas.ts` - All damage, HP scaling, machine production, and prestige calculations
- `src/lib/game/constants.ts` - Game balance constants (BASE_DAMAGE, HP_SCALE_PER_STAGE, etc.)
- `src/lib/game/types.ts` - TypeScript interfaces for game entities
- Boss HP formula: `100 * 1.12^(stage-1) * bossMultiplier`
- Boss multipliers: 2x every 10 stages (mini), 5x every 50 (named), 10x every 100 (major)
- Damage formula: `(baseDmg + weaponDmg) * tapPowerMult * permDamageMult * effectMult * critMult`

### API Routes (App Router)
- `/api/auth/login` - POST username to login/register
- `/api/game/state` - GET full game state (requires Bearer token)
- `/api/game/save` - POST save game state
- `/api/shop/buy` - POST purchase item
- `/api/shop/upgrade-weapon` - POST upgrade weapon level
- `/api/machines/buy` - POST buy/upgrade machine
- `/api/upgrades/buy` - POST buy upgrade
- `/api/prestige/reboot` - POST trigger prestige reset

### Pages (App Router)
- `/` - Fight screen (main game with 3D boss)
- `/upgrades` - Upgrade stats (tap power, crit chance/damage, idle power, drop rate)
- `/machines` - Idle generators (scrap collector, data miner, auto-turret, efficiency bot)
- `/shop` - Buy weapons, armor, consumables
- `/profile` - Stats, settings, prestige button
- `/offline` - PWA offline fallback

## Key Patterns

### GameContext Reducer Pattern
Actions are typed and processed in `gameReducer`. Key actions:
- `TAP` - Calculates damage with equipped weapon, upgrades, and active effects
- `BOSS_DEFEATED` - Awards rewards, advances stage, spawns new boss
- `TICK_IDLE` - Applies per-second machine production and DPS
- `PRESTIGE` - Resets temporary state, keeps permanent upgrades and core fragments

### Effect System
`activeEffects` array in state tracks temporary boosts:
- Type: `damage_boost`, `crit_boost`, etc.
- Has `endsAt` timestamp for expiry
- Filtered during damage calculation

## Database Schema

Prisma models in `prisma/schema.prisma`:
- `User` - Accounts with session tokens
- `GameState` - Progress, currencies, equipped items (1:1 with User)
- `Item` - Static item definitions (weapons, armor, accessories, consumables)
- `Inventory` - User's owned items with upgrade levels
- `Machine` - User's idle generators with levels
- `Upgrade` - User's purchased upgrades (temporary and permanent)
- `PrestigeStats` - Lifetime statistics
- `Achievement` - Unlocked achievements

Enums: `ItemType`, `MachineType`

## Performance Notes

- Keep particle counts low (< 20) for mobile performance
- Avoid multiple WebGL Canvas elements
- Use Lucide icons instead of 3D icons for UI elements
- Background effects have reduced frequency (500ms intervals)

## PWA

- `public/manifest.json` - App manifest
- `public/sw.js` - Service worker (network-first caching)
- `src/components/pwa/ServiceWorkerRegistration.tsx` - SW registration
- Icons generated from `public/icons/icon.svg` via `npm run pwa:icons`

## Styling

- Dark cyberpunk theme with cyan (#22d3ee) and purple (#a855f7) accents
- Background: #0a0a0f
- Fonts: Orbitron (display), JetBrains Mono (numbers), Rajdhani (UI)
- Mobile-first, max-width 448px centered layout

## Deployment

Production runs on Hostinger VPS with:
- PM2 process manager (`pm2 start npm --name "gone-off" -- start`)
- Nginx reverse proxy on port 3000
- Let's Encrypt SSL

Update process: `git pull && npm install && npx prisma db push && npm run build && pm2 restart gone-off`
