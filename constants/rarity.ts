import { RarityId, RarityTier, VariantId, VariantTier } from '../types';

export const RARITY_TIERS: Record<RarityId, RarityTier> = {
    [RarityId.COMMON]: {
        id: RarityId.COMMON,
        name: "Common",
        probability: 5,
        color: "border-gray-600",
        textColor: "text-gray-400",
        shadowColor: "rgba(156, 163, 175, 0)",
    },
    [RarityId.UNCOMMON]: {
        id: RarityId.UNCOMMON,
        name: "Uncommon",
        probability: 20,
        color: "border-green-600",
        textColor: "text-green-400",
        shadowColor: "rgba(74, 222, 128, 0.2)",
    },
    [RarityId.RARE]: {
        id: RarityId.RARE,
        name: "Rare",
        probability: 100,
        color: "border-blue-600",
        textColor: "text-blue-400",
        shadowColor: "rgba(96, 165, 250, 0.3)",
    },
    [RarityId.EPIC]: {
        id: RarityId.EPIC,
        name: "Epic",
        probability: 500,
        color: "border-purple-600",
        textColor: "text-purple-400",
        shadowColor: "rgba(192, 132, 252, 0.4)",
    },
    [RarityId.LEGENDARY]: {
        id: RarityId.LEGENDARY,
        name: "Legendary",
        probability: 2500,
        color: "border-yellow-600",
        textColor: "text-yellow-400",
        shadowColor: "rgba(250, 204, 21, 0.5)",
    },
    [RarityId.MYTHICAL]: {
        id: RarityId.MYTHICAL,
        name: "Mythical",
        probability: 12500,
        color: "border-pink-600",
        textColor: "text-pink-400",
        shadowColor: "rgba(244, 114, 182, 0.5)",
    },
    [RarityId.DIVINE]: {
        id: RarityId.DIVINE,
        name: "Divine",
        probability: 100000,
        color: "border-cyan-500",
        textColor: "text-cyan-300",
        shadowColor: "rgba(103, 232, 249, 0.6)",
        animate: true,
    },
    [RarityId.OTHERWORLDLY]: {
        id: RarityId.OTHERWORLDLY,
        name: "Otherworldly",
        probability: 500000,
        color: "border-indigo-500",
        textColor: "text-indigo-300",
        shadowColor: "rgba(165, 180, 252, 0.6)",
        animate: true,
    },
    [RarityId.COSMIC]: {
        id: RarityId.COSMIC,
        name: "Cosmic",
        probability: 2500000,
        color: "border-violet-500",
        textColor: "text-violet-300",
        shadowColor: "rgba(196, 181, 253, 0.7)",
        animate: true,
    },
    [RarityId.EXTREME]: {
        id: RarityId.EXTREME,
        name: "Extreme",
        probability: 10000000,
        color: "border-red-600",
        textColor: "text-red-500",
        shadowColor: "rgba(239, 68, 68, 0.8)",
        animate: true,
    },
    [RarityId.ABYSSAL]: {
        id: RarityId.ABYSSAL,
        name: "Abyssal",
        probability: 50000000,
        color: "border-slate-800",
        textColor: "text-slate-200",
        shadowColor: "rgba(15, 23, 42, 0.9)",
        animate: true,
    },
    [RarityId.PRIMORDIAL]: {
        id: RarityId.PRIMORDIAL,
        name: "Primordial",
        probability: 250000000,
        color: "border-orange-600",
        textColor: "text-orange-500",
        shadowColor: "rgba(249, 115, 22, 0.9)",
        animate: true,
    },
    [RarityId.INFINITE]: {
        id: RarityId.INFINITE,
        name: "Infinite",
        probability: 1000000000,
        color: "border-teal-400",
        textColor: "text-teal-200",
        shadowColor: "rgba(45, 212, 191, 1)",
        animate: true,
    },
    [RarityId.CHAOS]: {
        id: RarityId.CHAOS,
        name: "Chaos",
        probability: 10000000000,
        color: "border-fuchsia-600",
        textColor: "text-fuchsia-500",
        shadowColor: "rgba(217, 70, 239, 1)",
        animate: true,
    },
    [RarityId.THE_ONE]: {
        id: RarityId.THE_ONE,
        name: "The One",
        probability: 1000000000000,
        color: "border-white",
        textColor: "text-white",
        shadowColor: "rgba(255, 255, 255, 1)",
        animate: true,
    },
    [RarityId.MOON]: {
        id: RarityId.MOON,
        name: "Moon",
        probability: 1, // Variable, handled by subgame logic
        color: "border-slate-400",
        textColor: "text-slate-200",
        shadowColor: "rgba(226, 232, 240, 0.8)",
        animate: true
    }
};

