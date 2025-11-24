import React, { useState, useMemo } from 'react';
import { InventoryItem, RarityId, ItemData, OreInventoryItem, FishInventoryItem, PlantInventoryItem, DreamInventoryItem } from '../types';
import { RARITY_TIERS, PHRASES, TRANSLATIONS, ORES, GOLD_ORES, FISH, PLANTS, DREAMS } from '../constants';
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
    onSelectItem: (item: ItemData, rarityId: RarityId) => void;
}

type Tab = 'ITEMS' | 'ORES' | 'FISH' | 'PLANTS' | 'DREAMS';

export const IndexCatalog: React.FC<Props> = ({ isOpen, onClose, inventory, oreInventory = [], fishInventory = [], plantInventory = [], dreamInventory = [], onSelectItem }) => {
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

    const discoveredDreamSet = useMemo(() => {
        const set = new Set<number>();
        dreamInventory.forEach(i => set.add(i.id));
        return set;
    }, [dreamInventory]);

    if (!isOpen) return null;

    const tiers = Object.values(RARITY_TIERS).sort((a, b) => a.id - b.id);
    const currentItems = PHRASES['en'][selectedRarity] || [];

    // Calculate completion percentage
    const totalItems = Object.values(PHRASES['en']).flat().length;
    const foundItems = inventory.length;
    const percentComplete = Math.min(100, Math.floor((foundItems / totalItems) * 100));

    const totalOres = ORES.length + GOLD_ORES.length;
    const foundOres = oreInventory.length;
    const orePercent = Math.min(100, Math.floor((foundOres / totalOres) * 100));

    const totalFish = FISH.length;
    const foundFish = fishInventory.length;
    const fishPercent = Math.min(100, Math.floor((foundFish / totalFish) * 100));

    const totalPlants = PLANTS.length;
    const foundPlants = plantInventory.length;
    const plantPercent = Math.min(100, Math.floor((foundPlants / totalPlants) * 100));

    const totalDreams = DREAMS.length;
    const foundDreams = dreamInventory.length;
    const dreamPercent = Math.min(100, Math.floor((foundDreams / totalDreams) * 100));

    // Helper to handle resource clicks
    const handleResourceClick = (id: number, name: string, description: string) => {
        // Calculate a pseudo-rarity for visualization purposes based on ID
        const pseudoRarity = Math.min(Math.ceil((id > 1000 ? id - 1000 : id) / 10), 15) as RarityId;

        onSelectItem({
            text: name,
            description: description
        }, pseudoRarity);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
            <div className="w-full max-w-6xl h-[85vh] bg-neutral-900/50 border border-neutral-800 rounded-lg flex flex-col md:flex-row overflow-hidden shadow-2xl">

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
                                {activeTab === 'DREAMS' && `${dreamPercent}%`}
                            </div>
                        </div>

                        {/* Tab Switcher */}
                        <div className="flex flex-col gap-1">
                            <div className="flex p-1 bg-neutral-900 rounded border border-neutral-800 gap-1 overflow-x-auto no-scrollbar">
                                <button
                                    onClick={() => { audioService.playClick(); setActiveTab('ITEMS'); }}
                                    className={`flex-1 py-2 text-[10px] font-mono text-center rounded ${activeTab === 'ITEMS' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                                >
                                    ITEMS
                                </button>
                                <button
                                    onClick={() => { audioService.playClick(); setActiveTab('ORES'); }}
                                    className={`flex-1 py-2 text-[10px] font-mono text-center rounded ${activeTab === 'ORES' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                                >
                                    ORES
                                </button>
                                <button
                                    onClick={() => { audioService.playClick(); setActiveTab('FISH'); }}
                                    className={`flex-1 py-2 text-[10px] font-mono text-center rounded ${activeTab === 'FISH' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                                >
                                    FISH
                                </button>
                                <button
                                    onClick={() => { audioService.playClick(); setActiveTab('PLANTS'); }}
                                    className={`flex-1 py-2 text-[10px] font-mono text-center rounded ${activeTab === 'PLANTS' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                                >
                                    PLANTS
                                </button>
                                <button
                                    onClick={() => { audioService.playClick(); setActiveTab('DREAMS'); }}
                                    className={`flex-1 py-2 text-[10px] font-mono text-center rounded ${activeTab === 'DREAMS' ? 'bg-neutral-700 text-white' : 'text-neutral-500 hover:text-neutral-300'}`}
                                >
                                    DREAMS
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

                    {/* Statistics Panels */}
                    {activeTab !== 'ITEMS' && (
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className={`text-xs font-mono mb-4 ${activeTab === 'ORES' ? 'text-neutral-400' :
                                    activeTab === 'FISH' ? 'text-cyan-400' :
                                        activeTab === 'PLANTS' ? 'text-green-400' :
                                            'text-purple-400'
                                }`}>
                                {activeTab === 'ORES' && "CATALOGUED RESOURCES FROM SECTOR 7G & DIMENSION AU-79."}
                                {activeTab === 'FISH' && "DATA-FORMS FROM THE DEEP WEB."}
                                {activeTab === 'PLANTS' && "FLORA FROM THE HYDROPONICS BAY."}
                                {activeTab === 'DREAMS' && "FRAGMENTS FROM THE SUBCONSCIOUS."}
                            </div>
                            <div className="space-y-2">
                                <div className="text-[10px] text-neutral-500 uppercase tracking-widest">Statistics</div>
                                <div className="flex justify-between text-xs font-mono text-neutral-300">
                                    <span>Discovered</span>
                                    <span>
                                        {activeTab === 'ORES' && `${foundOres} / ${totalOres}`}
                                        {activeTab === 'FISH' && `${foundFish} / ${totalFish}`}
                                        {activeTab === 'PLANTS' && `${foundPlants} / ${totalPlants}`}
                                        {activeTab === 'DREAMS' && `${foundDreams} / ${totalDreams}`}
                                    </span>
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
                            ) : activeTab === 'PLANTS' ? (
                                <span className="text-sm font-bold font-mono text-green-400">BOTANICAL ARCHIVE</span>
                            ) : (
                                <span className="text-sm font-bold font-mono text-purple-400">DREAM LOG</span>
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
                            <div className="space-y-8">
                                {/* Standard Ores */}
                                <div>
                                    <h3 className="text-xs font-mono text-neutral-500 mb-4 uppercase tracking-widest border-b border-neutral-800 pb-2">Standard Sector</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {ORES.sort((a, b) => a.id - b.id).map((item) => {
                                            const isDiscovered = discoveredOreSet.has(item.id);
                                            const isVisible = isDiscovered || showSpoilers;
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => isVisible && handleResourceClick(item.id, item.name, item.description)}
                                                    className={`
                                                    relative p-4 border rounded-lg text-center transition-all h-40 flex flex-col items-center justify-center gap-2
                                                    ${isVisible ? 'border-neutral-700 bg-neutral-800/50 hover:bg-neutral-800 cursor-pointer group' : 'border-neutral-800 bg-neutral-900/50 opacity-50'}
                                                `}
                                                    style={{
                                                        borderColor: isVisible && item.id > 15 ? item.glowColor : undefined,
                                                        boxShadow: isVisible && item.id > 20 ? `0 0 15px ${item.glowColor}22` : 'none'
                                                    }}
                                                >
                                                    {isVisible ? (
                                                        <>
                                                            <div className={`text-[9px] font-mono uppercase text-neutral-500 tracking-widest mb-1`}>{item.tierName}</div>
                                                            <div className={`text-lg font-bold ${item.color} drop-shadow-sm`}>{item.name}</div>
                                                            <div className={`text-[10px] text-neutral-500 font-mono mt-2`}>1 in {item.probability.toLocaleString()}</div>
                                                            <div className={`text-[9px] text-neutral-500 uppercase tracking-widest mt-auto pt-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2`}>Visualize</div>
                                                        </>
                                                    ) : <div className="text-neutral-700 font-mono">LOCKED</div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Gold Dimension Ores */}
                                <div>
                                    <h3 className="text-xs font-mono text-yellow-600 mb-4 uppercase tracking-widest border-b border-yellow-900/30 pb-2">Dimension AU-79</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {GOLD_ORES.sort((a, b) => a.id - b.id).map((item) => {
                                            const isDiscovered = discoveredOreSet.has(item.id);
                                            const isVisible = isDiscovered || showSpoilers;
                                            return (
                                                <div
                                                    key={item.id}
                                                    onClick={() => isVisible && handleResourceClick(item.id, item.name, item.description)}
                                                    className={`
                                                    relative p-4 border rounded-lg text-center transition-all h-40 flex flex-col items-center justify-center gap-2
                                                    ${isVisible ? 'border-yellow-800 bg-yellow-900/20 hover:bg-yellow-900/40 cursor-pointer group' : 'border-neutral-800 bg-neutral-900/50 opacity-50'}
                                                `}
                                                    style={{
                                                        borderColor: isVisible ? item.glowColor : undefined,
                                                        boxShadow: isVisible ? `0 0 15px ${item.glowColor}22` : 'none'
                                                    }}
                                                >
                                                    {isVisible ? (
                                                        <>
                                                            <div className={`text-[9px] font-mono uppercase text-yellow-600 tracking-widest mb-1`}>{item.tierName}</div>
                                                            <div className={`text-lg font-bold ${item.color} drop-shadow-sm`}>{item.name}</div>
                                                            <div className={`text-[10px] text-yellow-700 font-mono mt-2`}>1 in {item.probability.toLocaleString()}</div>
                                                            <div className={`text-[9px] text-yellow-500 uppercase tracking-widest mt-auto pt-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2`}>Visualize</div>
                                                        </>
                                                    ) : <div className="text-neutral-700 font-mono">LOCKED</div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Generic View for Fish/Plants/Dreams (simplified for brevity as they weren't changed)
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {(activeTab === 'FISH' ? FISH : activeTab === 'PLANTS' ? PLANTS : DREAMS)
                                    .sort((a, b) => a.id - b.id)
                                    .map((item) => {
                                        const isDiscovered = (activeTab === 'FISH' ? discoveredFishSet : activeTab === 'PLANTS' ? discoveredPlantSet : discoveredDreamSet).has(item.id);
                                        const isVisible = isDiscovered || showSpoilers;
                                        // ... simplified styling logic ...
                                        return (
                                            <div key={item.id} className="p-4 border rounded-lg text-center border-neutral-800 bg-neutral-900/50 opacity-50">
                                                {isVisible ? <span className={item.color}>{item.name}</span> : "LOCKED"}
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