import { prisma } from './prisma'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function getSessionUser() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('sessionToken')?.value

  if (!sessionToken) {
    return null
  }

  const user = await prisma.user.findFirst({
    where: { sessionToken },
    include: {
      gameState: true,
      inventory: { include: { item: true } },
      machines: true,
      upgrades: true,
      prestigeStats: true,
      achievements: true,
    },
  })

  return user
}

export async function getSessionUserFromHeader(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const sessionToken = authHeader.replace('Bearer ', '')

  const user = await prisma.user.findFirst({
    where: { sessionToken },
    include: {
      gameState: true,
      inventory: { include: { item: true } },
      machines: true,
      upgrades: true,
      prestigeStats: true,
      achievements: true,
    },
  })

  return user
}

export function convertBigIntToNumber(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj === 'bigint') {
    return Number(obj)
  }

  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToNumber)
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = convertBigIntToNumber(value)
    }
    return result
  }

  return obj
}
