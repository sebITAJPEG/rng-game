import { ORES, GOLD_ORES } from '../constants';
import { Ore } from '../types';

export const mineOre = (luckMultiplier: number = 1, dimension: 'NORMAL' | 'GOLD' = 'NORMAL'): Ore => {
  const rand = Math.random();
  
  // Select the correct ore list based on dimension
  const sourceOres = dimension === 'GOLD' ? GOLD_ORES : ORES;

  // Sort ores by probability (rare to common) to check rarest first
  const sortedOres = [...sourceOres].sort((a, b) => b.probability - a.probability);

  for (const ore of sortedOres) {
    const baseThreshold = 1 / ore.probability;
    const threshold = baseThreshold * luckMultiplier;
    
    if (rand < threshold) {
      return ore;
    }
  }

  // Fallback to lowest tier of the current dimension
  return sortedOres[sortedOres.length - 1];
};