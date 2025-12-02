'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '@/contexts/GameContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Zap } from 'lucide-react'

export function LoginScreen() {
  const { login, isLoading } = useGame()
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    if (username.length > 20) {
      setError('Username must be 20 characters or less')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores')
      return
    }

    setIsSubmitting(true)
    const success = await login(username)
    setIsSubmitting(false)

    if (!success) {
      setError('Failed to login. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            {/* Logo */}
            <motion.div
              className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Zap className="w-10 h-10 text-primary-foreground" />
            </motion.div>

            <div>
              <CardTitle className="text-3xl font-display text-glow-primary tracking-wider">
                GONE OFF
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                The Resistance needs you. Choose your callsign.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-muted/50 border-border focus:border-primary text-center text-lg"
                  maxLength={20}
                  autoFocus
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-destructive text-sm text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 glow-primary"
                disabled={isSubmitting || !username.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Join the Resistance'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>No password required.</p>
              <p className="mt-1">Progress is saved automatically.</p>
            </div>
          </CardContent>
        </Card>

        {/* Decorative elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-primary/30" />
        <div className="absolute -top-4 -right-4 w-8 h-8 border-t-2 border-r-2 border-primary/30" />
        <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-2 border-l-2 border-primary/30" />
        <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-primary/30" />
      </motion.div>
    </div>
  )
}
