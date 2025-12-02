# Gone Off - Incremental RPG

A dark humor incremental clicker RPG where you fight rogue AI bosses in a dystopian future. Collect scrap, upgrade weapons, and take down THE ADMINISTRATOR.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **3D Graphics**: Three.js with @react-three/fiber and @react-three/drei
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Database**: MySQL with Prisma ORM
- **PWA**: Installable with offline support

## Features

- **Boss Fights**: Tap to damage 3D animated robot bosses with combo system
- **Progression**: Stage-based difficulty scaling with boss variants
- **Economy**: Dual currency system (Scrap + Data Points)
- **Upgrades**: Damage, crit chance, crit damage, passive income
- **Machines**: Idle resource generators
- **Skills**: Overclock, EMP Burst, Data Surge abilities
- **Shop**: Weapons, armor, and consumables
- **PWA**: Install on mobile, works offline

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/gone-off.git
cd gone-off
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL
```

4. Set up the database:
```bash
npm run db:push
npm run db:seed
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with items |
| `npm run db:studio` | Open Prisma Studio |
| `npm run pwa:icons` | Regenerate PWA icons |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── fight/             # Fight screen (redirects to /)
│   ├── upgrades/          # Upgrades page
│   ├── machines/          # Machines page
│   ├── shop/              # Shop page
│   ├── profile/           # Profile/stats page
│   └── offline/           # Offline fallback page
├── components/
│   ├── fight/             # Boss, skills, damage numbers
│   ├── layout/            # Header, BottomNav
│   ├── pwa/               # Service worker registration
│   └── ui/                # shadcn/ui components
├── contexts/              # React contexts (GameContext)
└── lib/
    ├── game/              # Game formulas and calculations
    └── prisma.ts          # Prisma client

public/
├── icons/                 # PWA icons (generated)
├── splash/                # iOS splash screens (generated)
├── manifest.json          # PWA manifest
└── sw.js                  # Service worker

prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Database seeder
```

## PWA Installation

The app can be installed on mobile devices:

1. Open the app in your mobile browser
2. Wait for the "Install Gone Off" prompt
3. Tap "Install" to add to home screen

Or use browser menu: "Add to Home Screen" / "Install App"

## Game Mechanics

### Combat
- Tap the boss to deal damage
- Build combos for damage multipliers (up to 2x at 50 combo)
- Critical hits deal extra damage
- Boss HP scales with stage number

### Skills
- **Overclock**: 2x damage for 5 seconds (30s cooldown)
- **EMP Burst**: Instant 10% boss HP damage (45s cooldown)
- **Data Surge**: 3x rewards for next kill (60s cooldown)

### Currencies
- **Scrap** (yellow): Primary currency for upgrades
- **Data Points** (cyan): Premium currency for machines
- **Core Fragments** (purple): Prestige currency (future)

## Environment Variables

```env
DATABASE_URL="mysql://user:password@localhost:3306/gone_off"
```

## License

MIT
