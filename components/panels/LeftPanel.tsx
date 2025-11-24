import React from 'react';
import { GameStats, RarityId } from '../../types';
import { RARITY_TIERS, TRANSLATIONS } from '../../constants';
import { MiniTicTacToe } from '../MiniTicTacToe';
import { TrophySystem } from '../TrophySystem';
import { getEquippedItemName } from '../../utils/gameHelpers';

interface Props {
    stats: GameStats;
    showExtendedStats: boolean;
    setShowExtendedStats: (v: boolean) => void;
    currentGlobalLuck: number;
    autoSpinSpeed: number;
    generalMulti: number;
    currentMineLuck: number;
    miningSpeed: number;
    currentFishLuck: number;
    fishingSpeed: number;
    currentHarvLuck: number;
    harvestingSpeed: number;
    dreamBonuses: any;
    trophyLuckMult: number;
    onTicTacToeWin: () => void;
}

export const LeftPanel: React.FC<Props> = ({
    stats, showExtendedStats, setShowExtendedStats, currentGlobalLuck, autoSpinSpeed,
    generalMulti, currentMineLuck, miningSpeed, currentFishLuck, fishingSpeed,
    currentHarvLuck, harvestingSpeed, dreamBonuses, trophyLuckMult, onTicTacToeWin
}) => {
    const T = TRANSLATIONS['en'];

    return (
        <div className="flex flex-col gap-4 pointer-events-auto max-h-[80vh] overflow-y-auto no-scrollbar">
            {/* Main Economy Stats with Mini Game */}
            <div className="flex items-start gap-2">
                <div className="space-y-1 font-mono text-xs md:text-sm text-text-dim bg-black/60 backdrop-blur p-3 rounded border border-white/10 min-w-[200px]">
                    <p>{T.UI.ROLLS}: <span className="text-text">{stats.totalRolls.toLocaleString()}</span></p>
                    <p>BALANCE: <span className="text-yellow-500">{stats.balance.toLocaleString()}</span></p>
                    <p>CREDITS: <span className="text-purple-400">{stats.gachaCredits}</span></p>
                    <p>{T.UI.BEST}: <span className={`${RARITY_TIERS[stats.bestRarityFound]?.textColor || 'text-text'}`}>{T.RARITY_NAMES[stats.bestRarityFound]}</span></p>

                    {/* Player Stats */}
                    <div className="my-2 border-t border-white/10 pt-2">
                        <p>LUCK: <span className="text-green-400">{currentGlobalLuck.toFixed(2)}x</span></p>
                        <p>SPEED: <span className="text-cyan-400">{autoSpinSpeed}ms</span></p>
                        <p>BATCH: <span className="text-purple-300">x{generalMulti}</span></p>
                    </div>

                    {stats.equippedTitle && (
                        <p>TITLE: <span className="text-yellow-400 font-bold border-b border-yellow-600">{stats.equippedTitle}</span></p>
                    )}
                    <button
                        onClick={() => setShowExtendedStats(!showExtendedStats)}
                        className="text-[10px] text-text-dim hover:text-white underline mt-2 uppercase"
                    >
                        {showExtendedStats ? '[-] HIDE SUB-GAMES' : '[+] SHOW SUB-GAMES'}
                    </button>
                </div>

                {/* MINI TIC-TAC-TOE & TROPHY */}
                <div className="flex flex-col gap-2 pointer-events-auto">
                    <div className="flex">
                        <MiniTicTacToe onWin={onTicTacToeWin} />
                        <TrophySystem wins={stats.ticTacToeWins || 0} />
                    </div>
                </div>
            </div>

            {/* Extended Stats Panel */}
            {showExtendedStats && (
                <div className="flex flex-col gap-2 font-mono text-[10px] text-text-dim animate-fade-in-up">
                    {/* GENERAL EQUIP */}
                    <div className="bg-black/60 backdrop-blur p-3 rounded border border-white/10 space-y-1">
                        <div className="text-white font-bold border-b border-white/10 mb-1 pb-1">GENERAL GEAR</div>
                        <p>BOOST: <span className="text-yellow-200">{getEquippedItemName(stats.equippedItems, 'GENERAL', 'BOOST')}</span></p>
                        <p>MULTI: <span className="text-purple-300">{getEquippedItemName(stats.equippedItems, 'GENERAL', 'MULTI')}</span></p>
                    </div>

                    {/* MINING */}
                    <div className="bg-black/60 backdrop-blur p-3 rounded border border-orange-900/30 space-y-1">
                        <div className="text-orange-400 font-bold border-b border-orange-900/30 mb-1 pb-1">MINING</div>
                        <p>LUCK: <span className="text-orange-300">{currentMineLuck.toFixed(2)}x</span></p>
                        <p>SPEED: <span className="text-orange-300">{miningSpeed}ms</span></p>
                        <p>BOOST: <span className="text-yellow-200">{getEquippedItemName(stats.equippedItems, 'MINING', 'BOOST')}</span></p>
                        <p>MULTI: <span className="text-purple-300">{getEquippedItemName(stats.equippedItems, 'MINING', 'MULTI')}</span></p>
                    </div>

                    {/* FISHING */}
                    <div className="bg-black/60 backdrop-blur p-3 rounded border border-cyan-900/30 space-y-1">
                        <div className="text-cyan-400 font-bold border-b border-cyan-900/30 mb-1 pb-1">FISHING</div>
                        <p>LUCK: <span className="text-cyan-300">{currentFishLuck.toFixed(2)}x</span></p>
                        <p>SPEED: <span className="text-cyan-300">{fishingSpeed}ms</span></p>
                        <p>BOOST: <span className="text-yellow-200">{getEquippedItemName(stats.equippedItems, 'FISHING', 'BOOST')}</span></p>
                        <p>MULTI: <span className="text-purple-300">{getEquippedItemName(stats.equippedItems, 'FISHING', 'MULTI')}</span></p>
                    </div>

                    {/* HARVESTING */}
                    <div className="bg-black/60 backdrop-blur p-3 rounded border border-green-900/30 space-y-1">
                        <div className="text-green-400 font-bold border-b border-green-900/30 mb-1 pb-1">HARVESTING</div>
                        <p>LUCK: <span className="text-green-300">{currentHarvLuck.toFixed(2)}x</span></p>
                        <p>SPEED: <span className="text-green-300">{harvestingSpeed}ms</span></p>
                        <p>BOOST: <span className="text-yellow-200">{getEquippedItemName(stats.equippedItems, 'HARVESTING', 'BOOST')}</span></p>
                        <p>MULTI: <span className="text-purple-300">{getEquippedItemName(stats.equippedItems, 'HARVESTING', 'MULTI')}</span></p>
                    </div>

                    {/* DREAMING */}
                    <div className="bg-black/60 backdrop-blur p-3 rounded border border-purple-900/30 space-y-1">
                        <div className="text-purple-400 font-bold border-b border-purple-900/30 mb-1 pb-1">DREAMING</div>
                        <p>BASE STABILITY: <span className="text-purple-300">{100 + (dreamBonuses.bonusStability || 0)}%</span></p>
                        <p>REGEN CHANCE: <span className="text-purple-300">{((dreamBonuses.bonusStabilityRegen || 0) * 100).toFixed(0)}%</span></p>
                        <p>BOOST: <span className="text-yellow-200">{getEquippedItemName(stats.equippedItems, 'DREAMING', 'BOOST')}</span></p>
                        <p>MULTI: <span className="text-purple-300">{getEquippedItemName(stats.equippedItems, 'DREAMING', 'MULTI')}</span></p>
                        <p>TOTAL DREAMS: <span className="text-white">{stats.totalDreamt}</span></p>
                    </div>

                    {/* TROPHY BONUS INFO */}
                    <div className="bg-black/60 backdrop-blur p-3 rounded border border-yellow-600/30 space-y-1">
                        <div className="text-yellow-500 font-bold border-b border-yellow-600/30 mb-1 pb-1">TROFEO</div>
                        <p>BONUS ATTIVO: <span className="text-white animate-pulse">x{trophyLuckMult.toFixed(2)}</span></p>
                        <p className="text-[8px] text-neutral-500">MOLTIPLICA TUTTA LA FORTUNA</p>
                    </div>
                </div>
            )}
        </div>
    );
};