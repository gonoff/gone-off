import type { Metadata, Viewport } from 'next'
import { Orbitron, JetBrains_Mono, Rajdhani } from 'next/font/google'
import { GameProvider } from '@/contexts/GameContext'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { Toaster } from '@/components/ui/sonner'
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration'
import './globals.css'

// Tech/cyberpunk display font
const orbitron = Orbitron({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
})

// Monospace font for numbers and code
const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
})

// Modern UI font
const rajdhani = Rajdhani({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Gone Off - Incremental RPG',
  description: 'Fight rogue AI units in this incremental clicker RPG. Collect scrap, upgrade weapons, and take down THE ADMINISTRATOR.',
  keywords: ['incremental game', 'clicker', 'rpg', 'idle game', 'mobile game'],
  authors: [{ name: 'Gone Off Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Gone Off',
    startupImage: [
      {
        url: '/splash/splash-640x1136.png',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/splash/splash-750x1334.png',
        media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      },
      {
        url: '/splash/splash-1242x2208.png',
        media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/splash/splash-1125x2436.png',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
      {
        url: '/splash/splash-1170x2532.png',
        media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  icons: {
    icon: [
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0a0a0f',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${orbitron.variable} ${jetbrainsMono.variable} ${rajdhani.variable} font-sans antialiased`}
      >
        <GameProvider>
          <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 pt-16 pb-20 overflow-y-auto">
              <div className="max-w-md mx-auto h-full">
                {children}
              </div>
            </main>
            <BottomNav />
          </div>
          <Toaster position="top-center" />
          <ServiceWorkerRegistration />
        </GameProvider>
      </body>
    </html>
  )
}
