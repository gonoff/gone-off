import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserFromHeader, convertBigIntToNumber } from '@/lib/auth'
import { getUpgradeCost, TEMP_UPGRADE_CONFIGS, PERM_UPGRADE_CONFIGS } from '@/lib/game'

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

    const { upgradeType } = await request.json()

    // Find upgrade config
    let config = TEMP_UPGRADE_CONFIGS.find((c) => c.type === upgradeType)
    let isPermanent = false

    if (!config) {
      config = PERM_UPGRADE_CONFIGS.find((c) => c.type === upgradeType)
      isPermanent = true
    }

    if (!config) {
      return NextResponse.json(
        { error: 'Invalid upgrade type' },
        { status: 400 }
      )
    }

    // Get current level
    const existingUpgrade = user.upgrades.find((u) => u.upgradeType === upgradeType)
    const currentLevel = existingUpgrade?.level ?? 0

    // Check max level
    if (config.maxLevel && currentLevel >= config.maxLevel) {
      return NextResponse.json(
        { error: 'Upgrade already at max level' },
        { status: 400 }
      )
    }

    // Calculate cost
    const cost = getUpgradeCost(upgradeType, currentLevel, isPermanent)

    // Check currency
    const currentScrap = Number(user.gameState.scrap)
    const currentData = Number(user.gameState.dataPoints)
    const currentCoreFragments = user.gameState.coreFragments

    if (config.costCurrency === 'scrap' && currentScrap < cost) {
      return NextResponse.json(
        { error: 'Not enough scrap' },
        { status: 400 }
      )
    }

    if (config.costCurrency === 'data' && currentData < cost) {
      return NextResponse.json(
        { error: 'Not enough data' },
        { status: 400 }
      )
    }

    if (config.costCurrency === 'core_fragments' && currentCoreFragments < cost) {
      return NextResponse.json(
        { error: 'Not enough core fragments' },
        { status: 400 }
      )
    }

    // Deduct cost
    const newScrap = config.costCurrency === 'scrap' ? currentScrap - cost : currentScrap
    const newData = config.costCurrency === 'data' ? currentData - cost : currentData
    const newCoreFragments = config.costCurrency === 'core_fragments'
      ? currentCoreFragments - cost
      : currentCoreFragments

    await prisma.gameState.update({
      where: { userId: user.id },
      data: {
        scrap: BigInt(newScrap),
        dataPoints: BigInt(newData),
        coreFragments: newCoreFragments,
      },
    })

    // Update or create upgrade
    const newLevel = currentLevel + 1

    if (existingUpgrade) {
      await prisma.upgrade.update({
        where: { id: existingUpgrade.id },
        data: { level: newLevel },
      })
    } else {
      await prisma.upgrade.create({
        data: {
          userId: user.id,
          upgradeType,
          level: newLevel,
          isPermanent,
        },
      })
    }

    return NextResponse.json(convertBigIntToNumber({
      success: true,
      newLevel,
      newScrap,
      newData,
      newCoreFragments,
    }))
  } catch (error) {
    console.error('Buy upgrade error:', error)
    return NextResponse.json(
      { error: 'Failed to buy upgrade' },
      { status: 500 }
    )
  }
}
