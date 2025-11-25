
// Index maps to speedLevel in GameStats
export const SPEED_TIERS = [
    { ms: 250, cost: 0, name: "BASE CLOCK" },
    { ms: 150, cost: 500, name: "OVERCLOCK I" },
    { ms: 75, cost: 2500, name: "OVERCLOCK II" },
    { ms: 40, cost: 10000, name: "LIQUID COOLING" },
    { ms: 20, cost: 50000, name: "NITROGEN LOOP" },
    { ms: 10, cost: 250000, name: "QUANTUM TUNNEL" },
    { ms: 5, cost: 1000000, name: "ZERO POINT" }
];

// UPGRADE CONFIGS
export const UPGRADE_COSTS = {
    LUCK: { base: 1000, multiplier: 2.5, max: 10 }, // 1.1x, 1.2x, etc.
    MINING_SPEED: { base: 500, multiplier: 2.0, max: 8 }, // Reduces ms
    MINING_LUCK: { base: 750, multiplier: 2.2, max: 10 }, // Increases luck mult
    MINING_MULTI: { base: 5000, multiplier: 3.0, max: 5 }, // +1 Ore per mine
    FISHING_SPEED: { base: 600, multiplier: 2.1, max: 8 },
    FISHING_LUCK: { base: 800, multiplier: 2.3, max: 10 },
    FISHING_MULTI: { base: 6000, multiplier: 3.2, max: 5 },
    HARVESTING_SPEED: { base: 550, multiplier: 2.05, max: 8 },
    HARVESTING_LUCK: { base: 775, multiplier: 2.25, max: 10 },
    HARVESTING_MULTI: { base: 5500, multiplier: 3.1, max: 5 }
};

export const MINING_SPEEDS = [1000, 800, 600, 400, 200, 100, 50, 25, 10]; // ms delays
export const FISHING_SPEEDS = [1200, 1000, 800, 600, 400, 200, 100, 50, 25]; // ms delays (slightly slower base)
export const HARVESTING_SPEEDS = [1100, 900, 700, 500, 300, 150, 75, 35, 15]; // ms delays

export const BURST_COST = 5000;
export const ENTROPY_THRESHOLD = 1000;
