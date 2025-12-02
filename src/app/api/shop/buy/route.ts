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

    // Calculate cost
    const scrapCost = Number(item.costScrap) * quantity
    const dataCost = Number(item.costData) * quantity

    // Check if user has enough currency
    const currentScrap = Number(user.gameState.scrap)
    const currentData = Number(user.gameState.dataPoints)

    if (currentScrap < scrapCost || currentData < dataCost) {
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

    // Deduct currency and add to inventory
    const newScrap = currentScrap - scrapCost
    const newData = currentData - dataCost

    await prisma.gameState.update({
      where: { userId: user.id },
      data: {
        scrap: BigInt(newScrap),
        dataPoints: BigInt(newData),
      },
    })

    if (existingInventory) {
      // Increase quantity for consumables
      await prisma.inventory.update({
        where: { id: existingInventory.id },
        data: { quantity: existingInventory.quantity + quantity },
      })
    } else {
      // Create new inventory entry
      await prisma.inventory.create({
        data: {
          userId: user.id,
          itemId: item.id,
          quantity,
          upgradeLevel: 0,
          isEquipped: false,
        },
      })
    }

    // Return updated item info
    const responseData = convertBigIntToNumber({
      success: true,
      newScrap,
      newData,
      item: {
        id: item.id,
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
        quantity: existingInventory ? existingInventory.quantity + quantity : quantity,
        upgradeLevel: 0,
        isEquipped: false,
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
