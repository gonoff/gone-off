import { NextRequest, NextResponse } from 'next/server'
import { getSessionUserFromHeader, convertBigIntToNumber } from '@/lib/auth'
import { calculateOfflineEarnings } from '@/lib/game/formulas'

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

    // Calculate offline earnings
    let offlineEarnings = null
    if (user.gameState && user.machines.length > 0) {
      const lastOnline = user.gameState.lastOfflineClaim

      // Convert machines to the expected format
      const machines = user.machines.map((m) => ({
        id: m.id,
        machineType: m.machineType as 'scrap_collector' | 'data_miner' | 'auto_turret' | 'efficiency_bot',
        level: m.level,
        lastCollected: m.lastCollected,
      }))

      // Convert upgrades to the expected format
      const upgrades = user.upgrades.map((u) => ({
        id: u.id,
        upgradeType: u.upgradeType,
        level: u.level,
        isPermanent: u.isPermanent,
      }))

      const earnings = calculateOfflineEarnings(
        lastOnline,
        machines,
        upgrades,
        user.gameState.offlineCapLevel
      )

      if (earnings.scrap > 0 || earnings.data > 0 || earnings.dps > 0) {
        offlineEarnings = earnings
      }
    }

    const responseData = convertBigIntToNumber({
      user: {
        id: user.id,
        username: user.username,
      },
      gameState: user.gameState
        ? {
            currentStage: user.gameState.currentStage,
            highestStage: user.gameState.highestStage,
            scrap: user.gameState.scrap,
            dataPoints: user.gameState.dataPoints,
            coreFragments: user.gameState.coreFragments,
            offlineCapLevel: user.gameState.offlineCapLevel,
            currentBossHp: user.gameState.currentBossHp,
            currentBossMaxHp: user.gameState.currentBossMaxHp,
            totalTaps: user.gameState.totalTaps,
            totalDamageDealt: user.gameState.totalDamageDealt,
            equippedWeaponId: user.gameState.equippedWeaponId,
            equippedArmorId: user.gameState.equippedArmorId,
          }
        : null,
      inventory: user.inventory.map((inv) => ({
        id: inv.item.id,
        inventoryId: inv.id, // The Inventory row's primary key for equip/upgrade
        name: inv.item.name,
        type: inv.item.type,
        description: inv.item.description,
        damageBonus: inv.item.damageBonus,
        critChanceBonus: Number(inv.item.critChanceBonus),
        critDamageBonus: Number(inv.item.critDamageBonus),
        scrapBonus: Number(inv.item.scrapBonus),
        dataBonus: Number(inv.item.dataBonus),
        unlockStage: inv.item.unlockStage,
        costScrap: inv.item.costScrap,
        costData: inv.item.costData,
        effectDuration: inv.item.effectDuration,
        effectValue: Number(inv.item.effectValue),
        tier: inv.item.tier,
        quantity: inv.quantity,
        upgradeLevel: inv.upgradeLevel,
        isEquipped: inv.isEquipped,
      })),
      machines: user.machines.map((m) => ({
        id: m.id,
        machineType: m.machineType,
        level: m.level,
        lastCollected: m.lastCollected,
      })),
      upgrades: user.upgrades.map((u) => ({
        id: u.id,
        upgradeType: u.upgradeType,
        level: u.level,
        isPermanent: u.isPermanent,
      })),
      prestigeStats: user.prestigeStats
        ? {
            totalPrestiges: user.prestigeStats.totalPrestiges,
            lifetimeScrap: user.prestigeStats.lifetimeScrap,
            lifetimeData: user.prestigeStats.lifetimeData,
            lifetimeCoreFragments: user.prestigeStats.lifetimeCoreFragments,
            lifetimeBossesKilled: user.prestigeStats.lifetimeBossesKilled,
            lifetimeTaps: user.prestigeStats.lifetimeTaps,
            fastestStage100: user.prestigeStats.fastestStage100,
            highestDamageHit: user.prestigeStats.highestDamageHit,
          }
        : null,
      achievements: user.achievements.map((a) => ({
        key: a.achievementKey,
        unlockedAt: a.unlockedAt,
      })),
      offlineEarnings,
    })

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Get state error:', error)
    return NextResponse.json(
      { error: 'Failed to get game state' },
      { status: 500 }
    )
  }
}
