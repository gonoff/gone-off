import { PrismaClient, ItemType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clear existing items
  await prisma.item.deleteMany()

  // Seed Weapons
  const weapons = [
    {
      name: 'Rusty Pipe',
      type: ItemType.weapon,
      description: 'A corroded metal pipe. Better than nothing.',
      damageBonus: 2,
      unlockStage: 1,
      costScrap: BigInt(50),
      tier: 1,
    },
    {
      name: 'Shock Baton',
      type: ItemType.weapon,
      description: 'Salvaged security equipment. Zaps on impact.',
      damageBonus: 5,
      unlockStage: 10,
      costScrap: BigInt(500),
      tier: 2,
    },
    {
      name: 'EMP Pistol',
      type: ItemType.weapon,
      description: 'Disrupts electronic circuits. Highly effective against bots.',
      damageBonus: 15,
      unlockStage: 25,
      costScrap: BigInt(5000),
      tier: 3,
    },
    {
      name: 'Plasma Cutter',
      type: ItemType.weapon,
      description: 'Industrial tool repurposed for combat. Cuts through armor.',
      damageBonus: 40,
      unlockStage: 50,
      costScrap: BigInt(50000),
      tier: 4,
    },
    {
      name: 'Arc Rifle',
      type: ItemType.weapon,
      description: 'Fires concentrated electrical arcs. Chain damage potential.',
      damageBonus: 100,
      unlockStage: 75,
      costScrap: BigInt(250000),
      tier: 5,
    },
    {
      name: 'Quantum Disruptor',
      type: ItemType.weapon,
      description: 'Destabilizes matter at the quantum level. Experimental tech.',
      damageBonus: 300,
      unlockStage: 100,
      costScrap: BigInt(1000000),
      tier: 6,
    },
    {
      name: 'Singularity Cannon',
      type: ItemType.weapon,
      description: 'Creates micro black holes. Handle with extreme caution.',
      damageBonus: 800,
      unlockStage: 150,
      costScrap: BigInt(10000000),
      tier: 7,
    },
    {
      name: 'Reality Shredder',
      type: ItemType.weapon,
      description: 'Tears holes in the fabric of reality. THE ADMINISTRATOR fears this.',
      damageBonus: 2500,
      unlockStage: 200,
      costScrap: BigInt(100000000),
      tier: 8,
    },
  ]

  // Seed Armor
  const armor = [
    {
      name: 'Scrap Vest',
      type: ItemType.armor,
      description: 'Cobbled together from salvaged metal plates.',
      scrapBonus: 5,
      unlockStage: 5,
      costScrap: BigInt(200),
      tier: 1,
    },
    {
      name: 'Faraday Suit',
      type: ItemType.armor,
      description: 'Redirects electrical attacks. Increases critical precision.',
      critChanceBonus: 10,
      unlockStage: 20,
      costScrap: BigInt(2000),
      tier: 2,
    },
    {
      name: 'Nano-Weave',
      type: ItemType.armor,
      description: 'Self-repairing nano-fiber armor. Amplifies all damage.',
      damageBonus: 15,
      unlockStage: 40,
      costScrap: BigInt(20000),
      tier: 3,
    },
    {
      name: 'Quantum Armor',
      type: ItemType.armor,
      description: 'Exists in multiple states simultaneously. Enhanced data extraction.',
      dataBonus: 25,
      unlockStage: 80,
      costScrap: BigInt(500000),
      tier: 4,
    },
    {
      name: 'Admin Cloak',
      type: ItemType.armor,
      description: 'Stolen from a high-ranking AI. Grants administrator privileges.',
      scrapBonus: 25,
      dataBonus: 25,
      critChanceBonus: 15,
      unlockStage: 150,
      costScrap: BigInt(50000000),
      tier: 5,
    },
  ]

  // Seed Accessories
  const accessories = [
    {
      name: 'Lucky Chip',
      type: ItemType.accessory,
      description: 'A corrupted memory chip that brings good fortune.',
      critChanceBonus: 2,
      costData: BigInt(100),
      tier: 1,
    },
    {
      name: 'Overclocker',
      type: ItemType.accessory,
      description: 'Speeds up neural processing. Faster reactions.',
      damageBonus: 5,
      costData: BigInt(250),
      tier: 1,
    },
    {
      name: 'Data Siphon',
      type: ItemType.accessory,
      description: 'Extracts additional data from defeated units.',
      dataBonus: 10,
      costData: BigInt(500),
      tier: 2,
    },
    {
      name: 'Scrap Magnet',
      type: ItemType.accessory,
      description: 'Attracts loose components from destroyed bots.',
      scrapBonus: 10,
      costData: BigInt(500),
      tier: 2,
    },
  ]

  // Seed Consumables
  const consumables = [
    {
      name: 'Overclock Boost',
      type: ItemType.consumable,
      description: '2x tap damage for 30 seconds. Warning: May cause overheating.',
      effectDuration: 30,
      effectValue: 2.0,
      costData: BigInt(100),
      tier: 1,
    },
    {
      name: 'Auto-Tap Bot',
      type: ItemType.consumable,
      description: 'Deploys a small bot that auto-attacks for 5 minutes.',
      effectDuration: 300,
      effectValue: 5.0, // taps per second
      costData: BigInt(50),
      tier: 1,
    },
    {
      name: 'Data Burst',
      type: ItemType.consumable,
      description: '+100% Data drops for 2 minutes.',
      effectDuration: 120,
      effectValue: 2.0,
      costData: BigInt(200),
      tier: 2,
    },
    {
      name: 'Scrap Storm',
      type: ItemType.consumable,
      description: '+100% Scrap drops for 2 minutes.',
      effectDuration: 120,
      effectValue: 2.0,
      costScrap: BigInt(500),
      tier: 2,
    },
    {
      name: 'Lucky Strike',
      type: ItemType.consumable,
      description: '100% critical hit chance for 10 seconds.',
      effectDuration: 10,
      effectValue: 1.0, // 100% crit
      costData: BigInt(150),
      tier: 3,
    },
    {
      name: 'Jackpot Module',
      type: ItemType.consumable,
      description: '3x boss rewards for the next kill. One-time use.',
      effectDuration: 300, // 5 minute window to kill a boss
      effectValue: 3.0,
      costData: BigInt(500),
      tier: 4,
    },
  ]

  // Insert all items
  const allItems = [...weapons, ...armor, ...accessories, ...consumables]

  for (const item of allItems) {
    const itemData = item as Record<string, unknown>
    await prisma.item.create({
      data: {
        name: itemData.name as string,
        type: itemData.type as ItemType,
        description: itemData.description as string,
        damageBonus: (itemData.damageBonus as number) || 0,
        critChanceBonus: (itemData.critChanceBonus as number) || 0,
        critDamageBonus: (itemData.critDamageBonus as number) || 0,
        scrapBonus: (itemData.scrapBonus as number) || 0,
        dataBonus: (itemData.dataBonus as number) || 0,
        unlockStage: (itemData.unlockStage as number) || 1,
        costScrap: (itemData.costScrap as bigint) || BigInt(0),
        costData: (itemData.costData as bigint) || BigInt(0),
        effectDuration: (itemData.effectDuration as number) || 0,
        effectValue: (itemData.effectValue as number) || 0,
        tier: itemData.tier as number,
      },
    })
    console.log(`Created item: ${itemData.name}`)
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
