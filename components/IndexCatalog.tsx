import React, { useState, useMemo } from 'react';
import { InventoryItem, RarityId, ItemData, OreInventoryItem, FishInventoryItem, PlantInventoryItem } from '../types';
import { RARITY_TIERS, PHRASES, TRANSLATIONS, ORES, FISH, PLANTS } from '../constants';
import { RarityBadge } from './RarityBadge';
import { audioService } from '../services/audioService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    inventory: InventoryItem[];
    oreInventory?: OreInventoryItem[];
    fishInventory?: FishInventoryItem[];
    plantInventory?: PlantInventoryItem[];
    onSelectItem: (item: ItemData, rarityId: RarityId) => void;
}

type Tab = 'ITEMS' | 'ORES' | 'FISH' | 'PLANTS';

export const IndexCatalog: React.FC<Props> = ({ isOpen, onClose, inventory, oreInventory = [], fishInventory = [], plantInventory = [], onSelectItem }) => {
    const [activeTab, setActiveTab] = useState<Tab>('ITEMS');
    const [selectedRarity, setSelectedRarity] = useState<RarityId>(RarityId.COMMON);
    const [showSpoilers, setShowSpoilers] = useState(false);
    const T = TRANSLATIONS['en'];

    const discoveredSet = useMemo(() => {
        const set = new Set<string>();
        inventory.forEach(i => set.add(`${i.rarityId}:${i.text}`));
        return set;
    }, [inventory]);

    const discoveredOreSet = useMemo(() => {
        const set = new Set<number>();
        oreInventory.forEach(i => set.add(i.id));
        return set;
    }, [oreInventory]);

    const discoveredFishSet = useMemo(() => {
        const set = new Set<number>();
        fishInventory.forEach(i => set.add(i.id));
        return set;
    }, [fishInventory]);

    const discoveredPlantSet = useMemo(() => {
        const set = new Set<number>();
        plantInventory.forEach(i => set.add(i.id));
        return set;
    }, [plantInventory]);

    if (!isOpen) return null;

    const tiers = Object.values(RARITY_TIERS).sort((a, b) => a.id - b.id);
    const currentItems = PHRASES['en'][selectedRarity] || [];

    // Calculate completion percentage
    const totalItems = Object.values(PHRASES['en']).flat().length;
    const foundItems = inventory.length;
    const percentComplete = Math.min(100, Math.floor((foundItems / totalItems) * 100));

    const totalOres = ORES.length;
    const foundOres = oreInventory.length;
    const orePercent = Math.min(100, Math.floor((foundOres / totalOres) * 100));

    const totalFish = FISH.length;
    const foundFish = fishInventory.length;
    const fishPercent = Math.min(100, Math.floor((foundFish / totalFish) * 100));

    const totalPlants = PLANTS.length;
    const foundPlants = plantInventory.length;
    const plantPercent = Math.min(100, Math.floor((foundPlants / totalPlants) * 100));

    // Helper to handle resource clicks
    const handleResourceClick = (id: number, name: string, description: string) => {
        // Calculate a pseudo-rarity for visualization purposes based on ID
        // Range 1-150 roughly maps to tiers 1-15
        const pseudoRarity = Math.min(Math.ceil(id / 10), 15) as RarityId;

        onSelectItem({
            text: name,
            description: description
        }, pseudoRarity);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
            <div className="w-full max-w-5xl h-[85vh] bg-neutral-900/50 border border-neutral-800 rounded-lg flex flex-col md:flex-row overflow-hidden shadow-2xl">

                {/* Sidebar - Controls & Navigation */}
                <div className="w-full md:w-64 bg-black/40 border-r border-neutral-800 flex flex-col">
                    <div className="p-4 border-b border-neutral-800 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white tracking-wider font-mono">INDEX</h2>
                            <div className="text-[10px] text-neutral-500 font-mono">
                                {activeTab === 'ITEMS' && `${percentComplete}%`}
                                {activeTab === 'ORES' && `${orePercent}%`}
                                {activeTab === 'FISH' && `${fishPercent}%`}
                                {activeTab === 'PLANTS' && `${plantPercent}%`}
                            </div>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex flex-col gap-1">
                            <div className="flex p-1 bg-neutral-900 rounded border border-neutral-800 gap-1 overflow-x-auto">
                                <button
                                    onClick={() => { audioService.playClick(); setActiveTab('ITEMS'); }}
                                    className={`flex-1 py-2 text-xs font-mono text-center rounded ${activeTab === 'ITEMS' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                                >
                                    ITEMS
                                </button>
                                <button
                                    onClick={() => { audioService.playClick(); setActiveTab('ORES'); }}
                                    className={`flex-1 py-2 text-xs font-mono text-center rounded ${activeTab === 'ORES' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                                >
                                    ORES
                                </button>
                                <button
                                    onClick={() => { audioService.playClick(); setActiveTab('FISH'); }}
                                    className={`flex-1 py-2 text-xs font-mono text-center rounded ${activeTab === 'FISH' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                                >
                                    FISH
                                </button>
                                <button
                                    onClick={() => { audioService.playClick(); setActiveTab('PLANTS'); }}
                                    className={`flex-1 py-2 text-xs font-mono text-center rounded ${activeTab === 'PLANTS' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                                >
                                    PLANTS
                                </button>
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
                                    ${selectedRarity === tier.id ? 'bg-neutral-800 text-white border border-neutral-600' : 'text-neutral-500 hover:bg-neutral-900 hover:text-neutral-300'}
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

                    {activeTab === 'ORES' && (
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="text-xs text-neutral-400 font-mono mb-4">
                                CATALOGUED RESOURCES FROM SECTOR 7G.
                            </div>
                            <div className="space-y-2">
                                <div className="text-[10px] text-neutral-500 uppercase tracking-widest">Statistics</div>
                                <div className="flex justify-between text-xs font-mono text-neutral-300">
                                    <span>Discovered</span>
                                    <span>{foundOres} / {totalOres}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'FISH' && (
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="text-xs text-cyan-400 font-mono mb-4">
                                DATA-FORMS FROM THE DEEP WEB.
                            </div>
                            <div className="space-y-2">
                                <div className="text-[10px] text-neutral-500 uppercase tracking-widest">Statistics</div>
                                <div className="flex justify-between text-xs font-mono text-neutral-300">
                                    <span>Discovered</span>
                                    <span>{foundFish} / {totalFish}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'PLANTS' && (
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="text-xs text-green-400 font-mono mb-4">
                                FLORA FROM THE HYDROPONICS BAY.
                            </div>
                            <div className="space-y-2">
                                <div className="text-[10px] text-neutral-500 uppercase tracking-widest">Statistics</div>
                                <div className="flex justify-between text-xs font-mono text-neutral-300">
                                    <span>Discovered</span>
                                    <span>{foundPlants} / {totalPlants}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-4 border-t border-neutral-800">
                        <label className="flex items-center gap-2 text-xs text-neutral-400 font-mono cursor-pointer hover:text-white">
                            <input
                                type="checkbox"
                                checked={showSpoilers}
                                onChange={(e) => setShowSpoilers(e.target.checked)}
                                className="rounded border-neutral-700 bg-neutral-800"
                            />
                            SHOW UNDISCOVERED
                        </label>
                    </div>
                </div>

                {/* Main Content - Grid */}
                <div className="flex-1 flex flex-col bg-neutral-900/20">
                    <div className="p-4 flex justify-between items-center border-b border-neutral-800 bg-black/20">
                        <div className="flex items-center gap-3">
                            {activeTab === 'ITEMS' ? (
                                <>
                                    <RarityBadge rarityId={selectedRarity} />
                                    <span className="text-xs text-neutral-500 font-mono">
                                        1 in {RARITY_TIERS[selectedRarity].probability.toLocaleString()}
                                    </span>
                                </>
                            ) : activeTab === 'ORES' ? (
                                <span className="text-sm font-bold font-mono text-white">ORE DEPOSITS</span>
                            ) : activeTab === 'FISH' ? (
                                <span className="text-sm font-bold font-mono text-cyan-400">AQUATIC DATABASE</span>
                            ) : (
                                <span className="text-sm font-bold font-mono text-green-400">BOTANICAL ARCHIVE</span>
                            )}
                        </div>
                        <button onClick={onClose} className="text-neutral-500 hover:text-white font-mono">[X]</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === 'ITEMS' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {currentItems.map((item, idx) => {
                                    const isDiscovered = discoveredSet.has(`${selectedRarity}:${item.text}`);
                                    const isVisible = isDiscovered || showSpoilers;

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => isVisible && onSelectItem(item, selectedRarity)}
                                            disabled={!isVisible}
                                            className={`
                                        relative p-4 border rounded-lg text-left transition-all group h-32 flex flex-col justify-between
                                        ${isVisible
                                                    ? `border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 hover:border-${RARITY_TIERS[selectedRarity].color.split('-')[1]}-500`
                                                    : 'border-neutral-800 bg-neutral-900/50 opacity-50 cursor-not-allowed'
                                                }
                                    `}
                                        >
                                            {isVisible ? (
                                                <>
                                                    <div className={`font-bold text-sm ${RARITY_TIERS[selectedRarity].textColor} line-clamp-2`}>
                                                        {item.text}
                                                    </div>
                                                    <div className="text-[10px] text-neutral-500 font-mono line-clamp-2 mt-2">
                                                        {item.description}
                                                    </div>
                                                    {selectedRarity >= RarityId.PRIMORDIAL && (
                                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white animate-pulse" title="Has Cutscene" />
                                                    )}
                                                    <div className="text-[9px] text-neutral-600 uppercase tracking-widest mt-auto pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        Visualize
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <span className="text-neutral-700 font-mono text-2xl">???</span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : activeTab === 'ORES' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {ORES.sort((a, b) => a.id - b.id).map((ore) => {
                                    const isDiscovered = discoveredOreSet.has(ore.id);
                                    const isVisible = isDiscovered || showSpoilers;

                                    return (
                                        <div
                                            key={ore.id}
                                            onClick={() => isVisible && handleResourceClick(ore.id, ore.name, ore.description)}
                                            className={`
                                        relative p-4 border rounded-lg text-center transition-all h-40 flex flex-col items-center justify-center gap-2
                                        ${isVisible
                                                    ? 'border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 cursor-pointer group'
                                                    : 'border-neutral-800 bg-neutral-900/50 opacity-50'
                                                }
                                    `}
                                            style={{
                                                borderColor: isVisible && ore.id > 15 ? ore.glowColor : undefined,
                                                boxShadow: isVisible && ore.id > 20 ? `0 0 15px ${ore.glowColor}22` : 'none'
                                            }}
                                        >
                                            {isVisible ? (
                                                <>
                                                    <div className="text-[9px] font-mono uppercase text-neutral-500 tracking-widest mb-1">
                                                        {ore.tierName}
                                                    </div>
                                                    <div className={`text-lg font-bold ${ore.color} drop-shadow-sm`}>
                                                        {ore.name}
                                                    </div>
                                                    <div className="text-[10px] text-neutral-500 font-mono mt-2">
                                                        1 in {ore.probability.toLocaleString()}
                                                    </div>
                                                    <div className="text-[9px] text-neutral-600 uppercase tracking-widest mt-auto pt-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2">
                                                        Visualize
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-neutral-700 font-mono">LOCKED</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : activeTab === 'FISH' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {FISH.sort((a, b) => a.id - b.id).map((fish) => {
                                    const isDiscovered = discoveredFishSet.has(fish.id);
                                    const isVisible = isDiscovered || showSpoilers;

                                    return (
                                        <div
                                            key={fish.id}
                                            onClick={() => isVisible && handleResourceClick(fish.id, fish.name, fish.description)}
                                            className={`
                                        relative p-4 border rounded-lg text-center transition-all h-40 flex flex-col items-center justify-center gap-2
                                        ${isVisible
                                                    ? 'border-cyan-900 bg-cyan-950/20 hover:bg-cyan-950/40 cursor-pointer group'
                                                    : 'border-neutral-800 bg-neutral-900/50 opacity-50'
                                                }
                                    `}
                                            style={{
                                                borderColor: isVisible && fish.id > 15 ? fish.glowColor : undefined,
                                                boxShadow: isVisible && fish.id > 20 ? `0 0 15px ${fish.glowColor}22` : 'none'
                                            }}
                                        >
                                            {isVisible ? (
                                                <>
                                                    <div className="text-[9px] font-mono uppercase text-cyan-700 tracking-widest mb-1">
                                                        {fish.tierName}
                                                    </div>
                                                    <div className={`text-lg font-bold ${fish.color} drop-shadow-sm`}>
                                                        {fish.name}
                                                    </div>
                                                    <div className="text-[10px] text-cyan-600 font-mono mt-2">
                                                        1 in {fish.probability.toLocaleString()}
                                                    </div>
                                                    <div className="text-[9px] text-cyan-800 uppercase tracking-widest mt-auto pt-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2">
                                                        Visualize
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-neutral-700 font-mono">LOCKED</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {PLANTS.sort((a, b) => a.id - b.id).map((plant) => {
                                    const isDiscovered = discoveredPlantSet.has(plant.id);
                                    const isVisible = isDiscovered || showSpoilers;

                                    return (
                                        <div
                                            key={plant.id}
                                            onClick={() => isVisible && handleResourceClick(plant.id, plant.name, plant.description)}
                                            className={`
                                        relative p-4 border rounded-lg text-center transition-all h-40 flex flex-col items-center justify-center gap-2
                                        ${isVisible
                                                    ? 'border-green-900 bg-green-950/20 hover:bg-green-950/40 cursor-pointer group'
                                                    : 'border-neutral-800 bg-neutral-900/50 opacity-50'
                                                }
                                    `}
                                            style={{
                                                borderColor: isVisible && plant.id > 15 ? plant.glowColor : undefined,
                                                boxShadow: isVisible && plant.id > 20 ? `0 0 15px ${plant.glowColor}22` : 'none'
                                            }}
                                        >
                                            {isVisible ? (
                                                <>
                                                    <div className="text-[9px] font-mono uppercase text-green-700 tracking-widest mb-1">
                                                        {plant.tierName}
                                                    </div>
                                                    <div className={`text-lg font-bold ${plant.color} drop-shadow-sm`}>
                                                        {plant.name}
                                                    </div>
                                                    <div className="text-[10px] text-green-600 font-mono mt-2">
                                                        1 in {plant.probability.toLocaleString()}
                                                    </div>
                                                    <div className="text-[9px] text-green-800 uppercase tracking-widest mt-auto pt-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2">
                                                        Visualize
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-neutral-700 font-mono">LOCKED</div>
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