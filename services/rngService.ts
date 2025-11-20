import { PHRASES, RARITY_TIERS } from '../constants';
import { Drop, RarityId, Language } from '../types';

export const generateDrop = (totalRolls: number, luckMultiplier: number = 1, language: Language = 'en'): Drop => {
  const rand = Math.random();
  
  // Iterate from highest rarity to lowest
  // This ensures that if a 1/1T chance occurs, it is caught before the 1/5 chance
  const tiers = Object.values(RARITY_TIERS).sort((a, b) => b.id - a.id);

  let selectedTier = RARITY_TIERS[RarityId.COMMON];

  for (const tier of tiers) {
    // Calculate threshold: (1 / probability) * luck
    // Example: Rare is 1/100 = 0.01. With 2x luck, threshold becomes 0.02 (1/50).
    const baseThreshold = 1 / tier.probability;
    const threshold = baseThreshold * luckMultiplier;
    
    if (rand < threshold) {
      selectedTier = tier;
      break;
    }
  }

  const potentialItems = PHRASES[language][selectedTier.id];
  const item = potentialItems[Math.floor(Math.random() * potentialItems.length)];

  return {
    text: item.text,
    description: item.description,
    rarityId: selectedTier.id,
    timestamp: Date.now(),
    rollNumber: totalRolls + 1
  };
};