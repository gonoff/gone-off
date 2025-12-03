import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserFromHeader, convertBigIntToNumber } from '@/lib/auth'
import { getWeaponUpgradeCost, getWeaponDamageAtLevel } from '@/lib/game/formulas'

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

    const body = await request.json()
    // Accept both itemId (from frontend) and inventoryId for backwards compatibility
    const inventoryId = body.inventoryId ?? body.itemId

    if (!inventoryId || typeof inventoryId !== 'number' || inventoryId <= 0) {
      return NextResponse.json(
        { error: 'Invalid inventory ID' },
        { status: 400 }
      )
    }

    // Find the inventory item
    const inventoryItem = await prisma.inventory.findFirst({
      where: {
        id: inventoryId,
        userId: user.id,
      },
      include: { item: true },
    })

    if (!inventoryItem) {
      return NextResponse.json(
        { error: 'Item not found in inventory' },
        { status: 404 }
      )
    }

    if (inventoryItem.item.type !== 'weapon') {
      return NextResponse.json(
        { error: 'Only weapons can be upgraded' },
        { status: 400 }
      )
    }

    // Calculate upgrade cost using a fixed base (not item cost, for balance)
    // Base cost is 500 scrap, scaling with weapon tier and upgrade level
    const tierMultiplier = Math.pow(2, inventoryItem.item.tier - 1) // 1x, 2x, 4x, 8x, etc.
    const baseCost = 500 * tierMultiplier
    const upgradeCost = getWeaponUpgradeCost(baseCost, inventoryItem.upgradeLevel)

    // Check currency using BigInt comparison to avoid precision loss
    const currentScrap = user.gameState.scrap
    const upgradeCostBigInt = BigInt(upgradeCost)

    if (currentScrap < upgradeCostBigInt) {
      return NextResponse.json(
        { error: 'Not enough scrap' },
        { status: 400 }
      )
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Deduct currency
      const newScrap = currentScrap - upgradeCostBigInt

      await tx.gameState.update({
        where: { userId: user.id },
        data: { scrap: newScrap },
      })

      // Upgrade the weapon
      const updatedItem = await tx.inventory.update({
        where: { id: inventoryId },
        data: { upgradeLevel: inventoryItem.upgradeLevel + 1 },
        include: { item: true },
      })

      return { newScrap, updatedItem }
    })

    // Calculate new damage for response
    const newDamage = getWeaponDamageAtLevel(
      result.updatedItem.item.damageBonus,
      result.updatedItem.upgradeLevel
    )

    const responseData = convertBigIntToNumber({
      success: true,
      newScrap: result.newScrap,
      item: {
        id: result.updatedItem.item.id,
        inventoryId: result.updatedItem.id,
        name: result.updatedItem.item.name,
        upgradeLevel: result.updatedItem.upgradeLevel,
        baseDamage: result.updatedItem.item.damageBonus,
        currentDamage: newDamage,
        nextUpgradeCost: getWeaponUpgradeCost(baseCost, result.updatedItem.upgradeLevel),
      },
    })

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Upgrade weapon error:', error)
    return NextResponse.json(
      { error: 'Failed to upgrade weapon' },
      { status: 500 }
    )
  }
}
