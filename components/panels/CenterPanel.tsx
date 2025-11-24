import React from 'react';
import { GameStats, Drop, RarityId, VariantId } from '../../types';
import { RARITY_TIERS, VARIANTS, TRANSLATIONS } from '../../constants';
import { RarityBadge } from '../RarityBadge';
import { EntropyBar } from '../EntropyBar';
import { audioService } from '../../services/audioService';

interface Props {
    stats: GameStats;
    currentDrops: Drop[];
    isAutoSpinning: boolean;
    inspectedItem: any;
    autoSpinSpeed: number;
    handleRoll: (batch?: number) => void;
    handleBurstClick: () => void;
    setIsAutoSpinning: (v: boolean) => void;
    generalMulti: number;
    formatProb: (p: number, m?: number) => string;
}

export const CenterPanel: React.FC<Props> = ({
    stats, currentDrops, isAutoSpinning, inspectedItem, autoSpinSpeed,
    handleRoll, handleBurstClick, setIsAutoSpinning, generalMulti, formatProb
}) => {
    const T = TRANSLATIONS['en'];

    return (
        <div className="z-10 w-full max-w-4xl px-6 flex flex-col items-center justify-center space-y-8 mt-8">

            <div className="w-full flex justify-center">
                <EntropyBar value={stats.entropy} />
            </div>

            <div className="min-h-[300px] w-full flex items-center justify-center perspective-1000">
                {currentDrops.length > 0 ? (
                    <div className={`
                        w-full grid gap-8 items-center justify-center
                        ${currentDrops.length === 1 ? 'grid-cols-1' : ''}
                        ${currentDrops.length >= 2 && currentDrops.length <= 4 ? 'grid-cols-1 md:grid-cols-2' : ''}
                        ${currentDrops.length > 4 && currentDrops.length <= 6 ? 'grid-cols-2 md:grid-cols-3' : ''}
                        ${currentDrops.length > 6 ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5' : ''}
                    `}>
                        {currentDrops.map((drop, idx) => {
                            const tier = RARITY_TIERS[drop.rarityId];
                            const variant = VARIANTS[drop.variantId || VariantId.NONE];
                            const isTheOne = drop.rarityId === RarityId.THE_ONE;
                            const textColorClass = isTheOne ? "text-black drop-shadow-none" : tier.textColor;
                            const descColorClass = isTheOne ? "text-neutral-600" : "text-neutral-400";
                            const hasVariant = (drop.variantId ?? VariantId.NONE) !== VariantId.NONE;
                            const isLargeBatch = currentDrops.length > 6;

                            return (
                                <div key={`${drop.rollNumber}-${idx}`} className="flex flex-col items-center text-center animate-fade-in-up relative z-10">
                                    <div className="mb-2 md:mb-4">
                                        <RarityBadge rarityId={drop.rarityId} variantId={drop.variantId} size="sm" label={T.RARITY_NAMES[drop.rarityId]} />
                                        <p className={`text-[10px] mt-1 font-mono tracking-widest mix-blend-difference ${isTheOne ? 'text-black' : 'text-neutral-500'}`}>
                                            {formatProb(tier.probability, variant.multiplier)}
                                        </p>
                                    </div>

                                    <h1 className={`
                                        font-bold tracking-tight leading-tight transition-all duration-75 mb-2 md:mb-4
                                        ${textColorClass} ${hasVariant ? variant.styleClass : ''}
                                        ${currentDrops.length === 1 ? 'text-3xl md:text-5xl lg:text-6xl' : ''}
                                        ${currentDrops.length > 1 && !isLargeBatch ? 'text-xl md:text-2xl' : ''}
                                        ${isLargeBatch ? 'text-sm md:text-base lg:text-lg' : ''}
                                    `}
                                        style={{
                                            textShadow: !isTheOne && !hasVariant && tier.id >= RarityId.MYTHICAL ? `0 0 20px ${tier.shadowColor}` : undefined,
                                            transform: tier.id >= RarityId.DIVINE ? 'scale(1.05)' : 'scale(1)'
                                        }}>
                                        "{hasVariant ? variant.prefix : ''} {drop.text}"
                                    </h1>

                                    {drop.description && (
                                        <p className={`font-mono ${descColorClass} ${currentDrops.length === 1 ? 'text-sm md:text-base max-w-lg' : ''} ${currentDrops.length > 1 && !isLargeBatch ? 'text-[10px] max-w-[150px]' : ''} ${isLargeBatch ? 'text-[9px] hidden md:block max-w-[120px]' : ''}`}>
                                            {drop.description}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <h1 className="text-4xl text-neutral-800 animate-pulse">{T.UI.READY}</h1>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center w-full justify-center">
                <button onClick={() => { if (isAutoSpinning) setIsAutoSpinning(false); handleRoll(); }} disabled={inspectedItem !== null}
                    className="group relative px-12 py-6 bg-surface border border-border hover:border-text hover:bg-surface-highlight transition-all active:scale-95 w-64 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed">
                    <span className="relative z-10 text-xl font-bold tracking-[0.2em] group-hover:text-text text-text-dim">{T.UI.GENERATE}</span>
                    <div className="absolute bottom-0 left-0 h-1 bg-text w-0 group-hover:w-full transition-all duration-300" />
                    {generalMulti > 1 && <span className="absolute top-2 right-2 text-[10px] text-neutral-500">x{generalMulti}</span>}
                </button>
                {stats.hasBurst && (
                    <button onClick={handleBurstClick} disabled={inspectedItem !== null || isAutoSpinning}
                        className="group relative px-6 py-6 bg-purple-900/20 border border-purple-900 hover:border-purple-400 hover:bg-purple-900/40 transition-all active:scale-95 w-32 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed">
                        <span className="relative z-10 text-sm font-bold tracking-widest text-purple-400 group-hover:text-white">BURST</span>
                        <span className="absolute bottom-1 right-2 text-[9px] text-purple-500 group-hover:text-white">50x</span>
                    </button>
                )}
                <button onClick={() => { audioService.playClick(); setIsAutoSpinning(!isAutoSpinning); }} disabled={inspectedItem !== null}
                    className={`group relative px-8 py-6 border transition-all w-64 disabled:opacity-50 disabled:cursor-not-allowed ${isAutoSpinning ? 'bg-red-900/20 border-red-500 text-red-500' : 'bg-surface border-border text-text-dim hover:border-success hover:text-success'}`}>
                    <span className="text-xl font-bold tracking-[0.2em]">{isAutoSpinning ? T.UI.STOP_AUTO : T.UI.AUTO_SPIN}</span>
                    <span className="absolute bottom-2 right-2 text-[10px] opacity-50">{autoSpinSpeed}ms</span>
                    {isAutoSpinning && (
                        <span className="absolute top-2 right-2 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
};