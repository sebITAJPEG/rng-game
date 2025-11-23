
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, Drop, InventoryItem, RarityId, ItemData, VariantId, OreInventoryItem, FishInventoryItem, PlantInventoryItem } from './types';
import { RARITY_TIERS, TRANSLATIONS, VARIANTS, ACHIEVEMENTS, SPEED_TIERS, ENTROPY_THRESHOLD, BURST_COST, MINING_SPEEDS, ORES, FISHING_SPEEDS, FISH, HARVESTING_SPEEDS, PLANTS } from './constants';
import { generateDrop } from './services/rngService';
import { mineOre } from './services/miningService';
import { catchFish } from './services/fishingService';
import { harvestPlant } from './services/harvestingService';
import { audioService } from './services/audioService';
import { RarityBadge } from './components/RarityBadge';
import { Inventory } from './components/Inventory';
import { SpecialEffects } from './components/SpecialEffects';
import { Shop } from './components/Shop';
import { Changelog } from './components/Changelog';
import { ItemVisualizer } from './components/ItemVisualizer';
import { IndexCatalog } from './components/IndexCatalog';
import { Achievements } from './components/Achievements';
import { CoinToss } from './components/CoinToss';
import { EntropyBar } from './components/EntropyBar';
import { MiningPanel } from './components/MiningPanel';
import { FishingPanel } from './components/FishingPanel';
import { HarvestingPanel } from './components/HarvestingPanel';
import { GachaTerminal } from './components/GachaTerminal';
import { SignalInterceptor } from './components/SignalInterceptor';
import { useSubGame } from './hooks/useSubGame';
import { ResourceInventory } from './components/ResourceInventory';
import { THEMES, applyTheme } from './themes';

