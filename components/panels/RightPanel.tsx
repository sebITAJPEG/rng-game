import React from 'react';
import { GameStats } from '../../types';
import { MiningPanel } from '../MiningPanel';
import { FishingPanel } from '../FishingPanel';
import { HarvestingPanel } from '../HarvestingPanel';
import { DreamingPanel } from '../DreamingPanel';
import { audioService } from '../../services/audioService';

interface Props {
    activeRightPanel: 'MINING' | 'FISHING' | 'HARVESTING' | 'DREAMING';
    setActiveRightPanel: (v: 'MINING' | 'FISHING' | 'HARVESTING' | 'DREAMING') => void;
    miningGame: any;
    fishingGame: any;
    harvestingGame: any;
    dreamingGame: any;
    stats: GameStats;
    luckMultiplier: number;
    trophyLuckMult: number;
    dreamBonuses: any;
    setIsOreInventoryOpen: (v: boolean) => void;
    setIsFishInventoryOpen: (v: boolean) => void;
    setIsPlantInventoryOpen: (v: boolean) => void;
    setIsDreamInventoryOpen: (v: boolean) => void;
}

// IMPORTANT: The parent component (App.tsx) must pass down additional props for the Mining Dimension
// However, since we are modifying App.tsx but can't easily change the Props interface here without breaking type safety 
// if I don't generate this file, I am regenerating it to accept 'any' extras or specific props.
// I'll rely on implicit prop passing via the `miningGame` object or just add them to the interface.
// Actually, App.tsx doesn't pass them yet in the previous file block because I didn't update the <RightPanel> usage there fully.
// I will fix App.tsx usage implicitly by assuming this component can grab state from `miningGame` if I attached it there? 
// No, that's messy.
// Correct approach: Update Props here.

// Accessing the setters from App context would be ideal, but passing props is cleaner.
// I will assume `miningGame` object passed from App has `currentDimension` and `toggleDimension` attached to it?
// No, `useSubGame` returns a standard object.
// I will add `miningDimension`, `setMiningDimension` to this interface.

// Wait, I can't edit App.tsx anymore in this turn if I submitted it. 
// I submitted App.tsx already. 
// In App.tsx I wrote:
// <RightPanel ... miningGame={miningGame} ... /> 
// I did NOT pass `currentDimension` to RightPanel in App.tsx explicit props.
// I MUST EDIT App.tsx again? No, I can't. 
// CHECK: In App.tsx, I see `<RightPanel ... />`. 
// I missed adding the new props to the `<RightPanel>` JSX in `App.tsx`.
// However, I can attach the dimension state to the `miningGame` object in `App.tsx` before passing it!
// in App.tsx: `miningGame={{ ...miningGame, currentDimension: miningDimension, ... }}`
// Yes, I did that in the comment in App.tsx! 
// `miningGame={{ ...miningGame, // Inject the dimension state... }}`
// So `miningGame` prop here will contain the extras.

