import React, { useState, useMemo, useEffect } from 'react';
import { InventoryItem, RarityId, ItemData, OreInventoryItem, FishInventoryItem, PlantInventoryItem, DreamInventoryItem, MoonInventoryItem, VariantId } from '../types';
import { RARITY_TIERS, PHRASES, TRANSLATIONS, ORES, GOLD_ORES, FISH, PLANTS, DREAMS, MOON_ITEMS, VARIANTS } from '../constants';
import { RarityBadge } from './RarityBadge';
import { audioService } from '../services/audioService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    inventory: InventoryItem[];
    oreInventory?: OreInventoryItem[];
    fishInventory?: FishInventoryItem[];
    plantInventory?: PlantInventoryItem[];
    dreamInventory?: DreamInventoryItem[];
    moonInventory?: MoonInventoryItem[];
    onSelectItem: (item: ItemData, rarityId: RarityId) => void;
}

type Tab = 'ITEMS' | 'ORES' | 'GOLD_ORES' | 'FISH' | 'PLANTS' | 'DREAMS' | 'MOON';

export const IndexCatalog: React.FC<Props> = ({ isOpen, onClose, inventory, oreInventory = [], fishInventory = [], plantInventory = [], dreamInventory = [], moonInventory = [], onSelectItem }) => {
    const [activeTab, setActiveTab] = useState<Tab>('ITEMS');
    const [selectedRarity, setSelectedRarity] = useState<RarityId>(RarityId.COMMON);
    const [showSpoilers, setShowSpoilers] = useState(false);
    const T = TRANSLATIONS['en'];

    // OPTIMIZATION: All useMemos now depend on 'isOpen'.
    // If the catalog is closed, we return an empty Set immediately.
    // This prevents iterating through thousands of items during auto-rolls when the UI isn't visible.

    const discoveredSet = useMemo(() => {
        if (!isOpen) return new Set<string>();
        const set = new Set<string>();
        inventory.forEach(i => set.add(`${i.rarityId}:${i.text}`));
        return set;
    }, [inventory, isOpen]);

    // NEW: Track discovered variants for each item
    const discoveredVariantsMap = useMemo(() => {
        if (!isOpen) return new Map<string, Set<VariantId>>();
        const map = new Map<string, Set<VariantId>>();
        inventory.forEach(i => {
            const key = `${i.rarityId}:${i.text}`;
            if (!map.has(key)) map.set(key, new Set());
            if (i.variantId !== undefined && i.variantId !== VariantId.NONE) {
                map.get(key)?.add(i.variantId);
            }
        });
        return map;
    }, [inventory, isOpen]);

    const discoveredOreSet = useMemo(() => {
        if (!isOpen) return new Set<number>();
        const set = new Set<number>();
        oreInventory.forEach(i => set.add(i.id));
        return set;
    }, [oreInventory, isOpen]);

    const discoveredFishSet = useMemo(() => {
        if (!isOpen) return new Set<number>();
        const set = new Set<number>();
        fishInventory.forEach(i => set.add(i.id));
        return set;
    }, [fishInventory, isOpen]);

    const discoveredPlantSet = useMemo(() => {
        if (!isOpen) return new Set<number>();
        const set = new Set<number>();
        plantInventory.forEach(i => set.add(i.id));
        return set;
    }, [plantInventory, isOpen]);

    const discoveredDreamSet = useMemo(() => {
        if (!isOpen) return new Set<number>();
        const set = new Set<number>();
        dreamInventory.forEach(i => set.add(i.id));
        return set;
    }, [dreamInventory, isOpen]);

    const discoveredMoonSet = useMemo(() => {
        if (!isOpen) return new Set<number>();
        const set = new Set<number>();
        moonInventory.forEach(i => set.add(i.id));
        return set;
    }, [moonInventory, isOpen]);

    if (!isOpen) return null;

    const tiers = Object.values(RARITY_TIERS).sort((a, b) => a.id - b.id).filter(t => t.id !== RarityId.MOON);
    const currentItems = PHRASES['en'][selectedRarity] || [];

    // Calculate completion percentage
    const totalItems = Object.values(PHRASES['en']).flat().length;
    const foundItems = inventory.filter(i => i.rarityId !== RarityId.MOON).length;
    const percentComplete = Math.min(100, Math.floor((foundItems / totalItems) * 100));

    const totalOres = ORES.length;
    const foundOres = oreInventory.filter(i => i.id <= 1000).length;
    const orePercent = Math.min(100, Math.floor((foundOres / totalOres) * 100));

    const totalGoldOres = GOLD_ORES.length;
    const foundGoldOres = oreInventory.filter(i => i.id > 1000).length;
    const goldOrePercent = Math.min(100, Math.floor((foundGoldOres / totalGoldOres) * 100));

    const totalFish = FISH.length;
    const foundFish = fishInventory.length;
    const fishPercent = Math.min(100, Math.floor((foundFish / totalFish) * 100));

    const totalPlants = PLANTS.length;
    const foundPlants = plantInventory.length;
    const plantPercent = Math.min(100, Math.floor((foundPlants / totalPlants) * 100));

    const totalDreams = DREAMS.length;
    const foundDreams = dreamInventory.length;
    const dreamPercent = Math.min(100, Math.floor((foundDreams / totalDreams) * 100));

    const totalMoon = MOON_ITEMS.length;
    const foundMoon = moonInventory.length;
    const moonPercent = Math.min(100, Math.floor((foundMoon / totalMoon) * 100));

    // Helper to handle resource clicks
    const handleResourceClick = (id: number, name: string, description: string) => {
        const pseudoRarity = Math.min(Math.ceil((id > 1000 ? id - 1000 : id) / 10), 15) as RarityId;
        onSelectItem({ text: name, description }, pseudoRarity);
    };

    const handleMoonClick = (item: any) => {
        onSelectItem({ text: item.text, description: item.description }, RarityId.MOON);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-xl p-4">
            <div className="w-full max-w-6xl h-[85vh] bg-surface border border-border rounded-lg flex flex-col md:flex-row overflow-hidden shadow-2xl transition-colors duration-300">

                {/* Sidebar - Controls & Navigation */}
                <div className="w-full md:w-64 bg-surface-highlight/10 border-r border-border flex flex-col">
                    <div className="p-4 border-b border-border space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-text tracking-wider font-mono">INDEX</h2>
                            <div className="text-[10px] text-text-dim font-mono">
                                {activeTab === 'ITEMS' && `${percentComplete}%`}
                                {activeTab === 'ORES' && `${orePercent}%`}
                                {activeTab === 'GOLD_ORES' && `${goldOrePercent}%`}
                                {activeTab === 'FISH' && `${fishPercent}%`}
                                {activeTab === 'PLANTS' && `${plantPercent}%`}
                                {activeTab === 'DREAMS' && `${dreamPercent}%`}
                                {activeTab === 'MOON' && `${moonPercent}%`}
                            </div>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex flex-col gap-1">
                            <div className="flex flex-wrap p-1 bg-surface rounded border border-border gap-1 overflow-x-auto no-scrollbar">
                                {['ITEMS', 'ORES', 'GOLD_ORES', 'FISH', 'PLANTS', 'DREAMS', 'MOON'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => { audioService.playClick(); setActiveTab(tab as Tab); }}
                                        className={`flex-1 min-w-[60px] py-2 text-[10px] font-mono text-center rounded transition-colors ${activeTab === tab ? 'bg-primary text-background font-bold' : 'text-text-dim hover:text-text hover:bg-surface-highlight'}`}
                                    >
                                        {tab === 'GOLD_ORES' ? 'GOLD' : tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {activeTab === 'ITEMS' && (
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {tiers.map((tier) => {
                                const count = PHRASES['en'][tier.id]?.length || 0;
                                const discoveredInTier = inventory.filter(i => i.rarityId === tier.id).length;

                                return (
                                    <button
                                        key={tier.id}
                                        onClick={() => setSelectedRarity(tier.id)}
                                        className={`
                                    w-full text-left px-3 py-2 rounded text-xs font-mono flex justify-between items-center transition-all
                                    ${selectedRarity === tier.id ? 'bg-surface-highlight text-text border border-border' : 'text-text-dim hover:bg-surface-highlight hover:text-text'}
                                `}
                                    >
                                        <span className={selectedRarity === tier.id ? tier.textColor : ''}>
                                            {T.RARITY_NAMES[tier.id]}
                                        </span>
                                        <span className="opacity-50">{discoveredInTier}/{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Statistics Panels */}
                    {activeTab !== 'ITEMS' && (
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className={`text-xs font-mono mb-4 text-text-dim`}>
                                {activeTab === 'ORES' && "CATALOGUED RESOURCES FROM SECTOR 7G."}
                                {activeTab === 'GOLD_ORES' && "RARE METALS FROM DIMENSION AU-79."}
                                {activeTab === 'FISH' && "DATA-FORMS FROM THE DEEP WEB."}
                                {activeTab === 'PLANTS' && "FLORA FROM THE HYDROPONICS BAY."}
                                {activeTab === 'DREAMS' && "FRAGMENTS FROM THE SUBCONSCIOUS."}
                                {activeTab === 'MOON' && "LUNAR SAMPLES AND ANOMALIES."}
                            </div>
                            <div className="space-y-2">
                                <div className="text-[10px] text-text-dim uppercase tracking-widest">Statistics</div>
                                <div className="flex justify-between text-xs font-mono text-text">
                                    <span>Discovered</span>
                                    <span>
                                        {activeTab === 'ORES' && `${foundOres} / ${totalOres}`}
                                        {activeTab === 'GOLD_ORES' && `${foundGoldOres} / ${totalGoldOres}`}
                                        {activeTab === 'FISH' && `${foundFish} / ${totalFish}`}
                                        {activeTab === 'PLANTS' && `${foundPlants} / ${totalPlants}`}
                                        {activeTab === 'DREAMS' && `${foundDreams} / ${totalDreams}`}
                                        {activeTab === 'MOON' && `${foundMoon} / ${totalMoon}`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-4 border-t border-border">
                        <label className="flex items-center gap-2 text-xs text-text-dim font-mono cursor-pointer hover:text-text transition-colors">
                            <input
                                type="checkbox"
                                checked={showSpoilers}
                                onChange={(e) => setShowSpoilers(e.target.checked)}
                                className="rounded border-border bg-surface accent-primary"
                            />
                            SHOW UNDISCOVERED
                        </label>
                    </div>
                </div>

                {/* Main Content - Grid */}
                <div className="flex-1 flex flex-col bg-surface-highlight/5">
                    <div className="p-4 flex justify-between items-center border-b border-border bg-surface/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            {activeTab === 'ITEMS' ? (
                                <>
                                    <RarityBadge rarityId={selectedRarity} />
                                    <span className="text-xs text-text-dim font-mono">
                                        1 in {RARITY_TIERS[selectedRarity].probability.toLocaleString()}
                                    </span>
                                </>
                            ) : activeTab === 'MOON' ? (
                                <span className="text-sm font-bold font-mono text-text">LUNAR SURFACE</span>
                            ) : (
                                <span className="text-sm font-bold font-mono text-text">{activeTab.replace('_', ' ')} DB</span>
                            )}
                        </div>
                        <button onClick={onClose} className="text-text-dim hover:text-text font-mono transition-colors">[X]</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === 'ITEMS' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {currentItems.map((item, idx) => {
                                    const isDiscovered = discoveredSet.has(`${selectedRarity}:${item.text}`);
                                    const variantsFound = discoveredVariantsMap.get(`${selectedRarity}:${item.text}`);
                                    const isVisible = isDiscovered || showSpoilers;

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => isVisible && onSelectItem(item, selectedRarity)}
                                            disabled={!isVisible}
                                            className={`
                                        relative p-4 border rounded-lg text-left transition-all group flex flex-col justify-between min-h-[8rem]
                                        ${isVisible
                                                    ? `border-border bg-surface hover:bg-surface-highlight hover:border-text`
                                                    : 'border-border bg-surface opacity-50 cursor-not-allowed'
                                                }
                                    `}
                                        >
                                            {isVisible ? (
                                                <>
                                                    <div className={`font-bold text-sm line-clamp-2`} style={{ color: RARITY_TIERS[selectedRarity].color === 'border-white' ? 'var(--color-text)' : undefined }}>
                                                        <span className={RARITY_TIERS[selectedRarity].textColor}>{item.text}</span>
                                                    </div>
                                                    <div className="text-[10px] text-text-dim font-mono line-clamp-2 mt-2">
                                                        {item.description}
                                                    </div>

                                                    {/* Variants Display */}
                                                    {variantsFound && variantsFound.size > 0 && (
                                                        <div className="mt-3 pt-2 border-t border-border/50">
                                                            <div className="text-[9px] text-text-dim uppercase tracking-widest mb-1">VARIANTS</div>
                                                            <div className="flex flex-wrap gap-1">
                                                                {Array.from(variantsFound).map(vId => {
                                                                    const variant = VARIANTS[vId];
                                                                    if (!variant) return null;
                                                                    return (
                                                                        <span key={vId} className={`text-[8px] px-1 rounded bg-background/50 border border-border ${variant.styleClass.split(' ')[0]}`}>
                                                                            {variant.name}
                                                                        </span>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="text-[9px] text-text-dim uppercase tracking-widest mt-auto pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Visualize
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <span className="text-text-dim font-mono text-2xl">???</span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : activeTab === 'MOON' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {MOON_ITEMS.sort((a, b) => a.probability - b.probability).map((item) => {
                                    const isDiscovered = discoveredMoonSet.has(item.id);
                                    const isVisible = isDiscovered || showSpoilers;
                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => isVisible && handleMoonClick(item)}
                                            className={`
                                                relative p-4 border rounded-lg text-center transition-all h-40 flex flex-col items-center justify-center gap-2
                                                ${isVisible
                                                    ? 'border-border bg-surface hover:bg-surface-highlight cursor-pointer group shadow-sm hover:shadow-md'
                                                    : 'border-border bg-surface opacity-50'
                                                }
                                            `}
                                        >
                                            {isVisible ? (
                                                <>
                                                    <div className="text-[9px] font-mono uppercase text-text-dim tracking-widest mb-1">Moon</div>
                                                    <div className="text-lg font-bold text-text drop-shadow-sm">{item.text}</div>
                                                    <div className="text-[10px] text-text-dim font-mono mt-2">1 in {item.probability.toLocaleString()}</div>
                                                    <div className="text-[9px] text-text-dim uppercase tracking-widest mt-auto pt-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2">Visualize</div>
                                                </>
                                            ) : <div className="text-text-dim font-mono">LOCKED</div>}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            // Generic View for Ores/Gold Ores/Fish/Plants/Dreams
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {((activeTab === 'ORES' ? ORES : activeTab === 'GOLD_ORES' ? GOLD_ORES : activeTab === 'FISH' ? FISH : activeTab === 'PLANTS' ? PLANTS : DREAMS) as any[])
                                    .sort((a, b) => a.id - b.id)
                                    .map((item) => {
                                        // Determine discovery based on tab sets
                                        let set;
                                        if (activeTab === 'ORES' || activeTab === 'GOLD_ORES') set = discoveredOreSet;
                                        else if (activeTab === 'FISH') set = discoveredFishSet;
                                        else if (activeTab === 'PLANTS') set = discoveredPlantSet;
                                        else set = discoveredDreamSet;

                                        const isDiscovered = set.has(item.id);
                                        const isVisible = isDiscovered || showSpoilers;

                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => isVisible && handleResourceClick(item.id, item.name, item.description)}
                                                className={`
                                                    relative p-4 border rounded-lg text-center transition-all h-40 flex flex-col items-center justify-center gap-2
                                                    ${isVisible ? 'border-border bg-surface hover:bg-surface-highlight cursor-pointer group' : 'border-border bg-surface opacity-50'}
                                                `}
                                                style={{
                                                    borderColor: isVisible && item.id > 20 ? item.glowColor : undefined,
                                                    boxShadow: isVisible && item.id > 30 ? `0 0 15px ${item.glowColor}22` : 'none'
                                                }}
                                            >
                                                {isVisible ? (
                                                    <>
                                                        <div className="text-[9px] font-mono uppercase text-text-dim tracking-widest mb-1">
                                                            {item.tierName}
                                                        </div>
                                                        <div className={`text-lg font-bold drop-shadow-sm`} style={{ color: item.glowColor }}>
                                                            {item.name}
                                                        </div>
                                                        <div className="text-[10px] text-text-dim font-mono mt-2">
                                                            1 in {item.probability.toLocaleString()}
                                                        </div>
                                                        <div className="text-[9px] text-text-dim uppercase tracking-widest mt-auto pt-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2">
                                                            Visualize
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-text-dim font-mono">LOCKED</div>
                                                )}
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};