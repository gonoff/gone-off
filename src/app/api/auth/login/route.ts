import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSessionToken, convertBigIntToNumber } from '@/lib/auth'
import { getBossHP } from '@/lib/game/formulas'

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Validate username
    const trimmedUsername = username.trim()
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 20 characters' },
        { status: 400 }
      )
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, and underscores' },
        { status: 400 }
      )
    }

    // Generate session token
    const sessionToken = generateSessionToken()

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { username: trimmedUsername },
      include: {
        gameState: true,
        inventory: { include: { item: true } },
        machines: true,
        upgrades: true,
        prestigeStats: true,
        achievements: true,
      },
    })

    if (user) {
      // Update session token
      user = await prisma.user.update({
        where: { id: user.id },
        data: { sessionToken, lastActive: new Date() },
        include: {
          gameState: true,
          inventory: { include: { item: true } },
          machines: true,
          upgrades: true,
          prestigeStats: true,
          achievements: true,
        },
      })
    } else {
      // Create new user with initial game state
      const initialBossHP = getBossHP(1)

      user = await prisma.user.create({
        data: {
          username: trimmedUsername,
          sessionToken,
          gameState: {
            create: {
              currentStage: 1,
              highestStage: 1,
              scrap: BigInt(0),
              dataPoints: BigInt(0),
              coreFragments: 0,
              offlineCapLevel: 1,
              currentBossHp: BigInt(initialBossHP),
              currentBossMaxHp: BigInt(initialBossHP),
            },
          },
          prestigeStats: {
            create: {
              totalPrestiges: 0,
              lifetimeScrap: BigInt(0),
              lifetimeData: BigInt(0),
              lifetimeCoreFragments: 0,
              lifetimeBossesKilled: 0,
              lifetimeTaps: BigInt(0),
            },
          },
        },
        include: {
          gameState: true,
          inventory: { include: { item: true } },
          machines: true,
          upgrades: true,
          prestigeStats: true,
          achievements: true,
        },
      })
    }

    // Convert BigInt to numbers for JSON serialization
    const responseData = convertBigIntToNumber({
      success: true,
      sessionToken,
      user: {
        id: user.id,
        username: user.username,
      },
      gameState: user.gameState
        ? {
            currentStage: user.gameState.currentStage,
            highestStage: user.gameState.highestStage,
            scrap: user.gameState.scrap,
            dataPoints: user.gameState.dataPoints,
            coreFragments: user.gameState.coreFragments,
            offlineCapLevel: user.gameState.offlineCapLevel,
            currentBossHp: user.gameState.currentBossHp,
            currentBossMaxHp: user.gameState.currentBossMaxHp,
            totalTaps: user.gameState.totalTaps,
            totalDamageDealt: user.gameState.totalDamageDealt,
            equippedWeaponId: user.gameState.equippedWeaponId,
            equippedArmorId: user.gameState.equippedArmorId,
          }
        : null,
      inventory: user.inventory.map((inv) => ({
        id: inv.item.id,
        name: inv.item.name,
        type: inv.item.type,
        description: inv.item.description,
        damageBonus: inv.item.damageBonus,
        critChanceBonus: Number(inv.item.critChanceBonus),
        critDamageBonus: Number(inv.item.critDamageBonus),
        scrapBonus: Number(inv.item.scrapBonus),
        dataBonus: Number(inv.item.dataBonus),
        unlockStage: inv.item.unlockStage,
        costScrap: inv.item.costScrap,
        costData: inv.item.costData,
        effectDuration: inv.item.effectDuration,
        effectValue: Number(inv.item.effectValue),
        tier: inv.item.tier,
        quantity: inv.quantity,
        upgradeLevel: inv.upgradeLevel,
        isEquipped: inv.isEquipped,
      })),
      machines: user.machines.map((m) => ({
        id: m.id,
        machineType: m.machineType,
        level: m.level,
        lastCollected: m.lastCollected,
      })),
      upgrades: user.upgrades.map((u) => ({
        id: u.id,
        upgradeType: u.upgradeType,
        level: u.level,
        isPermanent: u.isPermanent,
      })),
      prestigeStats: user.prestigeStats
        ? {
            totalPrestiges: user.prestigeStats.totalPrestiges,
            lifetimeScrap: user.prestigeStats.lifetimeScrap,
            lifetimeData: user.prestigeStats.lifetimeData,
            lifetimeCoreFragments: user.prestigeStats.lifetimeCoreFragments,
            lifetimeBossesKilled: user.prestigeStats.lifetimeBossesKilled,
            lifetimeTaps: user.prestigeStats.lifetimeTaps,
            fastestStage100: user.prestigeStats.fastestStage100,
            highestDamageHit: user.prestigeStats.highestDamageHit,
          }
        : null,
      achievements: user.achievements.map((a) => ({
        key: a.achievementKey,
        unlockedAt: a.unlockedAt,
      })),
    })

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}