export const VARIANTS: Record<VariantId, VariantTier> = {
    [VariantId.NONE]: {
        id: VariantId.NONE,
        name: "Normal",
        prefix: "",
        multiplier: 1,
        styleClass: "",
        borderClass: ""
    },
    [VariantId.GILDED]: {
        id: VariantId.GILDED,
        name: "Gilded",
        prefix: "Gilded",
        multiplier: 2,
        styleClass: "text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)] font-serif italic",
        borderClass: "border-yellow-400"
    },
    [VariantId.HOLOGRAPHIC]: {
        id: VariantId.HOLOGRAPHIC,
        name: "Holographic",
        prefix: "Holo",
        multiplier: 5,
        styleClass: "text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-cyan-400 to-purple-500 animate-pulse",
        borderClass: "border-cyan-400"
    },
    [VariantId.RADIOACTIVE]: {
        id: VariantId.RADIOACTIVE,
        name: "Radioactive",
        prefix: "Toxic",
        multiplier: 10,
        styleClass: "text-lime-400 drop-shadow-[0_0_10px_rgba(163,230,53,1)] animate-pulse",
        borderClass: "border-lime-500"
    },
    [VariantId.VOLCANIC]: {
        id: VariantId.VOLCANIC,
        name: "Volcanic",
        prefix: "Magmatic",
        multiplier: 25,
        styleClass: "text-orange-600 drop-shadow-[0_0_15px_rgba(234,88,12,0.9)] tracking-widest",
        borderClass: "border-orange-600"
    },
    [VariantId.GLACIAL]: {
        id: VariantId.GLACIAL,
        name: "Glacial",
        prefix: "Frozen",
        multiplier: 50,
        styleClass: "text-cyan-100 drop-shadow-[0_0_12px_rgba(165,243,252,0.9)]",
        borderClass: "border-cyan-200"
    },
    [VariantId.ABYSSAL]: {
        id: VariantId.ABYSSAL,
        name: "Abyssal",
        prefix: "Void",
        multiplier: 100,
        styleClass: "text-slate-900 bg-white px-2 drop-shadow-[0_0_20px_rgba(0,0,0,1)]",
        borderClass: "border-slate-900 bg-slate-200"
    },
    [VariantId.CELESTIAL]: {
        id: VariantId.CELESTIAL,
        name: "Celestial",
        prefix: "Starforged",
        multiplier: 250,
        styleClass: "text-white drop-shadow-[0_0_25px_rgba(255,255,255,1)] tracking-[0.2em]",
        borderClass: "border-white"
    },
    [VariantId.QUANTUM]: {
        id: VariantId.QUANTUM,
        name: "Quantum",
        prefix: "Glitch",
        multiplier: 500,
        styleClass: "text-emerald-400 font-mono tracking-tighter blur-[0.5px] animate-pulse",
        borderClass: "border-emerald-500"
    },
    [VariantId.NEGATIVE]: {
        id: VariantId.NEGATIVE,
        name: "Negative",
        prefix: "Inverted",
        multiplier: 1000,
        styleClass: "invert filter drop-shadow-[0_0_10px_white]",
        borderClass: "border-white invert"
    },
    [VariantId.PURE]: {
        id: VariantId.PURE,
        name: "Pure",
        prefix: "Perfect",
        multiplier: 10000,
        styleClass: "text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-200 to-neutral-400 drop-shadow-[0_0_30px_white] text-[1.1em]",
        borderClass: "border-white bg-white/10"
    }
};
