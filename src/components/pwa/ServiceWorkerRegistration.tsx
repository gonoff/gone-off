'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function ServiceWorkerRegistration() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [showUpdateBanner, setShowUpdateBanner] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service worker registered')
          setRegistration(reg)

          // Check for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New update available
                  setShowUpdateBanner(true)
                }
              })
            }
          })
        })
        .catch((err) => {
          console.error('[PWA] Service worker registration failed:', err)
        })

      // Handle controller change (when new SW takes over)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload()
      })
    }

    // Capture install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)

      // Show install banner after a delay
      setTimeout(() => {
        setShowInstallBanner(true)
      }, 3000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return

    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('[PWA] User accepted install prompt')
    }

    setInstallPrompt(null)
    setShowInstallBanner(false)
  }

  const handleUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
    setShowUpdateBanner(false)
  }

  return (
    <>
      {/* Install Banner */}
      <AnimatePresence>
        {showInstallBanner && installPrompt && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-50 max-w-md mx-auto"
          >
            <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground">Install Gone Off</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add to your home screen for the best experience
                  </p>
                </div>
                <button
                  onClick={() => setShowInstallBanner(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInstallBanner(false)}
                  className="flex-1"
                >
                  Not now
                </Button>
                <Button
                  size="sm"
                  onClick={handleInstall}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600"
                >
                  Install
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Banner */}
      <AnimatePresence>
        {showUpdateBanner && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-20 left-4 right-4 z-50 max-w-md mx-auto"
          >
            <div className="bg-gradient-to-r from-green-500/20 to-cyan-500/20 backdrop-blur-md border border-green-500/30 rounded-2xl p-4 shadow-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <RefreshCw className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground">Update Available</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    A new version is ready. Refresh to update!
                  </p>
                </div>
                <button
                  onClick={() => setShowUpdateBanner(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUpdateBanner(false)}
                  className="flex-1"
                >
                  Later
                </Button>
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  Update Now
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
