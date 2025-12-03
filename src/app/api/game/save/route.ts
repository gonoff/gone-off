import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserFromHeader } from '@/lib/auth'

// Validate game state values to prevent cheating/corruption
function validateGameState(gs: Record<string, unknown>): boolean {
  // Check required fields exist
  if (typeof gs.currentStage !== 'number' || gs.currentStage < 1) return false
  if (typeof gs.scrap !== 'number' || gs.scrap < 0) return false
  if (typeof gs.dataPoints !== 'number' || gs.dataPoints < 0) return false
  if (typeof gs.coreFragments !== 'number' || gs.coreFragments < 0) return false
  if (typeof gs.currentBossHp !== 'number' || gs.currentBossHp < 0) return false
  if (typeof gs.currentBossMaxHp !== 'number' || gs.currentBossMaxHp <= 0) return false

  // Boss HP should not exceed max HP
  if (gs.currentBossHp > gs.currentBossMaxHp) return false

  return true
}

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

    const { gameState } = await request.json()

    // Validate game state
    if (!gameState || !validateGameState(gameState)) {
      return NextResponse.json(
        { error: 'Invalid game state' },
        { status: 400 }
      )
    }

    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Update game state
      await tx.gameState.update({
        where: { userId: user.id },
        data: {
          currentStage: gameState.currentStage,
          highestStage: Math.max(user.gameState!.highestStage, gameState.currentStage),
          scrap: BigInt(Math.floor(gameState.scrap)),
          dataPoints: BigInt(Math.floor(gameState.dataPoints)),
          coreFragments: Math.floor(gameState.coreFragments),
          currentBossHp: BigInt(Math.floor(gameState.currentBossHp)),
          currentBossMaxHp: BigInt(Math.floor(gameState.currentBossMaxHp)),
          totalTaps: BigInt(gameState.totalTaps || 0),
          totalDamageDealt: BigInt(gameState.totalDamageDealt || 0),
          equippedWeaponId: gameState.equippedWeaponId ?? null,
          equippedArmorId: gameState.equippedArmorId ?? null,
          lastSave: new Date(),
        },
      })

      // Update user last active
      await tx.user.update({
        where: { id: user.id },
        data: { lastActive: new Date() },
      })
    })

    return NextResponse.json({
      success: true,
      savedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Save error:', error)
    return NextResponse.json(
      { error: 'Failed to save game' },
      { status: 500 }
    )
  }
}
