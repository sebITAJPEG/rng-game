import React from 'react';
import { DreamInventoryItem } from '../types';
import { DREAMS } from '../constants';

interface Props {
    items: DreamInventoryItem[];
    isOpen: boolean;
    onClose: () => void;
    onSell: () => void;
}

export const DreamInventory: React.FC<Props> = ({ items, isOpen, onClose, onSell }) => {
    if (!isOpen) return null;

    const sortedItems = [...items].sort((a, b) => b.id - a.id);
    const totalCount = items.reduce((acc, i) => acc + i.count, 0);

    let totalValue = 0;
    items.forEach(item => {
        const dream = DREAMS.find(d => d.id === item.id);
        if (dream) {
            // Dreams are risky, so they are valuable. 
            const unitValue = Math.max(5, Math.floor(dream.probability / 3));
            totalValue += unitValue * item.count;
        }
    });

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
            <div className="w-full max-w-2xl bg-neutral-900 border border-purple-900 rounded-lg shadow-[0_0_50px_rgba(147,51,234,0.1)] flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-6 border-b border-purple-900/30">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-purple-400 tracking-wider font-mono">MEMORY BANK</h2>
                        <span className="text-xs font-mono text-purple-800 bg-purple-950/30 px-2 py-1 rounded">{totalCount.toLocaleString()} FRAGMENTS</span>
                    </div>
                    <button onClick={onClose} className="text-purple-700 hover:text-purple-400 font-mono">[CLOSE]</button>
                </div>

                <div className="overflow-y-auto p-6 flex-1 bg-black/50">
                    {sortedItems.length === 0 ? (
                        <div className="text-center py-12 text-purple-900 font-mono">
                            <div className="text-4xl mb-4 opacity-50">☾</div>
                            NO MEMORIES STORED.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {sortedItems.map(item => {
                                const dream = DREAMS.find(d => d.id === item.id);
                                if (!dream) return null;
                                const unitValue = Math.max(5, Math.floor(dream.probability / 3));

                                return (
                                    <div
                                        key={item.id}
                                        className={`
                                    p-3 rounded bg-purple-900/5 border border-purple-900/20 hover:bg-purple-900/20 transition-all
                                    flex flex-col items-center text-center gap-2 relative group
                                `}
                                        style={{
                                            borderColor: item.id > 30 ? dream.glowColor : undefined,
                                            boxShadow: item.id > 30 ? `0 0 15px ${dream.glowColor}22` : 'none'
                                        }}
                                    >
                                        <div className="text-[10px] text-purple-600 font-mono uppercase tracking-wider">
                                            {dream.tierName}
                                        </div>
                                        <div className={`font-bold ${dream.color} drop-shadow-sm`}>
                                            {dream.name}
                                        </div>
                                        <div className="mt-auto flex justify-between w-full text-xs font-mono">
                                            <span className="text-purple-200 bg-purple-900/30 px-2 py-1 rounded">x{item.count.toLocaleString()}</span>
                                            <span className="text-yellow-500 py-1">${unitValue}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-purple-900/30 bg-black/60">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-purple-600 font-mono">MEMORY VALUE</span>
                        <span className="text-xl text-yellow-500 font-bold font-mono">${totalValue.toLocaleString()}</span>
                    </div>
                    <button
                        onClick={onSell}
                        disabled={totalValue === 0}
                        className="w-full py-3 bg-purple-900/20 hover:bg-purple-800/40 border border-purple-700 text-purple-400 hover:text-white font-mono font-bold tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        FORGET ALL
                    </button>
                </div>

            </div>
        </div>
    );
};