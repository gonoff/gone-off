import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUserFromHeader, convertBigIntToNumber } from '@/lib/auth'
import { getMachineCost, MACHINE_CONFIGS } from '@/lib/game'

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

    const { machineType, levels = 1 } = await request.json()

    // Validate machine type
    const machineConfig = MACHINE_CONFIGS[machineType as keyof typeof MACHINE_CONFIGS]
    if (!machineConfig) {
      return NextResponse.json(
        { error: 'Invalid machine type' },
        { status: 400 }
      )
    }

    // Check unlock stage
    if (user.gameState.highestStage < machineConfig.unlockStage) {
      return NextResponse.json(
        { error: 'Machine not unlocked yet' },
        { status: 400 }
      )
    }

    // Get current machine level
    const existingMachine = user.machines.find((m) => m.machineType === machineType)
    const currentLevel = existingMachine?.level ?? 0

    // Calculate cost
    const cost = getMachineCost(machineType as keyof typeof MACHINE_CONFIGS, currentLevel)

    // Check currency
    const currentScrap = Number(user.gameState.scrap)
    const currentData = Number(user.gameState.dataPoints)

    if (machineConfig.costCurrency === 'scrap' && currentScrap < cost) {
      return NextResponse.json(
        { error: 'Not enough scrap' },
        { status: 400 }
      )
    }

    if (machineConfig.costCurrency === 'data' && currentData < cost) {
      return NextResponse.json(
        { error: 'Not enough data' },
        { status: 400 }
      )
    }

    // Deduct cost
    const newScrap = machineConfig.costCurrency === 'scrap' ? currentScrap - cost : currentScrap
    const newData = machineConfig.costCurrency === 'data' ? currentData - cost : currentData

    await prisma.gameState.update({
      where: { userId: user.id },
      data: {
        scrap: BigInt(newScrap),
        dataPoints: BigInt(newData),
      },
    })

    // Update or create machine
    const newLevel = currentLevel + levels

    if (existingMachine) {
      await prisma.machine.update({
        where: { id: existingMachine.id },
        data: { level: newLevel },
      })
    } else {
      await prisma.machine.create({
        data: {
          userId: user.id,
          machineType: machineType as 'scrap_collector' | 'data_miner' | 'auto_turret' | 'efficiency_bot',
          level: newLevel,
        },
      })
    }

    return NextResponse.json(convertBigIntToNumber({
      success: true,
      newLevel,
      newScrap,
      newData,
    }))
  } catch (error) {
    console.error('Buy machine error:', error)
    return NextResponse.json(
      { error: 'Failed to buy machine' },
      { status: 500 }
    )
  }
}
