import React from 'react';
import { InventoryItem, Language } from '../types';
import { RARITY_TIERS, TRANSLATIONS } from '../constants';
import { RarityBadge } from './RarityBadge';

interface Props {
  items: InventoryItem[];
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onInspect: (item: InventoryItem) => void;
}

export const Inventory: React.FC<Props> = ({ items, isOpen, onClose, language, onInspect }) => {
  const T = TRANSLATIONS[language];
  
  // Sort by rarity (desc), then by count
  const sortedItems = [...items].sort((a, b) => {
    if (b.rarityId !== a.rarityId) {
      return b.rarityId - a.rarityId;
    }
    return b.count - a.count;
  });

  const formatProbability = (p: number) => {
    if (p >= 1000000000000) return `1 in ${Math.round(p / 1000000000000)}T`;
    if (p >= 1000000000) return `1 in ${Math.round(p / 1000000000 * 10) / 10}B`;
    if (p >= 1000000) return `1 in ${Math.round(p / 1000000 * 10) / 10}M`;
    if (p >= 1000) return `1 in ${Math.round(p / 1000 * 10) / 10}k`;
    return `1 in ${p}`;
  };

  return (
    <div 
      className={`fixed inset-y-0 right-0 w-80 bg-neutral-900/95 border-l border-neutral-700 transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full p-4">
        <div className="flex justify-between items-center mb-6 border-b border-neutral-700 pb-4">
          <h2 className="text-xl font-bold tracking-wider text-white">{T.UI.COLLECTION}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            [X]
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {sortedItems.length === 0 ? (
            <div className="text-center text-neutral-600 mt-10">
              <p>{T.UI.NO_ITEMS}</p>
              <p className="text-xs mt-2">{T.UI.KEEP_SPINNING}</p>
            </div>
          ) : (
            sortedItems.map((item, idx) => {
                const tier = RARITY_TIERS[item.rarityId];
                const tierName = T.RARITY_NAMES[item.rarityId];
                return (
                    <button 
                        key={`${item.rarityId}-${idx}`} 
                        onClick={() => onInspect(item)}
                        className={`w-full text-left p-3 rounded border border-neutral-800 bg-black/40 hover:border-neutral-600 hover:bg-neutral-800 transition-all relative overflow-hidden group`}
                    >
                        {/* Subtle background glow based on rarity */}
                        <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                            style={{ backgroundColor: tier.shadowColor }}
                        />
                        
                        <div className="flex justify-between items-start mb-2">
                            <RarityBadge rarityId={item.rarityId} size="sm" label={tierName} />
                            <div className="text-right">
                                <span className="block text-xs text-neutral-500">x{item.count}</span>
                                <span className="block text-[10px] text-neutral-600 font-mono">{formatProbability(tier.probability)}</span>
                            </div>
                        </div>
                        <p className={`text-sm ${tier.textColor} font-medium break-words`}>
                            "{item.text}"
                        </p>
                        <div className="mt-2 text-[10px] text-neutral-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            {T.UI.INSPECT}
                        </div>
                    </button>
                );
            })
          )}
        </div>
      </div>
    </div>
  );
};