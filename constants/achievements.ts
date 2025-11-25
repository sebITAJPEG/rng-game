import { Achievement, RarityId, VariantId } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'beginner',
        title: 'NOVICE',
        description: 'Roll 100 times.',
        condition: (stats) => stats.totalRolls >= 100
    },
    {
        id: 'addict',
        title: 'ADDICT',
        description: 'Roll 10,000 times.',
        condition: (stats) => stats.totalRolls >= 10000
    },
    {
        id: 'wealthy',
        title: 'WEALTHY',
        description: 'Reach a balance of 10,000.',
        condition: (stats) => stats.balance >= 10000
    },
    {
        id: 'tycoon',
        title: 'TYCOON',
        description: 'Reach a balance of 1,000,000.',
        condition: (stats) => stats.balance >= 1000000
    },
    {
        id: 'lucky',
        title: 'BLESSED',
        description: 'Find a Legendary item.',
        condition: (stats) => stats.bestRarityFound >= RarityId.LEGENDARY
    },
    {
        id: 'god',
        title: 'DIVINITY',
        description: 'Find a Divine item.',
        condition: (stats) => stats.bestRarityFound >= RarityId.DIVINE
    },
    {
        id: 'variant_hunter',
        title: 'GLITCH HUNTER',
        description: 'Find any Variant item.',
        condition: (_, inv) => inv.some(i => i.variantId !== undefined && i.variantId !== VariantId.NONE)
    },
    {
        id: 'pure_luck',
        title: 'PERFECTION',
        description: 'Find a Pure variant.',
        condition: (_, inv) => inv.some(i => i.variantId === VariantId.PURE)
    },
    {
        id: 'ascended',
        title: 'THE ONE',
        description: 'Find "The One".',
        condition: (stats) => stats.bestRarityFound === RarityId.THE_ONE
    },
    {
        id: 'miner_basic',
        title: 'PROSPECTOR',
        description: 'Mine 1,000 ores.',
        condition: (stats) => (stats.totalMined || 0) >= 1000
    },
    {
        id: 'miner_expert',
        title: 'DEEP DIVER',
        description: 'Find an ore rarer than Ruby (1 in 1,000).',
        condition: (stats) => (stats.bestOreMined || 0) >= 26
    },
    {
        id: 'fisher_basic',
        title: 'ANGLER',
        description: 'Catch 500 fish.',
        condition: (stats) => (stats.totalFished || 0) >= 500
    },
    {
        id: 'fisher_expert',
        title: 'NET RUNNER',
        description: 'Catch a Deep Web Angler or rarer.',
        condition: (stats) => (stats.bestFishCaught || 0) >= 21
    },
    {
        id: 'harvester_basic',
        title: 'GARDENER',
        description: 'Harvest 500 plants.',
        condition: (stats) => (stats.totalHarvested || 0) >= 500
    },
    {
        id: 'harvester_expert',
        title: 'BOTANIST',
        description: 'Harvest a Magical plant or rarer.',
        condition: (stats) => (stats.bestPlantHarvested || 0) >= 21
    },
    { id: 'moon_walker', title: 'MOON WALKER', description: 'Travel to the Moon.', condition: (stats) => !!stats.moonTravelUnlocked },
];