export default function App() {
    // State
    const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('textbound_theme') || 'default');
    const [currentDrops, setCurrentDrops] = useState<Drop[]>([]);

    const [stats, setStats] = useState<GameStats>(() => {
        const saved = localStorage.getItem('textbound_stats');
        if (saved) {
            const parsed = JSON.parse(saved);
            let bestRarity = parsed.bestRarityFound || RarityId.COMMON;
            if (bestRarity > RarityId.THE_ONE) bestRarity = RarityId.THE_ONE;

            return {
                totalRolls: parsed.totalRolls || 0,
                balance: parsed.balance ?? parsed.totalRolls ?? 0,
                startTime: parsed.startTime || Date.now(),
                bestRarityFound: bestRarity,
                multiRollLevel: parsed.multiRollLevel || 1,
                speedLevel: parsed.speedLevel || 0,
                luckLevel: parsed.luckLevel || 0,
                entropy: parsed.entropy || 0,
                hasBurst: parsed.hasBurst || false,
                unlockedAchievements: parsed.unlockedAchievements || [],
                equippedTitle: parsed.equippedTitle || null,
                totalMined: parsed.totalMined || 0,
                bestOreMined: parsed.bestOreMined || 0,
                miningSpeedLevel: parsed.miningSpeedLevel || 0,
                miningLuckLevel: parsed.miningLuckLevel || 0,
                miningMultiLevel: parsed.miningMultiLevel || 1,
                totalFished: parsed.totalFished || 0,
                bestFishCaught: parsed.bestFishCaught || 0,
                fishingSpeedLevel: parsed.fishingSpeedLevel || 0,
                fishingLuckLevel: parsed.fishingLuckLevel || 0,
                fishingMultiLevel: parsed.fishingMultiLevel || 1,
                totalHarvested: parsed.totalHarvested || 0,
                bestPlantHarvested: parsed.bestPlantHarvested || 0,
                harvestingSpeedLevel: parsed.harvestingSpeedLevel || 0,
                harvestingLuckLevel: parsed.harvestingLuckLevel || 0,
                harvestingMultiLevel: parsed.harvestingMultiLevel || 1,
                gachaCredits: parsed.gachaCredits || 0,
                signalBuff: parsed.signalBuff || null
            };
        }
        return {
            totalRolls: 0,
            balance: 0,
            startTime: Date.now(),
            bestRarityFound: RarityId.COMMON,
            multiRollLevel: 1,
            speedLevel: 0,
            luckLevel: 0,
            entropy: 0,
            hasBurst: false,
            unlockedAchievements: [],
            equippedTitle: null,
            totalMined: 0,
            bestOreMined: 0,
            miningSpeedLevel: 0,
            miningLuckLevel: 0,
            miningMultiLevel: 1,
            totalFished: 0,
            bestFishCaught: 0,
            fishingSpeedLevel: 0,
            fishingLuckLevel: 0,
            fishingMultiLevel: 1,
            totalHarvested: 0,
            bestPlantHarvested: 0,
            harvestingSpeedLevel: 0,
            harvestingLuckLevel: 0,
            harvestingMultiLevel: 1,
            gachaCredits: 0,
            signalBuff: null
        };
    });

    const [inventory, setInventory] = useState<InventoryItem[]>(() => {
        const saved = localStorage.getItem('textbound_inventory');
        const items = saved ? JSON.parse(saved) : [];
        return items.filter((i: any) => i.rarityId <= RarityId.THE_ONE);
    });

    // UI State
    const [isAutoSpinning, setIsAutoSpinning] = useState(false);
    const [activeRightPanel, setActiveRightPanel] = useState<'MINING' | 'FISHING' | 'HARVESTING'>('MINING');

    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [isOreInventoryOpen, setIsOreInventoryOpen] = useState(false);
    const [isFishInventoryOpen, setIsFishInventoryOpen] = useState(false);
    const [isPlantInventoryOpen, setIsPlantInventoryOpen] = useState(false);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [isShopOpen, setIsShopOpen] = useState(false);
    const [isChangelogOpen, setIsChangelogOpen] = useState(false);
    const [isIndexOpen, setIsIndexOpen] = useState(false);
    const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
    const [isCoinTossOpen, setIsCoinTossOpen] = useState(false);
    const [isGachaOpen, setIsGachaOpen] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // Visualizer State
    const [inspectedItem, setInspectedItem] = useState<(ItemData & { rarityId: RarityId, variantId?: VariantId }) | null>(null);

    // Settings State
    const [autoSpinSpeed, setAutoSpinSpeed] = useState(SPEED_TIERS[stats.speedLevel]?.ms || 250);
    const [luckMultiplier, setLuckMultiplier] = useState(1);

    // Sub-game Settings (Debug)
    const [miningLuckMultiplier, setMiningLuckMultiplier] = useState(1);
    const [miningSpeed, setMiningSpeed] = useState(1000);

    const [fishingSpeed, setFishingSpeed] = useState(1200);
    const [fishingLuckMultiplier, setFishingLuckMultiplier] = useState(1);

    const [harvestingSpeed, setHarvestingSpeed] = useState(1100);
    const [harvestingLuckMultiplier, setHarvestingLuckMultiplier] = useState(1);

    // Filters / Thresholds
    const [autoStopRarity, setAutoStopRarity] = useState<RarityId>(() => {
        const saved = localStorage.getItem('textbound_settings_autostop');
        const val = saved ? parseInt(saved) : RarityId.DIVINE;
        return val > RarityId.THE_ONE ? RarityId.THE_ONE : val;
    });

    const [showSignalInterceptor, setShowSignalInterceptor] = useState(() => {
        const saved = localStorage.getItem('textbound_settings_signal');
        return saved !== null ? JSON.parse(saved) : true;
    });

    // Derived Translations
    const T = TRANSLATIONS['en'];

    // Refs
    const autoSpinRef = useRef<number | null>(null);
    const timerRef = useRef<number | null>(null);

    // Persistence
    useEffect(() => {
        localStorage.setItem('textbound_stats', JSON.stringify(stats));
    }, [stats]);

    useEffect(() => {
        localStorage.setItem('textbound_inventory', JSON.stringify(inventory));
    }, [inventory]);

    useEffect(() => {
        localStorage.setItem('textbound_settings_autostop', autoStopRarity.toString());
    }, [autoStopRarity]);

    useEffect(() => {
        localStorage.setItem('textbound_settings_signal', JSON.stringify(showSignalInterceptor));
    }, [showSignalInterceptor]);

    // Apply theme
    useEffect(() => {
        applyTheme(currentTheme);
        localStorage.setItem('textbound_theme', currentTheme);
    }, [currentTheme]);

    // Sync Speed with Stats
    useEffect(() => {
        setAutoSpinSpeed(SPEED_TIERS[stats.speedLevel]?.ms || 250);
        setMiningSpeed(MINING_SPEEDS[Math.min(stats.miningSpeedLevel || 0, MINING_SPEEDS.length - 1)] || 1000);
        setFishingSpeed(FISHING_SPEEDS[Math.min(stats.fishingSpeedLevel || 0, FISHING_SPEEDS.length - 1)] || 1200);
        setHarvestingSpeed(HARVESTING_SPEEDS[Math.min(stats.harvestingSpeedLevel || 0, HARVESTING_SPEEDS.length - 1)] || 1100);
    }, [stats.speedLevel, stats.miningSpeedLevel, stats.fishingSpeedLevel, stats.harvestingSpeedLevel]);

    // Force update UI every second if there is a buff to update timer
    useEffect(() => {
        if (stats.signalBuff) {
            timerRef.current = window.setInterval(() => {
                if (stats.signalBuff && Date.now() > stats.signalBuff.endTime) {
                    setStats(prev => ({ ...prev, signalBuff: null }));
                } else {
                    setStats(prev => ({ ...prev }));
                }
            }, 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [stats.signalBuff]);

    // --- SUB-GAMES HOOKS ---

    const miningGame = useSubGame<any, OreInventoryItem>({
        storageKey: 'textbound_ore_inventory',
        dropFn: mineOre,
        playSound: audioService.playMineSound.bind(audioService),
        speed: miningSpeed,
        luck: miningLuckMultiplier * (1 + (stats.miningLuckLevel * 0.5)),
        multi: stats.miningMultiLevel || 1,
        thresholds: { boom: 30, rare: 10, boomDivisor: 6 }
    }, {
        onUpdate: (count, bestId, gacha) => setStats(prev => ({
            ...prev,
            totalMined: (prev.totalMined || 0) + count,
            bestOreMined: Math.max(prev.bestOreMined || 0, bestId),
            gachaCredits: prev.gachaCredits + gacha
        })),
        playBoom: audioService.playBoom.bind(audioService),
        playRare: audioService.playRaritySound.bind(audioService),
        playCoinWin: audioService.playCoinWin.bind(audioService)
    });

    const fishingGame = useSubGame<any, FishInventoryItem>({
        storageKey: 'textbound_fish_inventory',
        dropFn: catchFish,
        playSound: audioService.playFishSound.bind(audioService),
        speed: fishingSpeed,
        luck: fishingLuckMultiplier * (1 + (stats.fishingLuckLevel * 0.5)),
        multi: stats.fishingMultiLevel || 1,
        thresholds: { boom: 25, rare: 15, boomDivisor: 3 }
    }, {
        onUpdate: (count, bestId, gacha) => setStats(prev => ({
            ...prev,
            totalFished: (prev.totalFished || 0) + count,
            bestFishCaught: Math.max(prev.bestFishCaught || 0, bestId),
            gachaCredits: prev.gachaCredits + gacha
        })),
        playBoom: audioService.playBoom.bind(audioService),
        playRare: audioService.playRaritySound.bind(audioService),
        playCoinWin: audioService.playCoinWin.bind(audioService)
    });

    const harvestingGame = useSubGame<any, PlantInventoryItem>({
        storageKey: 'textbound_plant_inventory',
        dropFn: harvestPlant,
        playSound: audioService.playHarvestSound.bind(audioService),
        speed: harvestingSpeed,
        luck: harvestingLuckMultiplier * (1 + (stats.harvestingLuckLevel * 0.5)),
        multi: stats.harvestingMultiLevel || 1,
        thresholds: { boom: 25, rare: 15, boomDivisor: 3 }
    }, {
        onUpdate: (count, bestId, gacha) => setStats(prev => ({
            ...prev,
            totalHarvested: (prev.totalHarvested || 0) + count,
            bestPlantHarvested: Math.max(prev.bestPlantHarvested || 0, bestId),
            gachaCredits: prev.gachaCredits + gacha
        })),
        playBoom: audioService.playBoom.bind(audioService),
        playRare: audioService.playRaritySound.bind(audioService),
        playCoinWin: audioService.playCoinWin.bind(audioService)
    });

    // Achievement Checker
    useEffect(() => {
        const newUnlocks: string[] = [];
        ACHIEVEMENTS.forEach(ach => {
            if (!stats.unlockedAchievements.includes(ach.id)) {
                if (ach.condition(stats, inventory)) {
                    newUnlocks.push(ach.id);
                }
            }
        });

        if (newUnlocks.length > 0) {
            audioService.playRaritySound(RarityId.LEGENDARY);
            setStats(prev => ({
                ...prev,
                unlockedAchievements: [...prev.unlockedAchievements, ...newUnlocks]
            }));
        }
    }, [stats, inventory]);

    // Handle Mute Toggle
    const toggleMute = () => {
        const newState = !isMuted;
        setIsMuted(newState);
        audioService.toggleMute(newState);
    };

    // Helper to find best drop in a batch
    const getBestDrop = (drops: Drop[]) => {
        if (drops.length === 0) return null;
        return drops.reduce((prev, current) => (current.rarityId > prev.rarityId ? current : prev), drops[0]);
    };

    const toggleResourceLock = (type: 'ORES' | 'FISH' | 'PLANTS', id: number) => {
        if (type === 'ORES') {
            miningGame.setInventory(prev => prev.map(i => i.id === id ? { ...i, locked: !i.locked } : i));
        } else if (type === 'FISH') {
            fishingGame.setInventory(prev => prev.map(i => i.id === id ? { ...i, locked: !i.locked } : i));
        } else {
            harvestingGame.setInventory(prev => prev.map(i => i.id === id ? { ...i, locked: !i.locked } : i));
        }
        audioService.playClick();
    };

    const handleSellResources = (type: 'ORES' | 'FISH' | 'PLANTS') => {
        let totalValue = 0;
        let setInv: any;
        let currentInv: any[];
        let defs: any[];
        let divisor: number;

        if (type === 'ORES') {
            currentInv = miningGame.inventory;
            setInv = miningGame.setInventory;
            defs = ORES;
            divisor = 5;
        } else if (type === 'FISH') {
            currentInv = fishingGame.inventory;
            setInv = fishingGame.setInventory;
            defs = FISH;
            divisor = 4;
        } else {
            currentInv = harvestingGame.inventory;
            setInv = harvestingGame.setInventory;
            defs = PLANTS;
            divisor = 4.5;
        }

        currentInv.forEach(item => {
            if (item.locked) return;
            const def = defs.find(d => d.id === item.id);
            if (def) {
                totalValue += Math.max(1, Math.floor(def.probability / divisor)) * item.count;
            }
        });

        if (totalValue > 0) {
            audioService.playCoinWin(5);
            setStats(prev => ({ ...prev, balance: prev.balance + totalValue }));
            setInv((prev: any[]) => prev.filter(i => i.locked));
        }
    };

    // --- SIGNAL LOGIC ---
    const handleSignalDecrypt = (multiplier: number, duration: number) => {
        setStats(prev => ({
            ...prev,
            signalBuff: {
                multiplier,
                endTime: Date.now() + duration,
                id: Date.now()
            }
        }));
    };

    // --- MAIN GAME LOGIC ---
    const handleRoll = useCallback((manualBatchSize?: number) => {
        if (!manualBatchSize) audioService.playRollSound();
        const rollsToPerform = manualBatchSize || stats.multiRollLevel;
        const generatedDrops: Drop[] = [];
        let currentEntropy = stats.entropy;

        const levelLuck = 1 + (stats.luckLevel * 0.2);
        const signalLuck = (stats.signalBuff && Date.now() < stats.signalBuff.endTime) ? stats.signalBuff.multiplier : 1;
        const effectiveBaseLuck = luckMultiplier * levelLuck * signalLuck;
        let effectiveLuck = effectiveBaseLuck;

        let consumedPity = false;
        if (currentEntropy >= ENTROPY_THRESHOLD) {
            effectiveLuck = effectiveBaseLuck * 500;
            consumedPity = true;
        }

        for (let i = 0; i < rollsToPerform; i++) {
            const useLuck = (i === 0 && consumedPity) ? effectiveLuck : effectiveBaseLuck;
            const drop = generateDrop(stats.totalRolls + i, useLuck);
            generatedDrops.push(drop);

            if (drop.rarityId >= RarityId.LEGENDARY) {
                currentEntropy = 0;
                consumedPity = false;
            } else {
                if (!consumedPity) currentEntropy++;
                else currentEntropy = 0;
            }
        }

        const bestDrop = getBestDrop(generatedDrops);
        if (!bestDrop) return;
        setCurrentDrops(generatedDrops);
        batchUpdateStatsAndInventory(generatedDrops, rollsToPerform, currentEntropy);
        audioService.playBoom(bestDrop.rarityId);
    }, [stats.totalRolls, stats.multiRollLevel, stats.entropy, luckMultiplier, stats.luckLevel, stats.signalBuff]);

    const batchUpdateStatsAndInventory = (drops: Drop[], rollsCount: number, finalEntropy: number) => {
        let creditsFound = 0;
        if (Math.random() < (0.001 * rollsCount)) creditsFound = 1;

        setStats(prev => {
            const maxRarityInBatch = Math.max(...drops.map(d => d.rarityId));
            return {
                ...prev,
                totalRolls: prev.totalRolls + rollsCount,
                balance: prev.balance + rollsCount,
                bestRarityFound: Math.max(prev.bestRarityFound, maxRarityInBatch),
                entropy: finalEntropy,
                gachaCredits: prev.gachaCredits + creditsFound
            };
        });

        if (creditsFound > 0) audioService.playCoinWin(3);
        if (drops.some(d => d.rarityId >= autoStopRarity)) setIsAutoSpinning(false);

        setInventory(prev => {
            let newInv = [...prev];
            drops.forEach(drop => {
                // Save all items (Common, Uncommon, Rare, and above)
                const existingIndex = newInv.findIndex(i =>
                    i.text === drop.text &&
                    i.rarityId === drop.rarityId &&
                    i.variantId === drop.variantId
                );
                if (existingIndex >= 0) {
                    newInv[existingIndex].count += 1;
                } else {
                    newInv.push({
                        text: drop.text,
                        description: drop.description,
                        rarityId: drop.rarityId,
                        variantId: drop.variantId,
                        count: 1,
                        discoveredAt: Date.now()
                    });
                }
            });
            return newInv;
        });
    };

    const handleInspectItem = (item: InventoryItem) => {
        audioService.playClick();
        setIsAutoSpinning(false);
        setInspectedItem({
            text: item.text,
            description: item.description,
            rarityId: item.rarityId,
            variantId: item.variantId,
            cutscenePhrase: ''
        });
        setIsInventoryOpen(false);
    };

    const handleIndexSelectItem = (item: ItemData, rarityId: RarityId) => {
        audioService.playClick();
        setIsAutoSpinning(false);
        setInspectedItem({
            text: item.text,
            description: item.description,
            rarityId: rarityId,
            cutscenePhrase: item.cutscenePhrase
        });
    };

    // Shop Actions
    const handleBuyMultiRoll = (cost: number) => {
        if (stats.balance >= cost) {
            audioService.playRaritySound(RarityId.EPIC);
            setStats(prev => ({ ...prev, balance: prev.balance - cost, multiRollLevel: prev.multiRollLevel + 1 }));
        }
    };

    const handleBuySpeed = (cost: number) => {
        if (stats.balance >= cost) {
            audioService.playRaritySound(RarityId.EPIC);
            setStats(prev => ({ ...prev, balance: prev.balance - cost, speedLevel: prev.speedLevel + 1 }));
        }
    };

    const handleBuyBurst = () => {
        if (stats.balance >= BURST_COST) {
            audioService.playRaritySound(RarityId.LEGENDARY);
            setStats(prev => ({ ...prev, balance: prev.balance - BURST_COST, hasBurst: true }));
        }
    };

    const handleBuyLuck = (cost: number) => {
        if (stats.balance >= cost) {
            audioService.playRaritySound(RarityId.EPIC);
            setStats(prev => ({ ...prev, balance: prev.balance - cost, luckLevel: prev.luckLevel + 1 }));
        }
    };

    // Sub-game Buy Handlers
    const handleBuyMiningSpeed = (cost: number) => {
        if (stats.balance >= cost) {
            audioService.playRaritySound(RarityId.EPIC);
            setStats(prev => ({ ...prev, balance: prev.balance - cost, miningSpeedLevel: (prev.miningSpeedLevel || 0) + 1 }));
        }
    };
    const handleBuyMiningLuck = (cost: number) => {
        if (stats.balance >= cost) {
            audioService.playRaritySound(RarityId.EPIC);
            setStats(prev => ({ ...prev, balance: prev.balance - cost, miningLuckLevel: (prev.miningLuckLevel || 0) + 1 }));
        }
    };
    const handleBuyMiningMulti = (cost: number) => {
        if (stats.balance >= cost) {
            audioService.playRaritySound(RarityId.LEGENDARY);
            setStats(prev => ({ ...prev, balance: prev.balance - cost, miningMultiLevel: (prev.miningMultiLevel || 1) + 1 }));
        }
    };
    const handleBuyFishingSpeed = (cost: number) => {
        if (stats.balance >= cost) {
            audioService.playRaritySound(RarityId.EPIC);
            setStats(prev => ({ ...prev, balance: prev.balance - cost, fishingSpeedLevel: (prev.fishingSpeedLevel || 0) + 1 }));
        }
    };
    const handleBuyFishingLuck = (cost: number) => {
        if (stats.balance >= cost) {
            audioService.playRaritySound(RarityId.EPIC);
            setStats(prev => ({ ...prev, balance: prev.balance - cost, fishingLuckLevel: (prev.fishingLuckLevel || 0) + 1 }));
        }
    };
    const handleBuyFishingMulti = (cost: number) => {
        if (stats.balance >= cost) {
            audioService.playRaritySound(RarityId.LEGENDARY);
            setStats(prev => ({ ...prev, balance: prev.balance - cost, fishingMultiLevel: (prev.fishingMultiLevel || 1) + 1 }));
        }
    };
    const handleBuyHarvestingSpeed = (cost: number) => {
        if (stats.balance >= cost) {
            audioService.playRaritySound(RarityId.EPIC);
            setStats(prev => ({ ...prev, balance: prev.balance - cost, harvestingSpeedLevel: (prev.harvestingSpeedLevel || 0) + 1 }));
        }
    };
    const handleBuyHarvestingLuck = (cost: number) => {
        if (stats.balance >= cost) {
            audioService.playRaritySound(RarityId.EPIC);
            setStats(prev => ({ ...prev, balance: prev.balance - cost, harvestingLuckLevel: (prev.harvestingLuckLevel || 0) + 1 }));
        }
    };
    const handleBuyHarvestingMulti = (cost: number) => {
        if (stats.balance >= cost) {
            audioService.playRaritySound(RarityId.LEGENDARY);
            setStats(prev => ({ ...prev, balance: prev.balance - cost, harvestingMultiLevel: (prev.harvestingMultiLevel || 1) + 1 }));
        }
    };

    const handleBurstClick = () => {
        audioService.playClick();
        handleRoll(50);
    };

    // Auto Spin Effect
    useEffect(() => {
        if (isAutoSpinning && !inspectedItem) {
            autoSpinRef.current = window.setInterval(() => handleRoll(), autoSpinSpeed);
        } else {
            if (autoSpinRef.current) clearInterval(autoSpinRef.current);
            autoSpinRef.current = null;
        }
        return () => {
            if (autoSpinRef.current) clearInterval(autoSpinRef.current);
        };
    }, [isAutoSpinning, handleRoll, autoSpinSpeed, inspectedItem]);

    const formatProb = (p: number, variantMultiplier: number = 1) => {
        const levelLuck = 1 + (stats.luckLevel * 0.2);
        const signalLuck = (stats.signalBuff && Date.now() < stats.signalBuff.endTime) ? stats.signalBuff.multiplier : 1;
        const totalLuck = luckMultiplier * levelLuck * signalLuck;
        const adjustedP = (p / totalLuck) * variantMultiplier;

        if (adjustedP >= 1000000000000) return `1 in ${Math.round(adjustedP / 1000000000000)}T`;
        if (adjustedP >= 1000000000) return `1 in ${Math.round(adjustedP / 1000000000 * 10) / 10}B`;
        if (adjustedP >= 1000000) return `1 in ${Math.round(adjustedP / 1000000 * 10) / 10}M`;
        if (adjustedP >= 1000) return `1 in ${Math.round(adjustedP / 1000 * 10) / 10}k`;
        if (adjustedP < 1) return T.UI.GUARANTEED;
        return `1 in ${Math.round(adjustedP)}`;
    };

    const handleLogSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLuckMultiplier(Math.pow(10, parseFloat(e.target.value)));
    };

    const getLogValue = (luck: number) => Math.log10(Math.max(1, luck));

    const activeRarityVFX = inspectedItem ? inspectedItem.rarityId : getBestDrop(currentDrops)?.rarityId;
    const tierOptions = Object.values(RARITY_TIERS).sort((a, b) => a.id - b.id);
    const hasSignalBuff = stats.signalBuff && Date.now() < stats.signalBuff.endTime;
    const timeLeft = hasSignalBuff ? Math.ceil((stats.signalBuff!.endTime - Date.now()) / 1000) : 0;

    const toggleLock = (item: InventoryItem) => {
        setInventory(prev => prev.map(i => {
            if (i.text === item.text && i.rarityId === item.rarityId && i.variantId === item.variantId) {
                return { ...i, locked: !i.locked };
            }
            return i;
        }));
        audioService.playClick();
    };

    return (
        <div className="relative min-h-screen bg-background text-text selection:bg-text selection:text-background overflow-hidden flex">

            {activeRarityVFX && <SpecialEffects rarityId={activeRarityVFX} />}

            {inspectedItem && (
                <ItemVisualizer
                    item={inspectedItem}
                    onClose={() => setInspectedItem(null)}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_300px] xl:grid-cols-[1fr_2fr_350px] w-full h-screen">

                {/* CENTER: RNG Game */}
                <div className="relative flex flex-col items-center justify-center col-span-1 lg:col-span-2 lg:border-r border-surface-highlight h-full">

                    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 font-mono text-xs md:text-sm text-text-dim pointer-events-none">
                        <div className="space-y-1 pointer-events-auto">
                            <p>{T.UI.ROLLS}: <span className="text-text">{stats.totalRolls.toLocaleString()}</span></p>
                            <p>BALANCE: <span className="text-yellow-500">{stats.balance.toLocaleString()}</span></p>
                            <p>CREDITS: <span className="text-purple-400">{stats.gachaCredits}</span></p>
                            <p>{T.UI.BEST}: <span className={`${RARITY_TIERS[stats.bestRarityFound]?.textColor || 'text-text'}`}>{T.RARITY_NAMES[stats.bestRarityFound]}</span></p>
                            {stats.equippedTitle && (
                                <p>TITLE: <span className="text-yellow-400 font-bold border-b border-yellow-600">{stats.equippedTitle}</span></p>
                            )}
                            {hasSignalBuff && (
                                <p className="text-green-400 font-bold animate-pulse">SIGNAL BOOST: {stats.signalBuff!.multiplier}x ({timeLeft}s)</p>
                            )}
                        </div>

                        <div className="flex flex-wrap justify-end gap-2 pointer-events-auto">
                            <button onClick={toggleMute} className="border border-neutral-700 hover:border-white hover:text-white px-3 py-2 transition-all uppercase bg-black/50 backdrop-blur min-w-[40px]">
                                {isMuted ? '🔇' : '🔊'}
                            </button>
                            <button onClick={() => { audioService.playClick(); setIsGachaOpen(true); }} className="border border-purple-700 text-purple-400 hover:bg-purple-900/30 px-4 py-2 transition-all uppercase bg-black/50 backdrop-blur">
                                GACHA
                            </button>
                            <button onClick={() => { audioService.playClick(); setIsCoinTossOpen(true); }} className="border border-yellow-700 text-yellow-500 hover:bg-yellow-900/30 px-4 py-2 transition-all uppercase bg-black/50 backdrop-blur animate-pulse">
                                FLIP
                            </button>
                            <button onClick={() => { audioService.playClick(); setIsAchievementsOpen(true); }} className="border border-amber-700 text-amber-500 hover:bg-amber-900/30 px-4 py-2 transition-all uppercase bg-black/50 backdrop-blur">
                                TITLES
                            </button>
                            <button onClick={() => { audioService.playClick(); setIsIndexOpen(true); }} className="border border-indigo-900 text-indigo-400 hover:bg-indigo-900/30 hover:text-white px-4 py-2 transition-all uppercase bg-black/50 backdrop-blur">
                                INDEX
                            </button>
                            <button onClick={() => { audioService.playClick(); setIsShopOpen(true); }} className="border border-yellow-700 text-yellow-500 hover:bg-yellow-900/30 px-4 py-2 transition-all uppercase bg-black/50 backdrop-blur">
                                SHOP
                            </button>
                            <button onClick={() => { audioService.playClick(); setIsInventoryOpen(true); }} className="border border-neutral-700 hover:border-white hover:text-white px-4 py-2 transition-all uppercase bg-black/50 backdrop-blur">
                                {T.UI.INVENTORY} [{inventory.length}]
                            </button>
                        </div>
                    </div>

                    <div className="z-10 w-full max-w-4xl px-6 flex flex-col items-center justify-center space-y-8 mt-8">

                        <div className="w-full flex justify-center">
                            <EntropyBar value={stats.entropy} />
                        </div>

                        <div className="min-h-[300px] w-full flex items-center justify-center perspective-1000">
                            {currentDrops.length > 0 ? (
                                <div className={`
                            w-full grid gap-8 items-center justify-center
                            ${currentDrops.length === 1 ? 'grid-cols-1' : ''}
                            ${currentDrops.length >= 2 && currentDrops.length <= 4 ? 'grid-cols-1 md:grid-cols-2' : ''}
                            ${currentDrops.length > 4 && currentDrops.length <= 6 ? 'grid-cols-2 md:grid-cols-3' : ''}
                            ${currentDrops.length > 6 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' : ''}
                        `}>
                                    {currentDrops.map((drop, idx) => {
                                        const tier = RARITY_TIERS[drop.rarityId];
                                        const variant = VARIANTS[drop.variantId || VariantId.NONE];
                                        const isTheOne = drop.rarityId === RarityId.THE_ONE;
                                        const textColorClass = isTheOne ? "text-black drop-shadow-none" : tier.textColor;
                                        const descColorClass = isTheOne ? "text-neutral-600" : "text-neutral-400";
                                        const hasVariant = (drop.variantId ?? VariantId.NONE) !== VariantId.NONE;
                                        const isLargeBatch = currentDrops.length > 6;

                                        return (
                                            <div key={`${drop.rollNumber}-${idx}`} className="flex flex-col items-center text-center animate-fade-in-up relative z-10">
                                                <div className="mb-2 md:mb-4">
                                                    <RarityBadge rarityId={drop.rarityId} variantId={drop.variantId} size="sm" label={T.RARITY_NAMES[drop.rarityId]} />
                                                    <p className={`text-[10px] mt-1 font-mono tracking-widest mix-blend-difference ${isTheOne ? 'text-black' : 'text-neutral-500'}`}>
                                                        {formatProb(tier.probability, variant.multiplier)}
                                                    </p>
                                                </div>

                                                <h1 className={`
                                            font-bold tracking-tight leading-tight transition-all duration-75 mb-2 md:mb-4
                                            ${textColorClass} ${hasVariant ? variant.styleClass : ''}
                                            ${currentDrops.length === 1 ? 'text-3xl md:text-5xl lg:text-6xl' : ''}
                                            ${currentDrops.length > 1 && !isLargeBatch ? 'text-xl md:text-2xl' : ''}
                                            ${isLargeBatch ? 'text-sm md:text-base lg:text-lg' : ''}
                                        `}
                                                    style={{
                                                        textShadow: !isTheOne && !hasVariant && tier.id >= RarityId.MYTHICAL ? `0 0 20px ${tier.shadowColor}` : undefined,
                                                        transform: tier.id >= RarityId.DIVINE ? 'scale(1.05)' : 'scale(1)'
                                                    }}>
                                                    "{hasVariant ? variant.prefix : ''} {drop.text}"
                                                </h1>

                                                {drop.description && (
                                                    <p className={`font-mono ${descColorClass} ${currentDrops.length === 1 ? 'text-sm md:text-base max-w-lg' : ''} ${currentDrops.length > 1 && !isLargeBatch ? 'text-[10px] max-w-[150px]' : ''} ${isLargeBatch ? 'text-[9px] hidden md:block max-w-[120px]' : ''}`}>
                                                        {drop.description}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <h1 className="text-4xl text-neutral-800 animate-pulse">{T.UI.READY}</h1>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 items-center w-full justify-center">
                            <button onClick={() => { if (isAutoSpinning) setIsAutoSpinning(false); handleRoll(); }} disabled={inspectedItem !== null}
                                className="group relative px-12 py-6 bg-surface border border-border hover:border-text hover:bg-surface-highlight transition-all active:scale-95 w-64 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed">
                                <span className="relative z-10 text-xl font-bold tracking-[0.2em] group-hover:text-text text-text-dim">{T.UI.GENERATE}</span>
                                <div className="absolute bottom-0 left-0 h-1 bg-text w-0 group-hover:w-full transition-all duration-300" />
                                {stats.multiRollLevel > 1 && <span className="absolute top-2 right-2 text-[10px] text-neutral-500">x{stats.multiRollLevel}</span>}
                            </button>
                            {stats.hasBurst && (
                                <button onClick={handleBurstClick} disabled={inspectedItem !== null || isAutoSpinning}
                                    className="group relative px-6 py-6 bg-purple-900/20 border border-purple-900 hover:border-purple-400 hover:bg-purple-900/40 transition-all active:scale-95 w-32 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed">
                                    <span className="relative z-10 text-sm font-bold tracking-widest text-purple-400 group-hover:text-white">BURST</span>
                                    <span className="absolute bottom-1 right-2 text-[9px] text-purple-500 group-hover:text-white">50x</span>
                                </button>
                            )}
                            <button onClick={() => { audioService.playClick(); setIsAutoSpinning(!isAutoSpinning); }} disabled={inspectedItem !== null}
                                className={`group relative px-8 py-6 border transition-all w-64 disabled:opacity-50 disabled:cursor-not-allowed ${isAutoSpinning ? 'bg-red-900/20 border-red-500 text-red-500' : 'bg-surface border-border text-text-dim hover:border-success hover:text-success'}`}>
                                <span className="text-xl font-bold tracking-[0.2em]">{isAutoSpinning ? T.UI.STOP_AUTO : T.UI.AUTO_SPIN}</span>
                                <span className="absolute bottom-2 right-2 text-[10px] opacity-50">{autoSpinSpeed}ms</span>
                                {isAutoSpinning && (
                                    <span className="absolute top-2 right-2 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                )}
                            </button>
                        </div>

                        {showSignalInterceptor && (
                            <div className="w-full max-w-2xl pb-24">
                                <SignalInterceptor onDecrypt={handleSignalDecrypt} />
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-0 w-full p-6 flex justify-between items-end z-20 pointer-events-none">
                        <div className="flex gap-4 items-center pointer-events-auto">
                            <div className="text-neutral-800 text-xs font-mono uppercase tracking-widest">v2.6.0</div>
                            <button onClick={() => setIsChangelogOpen(true)} className="text-neutral-700 hover:text-white text-xs font-mono underline">CHANGELOG</button>
                        </div>
                        <button onClick={() => { audioService.playClick(); setIsAdminOpen(true); }} className="pointer-events-auto text-neutral-800 hover:text-neutral-500 text-xs font-mono uppercase transition-colors">
                            [ {T.UI.SYSTEM_CONFIG} ]
                        </button>
                    </div>

                </div>

                {/* RIGHT: Activity Panel */}
                <div className="border-t lg:border-t-0 lg:border-l border-surface-highlight min-h-[300px] lg:min-h-screen relative z-30 flex flex-col">
                    {/* Panel Switcher */}
                    <div className="flex border-b border-surface-highlight bg-background">
                        <button
                            onClick={() => setActiveRightPanel('MINING')}
                            className={`flex-1 py-3 text-[10px] font-mono font-bold tracking-widest transition-colors ${activeRightPanel === 'MINING' ? 'bg-surface-highlight text-text' : 'text-text-dim hover:bg-surface'}`}
                        >
                            MINING
                        </button>
                        <button
                            onClick={() => setActiveRightPanel('FISHING')}
                            className={`flex-1 py-3 text-[10px] font-mono font-bold tracking-widest transition-colors ${activeRightPanel === 'FISHING' ? 'bg-cyan-950/50 text-cyan-300' : 'text-text-dim hover:bg-surface'}`}
                        >
                            FISHING
                        </button>
                        <button
                            onClick={() => setActiveRightPanel('HARVESTING')}
                            className={`flex-1 py-3 text-[10px] font-mono font-bold tracking-widest transition-colors ${activeRightPanel === 'HARVESTING' ? 'bg-green-950/50 text-green-400' : 'text-text-dim hover:bg-surface'}`}
                        >
                            HARVESTING
                        </button>
                    </div>

                    {/* Active Component */}
                    <div className="flex-1 relative">
                        {activeRightPanel === 'MINING' ? (
                            <MiningPanel
                                onMine={miningGame.performAction}
                                lastBatch={miningGame.lastBatch}
                                totalMined={stats.totalMined || 0}
                                isAutoMining={miningGame.isAuto}
                                onToggleAuto={() => { audioService.playClick(); miningGame.toggleAuto(); }}
                                onOpenInventory={() => { audioService.playClick(); setIsOreInventoryOpen(true); }}
                            />
                        ) : activeRightPanel === 'FISHING' ? (
                            <FishingPanel
                                onFish={fishingGame.performAction}
                                lastBatch={fishingGame.lastBatch}
                                totalFished={stats.totalFished || 0}
                                isAutoFishing={fishingGame.isAuto}
                                onToggleAuto={() => { audioService.playClick(); fishingGame.toggleAuto(); }}
                                onOpenInventory={() => { audioService.playClick(); setIsFishInventoryOpen(true); }}
                            />
                        ) : (
                            <HarvestingPanel
                                onHarvest={harvestingGame.performAction}
                                lastBatch={harvestingGame.lastBatch}
                                totalHarvested={stats.totalHarvested || 0}
                                isAutoHarvesting={harvestingGame.isAuto}
                                onToggleAuto={() => { audioService.playClick(); harvestingGame.toggleAuto(); }}
                                onOpenInventory={() => { audioService.playClick(); setIsPlantInventoryOpen(true); }}
                            />
                        )}
                    </div>
                </div>

            </div>
            {/* Modals */}
            <Inventory items={inventory} isOpen={isInventoryOpen} onClose={() => setIsInventoryOpen(false)} onInspect={handleInspectItem} onToggleLock={toggleLock} />

            <ResourceInventory
                items={miningGame.inventory}
                definitions={ORES}
                isOpen={isOreInventoryOpen}
                onClose={() => setIsOreInventoryOpen(false)}
                onSell={() => handleSellResources('ORES')}
                onToggleLock={(item) => toggleResourceLock('ORES', item.id)}
                config={{
                    title: "ORE SILO",
                    itemName: "RES",
                    valueDivisor: 5,
                    themeColor: "text-white",
                    borderColor: "border-neutral-700",
                    bgColor: "bg-neutral-900",
                    emptyIcon: "∅",
                    emptyText: "SILO EMPTY. START MINING."
                }}
            />

            <ResourceInventory
                items={fishingGame.inventory}
                definitions={FISH}
                isOpen={isFishInventoryOpen}
                onClose={() => setIsFishInventoryOpen(false)}
                onSell={() => handleSellResources('FISH')}
                onToggleLock={(item) => toggleResourceLock('FISH', item.id)}
                config={{
                    title: "CRYO TANK",
                    itemName: "SPECIMENS",
                    valueDivisor: 4,
                    themeColor: "text-cyan-400",
                    borderColor: "border-cyan-900",
                    bgColor: "bg-cyan-950/20",
                    emptyIcon: "~ ~ ~",
                    emptyText: "TANK EMPTY. CAST NET."
                }}
            />

            <ResourceInventory
                items={harvestingGame.inventory}
                definitions={PLANTS}
                isOpen={isPlantInventoryOpen}
                onClose={() => setIsPlantInventoryOpen(false)}
                onSell={() => handleSellResources('PLANTS')}
                onToggleLock={(item) => toggleResourceLock('PLANTS', item.id)}
                config={{
                    title: "GREENHOUSE",
                    itemName: "PLANTS",
                    valueDivisor: 4.5,
                    themeColor: "text-green-400",
                    borderColor: "border-green-900",
                    bgColor: "bg-green-950/20",
                    emptyIcon: "❀",
                    emptyText: "GREENHOUSE EMPTY. START HARVESTING."
                }}
            />

            <Shop
                isOpen={isShopOpen}
                onClose={() => setIsShopOpen(false)}
                stats={stats}
                onBuyMultiRoll={handleBuyMultiRoll}
                onBuySpeed={handleBuySpeed}
                onBuyBurst={handleBuyBurst}
                onBuyLuck={handleBuyLuck}
                onBuyMiningSpeed={handleBuyMiningSpeed}
                onBuyMiningLuck={handleBuyMiningLuck}
                onBuyMiningMulti={handleBuyMiningMulti}
                onBuyFishingSpeed={handleBuyFishingSpeed}
                onBuyFishingLuck={handleBuyFishingLuck}
                onBuyFishingMulti={handleBuyFishingMulti}
                onBuyHarvestingSpeed={handleBuyHarvestingSpeed}
                onBuyHarvestingLuck={handleBuyHarvestingLuck}
                onBuyHarvestingMulti={handleBuyHarvestingMulti}
            />

            <GachaTerminal
                isOpen={isGachaOpen}
                onClose={() => setIsGachaOpen(false)}
                stats={stats}
                onUpdateStats={(newStats) => setStats(prev => ({ ...prev, ...newStats }))}
            />

            <Changelog isOpen={isChangelogOpen} onClose={() => setIsChangelogOpen(false)} />
            <IndexCatalog
                isOpen={isIndexOpen}
                onClose={() => setIsIndexOpen(false)}
                inventory={inventory}
                oreInventory={miningGame.inventory}
                fishInventory={fishingGame.inventory}
                plantInventory={harvestingGame.inventory}
                onSelectItem={handleIndexSelectItem}
            />
            <Achievements isOpen={isAchievementsOpen} onClose={() => setIsAchievementsOpen(false)} stats={stats} onEquipTitle={(title) => setStats(prev => ({ ...prev, equippedTitle: title }))} />
            <CoinToss isOpen={isCoinTossOpen} onClose={() => setIsCoinTossOpen(false)} balance={stats.balance} onUpdateBalance={(newBal) => setStats(prev => ({ ...prev, balance: newBal }))} />

            {/* Admin Panel Modal */}
            {isAdminOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-surface border border-border p-6 rounded-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 border-b border-border pb-2">
                            <h2 className="text-xl font-mono text-text tracking-wider">{T.UI.SYSTEM_CONFIG}</h2>
                            <button onClick={() => setIsAdminOpen(false)} className="text-text-dim hover:text-text">[X]</button>
                        </div>

                        <div className="space-y-8">

                            {/* Theme Selection */}
                            <div className="space-y-2 pt-2">
                                <div className="text-sm font-mono text-white font-bold">THEME CONFIG</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {THEMES.map(theme => (
                                        <button
                                            key={theme.id}
                                            onClick={() => setCurrentTheme(theme.id)}
                                            className={`p-2 text-xs border rounded transition-colors ${currentTheme === theme.id ? 'bg-white text-black border-white' : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-neutral-500'}`}
                                        >
                                            {theme.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Filters Section */}
                            <div className="space-y-4 border-t border-neutral-800 pt-4">
                                <div className="text-sm font-mono text-text font-bold">FILTERS</div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-mono text-text-dim">
                                        <label>AUTO-STOP AT RARITY</label>
                                    </div>
                                    <select value={autoStopRarity} onChange={(e) => setAutoStopRarity(Number(e.target.value))} className="w-full bg-surface-highlight border border-border text-text text-xs p-2 rounded font-mono">
                                        {tierOptions.map(tier => (
                                            <option key={tier.id} value={tier.id}>{T.RARITY_NAMES[tier.id]}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* UI Settings */}
                            <div className="space-y-2 border-t border-border pt-4">
                                <div className="text-sm font-mono text-text font-bold">UI SETTINGS</div>
                                <label className="flex items-center justify-between text-sm font-mono text-text-dim cursor-pointer hover:bg-surface-highlight/50 p-2 rounded transition-colors">
                                    <span>SIGNAL INTERCEPTOR</span>
                                    <input
                                        type="checkbox"
                                        checked={showSignalInterceptor}
                                        onChange={(e) => setShowSignalInterceptor(e.target.checked)}
                                        className="w-4 h-4 rounded bg-surface-highlight border-border accent-success"
                                    />
                                </label>
                            </div>

                            {/* DEBUG TOOLS */}
                            <div className="space-y-2 border-t border-border pt-4">
                                <div className="text-sm font-mono text-white font-bold">TEXT RNG CONFIG (DEBUG)</div>
                                <div className="flex justify-between text-sm font-mono text-neutral-400">
                                    <label>{T.UI.SPEED}</label>
                                    <span className="text-white">{autoSpinSpeed}ms</span>
                                </div>
                                <input type="range" min="5" max="1000" step="5" value={autoSpinSpeed} onChange={(e) => setAutoSpinSpeed(Number(e.target.value))} className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white" />

                                <div className="flex justify-between text-sm font-mono text-neutral-400 mt-2">
                                    <label>LUCK (Log Scale)</label>
                                    <span className="text-yellow-500 font-bold">{Math.round(luckMultiplier).toLocaleString()}x</span>
                                </div>
                                <input type="range" min="0" max="12" step="0.1" value={getLogValue(luckMultiplier)} onChange={handleLogSliderChange} className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
                            </div>

                            {/* MINING CONFIG */}
                            <div className="space-y-2 border-t border-border pt-4">
                                <div className="text-sm font-mono text-white font-bold">MINING CONFIG (DEBUG)</div>
                                <div className="flex justify-between text-sm font-mono text-neutral-400">
                                    <label>AUTO-MINE SPEED</label>
                                    <span className="text-white">{miningSpeed}ms</span>
                                </div>
                                <input type="range" min="50" max="2000" step="50" value={miningSpeed} onChange={(e) => setMiningSpeed(Number(e.target.value))} className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-orange-500" />

                                <div className="flex justify-between text-sm font-mono text-neutral-400 mt-2">
                                    <label>MINING LUCK (Log)</label>
                                    <span className="text-orange-500 font-bold">{Math.round(miningLuckMultiplier).toLocaleString()}x</span>
                                </div>
                                <input type="range" min="0" max="9" step="0.1" value={getLogValue(miningLuckMultiplier)} onChange={(e) => setMiningLuckMultiplier(Math.pow(10, parseFloat(e.target.value)))} className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                            </div>

                            {/* FISHING CONFIG */}
                            <div className="space-y-2 border-t border-border pt-4">
                                <div className="text-sm font-mono text-white font-bold">FISHING CONFIG (DEBUG)</div>
                                <div className="flex justify-between text-sm font-mono text-neutral-400">
                                    <label>AUTO-FISH SPEED</label>
                                    <span className="text-white">{fishingSpeed}ms</span>
                                </div>
                                <input type="range" min="50" max="2000" step="50" value={fishingSpeed} onChange={(e) => setFishingSpeed(Number(e.target.value))} className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-500" />

                                <div className="flex justify-between text-sm font-mono text-neutral-400 mt-2">
                                    <label>FISHING LUCK (Log)</label>
                                    <span className="text-teal-500 font-bold">{Math.round(fishingLuckMultiplier).toLocaleString()}x</span>
                                </div>
                                <input type="range" min="0" max="9" step="0.1" value={getLogValue(fishingLuckMultiplier)} onChange={(e) => setFishingLuckMultiplier(Math.pow(10, parseFloat(e.target.value)))} className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-teal-500" />
                            </div>

                            {/* HARVESTING CONFIG */}
                            <div className="space-y-2 border-t border-border pt-4">
                                <div className="text-sm font-mono text-white font-bold">HARVESTING CONFIG (DEBUG)</div>
                                <div className="flex justify-between text-sm font-mono text-neutral-400">
                                    <label>AUTO-HARVEST SPEED</label>
                                    <span className="text-white">{harvestingSpeed}ms</span>
                                </div>
                                <input type="range" min="50" max="2000" step="50" value={harvestingSpeed} onChange={(e) => setHarvestingSpeed(Number(e.target.value))} className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-green-500" />

                                <div className="flex justify-between text-sm font-mono text-neutral-400 mt-2">
                                    <label>HARVEST LUCK (Log)</label>
                                    <span className="text-green-500 font-bold">{Math.round(harvestingLuckMultiplier).toLocaleString()}x</span>
                                </div>
                                <input type="range" min="0" max="9" step="0.1" value={getLogValue(harvestingLuckMultiplier)} onChange={(e) => setHarvestingLuckMultiplier(Math.pow(10, parseFloat(e.target.value)))} className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-green-500" />
                            </div>

                            {/* Quick Presets */}
                            <div className="pt-4 border-t border-neutral-800">
                                <p className="text-xs text-neutral-500 mb-2">{T.UI.PRESETS}</p>
                                <div className="grid grid-cols-3 gap-2">
                                    <button onClick={() => { setAutoSpinSpeed(150); setLuckMultiplier(1); setMiningLuckMultiplier(1); setFishingLuckMultiplier(1); setHarvestingLuckMultiplier(1); }} className="text-xs border border-neutral-700 p-2 hover:bg-neutral-800 text-neutral-400">{T.UI.RESET}</button>
                                    <button onClick={() => { setAutoSpinSpeed(50); setLuckMultiplier(1000); setMiningLuckMultiplier(100); setFishingLuckMultiplier(100); setHarvestingLuckMultiplier(100); }} className="text-xs border border-neutral-700 p-2 hover:bg-neutral-800 text-neutral-400">{T.UI.LUCKY}</button>
                                    <button onClick={() => { setAutoSpinSpeed(20); setLuckMultiplier(1000000000); setMiningLuckMultiplier(1000000); setFishingLuckMultiplier(1000000); setHarvestingLuckMultiplier(1000000); }} className="text-xs border border-neutral-700 p-2 hover:bg-neutral-800 text-yellow-600 border-yellow-900">{T.UI.GOD_MODE}</button>
                                </div>
                            </div>

                            {/* Data Management */}
                            <div className="pt-4 border-t border-neutral-800 space-y-2">
                                <button onClick={() => { setStats(prev => ({ ...prev, unlockedAchievements: ACHIEVEMENTS.map(a => a.id) })); audioService.playRaritySound(RarityId.LEGENDARY); }} className="w-full text-xs text-green-800 hover:text-green-500 p-2 border border-green-900/30 hover:border-green-600 transition-colors">
                                    UNLOCK ALL TITLES
                                </button>
                                <button onClick={() => { if (confirm("Clear all save data?")) { localStorage.clear(); window.location.reload(); } }} className="w-full text-xs text-red-800 hover:text-red-500 p-2 border border-red-900/30 hover:border-red-600 transition-colors">
                                    WIPE DATA
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Flash Effect for High Tiers */}
            {activeRarityVFX && activeRarityVFX >= RarityId.DIVINE && (
                <div key={Date.now()} className="absolute inset-0 bg-white pointer-events-none animate-flash z-40 mix-blend-overlay opacity-50" />
            )}

            <style>{`
        @keyframes flash {
            0% { opacity: 0.8; }
            100% { opacity: 0; }
        }
        .animate-flash {
            animation: flash 0.5s ease-out forwards;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.2s ease-out forwards;
        }
        .cloud-texture {
            text-shadow: 2px 2px 10px rgba(255,255,255,0.5);
            filter: blur(0.5px);
        }
      `}</style>
        </div>
    );
}
