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

export type Language = 'en' | 'it';

export interface RarityTier {
  id: RarityId;
  name: string; // Fallback/Internal name
  probability: number; // 1 in X
  color: string;
  textColor: string;
  shadowColor: string;
  animate?: boolean;
}

export interface ItemData {
  text: string;
  description: string;
}

export interface Drop {
  text: string;
  description: string;
  rarityId: RarityId;
  timestamp: number;
  rollNumber: number;
}

export interface InventoryItem {
  text: string;
  description: string;
  rarityId: RarityId;
  count: number;
  discoveredAt: number;
}

export interface GameStats {
  totalRolls: number;
  balance: number; // Spendable rolls
  startTime: number;
  bestRarityFound: RarityId;
  multiRollLevel: number; // 1 = single, 2 = double, 3 = triple
}