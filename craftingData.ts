import { CraftableItem } from './types';

// Helper to generate items
const generateItems = (): CraftableItem[] => {
    const items: CraftableItem[] = [];

    // --- GENERAL ITEMS (Luck) [BOOST] ---
    const generalNames = [
        "Lucky Penny", "Rabbit's Foot", "Horseshoe", "Wishbone", "Four Leaf Charm",
        "Fortune Cookie", "Dream Catcher", "Mystic Orb", "Fate Prism", "Destiny Gear",
        "Time Dilator", "Probability Drive", "Entropy Shield", "Reality Anchor", "The Catalyst"
    ];

    generalNames.forEach((name, i) => {
        const tier = i + 1;
        items.push({
            id: `gen_${tier}`,
            name: name,
            description: `Increases Global Luck by ${tier * 10}%.`,
            tier,
            category: 'GENERAL',
            type: 'BOOST',
            bonuses: { luck: tier * 0.1 },
            recipe: {
                cost: Math.floor(250 * Math.pow(1.6, i)),
                materials: [
                    { type: 'ORE', id: Math.max(1, Math.floor(tier * 3)), count: 10 + tier },
                    { type: 'FISH', id: Math.max(1, Math.floor(tier * 2)), count: 10 + tier },
                    { type: 'PLANT', id: Math.max(1, Math.floor(tier * 2)), count: 10 + tier }
                ]
            }
        });
    });

    // --- GENERAL ITEMS (Multi) [MULTI] ---
    const generalMultiNames = ["Parallel Core", "Dual-Thread CPU", "Hyper-Threader", "Quantum Batcher", "Omni-Processor"];
    generalMultiNames.forEach((name, i) => {
        const tier = i + 1;
        items.push({
            id: `gen_multi_${tier}`,
            name: name,
            description: `Increases Auto-Roll batch size by +${tier}.`,
            tier,
            category: 'GENERAL',
            type: 'MULTI',
            bonuses: { multi: tier },
            recipe: {
                cost: Math.floor(2000 * Math.pow(2.5, i)),
                materials: [
                    { type: 'ORE', id: Math.max(10, tier * 10), count: 20 * tier },
                    { type: 'FISH', id: Math.max(10, tier * 8), count: 20 * tier }
                ]
            }
        });
    });

    // --- MINING ITEMS (Luck & Speed) [BOOST] ---
    const miningNames = [
        "Stone Pick", "Iron Pick", "Steel Mattock", "Hardened Drill", "Diamond Bore",
        "Plasma Cutter", "Laser Drill", "Sonic Blaster", "Mole Machine", "Tectonic Breaker",
        "Core Tapper", "Mantle Siphon", "Planetary Cracker", "Star Forge", "Reality Miner"
    ];

    miningNames.forEach((name, i) => {
        const tier = i + 1;
        items.push({
            id: `mine_${tier}`,
            name: name,
            description: `Increases mining luck by ${tier * 15}% and decreases delay by ${tier * 10}ms.`,
            tier,
            category: 'MINING',
            type: 'BOOST',
            // UPDATED: Now includes Luck bonus
            bonuses: { luck: tier * 0.15, speed: tier * 10 },
            recipe: {
                cost: Math.floor(500 * Math.pow(1.55, i)),
                materials: [
                    { type: 'ORE', id: Math.max(1, Math.floor(tier * 4)), count: 10 + tier * 2 },
                    { type: 'ORE', id: Math.max(1, Math.floor(tier * 2)), count: 20 + tier * 5 }
                ]
            }
        });
    });

    // --- MINING ITEMS (Multi) [MULTI] ---
    const miningMultiNames = ["Double Bit", "Twin-Head Drill", "Cluster Bomb", "Vein Stripper", "Planet Eater"];
    miningMultiNames.forEach((name, i) => {
        const tier = i + 1;
        items.push({
            id: `mine_multi_${tier}`,
            name: name,
            description: `Mines +${tier} additional ore per action.`,
            tier,
            category: 'MINING',
            type: 'MULTI',
            bonuses: { multi: tier },
            recipe: {
                cost: Math.floor(1500 * Math.pow(2.5, i)),
                materials: [
                    { type: 'ORE', id: Math.max(15, tier * 12), count: 50 * tier }
                ]
            }
        });
    });

    // --- FISHING ITEMS (Luck & Speed) [BOOST] ---
    const fishingNames = [
        "Bamboo Rod", "Fiberglass Rod", "Carbon Rod", "Reinforced Net", "Sonar Lure",
        "Deep Sea Lamp", "Magnetic Reel", "Pulse Catcher", "Quantum Hook", "Void Net",
        "Abyssal Trawler", "Time Sink", "Dimensional Rod", "Cosmic Bait", "The Harpoon"
    ];

    fishingNames.forEach((name, i) => {
        const tier = i + 1;
        items.push({
            id: `fish_${tier}`,
            name: name,
            description: `Increases fishing luck by ${tier * 15}% and speed by ${tier * 5}ms.`,
            tier,
            category: 'FISHING',
            type: 'BOOST',
            bonuses: { luck: tier * 0.15, speed: tier * 5 },
            recipe: {
                cost: Math.floor(500 * Math.pow(1.55, i)),
                materials: [
                    { type: 'FISH', id: Math.max(1, Math.floor(tier * 2.5)), count: 10 + tier * 2 },
                    { type: 'PLANT', id: Math.max(1, Math.floor(tier * 2)), count: 15 + tier },
                    { type: 'ORE', id: Math.max(1, Math.floor(tier * 2)), count: 5 + tier }
                ]
            }
        });
    });

    // --- FISHING ITEMS (Multi) [MULTI] ---
    const fishingMultiNames = ["Split Line", "Double Hook", "Trotline", "Drag Net", "Tsunami Caller"];
    fishingMultiNames.forEach((name, i) => {
        const tier = i + 1;
        items.push({
            id: `fish_multi_${tier}`,
            name: name,
            description: `Catches +${tier} additional fish per cast.`,
            tier,
            category: 'FISHING',
            type: 'MULTI',
            bonuses: { multi: tier },
            recipe: {
                cost: Math.floor(1500 * Math.pow(2.5, i)),
                materials: [
                    { type: 'FISH', id: Math.max(15, tier * 8), count: 40 * tier },
                    { type: 'PLANT', id: Math.max(15, tier * 8), count: 20 * tier }
                ]
            }
        });
    });

    // --- HARVESTING ITEMS (Luck & Speed) [BOOST] ---
    const harvestingNames = [
        "Rusty Shears", "Iron Sickle", "Steel Scythe", "Auto-Pruner", "Hydro-Cutter",
        "Laser Scythe", "Nano-Harvester", "Bio-Weaver", "Flora Synther", "Gaia's Hand",
        "Solar Reaper", "Life Siphon", "Evolution Tool", "Eden's Blade", "Alpha Sickle"
    ];

    harvestingNames.forEach((name, i) => {
        const tier = i + 1;
        items.push({
            id: `harv_${tier}`,
            name: name,
            description: `Increases harvesting luck by ${tier * 15}% and decreases delay by ${tier * 10}ms.`,
            tier,
            category: 'HARVESTING',
            type: 'BOOST',
            bonuses: { luck: tier * 0.15, speed: tier * 10 },
            recipe: {
                cost: Math.floor(500 * Math.pow(1.55, i)),
                materials: [
                    { type: 'PLANT', id: Math.max(1, Math.floor(tier * 3)), count: 15 + tier * 3 },
                    { type: 'ORE', id: Math.max(1, Math.floor(tier * 2.5)), count: 10 + tier }
                ]
            }
        });
    });

    // --- HARVESTING ITEMS (Multi) [MULTI] ---
    const harvestingMultiNames = ["Twin Sickle", "Rake", "Combine", "Forest Feller", "World Eater"];
    harvestingMultiNames.forEach((name, i) => {
        const tier = i + 1;
        items.push({
            id: `harv_multi_${tier}`,
            name: name,
            description: `Harvests +${tier} additional plants per action.`,
            tier,
            category: 'HARVESTING',
            type: 'MULTI',
            bonuses: { multi: tier },
            recipe: {
                cost: Math.floor(1500 * Math.pow(2.5, i)),
                materials: [
                    { type: 'PLANT', id: Math.max(15, tier * 9), count: 60 * tier }
                ]
            }
        });
    });

    // --- DREAMING ITEMS (Totems) [BOOST] - Increases Base Stability ---
    const totemNames = [
        "Spinning Top", "Loaded Die", "Weighted Chess Piece", "Gold Coin", "Iron Poker",
        "Silver Mirror", "Crystal Orb", "Obsidian Shard", "Runed Stone", "Ancestral Idol",
        "Void Anchor", "Reality Tether", "Soul Gem", "Chronos Watch", "The Constant"
    ];

    totemNames.forEach((name, i) => {
        const tier = i + 1;
        items.push({
            id: `dream_${tier}`,
            name: name,
            description: `Increases Base Stability by +${tier * 10}.`,
            tier,
            category: 'DREAMING',
            type: 'BOOST',
            bonuses: { stability: tier * 10 },
            recipe: {
                cost: Math.floor(1000 * Math.pow(1.7, i)),
                materials: [
                    { type: 'DREAM', id: Math.max(1, Math.floor(tier * 2)), count: 5 + tier },
                    { type: 'ORE', id: Math.max(10, tier * 5), count: 20 + tier * 5 }
                ]
            }
        });
    });

    // --- DREAMING ITEMS (Lucidity) [MULTI] - Increases Regen Chance ---
    // Note: Using 'MULTI' slot for Regen/Lucidity upgrades to fit the 2-slot system
    const lucidNames = [
        "Herbal Tea", "Dream Journal", "Lavender Scent", "Meditation Mat", "Lucid Mask",
        "Theta Wave Gen", "Synapse Booster", "Pineal Extract", "Third Eye Open", "Astral Projection",
        "Reality Check", "Memory Palace", "Subconscious Key", "Mind Fortress", "Omniscience"
    ];

    lucidNames.forEach((name, i) => {
        const tier = i + 1;
        items.push({
            id: `dream_multi_${tier}`,
            name: name,
            description: `+${tier * 2}% Chance to regain Stability on roll.`,
            tier,
            category: 'DREAMING',
            type: 'MULTI',
            bonuses: { stabilityRegen: tier * 0.02 },
            recipe: {
                cost: Math.floor(2500 * Math.pow(2.2, i)),
                materials: [
                    { type: 'DREAM', id: Math.max(5, tier * 4), count: 10 * tier },
                    { type: 'PLANT', id: Math.max(10, tier * 6), count: 20 * tier }
                ]
            }
        });
    });

    return items;
};

export const CRAFTABLE_ITEMS = generateItems();