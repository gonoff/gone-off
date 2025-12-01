# Gone Off - UI Specification

## Overview

This document defines the user interface specifications for Gone Off, a mobile-first incremental RPG. The design uses shadcn/ui components with a dark cyberpunk theme.

---

## Design System

### Color Palette

```css
/* Primary Colors */
--background: #0a0a0f;         /* Deep black */
--foreground: #e4e4e7;         /* Light gray text */
--card: #18181b;               /* Dark gray cards */
--card-foreground: #fafafa;    /* White text on cards */

/* Accent Colors */
--primary: #22d3ee;            /* Cyan - primary actions */
--primary-foreground: #0a0a0f; /* Black text on primary */
--secondary: #a855f7;          /* Purple - secondary accent */
--destructive: #ef4444;        /* Red - danger/damage */
--success: #22c55e;            /* Green - success/heal */
--warning: #f59e0b;            /* Amber - warnings */

/* Currency Colors */
--scrap: #f59e0b;              /* Amber - Scrap */
--data: #3b82f6;               /* Blue - Data */
--core: #a855f7;               /* Purple - Core Fragments */

/* UI Elements */
--border: #27272a;             /* Dark borders */
--ring: #22d3ee;               /* Focus rings */
--muted: #3f3f46;              /* Muted backgrounds */
--muted-foreground: #a1a1aa;   /* Muted text */
```

### Typography

```css
/* Font Stack */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
--font-display: 'Orbitron', 'Rajdhani', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px - labels */
--text-sm: 0.875rem;   /* 14px - body small */
--text-base: 1rem;     /* 16px - body */
--text-lg: 1.125rem;   /* 18px - emphasis */
--text-xl: 1.25rem;    /* 20px - headings */
--text-2xl: 1.5rem;    /* 24px - section titles */
--text-3xl: 2rem;      /* 32px - boss names */
--text-4xl: 2.5rem;    /* 40px - damage numbers */
```

### Spacing

```css
/* Base unit: 4px */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
```

### Border Radius

```css
--radius-sm: 0.25rem;  /* 4px - buttons, inputs */
--radius-md: 0.5rem;   /* 8px - cards */
--radius-lg: 1rem;     /* 16px - modals */
--radius-full: 9999px; /* Pills, avatars */
```

---

## Screen Layout

### Mobile Viewport

```
Width: 375px - 430px (iPhone SE to iPhone Pro Max)
Height: 100vh (full viewport)
Orientation: Portrait only
```

### Global Layout Structure

```
┌─────────────────────────────────┐
│         HEADER (64px)           │
│   Currency Display + Settings   │
├─────────────────────────────────┤
│                                 │
│                                 │
│        MAIN CONTENT             │
│     (flex-1, scrollable)        │
│                                 │
│                                 │
│                                 │
├─────────────────────────────────┤
│       BOTTOM NAV (80px)         │
│   Fight|Shop|Machines|Up|Prof   │
└─────────────────────────────────┘
```

---

## Component Specifications

### Header Component

**Height**: 64px
**Position**: Fixed top
**Background**: `--background` with blur

```
┌─────────────────────────────────┐
│ ⚙️ 125,000  💾 3,400  💠 5  [⚙]│
└─────────────────────────────────┘
```

**Elements:**
- Currency icons with values (animated on change)
- Settings gear button (right)
- Optional notification badge

**shadcn components**: `Button`, custom icons

---

### Bottom Navigation

**Height**: 80px (includes safe area)
**Position**: Fixed bottom
**Background**: `--card` with top border

```
┌─────────────────────────────────┐
│  ⊕      🛒      ⚙️      ↑     👤  │
│ Fight  Shop  Machines  Up   Me │
└─────────────────────────────────┘
```

**Tab States:**
- Default: `--muted-foreground`
- Active: `--primary` with glow effect
- Badge: Red dot for notifications

**shadcn components**: Custom tabs based on `Tabs`

---

## Screen: Fight (Home)

The main combat screen where players tap to attack.

### Layout

```
┌─────────────────────────────────┐
│         HEADER                  │
├─────────────────────────────────┤
│       STAGE 45 / ZONE A         │
│                                 │
│    ┌─────────────────────┐     │
│    │                     │     │
│    │    BOSS SPRITE      │     │
│    │    (animated)       │     │
│    │                     │     │
│    └─────────────────────┘     │
│                                 │
│    "PATROL UNIT MK-IV"         │
│    "Scanning for rebels..."     │
│                                 │
│    ████████████░░░░░ 4500/10000 │
│         HP BAR                  │
│                                 │
│    ┌─────────────────────┐     │
│    │                     │     │
│    │    TAP ZONE         │     │
│    │    (large area)     │     │
│    │                     │     │
│    └─────────────────────┘     │
│                                 │
│    DMG: 15  |  CRIT: 5%        │
│    DPS: 25  |  REWARD: 5,500   │
│                                 │
├─────────────────────────────────┤
│         BOTTOM NAV              │
└─────────────────────────────────┘
```

