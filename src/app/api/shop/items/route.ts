import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserFromHeader, convertBigIntToNumber } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const user = await getSessionUserFromHeader(authHeader)

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const items = await prisma.item.findMany({
      orderBy: [{ type: 'asc' }, { tier: 'asc' }],
    })

    // Get user's current stage to check unlock requirements
    const currentStage = user.gameState?.highestStage ?? 1

    // Get user's inventory to check owned items
    const ownedItemIds = new Set(user.inventory.map((inv) => inv.itemId))

    const mapItem = (item: typeof items[0]) => ({
      ...(convertBigIntToNumber(item) as Record<string, unknown>),
      owned: ownedItemIds.has(item.id),
      locked: item.unlockStage > currentStage,
    })

    const categorizedItems = {
      weapons: items.filter((i) => i.type === 'weapon').map(mapItem),
      armor: items.filter((i) => i.type === 'armor').map(mapItem),
      accessories: items.filter((i) => i.type === 'accessory').map(mapItem),
      consumables: items.filter((i) => i.type === 'consumable').map((item) => ({
        ...(convertBigIntToNumber(item) as Record<string, unknown>),
        owned: ownedItemIds.has(item.id),
        locked: false,
      })),
    }

    return NextResponse.json(categorizedItems)
  } catch (error) {
    console.error('Get items error:', error)
    return NextResponse.json(
      { error: 'Failed to get items' },
      { status: 500 }
    )
  }
}
