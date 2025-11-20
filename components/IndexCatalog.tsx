
import React, { useState, useMemo } from 'react';
import { InventoryItem, Language, RarityId, ItemData } from '../types';
import { RARITY_TIERS, PHRASES, TRANSLATIONS } from '../constants';
import { RarityBadge } from './RarityBadge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  inventory: InventoryItem[];
  onSelectItem: (item: ItemData, rarityId: RarityId) => void;
}

export const IndexCatalog: React.FC<Props> = ({ isOpen, onClose, language, inventory, onSelectItem }) => {
  const [selectedRarity, setSelectedRarity] = useState<RarityId>(RarityId.COMMON);
  const [showSpoilers, setShowSpoilers] = useState(false);
  const T = TRANSLATIONS[language];

  const discoveredSet = useMemo(() => {
    const set = new Set<string>();
    inventory.forEach(i => set.add(`${i.rarityId}:${i.text}`));
    return set;
  }, [inventory]);

  if (!isOpen) return null;

  const tiers = Object.values(RARITY_TIERS).sort((a, b) => a.id - b.id);
  const currentItems = PHRASES[language][selectedRarity] || [];

  // Calculate completion percentage
  const totalItems = Object.values(PHRASES[language]).flat().length;
  const foundItems = inventory.length; 
  const percentComplete = Math.min(100, Math.floor((foundItems / totalItems) * 100));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
      <div className="w-full max-w-5xl h-[85vh] bg-neutral-900/50 border border-neutral-800 rounded-lg flex flex-col md:flex-row overflow-hidden shadow-2xl">
        
        {/* Sidebar - Rarities */}
        <div className="w-full md:w-64 bg-black/40 border-r border-neutral-800 flex flex-col">
            <div className="p-4 border-b border-neutral-800">
                <h2 className="text-xl font-bold text-white tracking-wider font-mono">INDEX</h2>
                <div className="text-[10px] text-neutral-500 font-mono mt-1">
                    COMPLETION: {percentComplete}%
                </div>
                <div className="w-full bg-neutral-800 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-white h-full" style={{ width: `${percentComplete}%` }} />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {tiers.map((tier) => {
                    const count = PHRASES[language][tier.id]?.length || 0;
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
                    <RarityBadge rarityId={selectedRarity} />
                    <span className="text-xs text-neutral-500 font-mono">
                        1 in {RARITY_TIERS[selectedRarity].probability.toLocaleString()}
                    </span>
                </div>
                <button onClick={onClose} className="text-neutral-500 hover:text-white font-mono">[X]</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
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
            </div>
        </div>

      </div>
    </div>
  );
};
    