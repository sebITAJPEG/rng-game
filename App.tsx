import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, Drop, InventoryItem, RarityId, ItemData, VariantId, OreInventoryItem, FishInventoryItem, PlantInventoryItem, CraftableItem } from './types';
import { RARITY_TIERS, TRANSLATIONS, VARIANTS, ACHIEVEMENTS, SPEED_TIERS, ENTROPY_THRESHOLD, MINING_SPEEDS, ORES, FISHING_SPEEDS, FISH, HARVESTING_SPEEDS, PLANTS, DREAMS } from './constants';
import { generateDrop } from './services/rngService';
import { mineOre } from './services/miningService';
import { catchFish } from './services/fishingService';
import { harvestPlant } from './services/harvestingService';
import { audioService } from './services/audioService';
import { SpecialEffects } from './components/SpecialEffects';
import { ItemVisualizer } from './components/ItemVisualizer';
import { useSubGame } from './hooks/useSubGame';
import { useDreaming } from './hooks/useDreaming';
import { THEMES, applyTheme } from './themes';

// Refactored Panels
import { LeftPanel } from './components/panels/LeftPanel';
import { CenterPanel } from './components/panels/CenterPanel';
import { RightPanel } from './components/panels/RightPanel';
import { GameModals } from './components/panels/GameModals';
import { getCraftingBonuses, getTrophyMultiplier } from './utils/gameHelpers';

