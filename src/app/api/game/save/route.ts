import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserFromHeader } from '@/lib/auth'

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

    // Update game state
    await prisma.gameState.update({
      where: { userId: user.id },
      data: {
        currentStage: gameState.currentStage,
        highestStage: Math.max(user.gameState.highestStage, gameState.currentStage),
        scrap: BigInt(gameState.scrap),
        dataPoints: BigInt(gameState.dataPoints),
        coreFragments: gameState.coreFragments,
        currentBossHp: BigInt(gameState.currentBossHp),
        currentBossMaxHp: BigInt(gameState.currentBossMaxHp),
        totalTaps: BigInt(gameState.totalTaps || 0),
        totalDamageDealt: BigInt(gameState.totalDamageDealt || 0),
        lastSave: new Date(),
        lastOfflineClaim: new Date(),
      },
    })

    // Update user last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() },
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
