import React, { useState, useRef, useEffect } from 'react';
import { Ore } from '../types';
import { audioService } from '../services/audioService';

interface Props {
    onMine: () => void;
    lastBatch: Ore[];
    totalMined: number;
    isAutoMining: boolean;
    onToggleAuto: () => void;
    onOpenInventory: () => void;
    // New Props
    currentDimension: 'NORMAL' | 'GOLD';
    onToggleDimension: () => void;
    isGoldUnlocked: boolean;
    balance: number; // Needed to show unlock progress or requirement
}

interface FloatingText {
    id: number;
    x: number;
    y: number;
    text: string;
    color: string;
}

export const MiningPanel: React.FC<Props> = ({
    onMine, lastBatch, totalMined, isAutoMining, onToggleAuto, onOpenInventory,
    currentDimension, onToggleDimension, isGoldUnlocked, balance
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
    const clickCount = useRef(0);

    // Cleanup floating text
    useEffect(() => {
        const t = setInterval(() => {
            if (floatingTexts.length > 0) {
                setFloatingTexts(prev => prev.slice(1));
            }
        }, 500);
        return () => clearInterval(t);
    }, [floatingTexts.length]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 100);
        onMine();

        // Add floating text effect
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const id = clickCount.current++;
        setFloatingTexts(prev => [
            ...prev,
            { id, x, y, text: "+1", color: currentDimension === 'GOLD' ? "text-yellow-300" : "text-white" }
        ]);
    };

    const isGold = currentDimension === 'GOLD';
    const containerClass = isGold 
        ? "bg-gradient-to-b from-yellow-900/30 to-yellow-950/50 border-yellow-700/50" 
        : "bg-background/40 border-surface-highlight";

    return (
        <div className={`h-full w-full border-l flex flex-col p-6 relative overflow-hidden transition-colors duration-500 ${containerClass} backdrop-blur-sm`}>
            
            {/* Header */}
            <div className="flex justify-between items-start mb-8 z-10">
                <div>
                    <h2 className={`text-lg font-mono font-bold tracking-widest ${isGold ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]' : 'text-text'}`}>
                        {isGold ? 'GOLD_RUSH' : 'DEEP_DIVING'}
                    </h2>
                    <div className={`text-[10px] font-mono ${isGold ? 'text-yellow-600' : 'text-text-dim'}`}>
                        {isGold ? 'DIMENSION: AU-79' : 'SECTOR 7G'}
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Dimension Toggle */}
                    {(isGoldUnlocked || balance >= 1000000) && (
                        <button
                            onClick={onToggleDimension}
                            className={`
                                text-[10px] font-mono border px-2 py-1 transition-all animate-pulse
                                ${isGold 
                                    ? 'border-yellow-500 bg-yellow-900/20 text-yellow-300 hover:bg-yellow-900/40' 
                                    : 'border-neutral-600 bg-neutral-900 text-neutral-400 hover:border-yellow-500 hover:text-yellow-500'
                                }
                            `}
                        >
                            {isGold ? 'EXIT GOLD DIM' : 'ENTER GOLD DIM'}
                        </button>
                    )}
                    <button
                        onClick={onOpenInventory}
                        className={`text-[10px] font-mono border px-2 py-1 transition-colors ${isGold ? 'border-yellow-800 text-yellow-600 hover:text-yellow-300 hover:border-yellow-500' : 'border-border hover:bg-surface-highlight text-text-dim hover:text-text'}`}
                    >
                        SILO
                    </button>
                </div>
            </div>

            {/* The Rock / Nugget */}
            <div className="flex-1 flex flex-col items-center justify-center z-10 min-h-[200px]">
                <div className="relative">
                    <button
                        onClick={handleClick}
                        className={`
                        relative group cursor-pointer outline-none transition-transform duration-100 select-none
                        ${isAnimating ? 'scale-95' : 'scale-100 hover:scale-105'}
                    `}
                    >
                        <pre className={`font-mono text-[8px] leading-[8px] md:text-[10px] md:leading-[10px] transition-colors whitespace-pre ${isGold ? 'text-yellow-500 group-hover:text-yellow-300 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'text-text-dim group-hover:text-text'}`}>
                            {isGold ? `
                ______________
    __,.,---'''''              '''''---..._
 ,-'             .....:::''::.:            '\`-.
'           ...:::.....       '
            ''':::'''''       .               ,
|'-.._           ''''':::..::':          __,,-
 '-.._''\`---.....______________.....---''__,,-
      ''\`---.....______________.....---''
` : `
      /\\
     /  \\
    /    \\  _
   /      \\/ \\
  /   /\\   \\  \\
 /   /  \\   \\  \\
/___/    \\___\\__\\
`}
                        </pre>

                        {/* Hit Particle Effect */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className={`w-full h-full rounded-full blur-xl transition-opacity duration-100 ${isAnimating ? 'opacity-100' : 'opacity-0'} ${isGold ? 'bg-yellow-500/20' : 'bg-text/10'}`} />
                        </div>
                    </button>

                    {/* Floating Text Layer */}
                    {floatingTexts.map(ft => (
                        <div
                            key={ft.id}
                            className={`absolute pointer-events-none font-mono font-bold text-xs ${ft.color} animate-float-up`}
                            style={{ left: ft.x, top: ft.y }}
                        >
                            {ft.text}
                        </div>
                    ))}
                </div>

                {/* Last Mined Batch Display */}
                <div className="mt-8 min-h-[6rem] flex flex-col items-center justify-center w-full">
                    {lastBatch.length > 0 ? (
                        <div key={totalMined} className="animate-fade-in-up w-full flex flex-col gap-2 items-center">
                            {lastBatch.map((ore, idx) => (
                                <div key={idx} className={`flex items-center gap-3 p-2 rounded border w-full max-w-[240px] ${isGold ? 'bg-yellow-950/30 border-yellow-800' : 'bg-background/40 border-surface-highlight'}`} style={{ animationDelay: `${idx * 0.05}s` }}>
                                    <div className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded min-w-[40px] text-center ${isGold ? 'bg-yellow-900 text-yellow-300 border border-yellow-700' : 'bg-surface border border-surface-highlight text-neutral-400'}`}>
                                        {ore.tierName.substring(0, 6)}
                                    </div>
                                    <div className={`text-sm font-bold ${ore.color} truncate flex-1 text-left`} style={{ textShadow: `0 0 5px ${ore.glowColor}44` }}>
                                        {ore.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <span className={`text-xs font-mono ${isGold ? 'text-yellow-700' : 'text-text-dim'}`}>READY TO MINE</span>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="mt-auto space-y-4 z-10">
                <div className={`flex justify-between text-[10px] font-mono ${isGold ? 'text-yellow-800' : 'text-neutral-500'}`}>
                    <span>TOTAL YIELD</span>
                    <span className={isGold ? 'text-yellow-400' : 'text-text'}>{totalMined.toLocaleString()}</span>
                </div>

                <button
                    onClick={(e) => handleClick(e)}
                    className={`w-full py-3 border font-mono font-bold tracking-widest transition-all active:scale-95 ${
                        isGold 
                        ? 'bg-yellow-600 hover:bg-yellow-500 text-yellow-950 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]' 
                        : 'bg-surface-highlight hover:bg-secondary border-border text-text hover:text-text'
                    }`}
                >
                    MINE {isGold ? 'GOLD' : 'ORE'}
                </button>

                <button
                    onClick={onToggleAuto}
                    className={`
                    w-full py-2 border text-[10px] font-mono font-bold tracking-widest transition-all
                    ${isAutoMining
                            ? 'bg-orange-900/20 border-orange-600 text-orange-500 animate-pulse'
                            : isGold 
                                ? 'bg-transparent border-yellow-800 text-yellow-700 hover:border-yellow-500 hover:text-yellow-400'
                                : 'bg-transparent border-surface-highlight text-text-dim hover:border-border hover:text-text'
                        }
                `}
                >
                    {isAutoMining ? 'AUTO-MINING ACTIVE' : 'ENABLE AUTO-MINER'}
                </button>
            </div>

            {/* Background Noise */}
            <div className="absolute inset-0 opacity-5 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-0 pointer-events-none" />
            {isGold && <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent pointer-events-none" />}

            <style>{`
            @keyframes floatUp {
                0% { opacity: 1; transform: translateY(0) scale(1); }
                100% { opacity: 0; transform: translateY(-30px) scale(1.2); }
            }
            .animate-float-up {
                animation: floatUp 0.5s ease-out forwards;
            }
        `}</style>
        </div>
    );
};