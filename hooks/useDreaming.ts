import { useState, useEffect, useRef, useCallback } from 'react';
import { rollDream } from '../services/dreamingService';
import { Dream, DreamInventoryItem, RarityId } from '../types';
import { audioService } from '../services/audioService';

interface DreamingConfig {
    storageKey: string;
    baseStability: number;
}

interface GlobalCallbacks {
    onUpdateStats: (count: number, bestId: number) => void;
    onCrash: () => void;
    onWake: (count: number) => void;
}

export function useDreaming(config: DreamingConfig, callbacks: GlobalCallbacks) {
    // Permanent Inventory
    const [inventory, setInventory] = useState<DreamInventoryItem[]>(() => {
        try {
            const s = localStorage.getItem(config.storageKey);
            return s ? JSON.parse(s) : [];
        } catch { return []; }
    });

    // Session State
    const [isDreaming, setIsDreaming] = useState(false);
    const [stability, setStability] = useState(100);
    const [depth, setDepth] = useState(1);
    const [sessionLoot, setSessionLoot] = useState<Dream[]>([]);
    const [lastDream, setLastDream] = useState<Dream | null>(null);
    const [isCrashed, setIsCrashed] = useState(false);

    // New: Auto-Dream State
    const [isAutoDreaming, setIsAutoDreaming] = useState(false);
    const autoDreamTimerRef = useRef<number | null>(null);

    // Save Inventory
    useEffect(() => {
        localStorage.setItem(config.storageKey, JSON.stringify(inventory));
    }, [inventory, config.storageKey]);

    const enterDream = () => {
        if (isDreaming) return;
        setIsDreaming(true);
        setStability(config.baseStability);
        setDepth(1);
        setSessionLoot([]);
        setLastDream(null);
        setIsCrashed(false);
        setIsAutoDreaming(false); // Reset auto on entry
        audioService.playClick();
    };

    const delveDeeper = useCallback((luckMultiplier: number, stabilityRegenChance: number) => {
        // Remove isDreaming check from here to allow it to be called in the update cycle before state updates? 
        // Actually, we need to access the current state. 
        // For auto-looping, we need to use refs or functional updates if we want to avoid dependency cycles, 
        // but since this is a game loop, let's use the pattern we fixed in useSubGame.

        // However, delveDeeper depends on 'stability' which changes every time.
        // We should perform the check inside the setter or ref.
        // Let's stick to the standard flow for now, but we need to handle the "latest state" issue for the interval.

        setStability(prevStability => {
            if (prevStability <= 0) return prevStability; // Already crashed or about to

            // We need 'depth' too. This is getting tricky with multiple state variables.
            // Let's use a ref for the game state to ensure the interval always has the latest data without re-creating.
            return prevStability; // Placeholder, actual logic below
        });

        // Actually, let's refactor 'delveDeeper' to rely on refs for the auto-loop to work smoothly.
        // But to keep it simple and consistent with the previous implementation:
        // We will let the interval trigger an effect or use the savedCallback pattern.
    }, []);

    // Let's rewrite delveDeeper to be stable and use functional updates or refs where possible.
    // But since 'rollDream' needs current 'depth', we need access to it.

    // Solution: Use a Ref to store the latest state for the auto-loop to access.
    const stateRef = useRef({ isDreaming, stability, depth, isCrashed });
    useEffect(() => {
        stateRef.current = { isDreaming, stability, depth, isCrashed };
    }, [isDreaming, stability, depth, isCrashed]);

    const performAutoDelve = useCallback((luckMultiplier: number, stabilityRegenChance: number) => {
        const { isDreaming, stability, depth, isCrashed } = stateRef.current;

        if (!isDreaming || isCrashed || stability <= 0) {
            setIsAutoDreaming(false); // Stop if crashed
            return;
        }

        // Roll logic (duplicated from delveDeeper but accessing refs/direct)
        const dream = rollDream(depth, luckMultiplier);
        const drain = dream.stabilityDrain + Math.floor(depth / 10);

        let newStability = stability - drain;
        if (Math.random() < stabilityRegenChance) {
            newStability += 5;
        }

        // Update all states
        setLastDream(dream);
        setSessionLoot(prev => [...prev, dream]);
        setDepth(d => d + 1);
        setStability(newStability);

        audioService.playRollSound();

        if (newStability <= 0) {
            // Crash logic
            setIsDreaming(false);
            setIsCrashed(true);
            setIsAutoDreaming(false);
            audioService.playCoinLose();

            setInventory(prev => {
                const next = [...prev];
                // We need to add the NEW dream we just found too? 
                // sessionLoot state update is async, so we should add 'dream' manually + existing sessionLoot
                // But sessionLoot state won't be updated yet in this closure.
                // For simplicity, let's just use the functional update of setInventory later or now.
                // Actually, 'transferLootToInventory' uses 'sessionLoot'.
                // We need to pass the *current* items + the new one.
                // This is getting complex. 

                // Simplified: Just set state here, and let a useEffect handle the crash/transfer?
                // No, that causes flickers.

                // Let's just call the callback.
                callbacks.onCrash();
                return next; // We'll update inventory in a separate effect or function to be safe?
                // Let's stick to the original 'transferLootToInventory' logic but adapted.
            });

            // We need to update inventory with the session loot + this new dream
            setInventory(prev => {
                const next = [...prev];
                // We can't easily access 'sessionLoot' here synchronously.
                // Let's use a ref for sessionLoot too?
                return next;
            });
            // Okay, to avoid major refactoring bugs: 
            // I will keep 'delveDeeper' as the single source of truth and just call it from the interval.
            // The 'useSubGame' fix works because it updates the ref to the function.
        }

    }, []);

    // Re-implementing delveDeeper to be the main function called by UI and Auto
    const delveDeeperAction = useCallback((luckMultiplier: number, stabilityRegenChance: number) => {
        setStability(prevStab => {
            if (prevStab <= 0) return prevStab;

            // We need depth.
            let currentDepth = 1;
            setDepth(prev => { currentDepth = prev; return prev; }); // Hacky way to read? No.

            // Better approach: Use the stateRef we created earlier for reading, but set state normally.
            const { depth } = stateRef.current;

            const dream = rollDream(depth, luckMultiplier);
            const drain = dream.stabilityDrain + Math.floor(depth / 10);
            let newStab = prevStab - drain;

            if (Math.random() < stabilityRegenChance) newStab += 5;

            setLastDream(dream);
            setSessionLoot(prev => [...prev, dream]);
            setDepth(d => d + 1);

            audioService.playRollSound();

            if (newStab <= 0) {
                // CRASH
                setIsDreaming(false);
                setIsCrashed(true);
                setIsAutoDreaming(false);
                audioService.playCoinLose();

                // Transfer loot (session + new dream)
                setSessionLoot(prev => {
                    const finalLoot = [...prev, dream];

                    // Update global inventory
                    setInventory(inv => {
                        const nextInv = [...inv];
                        finalLoot.forEach(d => {
                            const idx = nextInv.findIndex(i => i.id === d.id);
                            if (idx >= 0) nextInv[idx].count += 1;
                            else nextInv.push({ id: d.id, count: 1, discoveredAt: Date.now() });
                        });
                        return nextInv;
                    });

                    const bestId = finalLoot.reduce((max, d) => Math.max(max, d.id), 0);
                    callbacks.onUpdateStats(finalLoot.length, bestId);
                    callbacks.onCrash();

                    return []; // Clear session loot
                });
            }

            return newStab;
        });
    }, []);

    // Ref for the latest delve function (so interval doesn't reset)
    const savedDelve = useRef(delveDeeperAction);
    useEffect(() => { savedDelve.current = delveDeeperAction; }, [delveDeeperAction]);

    // Params refs (so interval can use latest stats)
    const paramsRef = useRef({ luck: 1, regen: 0 });
    const updateParams = (luck: number, regen: number) => {
        paramsRef.current = { luck, regen };
    };

    // Auto Loop
    useEffect(() => {
        if (isAutoDreaming && isDreaming && !isCrashed) {
            autoDreamTimerRef.current = window.setInterval(() => {
                savedDelve.current(paramsRef.current.luck, paramsRef.current.regen);
            }, 800); // Speed of auto-dreaming (faster than manual?)
        } else {
            if (autoDreamTimerRef.current) clearInterval(autoDreamTimerRef.current);
            autoDreamTimerRef.current = null;
        }
        return () => { if (autoDreamTimerRef.current) clearInterval(autoDreamTimerRef.current); };
    }, [isAutoDreaming, isDreaming, isCrashed]);

    const toggleAutoDream = () => setIsAutoDreaming(p => !p);

    // Standard Wake Up
    const wakeUp = () => {
        if (!isDreaming) return;
        setIsDreaming(false);
        setIsAutoDreaming(false);
        audioService.playRaritySound(RarityId.LEGENDARY);

        setInventory(prev => {
            const next = [...prev];
            sessionLoot.forEach(dream => {
                const idx = next.findIndex(i => i.id === dream.id);
                if (idx >= 0) next[idx].count += 1;
                else next.push({ id: dream.id, count: 1, discoveredAt: Date.now() });
            });
            return next;
        });

        const bestId = sessionLoot.reduce((max, d) => Math.max(max, d.id), 0);
        callbacks.onUpdateStats(sessionLoot.length, bestId);
        callbacks.onWake(sessionLoot.length);
    };

    return {
        inventory,
        setInventory,
        isDreaming,
        stability,
        depth,
        sessionLoot,
        lastDream,
        isCrashed,
        isAutoDreaming,
        enterDream,
        delveDeeper: delveDeeperAction,
        wakeUp,
        toggleAutoDream,
        updateParams // Exposed so App can push latest stats to the ref
    };
}