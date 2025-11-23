import { CraftableItem, RarityId } from './types';

export const CRAFTABLE_ITEMS: CraftableItem[] = [
    // --- GENERAL ITEMS (Luck & Multi-Roll) ---
    {
        id: 'gen_1', name: "Lucky Charm", description: "A simple charm to boost your luck.", tier: RarityId.COMMON, category: 'GENERAL',
        bonuses: { luck: 1 },
        recipe: { materials: [{ type: 'ITEM', id: 'A rusty spoon.', count: 1 }], cost: 100 }
    },
    {
        id: 'gen_2', name: "Fate Coin", description: "Slightly bends probability.", tier: RarityId.UNCOMMON, category: 'GENERAL',
        bonuses: { luck: 2 },
        recipe: { materials: [{ type: 'ITEM', id: 'A lucky penny.', count: 5 }], cost: 500 }
    },
    {
        id: 'gen_3', name: "Chance Die", description: "Rolls in your favor.", tier: RarityId.RARE, category: 'GENERAL',
        bonuses: { luck: 5 },
        recipe: { materials: [{ type: 'ITEM', id: 'Dice set', count: 3 }], cost: 2500 }
    },
    {
        id: 'gen_4', name: "Fortune Prism", description: "Refracts bad luck away.", tier: RarityId.EPIC, category: 'GENERAL',
        bonuses: { luck: 10 },
        recipe: { materials: [{ type: 'ITEM', id: 'Crystal Shrub', count: 1 }], cost: 10000 }
    },
    {
        id: 'gen_5', name: "Destiny Gear", description: "Mechanical fate.", tier: RarityId.LEGENDARY, category: 'GENERAL',
        bonuses: { luck: 25, multi: 1 },
        recipe: { materials: [{ type: 'ITEM', id: 'Time capsule.', count: 1 }], cost: 50000 }
    },
    {
        id: 'gen_6', name: "Mythic Compass", description: "Points to treasure.", tier: RarityId.MYTHICAL, category: 'GENERAL',
        bonuses: { luck: 50 },
        recipe: { materials: [{ type: 'ITEM', id: 'Compass', count: 10 }], cost: 250000 }
    },
    {
        id: 'gen_7', name: "Divine Halo", description: "Blessed by RNG.", tier: RarityId.DIVINE, category: 'GENERAL',
        bonuses: { luck: 100, multi: 1 },
        recipe: { materials: [{ type: 'ITEM', id: 'Halo.', count: 1 }], cost: 1000000 }
    },
    {
        id: 'gen_8', name: "Void Anchor", description: "Stabilizes reality.", tier: RarityId.OTHERWORLDLY, category: 'GENERAL',
        bonuses: { luck: 250 },
        recipe: { materials: [{ type: 'ITEM', id: 'Void Essence', count: 5 }], cost: 5000000 }
    },
    {
        id: 'gen_9', name: "Cosmic Lens", description: "Focuses starlight.", tier: RarityId.COSMIC, category: 'GENERAL',
        bonuses: { luck: 500, multi: 2 },
        recipe: { materials: [{ type: 'ITEM', id: 'Star Dust', count: 10 }], cost: 25000000 }
    },
    {
        id: 'gen_10', name: "Extreme Processor", description: "Calculates all outcomes.", tier: RarityId.EXTREME, category: 'GENERAL',
        bonuses: { luck: 1000 },
        recipe: { materials: [{ type: 'ITEM', id: 'Developer Console.', count: 1 }], cost: 100000000 }
    },
    {
        id: 'gen_11', name: "Abyssal Core", description: "Dark luck.", tier: RarityId.ABYSSAL, category: 'GENERAL',
        bonuses: { luck: 2500, multi: 3 },
        recipe: { materials: [{ type: 'ITEM', id: 'Abyssal Pearl', count: 5 }], cost: 500000000 }
    },
    {
        id: 'gen_12', name: "Primordial Spark", description: "Origin of luck.", tier: RarityId.PRIMORDIAL, category: 'GENERAL',
        bonuses: { luck: 5000 },
        recipe: { materials: [{ type: 'ITEM', id: 'Creation Spark', count: 1 }], cost: 2500000000 }
    },
    {
        id: 'gen_13', name: "Infinite Loop", description: "Luck never ends.", tier: RarityId.INFINITE, category: 'GENERAL',
        bonuses: { luck: 10000, multi: 5 },
        recipe: { materials: [{ type: 'ITEM', id: 'Infinity Symbol.', count: 1 }], cost: 10000000000 }
    },
    {
        id: 'gen_14', name: "Chaos Engine", description: "Unpredictable power.", tier: RarityId.CHAOS, category: 'GENERAL',
        bonuses: { luck: 25000 },
        recipe: { materials: [{ type: 'ITEM', id: 'Entropy Orb', count: 5 }], cost: 50000000000 }
    },
    {
        id: 'gen_15', name: "The One Chip", description: "Admin privileges.", tier: RarityId.THE_ONE, category: 'GENERAL',
        bonuses: { luck: 100000, multi: 10 },
        recipe: { materials: [{ type: 'ITEM', id: 'The Answer.', count: 1 }], cost: 100000000000 }
    },

    // --- MINING ITEMS (Mining Speed & Yield) ---
    {
        id: 'mine_1', name: "Stone Pick", description: "Better than hands.", tier: RarityId.COMMON, category: 'MINING',
        bonuses: { speed: 0.05 },
        recipe: { materials: [{ type: 'ORE', id: 1, count: 10 }], cost: 100 }
    },
    {
        id: 'mine_2', name: "Iron Drill", description: "Spinning metal.", tier: RarityId.UNCOMMON, category: 'MINING',
        bonuses: { speed: 0.10 },
        recipe: { materials: [{ type: 'ORE', id: 4, count: 10 }], cost: 500 }
    },
    {
        id: 'mine_3', name: "Steel Bore", description: "Pierces rock.", tier: RarityId.RARE, category: 'MINING',
        bonuses: { speed: 0.15, yield: 1 },
        recipe: { materials: [{ type: 'ORE', id: 7, count: 10 }], cost: 2500 }
    },
    {
        id: 'mine_4', name: "Diamond Cutter", description: "Hardest edge.", tier: RarityId.EPIC, category: 'MINING',
        bonuses: { speed: 0.20 },
        recipe: { materials: [{ type: 'ORE', id: 10, count: 5 }], cost: 10000 }
    },
    {
        id: 'mine_5', name: "Laser Drill", description: "Melts rock.", tier: RarityId.LEGENDARY, category: 'MINING',
        bonuses: { speed: 0.25, yield: 2 },
        recipe: { materials: [{ type: 'ORE', id: 13, count: 5 }], cost: 50000 }
    },
    {
        id: 'mine_6', name: "Plasma Pick", description: "Hot to the touch.", tier: RarityId.MYTHICAL, category: 'MINING',
        bonuses: { speed: 0.30 },
        recipe: { materials: [{ type: 'ORE', id: 16, count: 5 }], cost: 250000 }
    },
    {
        id: 'mine_7', name: "Divine Excavator", description: "Holy mining.", tier: RarityId.DIVINE, category: 'MINING',
        bonuses: { speed: 0.35, yield: 3 },
        recipe: { materials: [{ type: 'ORE', id: 19, count: 3 }], cost: 1000000 }
    },
    {
        id: 'mine_8', name: "Void Miner", description: "Mines nothingness.", tier: RarityId.OTHERWORLDLY, category: 'MINING',
        bonuses: { speed: 0.40 },
        recipe: { materials: [{ type: 'ORE', id: 22, count: 3 }], cost: 5000000 }
    },
    {
        id: 'mine_9', name: "Cosmic Dredge", description: "Scoops stars.", tier: RarityId.COSMIC, category: 'MINING',
        bonuses: { speed: 0.45, yield: 4 },
        recipe: { materials: [{ type: 'ORE', id: 25, count: 3 }], cost: 25000000 }
    },
    {
        id: 'mine_10', name: "Extreme Drill", description: "Goes to 11.", tier: RarityId.EXTREME, category: 'MINING',
        bonuses: { speed: 0.50 },
        recipe: { materials: [{ type: 'ORE', id: 28, count: 2 }], cost: 100000000 }
    },
    {
        id: 'mine_11', name: "Abyssal Pick", description: "Dark matter tip.", tier: RarityId.ABYSSAL, category: 'MINING',
        bonuses: { speed: 0.55, yield: 5 },
        recipe: { materials: [{ type: 'ORE', id: 31, count: 2 }], cost: 500000000 }
    },
    {
        id: 'mine_12', name: "Primordial Shovel", description: "Digs history.", tier: RarityId.PRIMORDIAL, category: 'MINING',
        bonuses: { speed: 0.60 },
        recipe: { materials: [{ type: 'ORE', id: 34, count: 2 }], cost: 2500000000 }
    },
    {
        id: 'mine_13', name: "Infinite Bore", description: "Never stops.", tier: RarityId.INFINITE, category: 'MINING',
        bonuses: { speed: 0.65, yield: 6 },
        recipe: { materials: [{ type: 'ORE', id: 37, count: 1 }], cost: 10000000000 }
    },
    {
        id: 'mine_14', name: "Chaos Crusher", description: "Breaks reality.", tier: RarityId.CHAOS, category: 'MINING',
        bonuses: { speed: 0.70 },
        recipe: { materials: [{ type: 'ORE', id: 40, count: 1 }], cost: 50000000000 }
    },
    {
        id: 'mine_15', name: "The One Pick", description: "Mines code.", tier: RarityId.THE_ONE, category: 'MINING',
        bonuses: { speed: 0.80, yield: 10 },
        recipe: { materials: [{ type: 'ORE', id: 43, count: 1 }], cost: 100000000000 }
    },

    // --- FISHING ITEMS (Fishing Speed & Multi-Catch) ---
    {
        id: 'fish_1', name: "Worn Rod", description: "Barely holds together.", tier: RarityId.COMMON, category: 'FISHING',
        bonuses: { speed: 0.05 },
        recipe: { materials: [{ type: 'FISH', id: 1, count: 10 }], cost: 100 }
    },
    {
        id: 'fish_2', name: "Fiberglass Rod", description: "Flexible.", tier: RarityId.UNCOMMON, category: 'FISHING',
        bonuses: { speed: 0.10 },
        recipe: { materials: [{ type: 'FISH', id: 4, count: 10 }], cost: 500 }
    },
    {
        id: 'fish_3', name: "Carbon Reel", description: "Smooth action.", tier: RarityId.RARE, category: 'FISHING',
        bonuses: { speed: 0.15, multi: 1 },
        recipe: { materials: [{ type: 'FISH', id: 7, count: 10 }], cost: 2500 }
    },
    {
        id: 'fish_4', name: "Deep Net", description: "Catches more.", tier: RarityId.EPIC, category: 'FISHING',
        bonuses: { speed: 0.20 },
        recipe: { materials: [{ type: 'FISH', id: 10, count: 5 }], cost: 10000 }
    },
    {
        id: 'fish_5', name: "Sonar Lure", description: "Beeps underwater.", tier: RarityId.LEGENDARY, category: 'FISHING',
        bonuses: { speed: 0.25, multi: 1 },
        recipe: { materials: [{ type: 'FISH', id: 13, count: 5 }], cost: 50000 }
    },
    {
        id: 'fish_6', name: "Mythic Hook", description: "Never lets go.", tier: RarityId.MYTHICAL, category: 'FISHING',
        bonuses: { speed: 0.30 },
        recipe: { materials: [{ type: 'FISH', id: 16, count: 5 }], cost: 250000 }
    },
    {
        id: 'fish_7', name: "Divine Trawler", description: "Holy fishing.", tier: RarityId.DIVINE, category: 'FISHING',
        bonuses: { speed: 0.35, multi: 2 },
        recipe: { materials: [{ type: 'FISH', id: 19, count: 3 }], cost: 1000000 }
    },
    {
        id: 'fish_8', name: "Void Rod", description: "Casts into nothing.", tier: RarityId.OTHERWORLDLY, category: 'FISHING',
        bonuses: { speed: 0.40 },
        recipe: { materials: [{ type: 'FISH', id: 22, count: 3 }], cost: 5000000 }
    },
    {
        id: 'fish_9', name: "Cosmic Net", description: "Catches comets.", tier: RarityId.COSMIC, category: 'FISHING',
        bonuses: { speed: 0.45, multi: 2 },
        recipe: { materials: [{ type: 'FISH', id: 25, count: 3 }], cost: 25000000 }
    },
    {
        id: 'fish_10', name: "Extreme Harpoon", description: "For big game.", tier: RarityId.EXTREME, category: 'FISHING',
        bonuses: { speed: 0.50 },
        recipe: { materials: [{ type: 'FISH', id: 28, count: 2 }], cost: 100000000 }
    },
    {
        id: 'fish_11', name: "Abyssal Line", description: "Infinite depth.", tier: RarityId.ABYSSAL, category: 'FISHING',
        bonuses: { speed: 0.55, multi: 3 },
        recipe: { materials: [{ type: 'FISH', id: 31, count: 2 }], cost: 500000000 }
    },
    {
        id: 'fish_12', name: "Primordial Bait", description: "First worm.", tier: RarityId.PRIMORDIAL, category: 'FISHING',
        bonuses: { speed: 0.60 },
        recipe: { materials: [{ type: 'FISH', id: 34, count: 2 }], cost: 2500000000 }
    },
    {
        id: 'fish_13', name: "Infinite Reel", description: "Keeps spinning.", tier: RarityId.INFINITE, category: 'FISHING',
        bonuses: { speed: 0.65, multi: 3 },
        recipe: { materials: [{ type: 'FISH', id: 37, count: 1 }], cost: 10000000000 }
    },
    {
        id: 'fish_14', name: "Chaos Cage", description: "Traps entropy.", tier: RarityId.CHAOS, category: 'FISHING',
        bonuses: { speed: 0.70 },
        recipe: { materials: [{ type: 'FISH', id: 40, count: 1 }], cost: 50000000000 }
    },
    {
        id: 'fish_15', name: "The One Rod", description: "Catches code.", tier: RarityId.THE_ONE, category: 'FISHING',
        bonuses: { speed: 0.80, multi: 5 },
        recipe: { materials: [{ type: 'FISH', id: 43, count: 1 }], cost: 100000000000 }
    },

    // --- HARVESTING ITEMS (Harvesting Speed & Yield) ---
    {
        id: 'harv_1', name: "Rusty Sickle", description: "Needs sharpening.", tier: RarityId.COMMON, category: 'HARVESTING',
        bonuses: { speed: 0.05 },
        recipe: { materials: [{ type: 'PLANT', id: 1, count: 10 }], cost: 100 }
    },
    {
        id: 'harv_2', name: "Iron Hoe", description: "Tills the soil.", tier: RarityId.UNCOMMON, category: 'HARVESTING',
        bonuses: { speed: 0.10 },
        recipe: { materials: [{ type: 'PLANT', id: 4, count: 10 }], cost: 500 }
    },
    {
        id: 'harv_3', name: "Steel Scythe", description: "Cuts clean.", tier: RarityId.RARE, category: 'HARVESTING',
        bonuses: { speed: 0.15, yield: 1 },
        recipe: { materials: [{ type: 'PLANT', id: 7, count: 10 }], cost: 2500 }
    },
    {
        id: 'harv_4', name: "Auto-Pruner", description: "Robotic snips.", tier: RarityId.EPIC, category: 'HARVESTING',
        bonuses: { speed: 0.20 },
        recipe: { materials: [{ type: 'PLANT', id: 10, count: 5 }], cost: 10000 }
    },
    {
        id: 'harv_5', name: "Nano Harvester", description: "Molecular cutting.", tier: RarityId.LEGENDARY, category: 'HARVESTING',
        bonuses: { speed: 0.25, yield: 2 },
        recipe: { materials: [{ type: 'PLANT', id: 13, count: 5 }], cost: 50000 }
    },
    {
        id: 'harv_6', name: "Mythic Trowel", description: "Digs deep.", tier: RarityId.MYTHICAL, category: 'HARVESTING',
        bonuses: { speed: 0.30 },
        recipe: { materials: [{ type: 'PLANT', id: 16, count: 5 }], cost: 250000 }
    },
    {
        id: 'harv_7', name: "Divine Watering Can", description: "Holy water.", tier: RarityId.DIVINE, category: 'HARVESTING',
        bonuses: { speed: 0.35, yield: 3 },
        recipe: { materials: [{ type: 'PLANT', id: 19, count: 3 }], cost: 1000000 }
    },
    {
        id: 'harv_8', name: "Void Rake", description: "Gathers shadows.", tier: RarityId.OTHERWORLDLY, category: 'HARVESTING',
        bonuses: { speed: 0.40 },
        recipe: { materials: [{ type: 'PLANT', id: 22, count: 3 }], cost: 5000000 }
    },
    {
        id: 'harv_9', name: "Cosmic Combine", description: "Harvests galaxies.", tier: RarityId.COSMIC, category: 'HARVESTING',
        bonuses: { speed: 0.45, yield: 4 },
        recipe: { materials: [{ type: 'PLANT', id: 25, count: 3 }], cost: 25000000 }
    },
    {
        id: 'harv_10', name: "Extreme Shears", description: "Cuts anything.", tier: RarityId.EXTREME, category: 'HARVESTING',
        bonuses: { speed: 0.50 },
        recipe: { materials: [{ type: 'PLANT', id: 28, count: 2 }], cost: 100000000 }
    },
    {
        id: 'harv_11', name: "Abyssal Scythe", description: "Reaps souls.", tier: RarityId.ABYSSAL, category: 'HARVESTING',
        bonuses: { speed: 0.55, yield: 5 },
        recipe: { materials: [{ type: 'PLANT', id: 31, count: 2 }], cost: 500000000 }
    },
    {
        id: 'harv_12', name: "Primordial Plow", description: "Turns the first earth.", tier: RarityId.PRIMORDIAL, category: 'HARVESTING',
        bonuses: { speed: 0.60 },
        recipe: { materials: [{ type: 'PLANT', id: 34, count: 2 }], cost: 2500000000 }
    },
    {
        id: 'harv_13', name: "Infinite Planter", description: "Sows forever.", tier: RarityId.INFINITE, category: 'HARVESTING',
        bonuses: { speed: 0.65, yield: 6 },
        recipe: { materials: [{ type: 'PLANT', id: 37, count: 1 }], cost: 10000000000 }
    },
    {
        id: 'harv_14', name: "Chaos Cultivator", description: "Grows entropy.", tier: RarityId.CHAOS, category: 'HARVESTING',
        bonuses: { speed: 0.70 },
        recipe: { materials: [{ type: 'PLANT', id: 40, count: 1 }], cost: 50000000000 }
    },
    {
        id: 'harv_15', name: "The One Seed", description: "Grows code.", tier: RarityId.THE_ONE, category: 'HARVESTING',
        bonuses: { speed: 0.80, yield: 10 },
        recipe: { materials: [{ type: 'PLANT', id: 43, count: 1 }], cost: 100000000000 }
    }
];
