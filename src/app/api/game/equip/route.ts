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

    const body = await request.json()
    // Accept both itemId (from frontend) and inventoryId for backwards compatibility
    const inventoryId = body.inventoryId ?? body.itemId
    const unequip = body.unequip

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

    const itemType = inventoryItem.item.type

    // Only weapons, armor, and accessories can be equipped
    if (itemType !== 'weapon' && itemType !== 'armor' && itemType !== 'accessory') {
      return NextResponse.json(
        { error: 'This item type cannot be equipped' },
        { status: 400 }
      )
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Unequip previously equipped item of same type
      await tx.inventory.updateMany({
        where: {
          userId: user.id,
          isEquipped: true,
          item: { type: itemType },
        },
        data: { isEquipped: false },
      })

      let updatedItem = inventoryItem
      let gameStateUpdate: Record<string, unknown> = {}

      if (unequip) {
        // Just unequip - set the slot to null
        if (itemType === 'weapon') {
          gameStateUpdate = { equippedWeaponId: null }
        } else if (itemType === 'armor') {
          gameStateUpdate = { equippedArmorId: null }
        } else {
          gameStateUpdate = { equippedAccessoryId: null }
        }
      } else {
        // Equip the new item
        updatedItem = await tx.inventory.update({
          where: { id: inventoryId },
          data: { isEquipped: true },
          include: { item: true },
        })

        if (itemType === 'weapon') {
          gameStateUpdate = { equippedWeaponId: inventoryItem.item.id }
        } else if (itemType === 'armor') {
          gameStateUpdate = { equippedArmorId: inventoryItem.item.id }
        } else {
          gameStateUpdate = { equippedAccessoryId: inventoryItem.item.id }
        }
      }

      // Update game state with equipped item ID
      const updatedGameState = await tx.gameState.update({
        where: { userId: user.id },
        data: gameStateUpdate,
      })

      return { updatedItem, updatedGameState }
    })

    const responseData = convertBigIntToNumber({
      success: true,
      item: {
        id: result.updatedItem.item.id,
        inventoryId: result.updatedItem.id,
        name: result.updatedItem.item.name,
        type: result.updatedItem.item.type,
        isEquipped: !unequip,
        damageBonus: result.updatedItem.item.damageBonus,
        upgradeLevel: result.updatedItem.upgradeLevel,
      },
      equippedWeaponId: result.updatedGameState.equippedWeaponId,
      equippedArmorId: result.updatedGameState.equippedArmorId,
      equippedAccessoryId: result.updatedGameState.equippedAccessoryId,
    })

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Equip error:', error)
    return NextResponse.json(
      { error: 'Failed to equip item' },
      { status: 500 }
    )
  }
}
