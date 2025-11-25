
export const GACHA_CREDIT_COST = 10000; // Balance cost to buy 1 credit
export const GACHA_CONFIG = {
    SYMBOLS: [
        { id: '7', char: '7', weight: 1, color: 'text-yellow-500', multiplier: 500 }, // JACKPOT
        { id: 'DIAMOND', char: '♦', weight: 5, color: 'text-cyan-400', multiplier: 100 },
        { id: 'BAR', char: '≡', weight: 15, color: 'text-green-500', multiplier: 50 },
        { id: 'BELL', char: 'Ω', weight: 25, color: 'text-orange-400', multiplier: 20 },
        { id: 'CHERRY', char: '🍒', weight: 30, color: 'text-red-500', multiplier: 10 },
        { id: 'SKULL', char: '☠', weight: 24, color: 'text-neutral-600', multiplier: 0 } // Loss
    ],
    SPIN_DURATION: 2000, // Total spin time
    DELAY_BETWEEN_REELS: 500
};