### Components

**Stage Indicator**
- Current stage number
- Zone name
- Progress to next milestone

**Boss Display**
- Boss sprite/image (256x256)
- Shake animation on hit
- Death animation on defeat
- Glitch effect for damage

**Boss Info**
- Name (--text-xl, --primary)
- Flavor text (--text-sm, --muted-foreground)
- Italicized, rotating quotes

**HP Bar**
- Full width with padding
- Gradient fill (green → yellow → red)
- Current HP / Max HP text
- Animated decrease

**Tap Zone**
- Large touchable area (min 200x200)
- Ripple effect on tap
- Damage numbers float up
- Critical hits: larger, different color

**Stats Bar**
- Current damage per tap
- Critical chance
- DPS (from machines)
- Estimated reward

### Animations

| Element | Animation | Duration |
|---------|-----------|----------|
| Damage number | Float up + fade | 600ms |
| Critical hit | Scale up + glow | 800ms |
| Boss shake | Horizontal shake | 100ms |
| Boss death | Glitch + dissolve | 500ms |
| HP bar | Width transition | 200ms |

---

## Screen: Shop

Purchase weapons, armor, and consumables.

### Layout

```
┌─────────────────────────────────┐
│         HEADER                  │
├─────────────────────────────────┤
│  [Weapons] [Armor] [Items]      │
│  ─────────────────────────────  │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🔫 EMP Pistol      [BUY]│   │
│  │ +15 DMG                 │   │
│  │ ⚙️ 5,000              │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ⚡ Plasma Cutter   [✓] │   │
│  │ +40 DMG   Lvl 3/10     │   │
│  │ EQUIPPED    [UPGRADE]   │   │
│  │ Next: ⚙️ 75,000       │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🔒 Arc Rifle            │   │
│  │ +100 DMG                │   │
│  │ Unlocks at Stage 75     │   │
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│         BOTTOM NAV              │
└─────────────────────────────────┘
```

### Components

**Category Tabs**
- Weapons, Armor, Items (consumables)
- Underline indicator for active
- Badge for affordable items

**Item Card**
- Icon + Name
- Stats (damage, crit, etc.)
- Price or EQUIPPED status
- Action button (Buy/Equip/Upgrade)

**Item States:**
| State | Appearance |
|-------|------------|
| Locked | Grayed out, lock icon, unlock requirement |
| Available | Full color, price shown, BUY button |
| Owned | Checkmark, EQUIP button |
| Equipped | Highlighted border, upgrade option |
| Maxed | Gold border, MAX LEVEL badge |

**shadcn components**: `Tabs`, `Card`, `Button`, `Badge`

---

## Screen: Machines

Manage idle income generators.

### Layout

```
┌─────────────────────────────────┐
│         HEADER                  │
├─────────────────────────────────┤
│    IDLE INCOME                  │
│    ⚙️ +32/sec  💾 +0.8/sec     │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🏭 Scrap Collector       │   │
│  │ Level 5                  │   │
│  │ Production: 32 ⚙️/sec   │   │
│  │                          │   │
│  │ [─────────] ⚙️ 2,011   │   │
│  │ [BUY x1] [x10] [MAX]    │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 💻 Data Miner            │   │
│  │ Level 3                  │   │
│  │ Production: 0.8 💾/sec  │   │
│  │                          │   │
│  │ [─────────] 💾 760      │   │
│  │ [BUY x1] [x10] [MAX]    │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🔒 Auto-Turret           │   │
│  │ Deals passive damage     │   │
│  │ Unlocks at Stage 50      │   │
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│         BOTTOM NAV              │
└─────────────────────────────────┘
```

### Components

**Income Summary**
- Total income per second
- By currency type
- Animated when collecting

**Machine Card**
- Machine icon + name
- Current level
- Production rate
- Cost for next level
- Buy buttons (x1, x10, MAX)

**Buy Button Variants:**
| Button | Function |
|--------|----------|
| x1 | Buy 1 level |
| x10 | Buy 10 levels (if affordable) |
| MAX | Buy maximum affordable |

**shadcn components**: `Card`, `Button`, `Progress`

---

## Screen: Upgrades

Temporary and permanent stat improvements.

### Layout

