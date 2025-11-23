
export enum RarityId {
  COMMON = 1,
  UNCOMMON,
  RARE,
  EPIC,
  LEGENDARY,
  MYTHICAL,
  DIVINE,
  OTHERWORLDLY,
  COSMIC,
  EXTREME,
  ABYSSAL,
  PRIMORDIAL,
  INFINITE,
  CHAOS,
  THE_ONE
}

export enum VariantId {
  NONE = 0,
  GILDED,      // x2
  HOLOGRAPHIC, // x5
  RADIOACTIVE, // x10
  VOLCANIC,    // x25
  GLACIAL,     // x50
  ABYSSAL,     // x100
  CELESTIAL,   // x250
  QUANTUM,     // x500
  NEGATIVE,    // x1000
  PURE         // x10000
}

export type Language = 'en';

export interface RarityTier {
  id: RarityId;
  name: string;
  probability: number;
  color: string;
  textColor: string;
  shadowColor: string;
  animate?: boolean;
}

export interface VariantTier {
  id: VariantId;
  name: string;
  prefix: string;
  multiplier: number; // Multiplies base rarity probability
  styleClass: string; // Tailwind classes for text effects
  borderClass: string; // For visualizer borders
}

export interface ItemData {
  text: string;
  description: string;
  cutscenePhrase?: string;
}

export interface Drop {
  text: string;
  description: string;
  cutscenePhrase?: string;
  rarityId: RarityId;
  variantId?: VariantId; // New optional field
  timestamp: number;
  rollNumber: number;
}

export interface InventoryItem {
  text: string;
  description: string;
  rarityId: RarityId;
  variantId?: VariantId;
  count: number;
  discoveredAt: number;
  locked?: boolean;
}

// --- MINING TYPES ---

export interface Ore {
  id: number;
  name: string;
  description: string;
  probability: number; // 1 in X
  color: string; // Text color class
  glowColor: string; // CSS color for shadows
  tierName: string;
}

export interface OreInventoryItem {
  id: number; // Reference to Ore ID
  count: number;
  discoveredAt: number;
  locked?: boolean;
}

// --- FISHING TYPES ---

export interface Fish {
  id: number;
  name: string;
  description: string;
  probability: number; // 1 in X
  color: string;
  glowColor: string;
  tierName: string;
}

export interface FishInventoryItem {
  id: number; // Reference to Fish ID
  count: number;
  discoveredAt: number;
  locked?: boolean;
}

// --- HARVESTING TYPES ---

export interface Plant {
  id: number;
  name: string;
  description: string;
  probability: number; // 1 in X
  color: string;
  glowColor: string;
  tierName: string;
}

export interface PlantInventoryItem {
  id: number; // Reference to Plant ID
  count: number;
  discoveredAt: number;
  locked?: boolean;
}

export interface Achievement {
  id: string;
  title: string; // The reward title
  description: string;
  condition: (stats: GameStats, inventory: InventoryItem[]) => boolean;
}

export interface SignalBuff {
  multiplier: number;
  endTime: number;
  id: number; // Unique ID to trigger updates/effects
}

export interface GameStats {
  totalRolls: number;
  balance: number;
  startTime: number;
  bestRarityFound: RarityId;

  // Main Upgrades
  multiRollLevel: number; // 1 to 10 (or higher via Admin)
  speedLevel: number; // Index for SPEED_TIERS
  luckLevel: number; // New: Global Luck Multiplier Level

  entropy: number; // Pity counter
  hasBurst: boolean; // Unlock status
  unlockedAchievements: string[]; // Array of achievement IDs
  equippedTitle: string | null;

  // Mining Stats & Upgrades
  totalMined: number;
  bestOreMined: number; // ID of best ore
  miningSpeedLevel: number; // New
  miningLuckLevel: number; // New
  miningMultiLevel: number; // New: How many ores mined at once

  // Fishing Stats & Upgrades
  totalFished: number;
  bestFishCaught: number;
  fishingSpeedLevel: number;
  fishingLuckLevel: number;
  fishingMultiLevel: number;

  // Harvesting Stats & Upgrades
  totalHarvested: number;
  bestPlantHarvested: number;
  harvestingSpeedLevel: number;
  harvestingLuckLevel: number;
  harvestingMultiLevel: number;

  // Gacha
  gachaCredits: number;

  // Signal Interceptor
  signalBuff: SignalBuff | null;
}

// --- CRAFTING TYPES ---

export type CraftingCategory = 'GENERAL' | 'MINING' | 'FISHING' | 'HARVESTING';

export interface CraftingMaterial {
  type: 'ORE' | 'FISH' | 'PLANT' | 'ITEM';
  id: number | string; // ID of the resource or item
  count: number;
}

export interface CraftingRecipe {
  materials: CraftingMaterial[];
  cost: number;
}

export interface CraftableItem {
  id: string;
  name: string;
  description: string;
  tier: RarityId;
  category: CraftingCategory;
  bonuses: {
    luck?: number; // Flat luck bonus
    speed?: number; // Percentage speed reduction (0.1 = 10%)
    yield?: number; // Extra resource chance
    multi?: number; // Multi-roll/mine/fish bonus
  };
  recipe: CraftingRecipe;
}

export type CraftedItemsState = Record<string, boolean>; // ItemID -> Owned
