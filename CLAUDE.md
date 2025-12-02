# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this codebase.

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
npm run db:push      # Push Prisma schema to database
npm run db:seed      # Seed database with items
npm run db:studio    # Open Prisma Studio
npm run pwa:icons    # Regenerate PWA icons from SVG
```

## Architecture

### State Management
- `src/contexts/GameContext.tsx` - Central game state with React Context
- State includes: currencies, stage, boss HP, upgrades, inventory, skills
- Auto-saves to database every 30 seconds
- Session-based authentication via cookies

### 3D Components
- All Three.js components use dynamic imports with `ssr: false`
- Single Canvas in `Boss3D.tsx` to avoid WebGL context limits
- Performance-optimized with reduced particle counts for mobile

### Game Logic
- `src/lib/game/formulas.ts` - Damage, HP scaling, costs calculations
- Boss HP formula: `100 * (stage ^ 1.5)`
- Combo system: up to 2x multiplier at 50 combo

### API Routes
- `/api/game/state` - GET game state
- `/api/game/save` - POST save game state
- `/api/game/tap` - POST process tap damage
- `/api/shop/items` - GET available items
- `/api/shop/buy` - POST purchase item

### Pages
- `/` - Fight screen (main game)
- `/upgrades` - Upgrade stats
- `/machines` - Idle generators
- `/shop` - Buy items
- `/profile` - Stats and settings
- `/offline` - PWA offline fallback

## Key Files

| File | Purpose |
|------|---------|
| `src/contexts/GameContext.tsx` | Central game state |
| `src/components/fight/Boss3D.tsx` | 3D boss with arena |
| `src/components/fight/SkillBar.tsx` | Skill buttons |
| `src/components/fight/DamageNumbers.tsx` | Floating damage |
| `src/components/layout/Header.tsx` | Currency display |
| `src/components/layout/BottomNav.tsx` | Tab navigation |
| `src/lib/game/formulas.ts` | Game calculations |
| `prisma/schema.prisma` | Database schema |

## Database Schema

Main tables:
- `users` - Player accounts with session tokens
- `game_state` - Current progress, currencies, stage
- `inventory` - Owned items
- `upgrades` - Upgrade levels
- `machines` - Idle generators
- `items` - Item definitions (seeded)

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