```
┌─────────────────────────────────┐
│         HEADER                  │
├─────────────────────────────────┤
│  [Temporary] [Permanent]        │
│  ─────────────────────────────  │
│                                 │
│  TEMPORARY UPGRADES             │
│  (Reset on Prestige)            │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ⚔️ Tap Power             │   │
│  │ Level 5 → +50% tap dmg  │   │
│  │ Next: +60%              │   │
│  │ ⚙️ 800           [BUY] │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🎯 Crit Chance           │   │
│  │ Level 3 → +3% crit      │   │
│  │ Next: +4%               │   │
│  │ ⚙️ 2,000         [BUY] │   │
│  └─────────────────────────┘   │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  PERMANENT UPGRADES             │
│  (Persist through Prestige)     │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 💎 Starting Damage       │   │
│  │ Level 2 → +50% base dmg │   │
│  │ Next: +75%              │   │
│  │ 💠 3              [BUY] │   │
│  └─────────────────────────┘   │
│                                 │
├─────────────────────────────────┤
│         BOTTOM NAV              │
└─────────────────────────────────┘
```

### Components

**Section Headers**
- Temporary vs Permanent distinction
- Description of reset behavior

**Upgrade Card**
- Upgrade icon + name
- Current level and effect
- Next level preview
- Cost + Buy button

**shadcn components**: `Tabs`, `Card`, `Button`, `Separator`

---

## Screen: Profile

Player stats, settings, and prestige.

### Layout

```
┌─────────────────────────────────┐
│         HEADER                  │
├─────────────────────────────────┤
│       👤                        │
│    player123                    │
│    [Change Name]                │
│                                 │
│  ┌─────────────────────────┐   │
│  │ STATS                    │   │
│  │ Highest Stage: 150      │   │
│  │ Total Prestiges: 3      │   │
│  │ Bosses Killed: 5,000    │   │
│  │ Total Taps: 250,000     │   │
│  │ Lifetime Scrap: 50M     │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🏆 ACHIEVEMENTS          │   │
│  │ [✓] First Blood         │   │
│  │ [✓] Stage 100           │   │
│  │ [ ] Stage 500 (340/500) │   │
│  │ [See All →]             │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ ⚡ PRESTIGE (REBOOT)     │   │
│  │ Reset for permanent     │   │
│  │ bonuses!                 │   │
│  │                          │   │
│  │ You will earn:          │   │
│  │ 💠 4 Core Fragments     │   │
│  │                          │   │
│  │ [REBOOT NOW]            │   │
│  └─────────────────────────┘   │
│                                 │
│  [Settings] [Help] [Logout]    │
│                                 │
├─────────────────────────────────┤
│         BOTTOM NAV              │
└─────────────────────────────────┘
```

### Components

**Profile Header**
- Avatar placeholder
- Username
- Edit button

**Stats Card**
- Key statistics
- Formatted numbers (50M, not 50,000,000)

**Achievements Preview**
- Recent achievements
- Progress on next
- Link to full list

**Prestige Card**
- Explanation text
- Preview of rewards
- Big action button
- Warning about what resets

**shadcn components**: `Avatar`, `Card`, `Button`, `Progress`, `Dialog`

---

## Modals & Dialogs

### Welcome Back Modal

Shown when returning after time away.

```
┌─────────────────────────────────┐
│                                 │
│       WELCOME BACK!             │
│                                 │
│   You were away for 4h 32m      │
│                                 │
│   Your machines collected:      │
│   ⚙️ +12,500 Scrap             │
│   💾 +340 Data                 │
│                                 │
│   Storage: 85% full             │
│   [Upgrade Storage]             │
│                                 │
│         [COLLECT]               │
│                                 │
└─────────────────────────────────┘
```

### Prestige Confirmation

```
┌─────────────────────────────────┐
│                                 │
│       ⚠️ CONFIRM REBOOT         │
│                                 │
│   You will LOSE:               │
│   • Stage Progress (150 → 1)   │
│   • All Scrap & Data           │
│   • Temporary Upgrades         │
│   • Machine Levels             │
│                                 │
│   You will GAIN:               │
│   💠 4 Core Fragments          │
│                                 │
│   You will KEEP:               │
│   • Permanent Upgrades         │
│   • Achievements               │
│   • Core Fragments             │
│                                 │
│   [CANCEL]    [CONFIRM REBOOT] │
│                                 │
└─────────────────────────────────┘
```

### Purchase Confirmation (Large)

For expensive purchases only.

```
┌─────────────────────────────────┐
│                                 │
│    CONFIRM PURCHASE             │
│                                 │
│    Quantum Disruptor            │
│    +300 DMG                     │
│                                 │
│    Cost: ⚙️ 1,000,000          │
│                                 │
│   [CANCEL]      [CONFIRM]      │
│                                 │
└─────────────────────────────────┘
```

**shadcn components**: `Dialog`, `AlertDialog`

---

## Animations & Effects

### Damage Numbers

