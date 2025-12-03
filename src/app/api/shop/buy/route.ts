import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserFromHeader, convertBigIntToNumber } from '@/lib/auth'

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

    const { itemId, quantity = 1 } = await request.json()

    // Get item
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Check unlock requirement
    if (item.unlockStage > user.gameState.highestStage) {
      return NextResponse.json(
        { error: 'Item not unlocked yet' },
        { status: 400 }
      )
    }

    // Input validation
    if (quantity <= 0 || !Number.isInteger(quantity)) {
      return NextResponse.json(
        { error: 'Invalid quantity' },
        { status: 400 }
      )
    }

    // Calculate cost using BigInt to avoid precision loss
    const scrapCostBigInt = item.costScrap * BigInt(quantity)
    const dataCostBigInt = item.costData * BigInt(quantity)

    // Check if user has enough currency using BigInt comparison
    const currentScrap = user.gameState.scrap
    const currentData = user.gameState.dataPoints

    if (currentScrap < scrapCostBigInt || currentData < dataCostBigInt) {
      return NextResponse.json(
        { error: 'Not enough currency' },
        { status: 400 }
      )
    }

    // Check if user already owns (for non-consumables)
    const existingInventory = user.inventory.find((inv) => inv.itemId === itemId)

    if (existingInventory && item.type !== 'consumable') {
      return NextResponse.json(
        { error: 'Item already owned' },
        { status: 400 }
      )
    }

    // Calculate new currency values
    const newScrap = currentScrap - scrapCostBigInt
    const newData = currentData - dataCostBigInt

    // Use transaction to ensure atomicity
    const inventoryRecord = await prisma.$transaction(async (tx) => {
      await tx.gameState.update({
        where: { userId: user.id },
        data: {
          scrap: newScrap,
          dataPoints: newData,
        },
      })

      if (existingInventory) {
        // Increase quantity for consumables
        return await tx.inventory.update({
          where: { id: existingInventory.id },
          data: { quantity: existingInventory.quantity + quantity },
        })
      } else {
        // Create new inventory entry
        return await tx.inventory.create({
          data: {
            userId: user.id,
            itemId: item.id,
            quantity,
            upgradeLevel: 0,
            isEquipped: false,
          },
        })
      }
    })

    // Return updated item info
    const responseData = convertBigIntToNumber({
      success: true,
      newScrap: newScrap,
      newData: newData,
      item: {
        id: item.id,
        inventoryId: inventoryRecord.id, // The Inventory row's primary key for equip/upgrade
        name: item.name,
        type: item.type,
        description: item.description,
        damageBonus: item.damageBonus,
        critChanceBonus: item.critChanceBonus,
        critDamageBonus: item.critDamageBonus,
        scrapBonus: item.scrapBonus,
        dataBonus: item.dataBonus,
        unlockStage: item.unlockStage,
        costScrap: item.costScrap,
        costData: item.costData,
        effectDuration: item.effectDuration,
        effectValue: item.effectValue,
        tier: item.tier,
        quantity: inventoryRecord.quantity,
        upgradeLevel: inventoryRecord.upgradeLevel,
        isEquipped: inventoryRecord.isEquipped,
      },
    })

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Buy error:', error)
    return NextResponse.json(
      { error: 'Failed to purchase item' },
      { status: 500 }
    )
  }
}
