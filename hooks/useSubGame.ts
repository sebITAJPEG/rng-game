import { useState, useEffect, useRef, useCallback } from 'react';
import { RarityId } from '../types';

interface SubGameConfig<T> {
    storageKey: string;
    dropFn: (luck: number) => T;
    playSound: () => void;
    speed: number;
    luck: number; // Total calculated luck
    multi: number;
    thresholds: { boom: number; rare: number; boomDivisor: number };
}

interface GlobalCallbacks {
    onUpdate: (count: number, bestId: number, gachaCredits: number) => void;
    playBoom: (rarity: RarityId) => void;
    playRare: (rarity: RarityId) => void;
    playCoinWin: (amount: number) => void;
}

export function useSubGame<T extends { id: number; probability: number }, InvItem extends { id: number; count: number; discoveredAt: number }>(
    config: SubGameConfig<T>,
    callbacks: GlobalCallbacks
) {
    const [inventory, setInventory] = useState<InvItem[]>(() => {
        try {
            const s = localStorage.getItem(config.storageKey);
            return s ? JSON.parse(s) : [];
        } catch { return []; }
    });

    const [lastBatch, setLastBatch] = useState<T[]>([]);
    const [isAuto, setIsAuto] = useState(false);
    const timerRef = useRef<number | null>(null);

    // Save Inventory
    useEffect(() => {
        localStorage.setItem(config.storageKey, JSON.stringify(inventory));
    }, [inventory, config.storageKey]);

    // Questa funzione viene ricreata ad ogni render perché 'config' cambia (es. luck cambia con i trofei)
    const performAction = useCallback(() => {
        config.playSound();
        const count = config.multi;
        const batch: T[] = [];
        const updates = new Map<number, number>();

        for (let i = 0; i < count; i++) {
            const item = config.dropFn(config.luck);
            batch.push(item);
            updates.set(item.id, (updates.get(item.id) || 0) + 1);
        }

        setLastBatch(batch);

        setInventory(prev => {
            const next = [...prev];
            updates.forEach((qty, id) => {
                const idx = next.findIndex(x => x.id === id);
                if (idx >= 0) next[idx].count += qty;
                else next.push({ id, count: qty, discoveredAt: Date.now() } as any);
            });
            return next;
        });

        // Stats & Audio
        let bestItem = batch[0];
        batch.forEach(i => { if (i.probability > bestItem.probability) bestItem = i; });

        const foundGacha = Math.random() < 0.0025;
        callbacks.onUpdate(count, bestItem.id, foundGacha ? 1 : 0);

        if (foundGacha) callbacks.playCoinWin(3);

        if (bestItem.id >= config.thresholds.boom) {
            const estRarity = Math.min(15, Math.floor(bestItem.id / config.thresholds.boomDivisor));
            callbacks.playBoom(estRarity as RarityId);
        } else if (bestItem.id >= config.thresholds.rare) {
            callbacks.playRare(RarityId.RARE);
        }

    }, [config.luck, config.multi, config.dropFn, callbacks, config.playSound, config.thresholds]);

    // --- FIX CRUCIALE PER AUTOSPIN ---
    // Usiamo un ref per tenere traccia dell'ultima versione di performAction.
    // Questo permette all'intervallo di eseguire sempre la logica più recente (con la fortuna aggiornata)
    // SENZA dover essere cancellato e ricreato ogni volta che cambia una dipendenza.
    const savedCallback = useRef(performAction);

    // Aggiorna il ref ogni volta che performAction cambia
    useEffect(() => {
        savedCallback.current = performAction;
    }, [performAction]);

    // Setup dell'intervallo
    useEffect(() => {
        if (isAuto) {
            // Se c'è già un timer, non ne creiamo un altro, a meno che la velocità non sia cambiata
            if (timerRef.current) clearInterval(timerRef.current);

            timerRef.current = window.setInterval(() => {
                // Chiamiamo la funzione salvata nel ref
                if (savedCallback.current) savedCallback.current();
            }, config.speed);
        } else {
            // Pulizia se l'auto viene disattivato
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }

        // Cleanup al smontaggio o cambio velocità
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null; // Importante resettare il ref
            }
        };

        // IMPORTANTE: Dipendiamo SOLO da isAuto e config.speed.
        // performAction NON è una dipendenza qui, quindi l'intervallo non si resetta quando cambia la fortuna.
    }, [isAuto, config.speed]);

    return {
        inventory,
        setInventory,
        lastBatch,
        isAuto,
        toggleAuto: () => setIsAuto(p => !p),
        performAction
    };
}