```css
@keyframes damageFloat {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) scale(0.8);
    opacity: 0;
  }
}

.damage-number {
  animation: damageFloat 600ms ease-out forwards;
  color: var(--destructive);
  font-size: var(--text-4xl);
  font-weight: bold;
}

.damage-number.critical {
  color: var(--warning);
  font-size: calc(var(--text-4xl) * 1.5);
  text-shadow: 0 0 10px var(--warning);
}
```

### Currency Change

```css
@keyframes currencyPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.currency-increased {
  animation: currencyPulse 300ms ease;
  color: var(--success);
}

.currency-decreased {
  animation: currencyPulse 300ms ease;
  color: var(--destructive);
}
```

### Boss Hit

```css
@keyframes bossShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.boss-hit {
  animation: bossShake 100ms ease;
}
```

### Glitch Effect (Damage Taken)

```css
@keyframes glitch {
  0% { clip-path: inset(40% 0 61% 0); }
  20% { clip-path: inset(92% 0 1% 0); }
  40% { clip-path: inset(43% 0 1% 0); }
  60% { clip-path: inset(25% 0 58% 0); }
  80% { clip-path: inset(54% 0 7% 0); }
  100% { clip-path: inset(58% 0 43% 0); }
}

.glitch-effect {
  animation: glitch 200ms steps(2) infinite;
}
```

---

## Touch Interactions

### Tap Responsiveness

| Action | Response Time |
|--------|---------------|
| Tap feedback (visual) | < 50ms |
| Damage calculation | < 100ms |
| Server sync (batched) | 2000ms |

### Touch Targets

Minimum touch target: **44x44px** (Apple HIG)

### Gesture Support

| Gesture | Screen | Action |
|---------|--------|--------|
| Tap | Fight | Attack boss |
| Long press | Shop | Item details |
| Swipe left/right | Shop | Switch categories |
| Pull down | Any | Refresh (if needed) |

---

## Loading States

### Skeleton Screens

Use skeleton placeholders matching content shape.

```
┌─────────────────────────────────┐
│  ████████  ███████  ██████     │
├─────────────────────────────────┤
│                                 │
│    ┌─────────────────────┐     │
│    │  ░░░░░░░░░░░░░░░░   │     │
│    │  ░░░░░░░░░░░░░░░░   │     │
│    │  ░░░░░░░░░░░░░░░░   │     │
│    └─────────────────────┘     │
│                                 │
└─────────────────────────────────┘
```

### Loading Spinner

Use for actions (buying, saving).

```css
.spinner {
  border: 3px solid var(--muted);
  border-top: 3px solid var(--primary);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}
```

---

## Error States

### Connection Lost

```
┌─────────────────────────────────┐
│                                 │
│         ⚠️ OFFLINE              │
│                                 │
│   Connection lost.              │
│   Progress will sync when       │
│   you're back online.           │
│                                 │
│         [RETRY]                 │
│                                 │
└─────────────────────────────────┘
```

### Purchase Failed

Toast notification:
```
[❌ Not enough Scrap!]
```

---

## shadcn/ui Components Used

| Component | Usage |
|-----------|-------|
| Button | All actions |
| Card | Item cards, stat cards |
| Dialog | Modals, confirmations |
| Tabs | Navigation, categories |
| Progress | HP bar, achievements |
| Badge | Notifications, status |
| Avatar | Profile |
| Separator | Section dividers |
| Toast | Notifications |
| Skeleton | Loading states |

---

## Accessibility

### Requirements

- Minimum contrast ratio: 4.5:1
- Focus indicators on all interactive elements
- Screen reader labels for icons
- Reduced motion option
- Touch targets minimum 44x44px

### ARIA Labels

```html
<button aria-label="Attack boss">TAP</button>
<div role="progressbar" aria-valuenow="45" aria-valuemax="100">HP</div>
<span aria-label="5000 Scrap">⚙️ 5,000</span>
```

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with nav
│   ├── page.tsx            # Fight screen (home)
│   ├── shop/
│   │   └── page.tsx
│   ├── machines/
│   │   └── page.tsx
│   ├── upgrades/
│   │   └── page.tsx
│   └── profile/
│       └── page.tsx
├── components/
│   ├── ui/                 # shadcn components
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── BottomNav.tsx
│   ├── fight/
│   │   ├── BossDisplay.tsx
│   │   ├── HPBar.tsx
│   │   ├── TapZone.tsx
│   │   └── DamageNumber.tsx
│   ├── shop/
│   │   ├── ItemCard.tsx
│   │   └── CategoryTabs.tsx
│   ├── machines/
│   │   └── MachineCard.tsx
│   ├── upgrades/
│   │   └── UpgradeCard.tsx
│   └── profile/
│       ├── StatsCard.tsx
│       └── PrestigeCard.tsx
└── styles/
    └── globals.css         # Theme variables
```
