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
  dimension?: 'NORMAL' | 'GOLD'; // New field
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

// --- DREAMING TYPES ---

export interface Dream {
  id: number;
  name: string;
  description: string;
  probability: number; // 1 in X (Base)
  stabilityDrain: number; // How much stability this dream costs
  color: string;
  glowColor: string;
  tierName: string; // "Lucid", "Nightmare", etc.
}

export interface DreamInventoryItem {
  id: number;
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

// --- CRAFTING TYPES ---

export type CraftingCategory = 'GENERAL' | 'MINING' | 'FISHING' | 'HARVESTING' | 'DREAMING';
export type CraftingType = 'BOOST' | 'MULTI'; // New field to distinguish slot type

export interface CraftingMaterial {
  type: 'ORE' | 'FISH' | 'PLANT' | 'DREAM' | 'ITEM';
  id: number | string; // ID of the resource
  count: number;
}

export interface CraftableItem {
  id: string;
  name: string;
  description: string;
  tier: number; // 1 to 15
  category: CraftingCategory;
  type: CraftingType; // New: Determines which slot it occupies
  bonuses: {
    luck?: number; // Multiplier add (e.g. 0.1 for +10%)
    speed?: number; // ms reduction
    yield?: number; // deprecated/unused for now, using multi
    multi?: number; // Additive to multi-roll

    // Dreaming Specific
    stability?: number; // Additive to base stability
    stabilityRegen?: number; // Chance to regen
  };
  recipe: {
    materials: CraftingMaterial[];
    cost: number;
  };
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

  // Crafting
  craftedItems: Record<string, boolean>; // ID -> owned status
  equippedItems: {
    // Format: "CATEGORY_TYPE": "itemId"
    // e.g. "GENERAL_BOOST": "gen_1", "GENERAL_MULTI": "gen_multi_1"
    [key: string]: string | null;
  };

  // Mining Stats & Upgrades
  totalMined: number;
  bestOreMined: number; // ID of best ore
  miningSpeedLevel: number; // New
  miningLuckLevel: number; // New
  miningMultiLevel: number; // New: How many ores mined at once
  goldDimensionUnlocked: boolean; // New: Gold Dimension Unlock

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

  // Dreaming Stats
  totalDreamt: number;
  bestDreamFound: number;

  // Gacha
  gachaCredits: number;

  // --- NEW ---
  ticTacToeWins: number;
}