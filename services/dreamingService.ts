import { DREAMS } from '../constants';
import { Dream } from '../types';

export const rollDream = (depth: number, luckMultiplier: number = 1): Dream => {
    const rand = Math.random();

    // Depth acts as a base multiplier for rarity.
    // The deeper you are, the more likely you are to find rare, high-stability-cost dreams.
    const effectiveLuck = luckMultiplier * (1 + (depth * 0.1));

    // Sort dreams by probability (rare to common)
    const sortedDreams = [...DREAMS].sort((a, b) => b.probability - a.probability);

    for (const dream of sortedDreams) {
        const baseThreshold = 1 / dream.probability;
        const threshold = baseThreshold * effectiveLuck;

        if (rand < threshold) {
            return dream;
        }
    }

    // Fallback to lowest tier
    return DREAMS[0];
};