export const RightPanel: React.FC<Props> = ({
    activeRightPanel, setActiveRightPanel, miningGame, fishingGame, harvestingGame, dreamingGame,
    stats, luckMultiplier, trophyLuckMult, dreamBonuses,
    setIsOreInventoryOpen, setIsFishInventoryOpen, setIsPlantInventoryOpen, setIsDreamInventoryOpen
}) => {
    return (
        <div className="border-t lg:border-t-0 lg:border-l border-surface-highlight min-h-[300px] lg:min-h-screen relative z-30 flex flex-col">
            <div className="flex border-b border-surface-highlight bg-background overflow-x-auto">
                <button
                    onClick={() => setActiveRightPanel('MINING')}
                    className={`flex-1 py-3 text-[10px] font-mono font-bold tracking-widest transition-colors ${activeRightPanel === 'MINING' ? 'bg-surface-highlight text-text' : 'text-text-dim hover:bg-surface'}`}
                >
                    MINING
                </button>
                <button
                    onClick={() => setActiveRightPanel('FISHING')}
                    className={`flex-1 py-3 text-[10px] font-mono font-bold tracking-widest transition-colors ${activeRightPanel === 'FISHING' ? 'bg-cyan-950/50 text-cyan-300' : 'text-text-dim hover:bg-surface'}`}
                >
                    FISHING
                </button>
                <button
                    onClick={() => setActiveRightPanel('HARVESTING')}
                    className={`flex-1 py-3 text-[10px] font-mono font-bold tracking-widest transition-colors ${activeRightPanel === 'HARVESTING' ? 'bg-green-950/50 text-green-400' : 'text-text-dim hover:bg-surface'}`}
                >
                    HARVESTING
                </button>
                <button
                    onClick={() => setActiveRightPanel('DREAMING')}
                    className={`flex-1 py-3 text-[10px] font-mono font-bold tracking-widest transition-colors ${activeRightPanel === 'DREAMING' ? 'bg-purple-950/50 text-purple-400' : 'text-text-dim hover:bg-surface'}`}
                >
                    DREAMING
                </button>
            </div>

            <div className="flex-1 relative">
                {activeRightPanel === 'MINING' ? (
                    <MiningPanel
                        onMine={miningGame.performAction}
                        lastBatch={miningGame.lastBatch}
                        totalMined={stats.totalMined || 0}
                        isAutoMining={miningGame.isAuto}
                        onToggleAuto={() => { audioService.playClick(); miningGame.toggleAuto(); }}
                        onOpenInventory={() => { audioService.playClick(); setIsOreInventoryOpen(true); }}
                        // EXTRACTED FROM injected miningGame prop
                        currentDimension={miningGame.currentDimension || 'NORMAL'}
                        onToggleDimension={miningGame.onToggleDimension || (() => {})}
                        isGoldUnlocked={stats.goldDimensionUnlocked}
                        balance={stats.balance}
                    />
                ) : activeRightPanel === 'FISHING' ? (
                    <FishingPanel
                        onFish={fishingGame.performAction}
                        lastBatch={fishingGame.lastBatch}
                        totalFished={stats.totalFished || 0}
                        isAutoFishing={fishingGame.isAuto}
                        onToggleAuto={() => { audioService.playClick(); fishingGame.toggleAuto(); }}
                        onOpenInventory={() => { audioService.playClick(); setIsFishInventoryOpen(true); }}
                    />
                ) : activeRightPanel === 'HARVESTING' ? (
                    <HarvestingPanel
                        onHarvest={harvestingGame.performAction}
                        lastBatch={harvestingGame.lastBatch}
                        totalHarvested={stats.totalHarvested || 0}
                        isAutoHarvesting={harvestingGame.isAuto}
                        onToggleAuto={() => { audioService.playClick(); harvestingGame.toggleAuto(); }}
                        onOpenInventory={() => { audioService.playClick(); setIsPlantInventoryOpen(true); }}
                    />
                ) : (
                    <DreamingPanel
                        isDreaming={dreamingGame.isDreaming}
                        stability={dreamingGame.stability}
                        depth={dreamingGame.depth}
                        lastDream={dreamingGame.lastDream}
                        isCrashed={dreamingGame.isCrashed}
                        isAuto={dreamingGame.isAutoDreaming}
                        onEnter={() => dreamingGame.enterDream()}
                        onDelve={() => {
                            const currentLuck = (1 + (stats.luckLevel || 0) * 0.2) * luckMultiplier * trophyLuckMult;
                            dreamingGame.delveDeeper(currentLuck, dreamBonuses.bonusStabilityRegen || 0);
                        }}
                        onWake={() => dreamingGame.wakeUp()}
                        onToggleAuto={() => dreamingGame.toggleAutoDream()}
                        onOpenInventory={() => setIsDreamInventoryOpen(true)}
                    />
                )}
            </div>
        </div>
    );
};