export default function App() {
    // State
    const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('textbound_theme') || 'default');
    const [currentDrops, setCurrentDrops] = useState<Drop[]>([]);
    const [showExtendedStats, setShowExtendedStats] = useState(false);

    const [stats, setStats] = useState<GameStats>(() => {
        const saved = localStorage.getItem('textbound_stats');
        if (saved) {
            const parsed = JSON.parse(saved);
            let bestRarity = parsed.bestRarityFound || RarityId.COMMON;
            if (bestRarity > RarityId.THE_ONE) bestRarity = RarityId.THE_ONE;
            return { ...parsed, bestRarityFound: bestRarity };
        }
        return {
            totalRolls: 0, balance: 0, startTime: Date.now(), bestRarityFound: RarityId.COMMON,
            multiRollLevel: 1, speedLevel: 0, luckLevel: 0, entropy: 0, hasBurst: false,
            unlockedAchievements: [], equippedTitle: null, craftedItems: {}, equippedItems: {},
            totalMined: 0, bestOreMined: 0, miningSpeedLevel: 0, miningLuckLevel: 0, miningMultiLevel: 1,
            totalFished: 0, bestFishCaught: 0, fishingSpeedLevel: 0, fishingLuckLevel: 0, fishingMultiLevel: 1,
            totalHarvested: 0, bestPlantHarvested: 0, harvestingSpeedLevel: 0, harvestingLuckLevel: 0, harvestingMultiLevel: 1,
            totalDreamt: 0, bestDreamFound: 0, gachaCredits: 0, ticTacToeWins: 0
        };
    });

    const [inventory, setInventory] = useState<InventoryItem[]>(() => {
        const saved = localStorage.getItem('textbound_inventory');
        const items = saved ? JSON.parse(saved) : [];
        return items.filter((i: any) => i.rarityId <= RarityId.THE_ONE);
    });

    const [isAutoSpinning, setIsAutoSpinning] = useState(false);
    const [activeRightPanel, setActiveRightPanel] = useState<'MINING' | 'FISHING' | 'HARVESTING' | 'DREAMING'>('MINING');

    // Modal States managed in one object to pass easily
    const [modalsState, setModalsState] = useState({
        isInventoryOpen: false, isOreInventoryOpen: false, isFishInventoryOpen: false,
        isPlantInventoryOpen: false, isDreamInventoryOpen: false, isCraftingOpen: false,
        isGachaOpen: false, isChangelogOpen: false, isIndexOpen: false,
        isAchievementsOpen: false, isCoinTossOpen: false, isAdminOpen: false
    });

    const [isMuted, setIsMuted] = useState(false);
    const [inspectedItem, setInspectedItem] = useState<(ItemData & { rarityId: RarityId, variantId?: VariantId }) | null>(null);

    const [autoSpinSpeed, setAutoSpinSpeed] = useState(SPEED_TIERS[stats.speedLevel]?.ms || 250);
    const [luckMultiplier, setLuckMultiplier] = useState(1);
    const [miningLuckMultiplier, setMiningLuckMultiplier] = useState(1);
    const [miningSpeed, setMiningSpeed] = useState(1000);
    const [fishingSpeed, setFishingSpeed] = useState(1200);
    const [fishingLuckMultiplier, setFishingLuckMultiplier] = useState(1);
    const [harvestingSpeed, setHarvestingSpeed] = useState(1100);
    const [harvestingLuckMultiplier, setHarvestingLuckMultiplier] = useState(1);

    const [autoStopRarity, setAutoStopRarity] = useState<RarityId>(() => {
        const saved = localStorage.getItem('textbound_settings_autostop');
        const val = saved ? parseInt(saved) : RarityId.DIVINE;
        return val > RarityId.THE_ONE ? RarityId.THE_ONE : val;
    });

    const T = TRANSLATIONS['en'];
    const autoSpinRef = useRef<number | null>(null);

    useEffect(() => { localStorage.setItem('textbound_stats', JSON.stringify(stats)); }, [stats]);
    useEffect(() => { localStorage.setItem('textbound_inventory', JSON.stringify(inventory)); }, [inventory]);
    useEffect(() => { localStorage.setItem('textbound_settings_autostop', autoStopRarity.toString()); }, [autoStopRarity]);
    useEffect(() => { applyTheme(currentTheme); localStorage.setItem('textbound_theme', currentTheme); }, [currentTheme]);

    const trophyLuckMult = getTrophyMultiplier(stats.ticTacToeWins || 0);

    useEffect(() => {
        const baseMineSpeed = MINING_SPEEDS[Math.min(stats.miningSpeedLevel || 0, MINING_SPEEDS.length - 1)] || 1000;
        const baseFishSpeed = FISHING_SPEEDS[Math.min(stats.fishingSpeedLevel || 0, FISHING_SPEEDS.length - 1)] || 1200;
        const baseHarvSpeed = HARVESTING_SPEEDS[Math.min(stats.harvestingSpeedLevel || 0, HARVESTING_SPEEDS.length - 1)] || 1100;
        const mineBonuses = getCraftingBonuses(stats.equippedItems, 'MINING');
        const fishBonuses = getCraftingBonuses(stats.equippedItems, 'FISHING');
        const harvBonuses = getCraftingBonuses(stats.equippedItems, 'HARVESTING');
        setAutoSpinSpeed(SPEED_TIERS[stats.speedLevel]?.ms || 250);
        setMiningSpeed(Math.max(10, baseMineSpeed - mineBonuses.bonusSpeed));
        setFishingSpeed(Math.max(25, baseFishSpeed - fishBonuses.bonusSpeed));
        setHarvestingSpeed(Math.max(15, baseHarvSpeed - harvBonuses.bonusSpeed));
    }, [stats.speedLevel, stats.miningSpeedLevel, stats.fishingSpeedLevel, stats.harvestingSpeedLevel, stats.equippedItems]);

    const mineBonuses = getCraftingBonuses(stats.equippedItems, 'MINING');
    const miningGame = useSubGame({
        storageKey: 'textbound_ore_inventory',
        dropFn: mineOre,
        playSound: audioService.playMineSound.bind(audioService),
        speed: miningSpeed,
        luck: ((miningLuckMultiplier * (1 + (stats.miningLuckLevel * 0.5))) + mineBonuses.bonusLuck) * trophyLuckMult,
        multi: (stats.miningMultiLevel || 1) + mineBonuses.bonusMulti,
        thresholds: { boom: 30, rare: 10, boomDivisor: 6 }
    }, {
        onUpdate: (count, bestId, gacha) => setStats(prev => ({ ...prev, totalMined: (prev.totalMined || 0) + count, bestOreMined: Math.max(prev.bestOreMined || 0, bestId), gachaCredits: prev.gachaCredits + gacha })),
        playBoom: audioService.playBoom.bind(audioService),
        playRare: audioService.playRaritySound.bind(audioService),
        playCoinWin: audioService.playCoinWin.bind(audioService)
    });

    const fishBonuses = getCraftingBonuses(stats.equippedItems, 'FISHING');
    const fishingGame = useSubGame({
        storageKey: 'textbound_fish_inventory',
        dropFn: catchFish,
        playSound: audioService.playFishSound.bind(audioService),
        speed: fishingSpeed,
        luck: ((fishingLuckMultiplier * (1 + (stats.fishingLuckLevel * 0.5))) + fishBonuses.bonusLuck) * trophyLuckMult,
        multi: (stats.fishingMultiLevel || 1) + fishBonuses.bonusMulti,
        thresholds: { boom: 25, rare: 15, boomDivisor: 3 }
    }, {
        onUpdate: (count, bestId, gacha) => setStats(prev => ({ ...prev, totalFished: (prev.totalFished || 0) + count, bestFishCaught: Math.max(prev.bestFishCaught || 0, bestId), gachaCredits: prev.gachaCredits + gacha })),
        playBoom: audioService.playBoom.bind(audioService),
        playRare: audioService.playRaritySound.bind(audioService),
        playCoinWin: audioService.playCoinWin.bind(audioService)
    });

    const harvBonuses = getCraftingBonuses(stats.equippedItems, 'HARVESTING');
    const harvestingGame = useSubGame({
        storageKey: 'textbound_plant_inventory',
        dropFn: harvestPlant,
        playSound: audioService.playHarvestSound.bind(audioService),
        speed: harvestingSpeed,
        luck: ((harvestingLuckMultiplier * (1 + (stats.harvestingLuckLevel * 0.5))) + harvBonuses.bonusLuck) * trophyLuckMult,
        multi: (stats.harvestingMultiLevel || 1) + harvBonuses.bonusMulti,
        thresholds: { boom: 25, rare: 15, boomDivisor: 3 }
    }, {
        onUpdate: (count, bestId, gacha) => setStats(prev => ({ ...prev, totalHarvested: (prev.totalHarvested || 0) + count, bestPlantHarvested: Math.max(prev.bestPlantHarvested || 0, bestId), gachaCredits: prev.gachaCredits + gacha })),
        playBoom: audioService.playBoom.bind(audioService),
        playRare: audioService.playRaritySound.bind(audioService),
        playCoinWin: audioService.playCoinWin.bind(audioService)
    });

    const dreamBonuses = getCraftingBonuses(stats.equippedItems, 'DREAMING');
    const dreamingGame = useDreaming({
        storageKey: 'textbound_dream_inventory',
        baseStability: 100 + dreamBonuses.bonusStability
    }, {
        onUpdateStats: (count, bestId) => setStats(prev => ({ ...prev, totalDreamt: (prev.totalDreamt || 0) + count, bestDreamFound: Math.max(prev.bestDreamFound || 0, bestId) })),
        onCrash: () => { },
        onWake: (count) => { }
    });

    useEffect(() => {
        const currentLuck = (1 + (stats.luckLevel || 0) * 0.2) * luckMultiplier * trophyLuckMult;
        dreamingGame.updateParams(currentLuck, dreamBonuses.bonusStabilityRegen || 0);
    }, [stats.luckLevel, luckMultiplier, dreamBonuses.bonusStabilityRegen, trophyLuckMult]);

    useEffect(() => {
        const newUnlocks: string[] = [];
        ACHIEVEMENTS.forEach(ach => {
            if (!stats.unlockedAchievements.includes(ach.id)) {
                if (ach.condition(stats, inventory)) newUnlocks.push(ach.id);
            }
        });
        if (newUnlocks.length > 0) {
            audioService.playRaritySound(RarityId.LEGENDARY);
            setStats(prev => ({ ...prev, unlockedAchievements: [...prev.unlockedAchievements, ...newUnlocks] }));
        }
    }, [stats, inventory]);

    const toggleMute = () => {
        const newState = !isMuted;
        setIsMuted(newState);
        audioService.toggleMute(newState);
    };

    const getBestDrop = (drops: Drop[]) => {
        if (drops.length === 0) return null;
        return drops.reduce((prev, current) => (current.rarityId > prev.rarityId ? current : prev), drops[0]);
    };

    // --- Handlers passed to children ---
    const toggleResourceLock = (type: 'ORES' | 'FISH' | 'PLANTS', id: number) => {
        if (type === 'ORES') miningGame.setInventory(prev => prev.map(i => i.id === id ? { ...i, locked: !i.locked } : i));
        else if (type === 'FISH') fishingGame.setInventory(prev => prev.map(i => i.id === id ? { ...i, locked: !i.locked } : i));
        else harvestingGame.setInventory(prev => prev.map(i => i.id === id ? { ...i, locked: !i.locked } : i));
        audioService.playClick();
    };

    const handleSellResources = (type: 'ORES' | 'FISH' | 'PLANTS') => {
        let totalValue = 0;
        let setInv: any;
        let currentInv: any[];
        let defs: any[];
        let divisor: number;

        if (type === 'ORES') { currentInv = miningGame.inventory; setInv = miningGame.setInventory; defs = ORES; divisor = 5; }
        else if (type === 'FISH') { currentInv = fishingGame.inventory; setInv = fishingGame.setInventory; defs = FISH; divisor = 4; }
        else { currentInv = harvestingGame.inventory; setInv = harvestingGame.setInventory; defs = PLANTS; divisor = 4.5; }

        currentInv.forEach(item => {
            if (item.locked) return;
            const def = defs.find(d => d.id === item.id);
            if (def) totalValue += Math.max(1, Math.floor(def.probability / divisor)) * item.count;
        });

        if (totalValue > 0) {
            audioService.playCoinWin(5);
            setStats(prev => ({ ...prev, balance: prev.balance + totalValue }));
            setInv((prev: any[]) => prev.filter(i => i.locked));
        }
    };

    const handleSellDreams = () => {
        let totalValue = 0;
        dreamingGame.inventory.forEach(item => {
            const def = DREAMS.find(d => d.id === item.id);
            if (def) totalValue += Math.max(5, Math.floor(def.probability / 3)) * item.count;
        });
        if (totalValue > 0) {
            audioService.playCoinWin(5);
            setStats(prev => ({ ...prev, balance: prev.balance + totalValue }));
            dreamingGame.setInventory([]);
        }
    };

    const handleInspectResource = (item: { id: number; name: string; description: string }) => {
        const rarityId = Math.min(Math.ceil(item.id / 10), 15) as RarityId;
        audioService.playClick();
        setIsAutoSpinning(false);
        setInspectedItem({ text: item.name, description: item.description, rarityId: rarityId || RarityId.COMMON, variantId: VariantId.NONE });
        setModalsState(prev => ({ ...prev, isOreInventoryOpen: false, isFishInventoryOpen: false, isPlantInventoryOpen: false, isIndexOpen: false }));
    };

    const handleCraftItem = (item: CraftableItem) => {
        if (stats.balance < item.recipe.cost) return;
        // Check requirements...
        const missingMaterial = item.recipe.materials.find(mat => {
            if (mat.type === 'ORE') return (miningGame.inventory.find(i => i.id === mat.id)?.count || 0) < mat.count;
            if (mat.type === 'FISH') return (fishingGame.inventory.find(i => i.id === mat.id)?.count || 0) < mat.count;
            if (mat.type === 'PLANT') return (harvestingGame.inventory.find(i => i.id === mat.id)?.count || 0) < mat.count;
            if (mat.type === 'DREAM') return (dreamingGame.inventory.find(i => i.id === mat.id)?.count || 0) < mat.count;
            return true;
        });
        if (missingMaterial) return;
        setStats(prev => ({ ...prev, balance: prev.balance - item.recipe.cost, craftedItems: { ...prev.craftedItems, [item.id]: true } }));
        // Deduct items...
        item.recipe.materials.forEach(mat => {
            const deduct = (inv: any[], setInv: any) => setInv((prev: any[]) => prev.map(i => i.id === mat.id ? { ...i, count: i.count - mat.count } : i).filter(i => i.count > 0));
            if (mat.type === 'ORE') deduct(miningGame.inventory, miningGame.setInventory);
            else if (mat.type === 'FISH') deduct(fishingGame.inventory, fishingGame.setInventory);
            else if (mat.type === 'PLANT') deduct(harvestingGame.inventory, harvestingGame.setInventory);
            else if (mat.type === 'DREAM') deduct(dreamingGame.inventory, dreamingGame.setInventory);
        });
        audioService.playRaritySound(RarityId.MYTHICAL);
    };

    const handleEquipItem = (item: CraftableItem) => {
        audioService.playClick();
        setStats(prev => ({ ...prev, equippedItems: { ...prev.equippedItems, [`${item.category}_${item.type}`]: item.id } }));
    };

    const handleUnequipItem = (item: CraftableItem) => {
        audioService.playClick();
        setStats(prev => {
            const newEquipped = { ...prev.equippedItems };
            newEquipped[`${item.category}_${item.type}`] = null;
            return { ...prev, equippedItems: newEquipped };
        });
    };

    const batchUpdateStatsAndInventory = (drops: Drop[], rollsCount: number, finalEntropy: number) => {
        let creditsFound = 0;
        if (Math.random() < (0.001 * rollsCount)) creditsFound = 1;
        setStats(prev => {
            const maxRarityInBatch = Math.max(...drops.map(d => d.rarityId));
            return { ...prev, totalRolls: prev.totalRolls + rollsCount, balance: prev.balance + rollsCount, bestRarityFound: Math.max(prev.bestRarityFound, maxRarityInBatch), entropy: finalEntropy, gachaCredits: prev.gachaCredits + creditsFound };
        });
        if (creditsFound > 0) audioService.playCoinWin(3);
        if (drops.some(d => d.rarityId >= autoStopRarity)) setIsAutoSpinning(false);
        setInventory(prev => {
            let newInv = [...prev];
            drops.forEach(drop => {
                if (drop.rarityId >= RarityId.RARE) {
                    const existingIndex = newInv.findIndex(i => i.text === drop.text && i.rarityId === drop.rarityId && i.variantId === drop.variantId);
                    if (existingIndex >= 0) newInv[existingIndex].count += 1;
                    else newInv.push({ text: drop.text, description: drop.description, rarityId: drop.rarityId, variantId: drop.variantId, count: 1, discoveredAt: Date.now() });
                }
            });
            return newInv;
        });
    };

    const handleRoll = useCallback((manualBatchSize?: number) => {
        if (!manualBatchSize) audioService.playRollSound();
        const genBonuses = getCraftingBonuses(stats.equippedItems, 'GENERAL');
        const rollsToPerform = manualBatchSize || (stats.multiRollLevel + genBonuses.bonusMulti);
        const generatedDrops: Drop[] = [];
        let currentEntropy = stats.entropy;
        const levelLuck = 1 + (stats.luckLevel * 0.2);
        const totalLuckMult = luckMultiplier * (levelLuck + genBonuses.bonusLuck) * trophyLuckMult;
        let effectiveLuck = totalLuckMult;
        let consumedPity = false;
        if (currentEntropy >= ENTROPY_THRESHOLD) { effectiveLuck = totalLuckMult * 500; consumedPity = true; }
        for (let i = 0; i < rollsToPerform; i++) {
            const useLuck = (i === 0 && consumedPity) ? effectiveLuck : totalLuckMult;
            const drop = generateDrop(stats.totalRolls + i, useLuck);
            generatedDrops.push(drop);
            if (drop.rarityId >= RarityId.LEGENDARY) { currentEntropy = 0; consumedPity = false; }
            else { if (!consumedPity) currentEntropy++; else currentEntropy = 0; }
        }
        const bestDrop = getBestDrop(generatedDrops);
        if (!bestDrop) return;
        setCurrentDrops(generatedDrops);
        batchUpdateStatsAndInventory(generatedDrops, rollsToPerform, currentEntropy);
        audioService.playBoom(bestDrop.rarityId);
    }, [stats.totalRolls, stats.multiRollLevel, stats.entropy, luckMultiplier, stats.luckLevel, stats.equippedItems, trophyLuckMult]);

    const savedHandleRoll = useRef(handleRoll);
    useEffect(() => { savedHandleRoll.current = handleRoll; }, [handleRoll]);

    useEffect(() => {
        if (isAutoSpinning && !inspectedItem) {
            if (autoSpinRef.current) clearInterval(autoSpinRef.current);
            autoSpinRef.current = window.setInterval(() => { if (savedHandleRoll.current) savedHandleRoll.current(); }, autoSpinSpeed);
        } else {
            if (autoSpinRef.current) clearInterval(autoSpinRef.current);
            autoSpinRef.current = null;
        }
        return () => { if (autoSpinRef.current) clearInterval(autoSpinRef.current); };
    }, [isAutoSpinning, autoSpinSpeed, inspectedItem]);

    const handleInspectItem = (item: InventoryItem) => {
        audioService.playClick();
        setIsAutoSpinning(false);
        setInspectedItem({ text: item.text, description: item.description, rarityId: item.rarityId, variantId: item.variantId, cutscenePhrase: '' });
        setModalsState(prev => ({ ...prev, isInventoryOpen: false }));
    };

    const handleIndexSelectItem = (item: ItemData, rarityId: RarityId) => {
        audioService.playClick();
        setIsAutoSpinning(false);
        setInspectedItem({ text: item.text, description: item.description, rarityId: rarityId, cutscenePhrase: item.cutscenePhrase });
    };

    const handleBurstClick = () => { audioService.playClick(); handleRoll(50); };
    const handleTicTacToeWin = () => { setStats(prev => ({ ...prev, ticTacToeWins: (prev.ticTacToeWins || 0) + 1 })); };
    const handleLogSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => { setLuckMultiplier(Math.pow(10, parseFloat(e.target.value))); };
    const getLogValue = (luck: number) => Math.log10(Math.max(1, luck));

    const activeRarityVFX = inspectedItem ? inspectedItem.rarityId : getBestDrop(currentDrops)?.rarityId;
    const currentGlobalLuck = (1 + (stats.luckLevel * 0.2) + getCraftingBonuses(stats.equippedItems, 'GENERAL').bonusLuck) * luckMultiplier * trophyLuckMult;
    const currentMineLuck = ((1 + (stats.miningLuckLevel * 0.5)) + getCraftingBonuses(stats.equippedItems, 'MINING').bonusLuck) * trophyLuckMult;
    const currentFishLuck = ((1 + (stats.fishingLuckLevel * 0.5)) + getCraftingBonuses(stats.equippedItems, 'FISHING').bonusLuck) * trophyLuckMult;
    const currentHarvLuck = ((1 + (stats.harvestingLuckLevel * 0.5)) + getCraftingBonuses(stats.equippedItems, 'HARVESTING').bonusLuck) * trophyLuckMult;

    const toggleLock = (item: InventoryItem) => {
        setInventory(prev => prev.map(i => {
            if (i.text === item.text && i.rarityId === item.rarityId && i.variantId === item.variantId) return { ...i, locked: !i.locked };
            return i;
        }));
        audioService.playClick();
    };

    const formatProb = (p: number, variantMultiplier: number = 1) => {
        const levelLuck = 1 + (stats.luckLevel * 0.2);
        const genBonuses = getCraftingBonuses(stats.equippedItems, 'GENERAL');
        const totalLuck = luckMultiplier * (levelLuck + genBonuses.bonusLuck) * trophyLuckMult;
        const adjustedP = (p / totalLuck) * variantMultiplier;
        if (adjustedP >= 1000000000000) return `1 in ${Math.round(adjustedP / 1000000000000)}T`;
        if (adjustedP >= 1000000000) return `1 in ${Math.round(adjustedP / 1000000000 * 10) / 10}B`;
        if (adjustedP >= 1000000) return `1 in ${Math.round(adjustedP / 1000000 * 10) / 10}M`;
        if (adjustedP >= 1000) return `1 in ${Math.round(adjustedP / 1000 * 10) / 10}k`;
        if (adjustedP < 1) return T.UI.GUARANTEED;
        return `1 in ${Math.round(adjustedP)}`;
    };

    return (
        <div className="relative min-h-screen bg-background text-text selection:bg-text selection:text-background overflow-hidden flex">
            {activeRarityVFX && <SpecialEffects rarityId={activeRarityVFX} />}
            {inspectedItem && <ItemVisualizer item={inspectedItem} onClose={() => setInspectedItem(null)} />}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_300px] xl:grid-cols-[1fr_2fr_350px] w-full h-screen">

                {/* CENTER: RNG Game + Left Stats */}
                <div className="relative flex flex-col items-center justify-center col-span-1 lg:col-span-2 lg:border-r border-surface-highlight h-full">
                    <div className="absolute top-0 left-0 w-full p-6 z-20 pointer-events-none flex flex-col md:flex-row justify-between items-start gap-4">

                        <LeftPanel
                            stats={stats}
                            showExtendedStats={showExtendedStats}
                            setShowExtendedStats={setShowExtendedStats}
                            currentGlobalLuck={currentGlobalLuck}
                            autoSpinSpeed={autoSpinSpeed}
                            generalMulti={(stats.multiRollLevel || 1) + getCraftingBonuses(stats.equippedItems, 'GENERAL').bonusMulti}
                            currentMineLuck={currentMineLuck}
                            miningSpeed={miningSpeed}
                            currentFishLuck={currentFishLuck}
                            fishingSpeed={fishingSpeed}
                            currentHarvLuck={currentHarvLuck}
                            harvestingSpeed={harvestingSpeed}
                            dreamBonuses={dreamBonuses}
                            trophyLuckMult={trophyLuckMult}
                            onTicTacToeWin={handleTicTacToeWin}
                        />

                        {/* Top Right Buttons */}
                        <div className="flex flex-wrap justify-end gap-2 pointer-events-auto ml-auto">
                            <button onClick={toggleMute} className="border border-neutral-700 hover:border-white hover:text-white px-3 py-2 transition-all uppercase bg-black/50 backdrop-blur min-w-[40px]">{isMuted ? '🔇' : '🔊'}</button>
                            <button onClick={() => { audioService.playClick(); setModalsState(p => ({ ...p, isGachaOpen: true })); }} className="border border-purple-700 text-purple-400 hover:bg-purple-900/30 px-4 py-2 transition-all uppercase bg-black/50 backdrop-blur">GACHA</button>
                            <button onClick={() => { audioService.playClick(); setModalsState(p => ({ ...p, isCraftingOpen: true })); }} className="border border-green-700 text-green-500 hover:bg-green-900/30 px-4 py-2 transition-all uppercase bg-black/50 backdrop-blur">CRAFT</button>
                            <button onClick={() => { audioService.playClick(); setModalsState(p => ({ ...p, isCoinTossOpen: true })); }} className="border border-yellow-700 text-yellow-500 hover:bg-yellow-900/30 px-4 py-2 transition-all uppercase bg-black/50 backdrop-blur animate-pulse">FLIP</button>
                            <button onClick={() => { audioService.playClick(); setModalsState(p => ({ ...p, isAchievementsOpen: true })); }} className="border border-amber-700 text-amber-500 hover:bg-amber-900/30 px-4 py-2 transition-all uppercase bg-black/50 backdrop-blur">TITLES</button>
                            <button onClick={() => { audioService.playClick(); setModalsState(p => ({ ...p, isIndexOpen: true })); }} className="border border-indigo-900 text-indigo-400 hover:bg-indigo-900/30 hover:text-white px-4 py-2 transition-all uppercase bg-black/50 backdrop-blur">INDEX</button>
                            <button onClick={() => { audioService.playClick(); setModalsState(p => ({ ...p, isInventoryOpen: true })); }} className="border border-neutral-700 hover:border-white hover:text-white px-4 py-2 transition-all uppercase bg-black/50 backdrop-blur">{T.UI.INVENTORY} [{inventory.length}]</button>
                        </div>
                    </div>

                    <CenterPanel
                        stats={stats}
                        currentDrops={currentDrops}
                        isAutoSpinning={isAutoSpinning}
                        inspectedItem={inspectedItem}
                        autoSpinSpeed={autoSpinSpeed}
                        handleRoll={handleRoll}
                        handleBurstClick={handleBurstClick}
                        setIsAutoSpinning={setIsAutoSpinning}
                        generalMulti={(stats.multiRollLevel || 1) + getCraftingBonuses(stats.equippedItems, 'GENERAL').bonusMulti}
                        formatProb={formatProb}
                    />

                    {/* Footer */}
                    <div className="absolute bottom-0 w-full p-6 flex justify-between items-end z-20 pointer-events-none">
                        <div className="flex gap-4 items-center pointer-events-auto">
                            <div className="text-neutral-800 text-xs font-mono uppercase tracking-widest">v3.0.0 Refactored</div>
                            <button onClick={() => setModalsState(p => ({ ...p, isChangelogOpen: true }))} className="text-neutral-700 hover:text-white text-xs font-mono underline">CHANGELOG</button>
                        </div>
                        <button onClick={() => { audioService.playClick(); setModalsState(p => ({ ...p, isAdminOpen: true })); }} className="pointer-events-auto text-neutral-800 hover:text-neutral-500 text-xs font-mono uppercase transition-colors">[ {T.UI.SYSTEM_CONFIG} ]</button>
                    </div>
                </div>

                {/* RIGHT: Activity Panel */}
                <RightPanel
                    activeRightPanel={activeRightPanel}
                    setActiveRightPanel={setActiveRightPanel}
                    miningGame={miningGame}
                    fishingGame={fishingGame}
                    harvestingGame={harvestingGame}
                    dreamingGame={dreamingGame}
                    stats={stats}
                    luckMultiplier={luckMultiplier}
                    trophyLuckMult={trophyLuckMult}
                    dreamBonuses={dreamBonuses}
                    setIsOreInventoryOpen={(v) => setModalsState(p => ({ ...p, isOreInventoryOpen: v }))}
                    setIsFishInventoryOpen={(v) => setModalsState(p => ({ ...p, isFishInventoryOpen: v }))}
                    setIsPlantInventoryOpen={(v) => setModalsState(p => ({ ...p, isPlantInventoryOpen: v }))}
                    setIsDreamInventoryOpen={(v) => setModalsState(p => ({ ...p, isDreamInventoryOpen: v }))}
                />
            </div>

            <GameModals
                stats={stats}
                inventory={inventory}
                miningGame={miningGame}
                fishingGame={fishingGame}
                harvestingGame={harvestingGame}
                dreamingGame={dreamingGame}
                modalsState={modalsState}
                setModalsState={setModalsState}
                handlers={{
                    handleInspectItem, handleInspectResource, toggleLock, toggleResourceLock,
                    handleSellResources, handleSellDreams, handleCraftItem, handleEquipItem,
                    handleUnequipItem, handleIndexSelectItem, setStats
                }}
            />

            {/* Admin Panel Modal (Kept in App for direct access to debug states) */}
            {modalsState.isAdminOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-surface border border-border p-6 rounded-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 border-b border-border pb-2">
                            <h2 className="text-xl font-mono text-text tracking-wider">{T.UI.SYSTEM_CONFIG}</h2>
                            <button onClick={() => setModalsState(p => ({ ...p, isAdminOpen: false }))} className="text-text-dim hover:text-text">[X]</button>
                        </div>
                        <div className="space-y-8">
                            <div className="space-y-2 pt-2">
                                <div className="text-sm font-mono text-white font-bold">THEME CONFIG</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {THEMES.map(theme => (
                                        <button key={theme.id} onClick={() => setCurrentTheme(theme.id)} className={`p-2 text-xs border rounded transition-colors ${currentTheme === theme.id ? 'bg-white text-black border-white' : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-neutral-500'}`}>{theme.name}</button>
                                    ))}
                                </div>
                            </div>
                            {/* Debug Tools */}
                            <div className="space-y-2 border-t border-border pt-4">
                                <div className="text-sm font-mono text-white font-bold">DEBUG TOOLS</div>
                                <div className="flex justify-between text-sm font-mono text-neutral-400"><label>{T.UI.SPEED}</label><span className="text-white">{autoSpinSpeed}ms</span></div>
                                <input type="range" min="5" max="1000" step="5" value={autoSpinSpeed} onChange={(e) => setAutoSpinSpeed(Number(e.target.value))} className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white" />
                                <div className="flex justify-between text-sm font-mono text-neutral-400 mt-2"><label>LUCK (Log Scale)</label><span className="text-yellow-500 font-bold">{Math.round(luckMultiplier).toLocaleString()}x</span></div>
                                <input type="range" min="0" max="12" step="0.1" value={getLogValue(luckMultiplier)} onChange={handleLogSliderChange} className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                            </div>
                            <div className="pt-4 border-t border-neutral-800">
                                <div className="grid grid-cols-3 gap-2">
                                    <button onClick={() => { setAutoSpinSpeed(150); setLuckMultiplier(1); setMiningLuckMultiplier(1); setFishingLuckMultiplier(1); setHarvestingLuckMultiplier(1); }} className="text-xs border border-neutral-700 p-2 hover:bg-neutral-800 text-neutral-400">{T.UI.RESET}</button>
                                    <button onClick={() => { setAutoSpinSpeed(50); setLuckMultiplier(1000); setMiningLuckMultiplier(100); setFishingLuckMultiplier(100); setHarvestingLuckMultiplier(100); }} className="text-xs border border-neutral-700 p-2 hover:bg-neutral-800 text-neutral-400">{T.UI.LUCKY}</button>
                                    <button onClick={() => { setAutoSpinSpeed(20); setLuckMultiplier(1000000000); setMiningLuckMultiplier(1000000); setFishingLuckMultiplier(1000000); setHarvestingLuckMultiplier(1000000); }} className="text-xs border border-neutral-700 p-2 hover:bg-neutral-800 text-yellow-600 border-yellow-900">{T.UI.GOD_MODE}</button>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-neutral-800 space-y-2">
                                <button onClick={() => { setStats(prev => ({ ...prev, unlockedAchievements: ACHIEVEMENTS.map(a => a.id) })); audioService.playRaritySound(RarityId.LEGENDARY); }} className="w-full text-xs text-green-800 hover:text-green-500 p-2 border border-green-900/30 hover:border-green-600 transition-colors">UNLOCK ALL TITLES</button>
                                <button onClick={() => { if (confirm("Clear all save data?")) { localStorage.clear(); window.location.reload(); } }} className="w-full text-xs text-red-800 hover:text-red-500 p-2 border border-red-900/30 hover:border-red-600 transition-colors">WIPE DATA</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Flash Effect */}
            {activeRarityVFX && activeRarityVFX >= RarityId.DIVINE && (
                <div key={Date.now()} className="absolute inset-0 bg-white pointer-events-none animate-flash z-40 mix-blend-overlay opacity-50" />
            )}

            <style>{`
        @keyframes flash { 0% { opacity: 0.8; } 100% { opacity: 0; } }
        .animate-flash { animation: flash 0.5s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.2s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
        </div>
    );
}