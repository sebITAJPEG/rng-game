import { GameStats } from '../types';
import { CRAFTABLE_ITEMS } from '../craftingData';
import { ORES, FISH, PLANTS } from '../constants';

export const getCraftingBonuses = (equippedItems: GameStats['equippedItems'], category: string) => {
    let bonusSpeed = 0;
    let bonusLuck = 0;
    let bonusMulti = 0;
    let bonusStability = 0;
    let bonusStabilityRegen = 0;

    const boostId = equippedItems?.[`${category}_BOOST`];
    const multiId = equippedItems?.[`${category}_MULTI`];
    const idsToCheck = [boostId, multiId].filter(id => id) as string[];

    idsToCheck.forEach(id => {
        const item = CRAFTABLE_ITEMS.find(i => i.id === id);
        if (item) {
            if (item.bonuses.speed) bonusSpeed += item.bonuses.speed;
            if (item.bonuses.luck) bonusLuck += item.bonuses.luck;
            if (item.bonuses.multi) bonusMulti += item.bonuses.multi;
            if (item.bonuses.stability) bonusStability += item.bonuses.stability;
            if (item.bonuses.stabilityRegen) bonusStabilityRegen += item.bonuses.stabilityRegen;
        }
    });
    return { bonusSpeed, bonusLuck, bonusMulti, bonusStability, bonusStabilityRegen };
};

export const getEquippedItemName = (equippedItems: GameStats['equippedItems'], category: string, type: 'BOOST' | 'MULTI') => {
    const id = equippedItems?.[`${category}_${type}`];
    if (!id) return "None";
    const item = CRAFTABLE_ITEMS.find(i => i.id === id);
    return item ? item.name : "None";
};

export const getBestResourceName = (type: 'ORE' | 'FISH' | 'PLANT', id: number) => {
    if (id === 0) return "None";
    if (type === 'ORE') return ORES.find(o => o.id === id)?.name || `Ore #${id}`;
    if (type === 'FISH') return FISH.find(f => f.id === id)?.name || `Fish #${id}`;
    if (type === 'PLANT') return PLANTS.find(p => p.id === id)?.name || `Plant #${id}`;
    return "None";
};

export const getTrophyMultiplier = (wins: number) => {
    if (wins >= 500) return 3.00;
    if (wins >= 300) return 2.75;
    if (wins >= 200) return 2.50;
    if (wins >= 100) return 2.25;
    if (wins >= 50) return 2.00;
    if (wins >= 30) return 1.75;
    if (wins >= 15) return 1.50;
    if (wins >= 5) return 1.25;
    return 1.0;
};