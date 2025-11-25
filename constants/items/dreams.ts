import { Dream } from '../../types';

export const DREAMS: Dream[] = [
    // --- TIER 1: SURFACE (1-10) - Low Stability Cost (1-3) ---
    { id: 1, name: "Falling Sensation", description: "You jolt awake instantly.", probability: 2, stabilityDrain: 1, color: "text-slate-400", glowColor: "#94a3b8", tierName: "Surface" },
    { id: 2, name: "Late for School", description: "The bell is ringing.", probability: 3, stabilityDrain: 1, color: "text-yellow-200", glowColor: "#fef08a", tierName: "Surface" },
    { id: 3, name: "Teeth Falling Out", description: "A common anxiety.", probability: 4, stabilityDrain: 2, color: "text-stone-300", glowColor: "#d6d3d1", tierName: "Surface" },
    { id: 4, name: "Forgot Pants", description: "Everyone is looking.", probability: 5, stabilityDrain: 2, color: "text-red-200", glowColor: "#fecaca", tierName: "Surface" },
    { id: 5, name: "Flying (Gliding)", description: "You catch a breeze.", probability: 6, stabilityDrain: 3, color: "text-blue-300", glowColor: "#93c5fd", tierName: "Surface" },
    { id: 6, name: "Underwater Breath", description: "Gills appear.", probability: 8, stabilityDrain: 3, color: "text-cyan-400", glowColor: "#22d3ee", tierName: "Surface" },
    { id: 7, name: "Slow Motion Run", description: "Legs feel heavy.", probability: 10, stabilityDrain: 3, color: "text-gray-500", glowColor: "#6b7280", tierName: "Surface" },
    { id: 8, name: "Old House", description: "Memories of childhood.", probability: 12, stabilityDrain: 2, color: "text-amber-200", glowColor: "#fde68a", tierName: "Surface" },
    { id: 9, name: "Unread Text", description: "You can't read the screen.", probability: 15, stabilityDrain: 2, color: "text-white", glowColor: "#ffffff", tierName: "Surface" },
    { id: 10, name: "Recurring Stranger", description: "You know them.", probability: 20, stabilityDrain: 3, color: "text-purple-300", glowColor: "#d8b4fe", tierName: "Surface" },

    // --- TIER 2: LUCID (11-20) - Medium Stability Cost (4-6) ---
    { id: 11, name: "Controlled Flight", description: "Superman style.", probability: 30, stabilityDrain: 4, color: "text-sky-400", glowColor: "#38bdf8", tierName: "Lucid" },
    { id: 12, name: "Object Summoning", description: "You needed a key.", probability: 40, stabilityDrain: 4, color: "text-yellow-400", glowColor: "#facc15", tierName: "Lucid" },
    { id: 13, name: "Mirror Gazing", description: "Your reflection waves.", probability: 50, stabilityDrain: 5, color: "text-neutral-300", glowColor: "#d4d4d4", tierName: "Lucid" },
    { id: 14, name: "Telekinesis", description: "Mind over matter.", probability: 60, stabilityDrain: 5, color: "text-fuchsia-400", glowColor: "#e879f9", tierName: "Lucid" },
    { id: 15, name: "Time Rewind", description: "Try that again.", probability: 75, stabilityDrain: 6, color: "text-teal-400", glowColor: "#2dd4bf", tierName: "Lucid" },
    { id: 16, name: "Scene Change", description: "Walk through a door.", probability: 100, stabilityDrain: 5, color: "text-indigo-400", glowColor: "#818cf8", tierName: "Lucid" },
    { id: 17, name: "Speaking to Animals", description: "The cat knows logic.", probability: 125, stabilityDrain: 4, color: "text-emerald-400", glowColor: "#34d399", tierName: "Lucid" },
    { id: 18, name: "Perfect Skill", description: "You know Kung Fu.", probability: 150, stabilityDrain: 5, color: "text-red-500", glowColor: "#ef4444", tierName: "Lucid" },
    { id: 19, name: "Invisible", description: "They can't see you.", probability: 200, stabilityDrain: 4, color: "text-slate-500 blur-[1px]", glowColor: "#64748b", tierName: "Lucid" },
    { id: 20, name: "Reality Check", description: "Six fingers.", probability: 250, stabilityDrain: 6, color: "text-white animate-pulse", glowColor: "#ffffff", tierName: "Lucid" },

    // --- TIER 3: SURREAL (21-30) - High Stability Cost (7-10) ---
    { id: 21, name: "Melting Clocks", description: "Time is liquid.", probability: 400, stabilityDrain: 7, color: "text-orange-300", glowColor: "#fdba74", tierName: "Surreal" },
    { id: 22, name: "Infinite Hallway", description: "No end in sight.", probability: 500, stabilityDrain: 8, color: "text-neutral-600", glowColor: "#525252", tierName: "Surreal" },
    { id: 23, name: "Talking Furniture", description: "The chair has opinions.", probability: 600, stabilityDrain: 7, color: "text-amber-600", glowColor: "#d97706", tierName: "Surreal" },
    { id: 24, name: "Sky Ocean", description: "Fish in the clouds.", probability: 750, stabilityDrain: 8, color: "text-blue-600", glowColor: "#2563eb", tierName: "Surreal" },
    { id: 25, name: "Giant Size", description: "Step over cities.", probability: 1000, stabilityDrain: 9, color: "text-rose-400", glowColor: "#fb7185", tierName: "Surreal" },
    { id: 26, name: "Microscopic", description: "Fighting dust mites.", probability: 1250, stabilityDrain: 9, color: "text-lime-400", glowColor: "#a3e635", tierName: "Surreal" },
    { id: 27, name: "Face Stealer", description: "Who are you?", probability: 1500, stabilityDrain: 10, color: "text-purple-800", glowColor: "#6b21a8", tierName: "Surreal" },
    { id: 28, name: "Upside Down World", description: "Gravity inverted.", probability: 2000, stabilityDrain: 9, color: "text-cyan-600", glowColor: "#0891b2", tierName: "Surreal" },
    { id: 29, name: "Geometric Sun", description: "It's a cube.", probability: 2500, stabilityDrain: 8, color: "text-yellow-500", glowColor: "#eab308", tierName: "Surreal" },
    { id: 30, name: "Liquid Floor", description: "Sinking into carpet.", probability: 3000, stabilityDrain: 10, color: "text-pink-500", glowColor: "#ec4899", tierName: "Surreal" },

    // --- TIER 4: NIGHTMARE (31-40) - Very High Cost (12-15) ---
    { id: 31, name: "Shadow Man", description: "Don't look at him.", probability: 5000, stabilityDrain: 12, color: "text-black bg-white px-1", glowColor: "#000000", tierName: "Nightmare" },
    { id: 32, name: "Endless Fall", description: "The ground never comes.", probability: 7500, stabilityDrain: 13, color: "text-slate-800", glowColor: "#1e293b", tierName: "Nightmare" },
    { id: 33, name: "False Awakening", description: "You thought you woke up.", probability: 10000, stabilityDrain: 15, color: "text-red-500 animate-pulse", glowColor: "#ef4444", tierName: "Nightmare" },
    { id: 34, name: "Teeth Storm", description: "Raining enamel.", probability: 15000, stabilityDrain: 12, color: "text-white drop-shadow-md", glowColor: "#ffffff", tierName: "Nightmare" },
    { id: 35, name: "The Paralysis", description: "Can't move.", probability: 20000, stabilityDrain: 14, color: "text-gray-900", glowColor: "#111827", tierName: "Nightmare" },
    { id: 36, name: "Faceless Crowd", description: "They are all watching.", probability: 25000, stabilityDrain: 13, color: "text-neutral-500 blur-[0.5px]", glowColor: "#737373", tierName: "Nightmare" },
    { id: 37, name: "Siren Head", description: "Loud noises.", probability: 35000, stabilityDrain: 15, color: "text-red-800", glowColor: "#991b1b", tierName: "Nightmare" },
    { id: 38, name: "Rotting World", description: "Everything decays.", probability: 50000, stabilityDrain: 14, color: "text-green-900", glowColor: "#14532d", tierName: "Nightmare" },
    { id: 39, name: "The Chase", description: "It's getting closer.", probability: 75000, stabilityDrain: 15, color: "text-orange-700 animate-pulse", glowColor: "#c2410c", tierName: "Nightmare" },
    { id: 40, name: "Void Stare", description: "The abyss blinks.", probability: 100000, stabilityDrain: 20, color: "text-violet-950", glowColor: "#2e1065", tierName: "Nightmare" },

    // --- TIER 5: ABSTRACT (41-50) - Extreme Cost (15-25) ---
    { id: 41, name: "Concept of Zero", description: "Nothing implies something.", probability: 200000, stabilityDrain: 18, color: "text-white font-thin", glowColor: "#ffffff", tierName: "Abstract" },
    { id: 42, name: "The Color Blurple", description: "A new primary color.", probability: 350000, stabilityDrain: 18, color: "text-indigo-500 animate-pulse", glowColor: "#6366f1", tierName: "Abstract" },
    { id: 43, name: "Sound of Silence", description: "Deafening.", probability: 500000, stabilityDrain: 20, color: "text-slate-200", glowColor: "#e2e8f0", tierName: "Abstract" },
    { id: 44, name: "4th Dimension", description: "Directions you can't point.", probability: 750000, stabilityDrain: 22, color: "text-fuchsia-600", glowColor: "#c026d3", tierName: "Abstract" },
    { id: 45, name: "Ego Death", description: "You are not.", probability: 1000000, stabilityDrain: 25, color: "text-transparent bg-clip-text bg-gradient-to-r from-white to-black", glowColor: "#ffffff", tierName: "Abstract" },
    { id: 46, name: "Universal Code", description: "The matrix revealed.", probability: 2000000, stabilityDrain: 20, color: "text-green-500 font-mono", glowColor: "#22c55e", tierName: "Abstract" },
    { id: 47, name: "Memory of Tomorrow", description: "Future past.", probability: 5000000, stabilityDrain: 22, color: "text-cyan-300", glowColor: "#67e8f9", tierName: "Abstract" },
    { id: 48, name: "Collective Unconscious", description: "Everyone is here.", probability: 10000000, stabilityDrain: 25, color: "text-yellow-200 blur-sm", glowColor: "#fef08a", tierName: "Abstract" },
    { id: 49, name: "The Architect", description: "He's busy.", probability: 25000000, stabilityDrain: 30, color: "text-blue-900 drop-shadow-[0_0_10px_white]", glowColor: "#1e3a8a", tierName: "Abstract" },
    { id: 50, name: "Waking Life", description: "This is the dream.", probability: 100000000, stabilityDrain: 50, color: "text-white animate-ping", glowColor: "#ffffff", tierName: "Abstract" }
];
