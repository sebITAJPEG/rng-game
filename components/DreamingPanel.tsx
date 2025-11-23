import React, { useState, useEffect } from 'react';
import { Dream } from '../types';
import { DREAMS } from '../constants';

interface Props {
    isDreaming: boolean;
    stability: number;
    depth: number;
    lastDream: Dream | null;
    isCrashed: boolean;
    isAuto: boolean;
    onEnter: () => void;
    onDelve: () => void;
    onWake: () => void;
    onToggleAuto: () => void;
    onOpenInventory: () => void;
}

export const DreamingPanel: React.FC<Props> = ({
    isDreaming, stability, depth, lastDream, isCrashed, isAuto, onEnter, onDelve, onWake, onToggleAuto, onOpenInventory
}) => {
    const [textEffect, setTextEffect] = useState('');

    useEffect(() => {
        if (lastDream) {
            setTextEffect('animate-pulse');
            setTimeout(() => setTextEffect(''), 500);
        }
    }, [lastDream]);

    const getStabilityColor = (s: number) => {
        if (s > 70) return 'bg-purple-500 shadow-[0_0_10px_#a855f7]';
        if (s > 30) return 'bg-yellow-500 shadow-[0_0_10px_#eab308]';
        return 'bg-red-600 shadow-[0_0_15px_#dc2626] animate-pulse';
    };

    return (
        <div className="h-full w-full border-l border-purple-900/30 bg-background/40 backdrop-blur-sm flex flex-col p-6 relative overflow-hidden">

            {/* Header */}
            <div className="flex justify-between items-start mb-8 z-10">
                <div>
                    <h2 className="text-lg font-mono font-bold text-purple-400 tracking-widest">REM_CYCLE</h2>
                    <div className="text-[10px] text-purple-800 font-mono">SUBCONSCIOUS LAYER</div>
                </div>
                <button
                    onClick={onOpenInventory}
                    className="text-[10px] font-mono border border-purple-900 px-2 py-1 bg-purple-950/30 hover:bg-purple-900 text-purple-400 hover:text-white transition-colors"
                >
                    MEMORIES
                </button>
            </div>

            {/* Main Visual Area */}
            <div className="flex-1 flex flex-col items-center justify-center z-10 min-h-[200px] relative">

                {isCrashed ? (
                    <div className="text-center animate-shake">
                        <h1 className="text-4xl font-bold text-red-600 mb-2">WAKE UP</h1>
                        <p className="text-xs font-mono text-red-400">STABILITY CRITICAL. CONNECTION LOST.</p>
                        <button
                            onClick={onEnter}
                            className="mt-6 px-6 py-3 bg-red-900/20 border border-red-600 text-red-500 hover:text-white font-mono uppercase tracking-widest"
                        >
                            RE-ENTER DREAM
                        </button>
                    </div>
                ) : !isDreaming ? (
                    <div className="text-center">
                        <div className="text-4xl mb-4 opacity-50 animate-float">☾</div>
                        <p className="text-xs font-mono text-purple-300 mb-6">READY TO ENTER LUCID STATE</p>
                        <button
                            onClick={onEnter}
                            className="px-8 py-4 bg-purple-900/20 border border-purple-500 text-purple-300 hover:bg-purple-900/40 hover:text-white font-mono font-bold tracking-widest transition-all"
                        >
                            SLEEP
                        </button>
                    </div>
                ) : (
                    <div className="w-full flex flex-col items-center">

                        {/* Depth Meter */}
                        <div className="text-[10px] font-mono text-purple-500 mb-2 tracking-[0.2em]">DEPTH: {depth}</div>

                        {/* Dream Item */}
                        {lastDream ? (
                            <div className={`text-center ${textEffect}`}>
                                <div className="text-[9px] font-mono uppercase text-purple-600 mb-1">{lastDream.tierName}</div>
                                <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${lastDream.color}`} style={{ textShadow: `0 0 15px ${lastDream.glowColor}` }}>
                                    {lastDream.name}
                                </h2>
                                <p className="text-[10px] font-mono text-purple-300/50 max-w-[200px] mx-auto">"{lastDream.description}"</p>
                            </div>
                        ) : (
                            <div className="text-purple-900 font-mono text-sm animate-pulse">DRIFTING...</div>
                        )}

                        {/* Stability Bar */}
                        <div className="w-64 h-2 bg-black rounded-full mt-12 relative overflow-hidden border border-purple-900/50">
                            <div
                                className={`h-full transition-all duration-300 ${getStabilityColor(stability)}`}
                                style={{ width: `${Math.max(0, Math.min(100, stability))}%` }}
                            />
                        </div>
                        <div className="text-[9px] font-mono text-purple-600 mt-1">STABILITY: {stability}%</div>

                    </div>
                )}
            </div>

            {/* Controls */}
            {isDreaming && (
                <div className="mt-auto grid grid-cols-2 gap-4 z-10">
                    <button
                        onClick={onWake}
                        className="col-span-1 py-3 bg-slate-900/50 border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white font-mono font-bold text-xs tracking-widest transition-all"
                    >
                        WAKE UP
                    </button>
                    <button
                        onClick={onDelve}
                        className="col-span-1 py-3 bg-purple-900/30 hover:bg-purple-800/50 border border-purple-500 text-purple-300 hover:text-white font-mono font-bold text-xs tracking-widest transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)] active:scale-95"
                    >
                        DELVE
                    </button>
                    <button
                        onClick={onToggleAuto}
                        className={`col-span-2 py-2 border font-mono font-bold text-[10px] tracking-widest transition-all ${isAuto ? 'bg-purple-600 border-purple-400 text-white animate-pulse' : 'bg-transparent border-purple-900 text-purple-700 hover:text-purple-400'}`}
                    >
                        {isAuto ? 'AUTO-DREAMING...' : 'ENABLE AUTO-DREAM'}
                    </button>
                </div>
            )}

            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-purple-950/20 to-transparent" />
                {isDreaming && <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] animate-noise" />}
                <div className={`absolute inset-0 transition-opacity duration-1000 ${isDreaming ? 'opacity-100' : 'opacity-0'}`}>
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute bg-purple-500 rounded-full opacity-20 blur-md animate-float"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                width: `${Math.random() * 4 + 2}px`,
                                height: `${Math.random() * 4 + 2}px`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${Math.random() * 10 + 10}s`
                            }}
                        />
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes noise {
                    0% { transform: translate(0,0); }
                    10% { transform: translate(-5%,-5%); }
                    20% { transform: translate(-10%,5%); }
                    30% { transform: translate(5%,-10%); }
                    40% { transform: translate(-5%,15%); }
                    50% { transform: translate(-10%,5%); }
                    60% { transform: translate(15%,0); }
                    70% { transform: translate(0,10%); }
                    80% { transform: translate(-15%,0); }
                    90% { transform: translate(10%,5%); }
                    100% { transform: translate(5%,0); }
                }
                .animate-noise { animation: noise 0.5s steps(5) infinite; }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake { animation: shake 0.3s linear; }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
            `}</style>
        </div>
    );
};