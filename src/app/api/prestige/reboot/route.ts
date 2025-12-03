import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserFromHeader, convertBigIntToNumber } from '@/lib/auth'
import { calculateCoreFragments, getBossHP } from '@/lib/game/formulas'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const user = await getSessionUserFromHeader(authHeader)

    if (!user || !user.gameState) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Minimum stage requirement for prestige
    const MIN_PRESTIGE_STAGE = 10
    if (user.gameState.highestStage < MIN_PRESTIGE_STAGE) {
      return NextResponse.json(
        { error: `Must reach stage ${MIN_PRESTIGE_STAGE} to prestige` },
        { status: 400 }
      )
    }

    // Calculate core fragments earned
    const prestigeBonusLevel = user.upgrades.find(
      u => u.upgradeType === 'perm_prestige_bonus'
    )?.level ?? 0
    const coreFragmentsEarned = calculateCoreFragments(
      user.gameState.highestStage,
      prestigeBonusLevel
    )

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Update prestige stats
      await tx.prestigeStats.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          totalPrestiges: 1,
          lifetimeScrap: user.gameState!.scrap,
          lifetimeData: user.gameState!.dataPoints,
          lifetimeCoreFragments: coreFragmentsEarned,
          lifetimeBossesKilled: user.gameState!.highestStage,
          lifetimeTaps: user.gameState!.totalTaps,
        },
        update: {
          totalPrestiges: { increment: 1 },
          lifetimeScrap: { increment: user.gameState!.scrap },
          lifetimeData: { increment: user.gameState!.dataPoints },
          lifetimeCoreFragments: { increment: coreFragmentsEarned },
          lifetimeBossesKilled: { increment: user.gameState!.highestStage },
          lifetimeTaps: { increment: user.gameState!.totalTaps },
        },
      })

      // Reset game state (keep core fragments, add new ones)
      const newBossHP = getBossHP(1)
      const updatedGameState = await tx.gameState.update({
        where: { userId: user.id },
        data: {
          currentStage: 1,
          // Keep highestStage for records
          scrap: BigInt(0),
          dataPoints: BigInt(0),
          coreFragments: { increment: coreFragmentsEarned },
          currentBossHp: BigInt(newBossHP),
          currentBossMaxHp: BigInt(newBossHP),
          totalTaps: BigInt(0),
          totalDamageDealt: BigInt(0),
          equippedWeaponId: null,
          equippedArmorId: null,
        },
      })

      // Delete all non-permanent upgrades
      await tx.upgrade.deleteMany({
        where: {
          userId: user.id,
          isPermanent: false,
        },
      })

      // Delete all machines
      await tx.machine.deleteMany({
        where: { userId: user.id },
      })

      // Delete all inventory items
      await tx.inventory.deleteMany({
        where: { userId: user.id },
      })

      // Get updated prestige stats
      const prestigeStats = await tx.prestigeStats.findUnique({
        where: { userId: user.id },
      })

      // Get remaining permanent upgrades
      const permanentUpgrades = await tx.upgrade.findMany({
        where: {
          userId: user.id,
          isPermanent: true,
        },
      })

      return { updatedGameState, prestigeStats, permanentUpgrades }
    })

    const responseData = convertBigIntToNumber({
      success: true,
      coreFragmentsEarned,
      totalCoreFragments: result.updatedGameState.coreFragments,
      prestigeStats: result.prestigeStats,
      permanentUpgrades: result.permanentUpgrades,
    })

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Prestige error:', error)
    return NextResponse.json(
      { error: 'Failed to prestige' },
      { status: 500 }
    )
  }
}
