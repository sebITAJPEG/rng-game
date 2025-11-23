import React, { useState } from 'react';
import { CraftableItem, CraftingCategory, GameStats, InventoryItem, OreInventoryItem, FishInventoryItem, PlantInventoryItem, RarityId } from '../types';
import { CRAFTABLE_ITEMS } from '../craftingData';
import { RARITY_TIERS, ORES, FISH, PLANTS } from '../constants';

interface CraftingPanelProps {
    stats: GameStats;
    inventory: InventoryItem[];
    oreInventory: OreInventoryItem[];
    fishInventory: FishInventoryItem[];
    plantInventory: PlantInventoryItem[];
    craftedItems: Record<string, boolean>;
    onCraft: (item: CraftableItem) => void;
    onClose: () => void;
}

export const CraftingPanel: React.FC<CraftingPanelProps> = ({
    stats,
    inventory,
    oreInventory,
    fishInventory,
    plantInventory,
    craftedItems,
    onCraft,
    onClose
}) => {
    const [activeCategory, setActiveCategory] = useState<CraftingCategory>('GENERAL');

    const categories: CraftingCategory[] = ['GENERAL', 'MINING', 'FISHING', 'HARVESTING'];

    const getMaterialCount = (type: 'ORE' | 'FISH' | 'PLANT' | 'ITEM', id: number | string): number => {
        switch (type) {
            case 'ORE':
                return oreInventory.find(i => i.id === id)?.count || 0;
            case 'FISH':
                return fishInventory.find(i => i.id === id)?.count || 0;
            case 'PLANT':
                return plantInventory.find(i => i.id === id)?.count || 0;
            case 'ITEM':
                return inventory.find(i => i.text === id)?.count || 0;
            default:
                return 0;
        }
    };

    const getMaterialName = (type: 'ORE' | 'FISH' | 'PLANT' | 'ITEM', id: number | string): string => {
        switch (type) {
            case 'ORE':
                return ORES.find(o => o.id === id)?.name || `Ore #${id}`;
            case 'FISH':
                return FISH.find(f => f.id === id)?.name || `Fish #${id}`;
            case 'PLANT':
                return PLANTS.find(p => p.id === id)?.name || `Plant #${id}`;
            case 'ITEM':
                return String(id);
            default:
                return 'Unknown';
        }
    };

    const canCraft = (item: CraftableItem): boolean => {
        if (stats.balance < item.recipe.cost) return false;
        if (craftedItems[item.id]) return false; // Already owned

        return item.recipe.materials.every(mat => getMaterialCount(mat.type, mat.id) >= mat.count);
    };

    const filteredItems = CRAFTABLE_ITEMS.filter(item => item.category === activeCategory);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border border-neutral-700 w-full max-w-4xl h-[80vh] flex flex-col rounded-lg shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-950">
                    <h2 className="text-xl font-bold text-amber-500 font-mono tracking-wider">WORKBENCH</h2>
                    <button
                        onClick={onClose}
                        className="text-neutral-500 hover:text-white transition-colors"
                    >
                        [CLOSE]
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-neutral-800 bg-neutral-900">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`flex-1 py-3 font-mono text-sm transition-colors ${activeCategory === cat
                                    ? 'bg-neutral-800 text-amber-500 border-b-2 border-amber-500'
                                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-900">
                    {filteredItems.map(item => {
                        const rarityColor = RARITY_TIERS[item.tier].color;
                        const isOwned = craftedItems[item.id];
                        const craftable = canCraft(item);

                        return (
                            <div
                                key={item.id}
                                className={`border rounded p-4 flex flex-col gap-3 transition-all ${isOwned
                                        ? 'border-green-900/50 bg-green-900/10 opacity-75'
                                        : craftable
                                            ? 'border-neutral-600 bg-neutral-800 hover:border-amber-500/50'
                                            : 'border-neutral-800 bg-neutral-900/50 opacity-60'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className={`font-bold font-mono ${rarityColor} ${isOwned ? 'line-through decoration-green-500' : ''}`}>
                                            {item.name}
                                        </h3>
                                        <p className="text-xs text-neutral-400 mt-1 font-mono">{item.description}</p>
                                    </div>
                                    {isOwned && <span className="text-xs font-bold text-green-500 bg-green-900/20 px-2 py-1 rounded border border-green-900">OWNED</span>}
                                </div>

                                {/* Bonuses */}
                                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-neutral-300 bg-black/20 p-2 rounded">
                                    {item.bonuses.luck && <div>LUCK: <span className="text-yellow-400">+{item.bonuses.luck}</span></div>}
                                    {item.bonuses.speed && <div>SPEED: <span className="text-cyan-400">-{item.bonuses.speed * 100}%</span></div>}
                                    {item.bonuses.yield && <div>YIELD: <span className="text-green-400">+{item.bonuses.yield}</span></div>}
                                    {item.bonuses.multi && <div>MULTI: <span className="text-purple-400">+{item.bonuses.multi}</span></div>}
                                </div>

                                {/* Recipe */}
                                <div className="mt-auto">
                                    <div className="text-[10px] font-bold text-neutral-500 mb-2 uppercase tracking-wider">Required Materials</div>
                                    <div className="space-y-1 mb-3">
                                        {item.recipe.materials.map((mat, idx) => {
                                            const count = getMaterialCount(mat.type, mat.id);
                                            const hasEnough = count >= mat.count;
                                            return (
                                                <div key={idx} className="flex justify-between text-xs font-mono">
                                                    <span className="text-neutral-400 truncate max-w-[70%]">
                                                        {getMaterialName(mat.type, mat.id)}
                                                    </span>
                                                    <span className={hasEnough ? 'text-green-500' : 'text-red-500'}>
                                                        {count}/{mat.count}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                        <div className="flex justify-between text-xs font-mono border-t border-neutral-700 pt-1 mt-1">
                                            <span className="text-neutral-400">COST</span>
                                            <span className={stats.balance >= item.recipe.cost ? 'text-green-500' : 'text-red-500'}>
                                                ${item.recipe.cost.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => onCraft(item)}
                                        disabled={!craftable || isOwned}
                                        className={`w-full py-2 text-xs font-bold font-mono uppercase tracking-widest transition-all ${isOwned
                                                ? 'bg-transparent text-green-500 cursor-default'
                                                : craftable
                                                    ? 'bg-amber-600 hover:bg-amber-500 text-black shadow-[0_0_10px_rgba(217,119,6,0.4)]'
                                                    : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                                            }`}
                                    >
                                        {isOwned ? 'Crafted' : 'Craft Item'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
