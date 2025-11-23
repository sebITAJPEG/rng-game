import React, { useState } from 'react';
import { CraftableItem, CraftingCategory, GameStats, OreInventoryItem, FishInventoryItem, PlantInventoryItem, DreamInventoryItem } from '../types';
import { ORES, FISH, PLANTS, DREAMS } from '../constants';
import { CRAFTABLE_ITEMS } from '../craftingData';
import { audioService } from '../services/audioService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    stats: GameStats;
    oreInventory: OreInventoryItem[];
    fishInventory: FishInventoryItem[];
    plantInventory: PlantInventoryItem[];
    dreamInventory: DreamInventoryItem[]; // Added this
    onCraft: (item: CraftableItem) => void;
    onEquip: (item: CraftableItem) => void;
    onUnequip: (item: CraftableItem) => void;
}

export const CraftingPanel: React.FC<Props> = ({
    isOpen, onClose, stats, oreInventory, fishInventory, plantInventory, dreamInventory, onCraft, onEquip, onUnequip
}) => {
    const [activeCategory, setActiveCategory] = useState<CraftingCategory>('GENERAL');

    if (!isOpen) return null;

    // Filter items by category
    const categoryItems = CRAFTABLE_ITEMS.filter(i => i.category === activeCategory);

    // Sort: Multi items first, then Boost items by tier
    categoryItems.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'MULTI' ? -1 : 1;
        return a.tier - b.tier;
    });

    const getMaterialCount = (type: 'ORE' | 'FISH' | 'PLANT' | 'DREAM' | 'ITEM', id: number | string) => {
        if (type === 'ORE') return oreInventory.find(i => i.id === Number(id))?.count || 0;
        if (type === 'FISH') return fishInventory.find(i => i.id === Number(id))?.count || 0;
        if (type === 'PLANT') return plantInventory.find(i => i.id === Number(id))?.count || 0;
        if (type === 'DREAM') return dreamInventory.find(i => i.id === Number(id))?.count || 0;
        return 0;
    };

    const getMaterialName = (type: 'ORE' | 'FISH' | 'PLANT' | 'DREAM' | 'ITEM', id: number | string) => {
        if (type === 'ORE') return ORES.find(o => o.id === Number(id))?.name || `Ore #${id}`;
        if (type === 'FISH') return FISH.find(f => f.id === Number(id))?.name || `Fish #${id}`;
        if (type === 'PLANT') return PLANTS.find(p => p.id === Number(id))?.name || `Plant #${id}`;
        if (type === 'DREAM') return DREAMS.find(d => d.id === Number(id))?.name || `Dream #${id}`;
        return `Item #${id}`;
    };

    const getMaterialColor = (type: 'ORE' | 'FISH' | 'PLANT' | 'DREAM' | 'ITEM', id: number | string) => {
        if (type === 'ORE') return ORES.find(o => o.id === Number(id))?.color || 'text-gray-500';
        if (type === 'FISH') return FISH.find(f => f.id === Number(id))?.color || 'text-gray-500';
        if (type === 'PLANT') return PLANTS.find(p => p.id === Number(id))?.color || 'text-gray-500';
        if (type === 'DREAM') return DREAMS.find(d => d.id === Number(id))?.color || 'text-purple-400';
        return 'text-gray-500';
    };

    // Helper to check if item is equipped in its slot
    const isItemEquipped = (item: CraftableItem) => {
        const slotKey = `${item.category}_${item.type}`;
        return stats.equippedItems?.[slotKey] === item.id;
    };

    return (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
            <div className="w-full max-w-6xl h-[85vh] bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-neutral-800 bg-black/40">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-wider font-mono">WORKBENCH</h2>
                        <span className="text-xs font-mono text-neutral-500">CRAFT & EQUIP GEAR</span>
                    </div>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white font-mono">[CLOSE]</button>
                </div>

                {/* Category Tabs */}
                <div className="flex border-b border-neutral-800 bg-neutral-950/50 overflow-x-auto no-scrollbar">
                    {(['GENERAL', 'MINING', 'FISHING', 'HARVESTING', 'DREAMING'] as CraftingCategory[]).map(cat => (
                        <button
                            key={cat}
                            onClick={() => { setActiveCategory(cat); audioService.playClick(); }}
                            className={`
                flex-1 py-4 px-4 text-xs font-mono font-bold tracking-widest transition-all border-b-2 min-w-[100px]
                ${activeCategory === cat
                                    ? 'border-white text-white bg-neutral-800'
                                    : 'border-transparent text-neutral-500 hover:bg-neutral-900 hover:text-neutral-300'
                                }
              `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-neutral-900/50">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {categoryItems.map(item => {
                            const isOwned = stats.craftedItems?.[item.id];
                            const equipped = isItemEquipped(item);
                            const isMulti = item.type === 'MULTI';

                            // Check Requirements
                            const canAffordCost = stats.balance >= item.recipe.cost;
                            const materialsStatus = item.recipe.materials.map(mat => {
                                const current = getMaterialCount(mat.type, mat.id);
                                return { ...mat, current, satisfied: current >= mat.count };
                            });
                            const hasMaterials = materialsStatus.every(m => m.satisfied);
                            const canCraft = canAffordCost && hasMaterials && !isOwned;

                            return (
                                <div
                                    key={item.id}
                                    className={`
                    relative p-4 rounded border flex flex-col gap-4 transition-all
                    ${equipped
                                            ? 'bg-green-900/20 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                                            : isOwned
                                                ? 'bg-neutral-800/40 border-neutral-600'
                                                : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-600'
                                        }
                  `}
                                >
                                    {/* Header */}
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className={`font-bold font-mono ${equipped ? 'text-green-400' : isOwned ? 'text-white' : 'text-neutral-400'}`}>
                                                    {item.name}
                                                </h3>
                                                <span className={`text-[10px] px-1.5 rounded font-mono border ${isMulti ? 'bg-purple-950 border-purple-800 text-purple-400' : 'bg-blue-950 border-blue-800 text-blue-400'}`}>
                                                    {isMulti ? 'MULTI' : 'BOOST'}
                                                </span>
                                                <span className="text-[10px] bg-neutral-950 px-1.5 rounded text-neutral-500 font-mono border border-neutral-800">
                                                    T{item.tier}
                                                </span>
                                            </div>
                                            <p className="text-xs text-neutral-400 font-mono mt-1 min-h-[2rem]">{item.description}</p>
                                        </div>
                                    </div>

                                    {/* Materials Grid (Only show if not owned) */}
                                    {!isOwned && (
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            {materialsStatus.map((mat, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-black/20 p-2 rounded border border-white/5">
                                                    <div className={`text-[10px] truncate max-w-[80px] ${getMaterialColor(mat.type, mat.id)}`}>
                                                        {getMaterialName(mat.type, mat.id)}
                                                    </div>
                                                    <div className={`text-[10px] font-mono ${mat.satisfied ? 'text-green-500' : 'text-red-500'}`}>
                                                        {mat.current}/{mat.count}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="col-span-2 flex justify-between items-center bg-black/20 p-2 rounded border border-white/5">
                                                <div className="text-[10px] text-yellow-500">COST</div>
                                                <div className={`text-[10px] font-mono ${canAffordCost ? 'text-green-500' : 'text-red-500'}`}>
                                                    ${item.recipe.cost.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="mt-auto">
                                        {isOwned ? (
                                            equipped ? (
                                                <button
                                                    onClick={() => onUnequip(item)}
                                                    className="w-full py-2 font-mono text-xs font-bold tracking-widest border border-red-900 text-red-500 hover:bg-red-950 hover:text-white transition-all"
                                                >
                                                    UNEQUIP
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => onEquip(item)}
                                                    className="w-full py-2 font-mono text-xs font-bold tracking-widest border border-green-900 text-green-500 hover:bg-green-950 hover:text-white transition-all"
                                                >
                                                    EQUIP
                                                </button>
                                            )
                                        ) : (
                                            <button
                                                onClick={() => onCraft(item)}
                                                disabled={!canCraft}
                                                className={`
                            w-full py-2 font-mono text-xs font-bold tracking-widest transition-all
                            ${canCraft
                                                        ? 'bg-white text-black hover:bg-neutral-200'
                                                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                                                    }
                          `}
                                            >
                                                CRAFT
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};