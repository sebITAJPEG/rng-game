import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, Drop, InventoryItem, RarityId, Language } from './types';
import { RARITY_TIERS, TRANSLATIONS } from './constants';
import { generateDrop } from './services/rngService';
import { RarityBadge } from './components/RarityBadge';
import { Inventory } from './components/Inventory';
import { SpecialEffects } from './components/SpecialEffects';
import { Cutscene } from './components/Cutscene';
import { Shop } from './components/Shop';
import { Changelog } from './components/Changelog';

export default function App() {
  // State
  const [currentDrops, setCurrentDrops] = useState<Drop[]>([]);
  const [pendingDrops, setPendingDrops] = useState<Drop[]>([]); // For storing the batch during cutscene
  const [isCutscenePlaying, setIsCutscenePlaying] = useState(false);
  
  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('textbound_stats');
    // Migration for older save versions
    if (saved) {
        const parsed = JSON.parse(saved);
        return {
            totalRolls: parsed.totalRolls || 0,
            balance: parsed.balance ?? parsed.totalRolls ?? 0,
            startTime: parsed.startTime || Date.now(),
            bestRarityFound: parsed.bestRarityFound || RarityId.COMMON,
            multiRollLevel: parsed.multiRollLevel || 1
        };
    }
    return { 
        totalRolls: 0, 
        balance: 0, 
        startTime: Date.now(), 
        bestRarityFound: RarityId.COMMON, 
        multiRollLevel: 1 
    };
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('textbound_inventory');
    return saved ? JSON.parse(saved) : [];
  });

  // UI State
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  
  // Settings State
  const [autoSpinSpeed, setAutoSpinSpeed] = useState(150);
  const [luckMultiplier, setLuckMultiplier] = useState(1);
  const [language, setLanguage] = useState<Language>(() => {
     return (localStorage.getItem('textbound_lang') as Language) || 'en';
  });
  
  // Derived Translations
  const T = TRANSLATIONS[language];

  // Refs
  const autoSpinRef = useRef<number | null>(null);
  
  // Persistence
  useEffect(() => {
    localStorage.setItem('textbound_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('textbound_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('textbound_lang', language);
  }, [language]);

  // Helper to find best drop in a batch
  const getBestDrop = (drops: Drop[]) => {
      if (drops.length === 0) return null;
      return drops.reduce((prev, current) => (current.rarityId > prev.rarityId ? current : prev), drops[0]);
  };

  // Core Game Logic
  const handleRoll = useCallback(() => {
    // Multi-roll Loop
    const rollsToPerform = stats.multiRollLevel;
    const generatedDrops: Drop[] = [];
    
    for(let i = 0; i < rollsToPerform; i++) {
        generatedDrops.push(generateDrop(stats.totalRolls + i, luckMultiplier, language));
    }

    // Find the best drop to check for cutscenes
    const bestDrop = getBestDrop(generatedDrops);
    if (!bestDrop) return;

    const CUTSCENE_THRESHOLD = RarityId.PRIMORDIAL;

    // Process Cutsene Logic only for the best item
    if (bestDrop.rarityId >= CUTSCENE_THRESHOLD) {
        setIsAutoSpinning(false);
        setPendingDrops(generatedDrops); // Store the whole batch
        setIsCutscenePlaying(true);
    } else {
        setCurrentDrops(generatedDrops);
        // If cutscene plays, stats update after. If not, update here.
        batchUpdateStatsAndInventory(generatedDrops, rollsToPerform);
    }

  }, [stats.totalRolls, stats.multiRollLevel, luckMultiplier, language]);

  const batchUpdateStatsAndInventory = (drops: Drop[], rollsCount: number) => {
     setStats(prev => {
         const maxRarityInBatch = Math.max(...drops.map(d => d.rarityId));
         return {
            ...prev,
            totalRolls: prev.totalRolls + rollsCount,
            balance: prev.balance + rollsCount, // Earn 1 point per roll
            bestRarityFound: Math.max(prev.bestRarityFound, maxRarityInBatch)
         };
     });

     // Check for auto-stop condition
     if (drops.some(d => d.rarityId >= RarityId.DIVINE)) {
         setIsAutoSpinning(false);
     }

     // Update Inventory
     setInventory(prev => {
        let newInv = [...prev];
        drops.forEach(drop => {
            if (drop.rarityId >= RarityId.RARE) {
                const existingIndex = newInv.findIndex(i => i.text === drop.text && i.rarityId === drop.rarityId);
                if (existingIndex >= 0) {
                    newInv[existingIndex].count += 1;
                } else {
                    newInv.push({
                        text: drop.text,
                        description: drop.description,
                        rarityId: drop.rarityId,
                        count: 1,
                        discoveredAt: Date.now()
                    });
                }
            }
        });
        return newInv;
     });
  };

  const handleCutsceneComplete = () => {
      if (pendingDrops.length > 0) {
          setCurrentDrops(pendingDrops);
          batchUpdateStatsAndInventory(pendingDrops, stats.multiRollLevel);
          setPendingDrops([]);
      }
      setIsCutscenePlaying(false);
  };

  const handleInspectItem = (item: InventoryItem) => {
      // When inspecting, we just show a single item
      setCurrentDrops([{
          text: item.text,
          description: item.description,
          rarityId: item.rarityId,
          timestamp: Date.now(),
          rollNumber: stats.totalRolls 
      }]);
      setIsInventoryOpen(false);
  };

  const handleBuyUpgrade = (level: number, cost: number) => {
      if (stats.balance >= cost) {
          setStats(prev => ({
              ...prev,
              balance: prev.balance - cost,
              multiRollLevel: level
          }));
      }
  };

  // Auto Spin Effect
  useEffect(() => {
    if (isAutoSpinning && !isCutscenePlaying) {
      autoSpinRef.current = window.setInterval(handleRoll, autoSpinSpeed);
    } else {
      if (autoSpinRef.current) clearInterval(autoSpinRef.current);
      autoSpinRef.current = null;
    }
    return () => {
      if (autoSpinRef.current) clearInterval(autoSpinRef.current);
    };
  }, [isAutoSpinning, handleRoll, autoSpinSpeed, isCutscenePlaying]);

  const formatProb = (p: number) => {
    const adjustedP = p / luckMultiplier;
    if (adjustedP >= 1000000000000) return `1 in ${Math.round(adjustedP / 1000000000000)}T`;
    if (adjustedP >= 1000000000) return `1 in ${Math.round(adjustedP / 1000000000 * 10) / 10}B`;
    if (adjustedP >= 1000000) return `1 in ${Math.round(adjustedP / 1000000 * 10) / 10}M`;
    if (adjustedP >= 1000) return `1 in ${Math.round(adjustedP / 1000 * 10) / 10}k`;
    if (adjustedP < 1) return T.UI.GUARANTEED;
    return `1 in ${Math.round(adjustedP)}`;
  };

  // Logarithmic Slider Logic
  const handleLogSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      const actualValue = Math.pow(10, val);
      setLuckMultiplier(actualValue);
  };

  const getLogValue = (luck: number) => {
      return Math.log10(Math.max(1, luck));
  };

  // Get best drop for global effects/header
  const bestCurrentDrop = getBestDrop(currentDrops);
  const bestPendingDrop = getBestDrop(pendingDrops);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white selection:bg-white selection:text-black overflow-hidden">
      
      {/* Cutscene Overlay - Uses best pending drop */}
      {isCutscenePlaying && bestPendingDrop && (
          <Cutscene 
            text={bestPendingDrop.text} 
            rarityId={bestPendingDrop.rarityId} 
            onComplete={handleCutsceneComplete} 
          />
      )}

      {/* VFX Layer - Uses best current drop */}
      {bestCurrentDrop && <SpecialEffects rarityId={bestCurrentDrop.rarityId} />}

      {/* Header Stats */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 font-mono text-xs md:text-sm text-neutral-500">
        <div className="space-y-1">
          <p>{T.UI.ROLLS}: <span className="text-white">{stats.totalRolls.toLocaleString()}</span></p>
          <p>BALANCE: <span className="text-yellow-500">{stats.balance.toLocaleString()}</span></p>
          <p>{T.UI.BEST}: <span className={`${RARITY_TIERS[stats.bestRarityFound].textColor}`}>{T.RARITY_NAMES[stats.bestRarityFound]}</span></p>
          {luckMultiplier > 1.01 && (
             <p className="text-green-500 animate-pulse">LUCK: {Math.round(luckMultiplier).toLocaleString()}x</p>
          )}
          {stats.multiRollLevel > 1 && (
             <p className="text-blue-400">MULTI-ROLL: Lv.{stats.multiRollLevel}</p>
          )}
        </div>
        
        <div className="flex gap-2">
            <button 
            onClick={() => setIsShopOpen(true)}
            className="border border-yellow-700 text-yellow-500 hover:bg-yellow-900/30 px-4 py-2 transition-all uppercase bg-black/50 backdrop-blur"
            >
            SHOP
            </button>
            <button 
            onClick={() => setIsInventoryOpen(true)}
            className="border border-neutral-700 hover:border-white hover:text-white px-4 py-2 transition-all uppercase bg-black/50 backdrop-blur"
            >
            {T.UI.INVENTORY} [{inventory.length}]
            </button>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="z-10 w-full max-w-6xl px-6 flex flex-col items-center justify-center space-y-8">
        
        {/* Content Area */}
        <div className="min-h-[300px] w-full flex items-center justify-center perspective-1000">
          {currentDrops.length > 0 ? (
            <div className={`
                w-full grid gap-8 items-center justify-center
                ${currentDrops.length === 1 ? 'grid-cols-1' : ''}
                ${currentDrops.length === 2 ? 'grid-cols-1 md:grid-cols-2' : ''}
                ${currentDrops.length === 3 ? 'grid-cols-1 md:grid-cols-3' : ''}
            `}>
                {currentDrops.map((drop, idx) => {
                    const tier = RARITY_TIERS[drop.rarityId];
                    return (
                        <div key={`${drop.rollNumber}-${idx}`} className="flex flex-col items-center text-center animate-fade-in-up">
                            <div className="mb-4">
                                <RarityBadge rarityId={drop.rarityId} size="md" label={T.RARITY_NAMES[drop.rarityId]} />
                                <p className="text-[10px] text-neutral-500 mt-1 font-mono tracking-widest mix-blend-difference">
                                    {formatProb(tier.probability)}
                                </p>
                            </div>

                            <h1 
                                className={`
                                    font-bold tracking-tight leading-tight transition-all duration-75 mb-4
                                    ${tier.textColor}
                                    ${currentDrops.length > 1 ? 'text-2xl md:text-3xl' : 'text-3xl md:text-5xl lg:text-6xl'}
                                `}
                                style={{
                                    textShadow: tier.id >= RarityId.MYTHICAL ? `0 0 20px ${tier.shadowColor}` : 'none',
                                    transform: tier.id >= RarityId.DIVINE ? 'scale(1.05)' : 'scale(1)'
                                }}
                            >
                                "{drop.text}"
                            </h1>

                            {drop.description && (
                                <p className={`
                                    font-mono text-neutral-400
                                    ${currentDrops.length > 1 ? 'text-xs max-w-[200px]' : 'text-sm md:text-base max-w-lg'}
                                `}>
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

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 items-center mt-12 w-full justify-center">
          
          <button
            onClick={() => {
                if(isAutoSpinning) setIsAutoSpinning(false);
                handleRoll();
            }}
            disabled={isCutscenePlaying}
            className="
              group relative px-12 py-6 bg-neutral-900 border border-neutral-700 
              hover:border-white hover:bg-neutral-800 transition-all active:scale-95
              w-64 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <span className="relative z-10 text-xl font-bold tracking-[0.2em] group-hover:text-white text-neutral-300">{T.UI.GENERATE}</span>
            <div className="absolute bottom-0 left-0 h-1 bg-white w-0 group-hover:w-full transition-all duration-300" />
          </button>

          <button
            onClick={() => setIsAutoSpinning(!isAutoSpinning)}
            disabled={isCutscenePlaying}
            className={`
              group relative px-8 py-6 border transition-all w-64 disabled:opacity-50 disabled:cursor-not-allowed
              ${isAutoSpinning 
                ? 'bg-red-900/20 border-red-500 text-red-500' 
                : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:border-green-500 hover:text-green-500'
              }
            `}
          >
            <span className="text-xl font-bold tracking-[0.2em]">
              {isAutoSpinning ? T.UI.STOP_AUTO : T.UI.AUTO_SPIN}
            </span>
            <span className="absolute bottom-2 right-2 text-[10px] opacity-50">
              {autoSpinSpeed}ms
            </span>
            {isAutoSpinning && (
                <span className="absolute top-2 right-2 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            )}
          </button>

        </div>
      </div>

      {/* Footer Decor & Admin Toggle */}
      <div className="absolute bottom-0 w-full p-6 flex justify-between items-end z-20 pointer-events-none">
        <div className="flex gap-4 items-center pointer-events-auto">
             <div className="text-neutral-800 text-xs font-mono uppercase tracking-widest">
                v1.3.0
            </div>
            <button onClick={() => setIsChangelogOpen(true)} className="text-neutral-700 hover:text-white text-xs font-mono underline">
                CHANGELOG
            </button>
        </div>
        
        <button 
            onClick={() => setIsAdminOpen(true)}
            className="pointer-events-auto text-neutral-800 hover:text-neutral-500 text-xs font-mono uppercase transition-colors"
        >
            [ {T.UI.SYSTEM_CONFIG} ]
        </button>
      </div>

      {/* Modals */}
      <Inventory 
        items={inventory} 
        isOpen={isInventoryOpen} 
        onClose={() => setIsInventoryOpen(false)}
        language={language}
        onInspect={handleInspectItem}
      />

      <Shop 
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        balance={stats.balance}
        multiRollLevel={stats.multiRollLevel}
        onBuyUpgrade={handleBuyUpgrade}
      />

      <Changelog 
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />

      {/* Admin Panel Modal */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 p-6 rounded-lg shadow-2xl relative">
            <div className="flex justify-between items-center mb-6 border-b border-neutral-700 pb-2">
              <h2 className="text-xl font-mono text-white tracking-wider">{T.UI.SYSTEM_CONFIG}</h2>
              <button onClick={() => setIsAdminOpen(false)} className="text-neutral-500 hover:text-white">[X]</button>
            </div>

            <div className="space-y-8">

               {/* Language Selection */}
               <div className="space-y-2">
                <div className="text-sm font-mono text-neutral-400">LANGUAGE / LINGUA</div>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => setLanguage('en')}
                        className={`py-2 px-4 border font-mono text-xs ${language === 'en' ? 'bg-white text-black border-white' : 'bg-transparent text-neutral-500 border-neutral-700 hover:border-neutral-500'}`}
                    >
                        ENGLISH
                    </button>
                    <button 
                        onClick={() => setLanguage('it')}
                        className={`py-2 px-4 border font-mono text-xs ${language === 'it' ? 'bg-white text-black border-white' : 'bg-transparent text-neutral-500 border-neutral-700 hover:border-neutral-500'}`}
                    >
                        ITALIANO
                    </button>
                </div>
              </div>
              
              {/* Auto Spin Speed Control */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-mono text-neutral-400">
                    <label>{T.UI.SPEED}</label>
                    <span className="text-white">{autoSpinSpeed}ms</span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="1000" 
                  step="10"
                  value={autoSpinSpeed}
                  onChange={(e) => setAutoSpinSpeed(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>

              {/* Luck Boost Control (Logarithmic) */}
              <div className="space-y-2">
                <div className="flex justify-between items-end text-sm font-mono text-neutral-400 mb-1">
                    <label>{T.UI.LUCK_MULT} (Log Scale)</label>
                    <div className="text-right">
                         <span className="text-yellow-500 font-bold">{Math.round(luckMultiplier).toLocaleString()}x</span>
                    </div>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="12" 
                  step="0.1"
                  value={getLogValue(luckMultiplier)}
                  onChange={handleLogSliderChange}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
                <div className="flex justify-between text-[10px] text-neutral-600 font-mono">
                    <span>1x</span>
                    <span>1Mx</span>
                    <span>1Bx</span>
                    <span>1Tx</span>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="pt-4 border-t border-neutral-800">
                 <p className="text-xs text-neutral-500 mb-2">{T.UI.PRESETS}</p>
                 <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => { setAutoSpinSpeed(150); setLuckMultiplier(1); }} className="text-xs border border-neutral-700 p-2 hover:bg-neutral-800 text-neutral-400">{T.UI.RESET}</button>
                    <button onClick={() => { setAutoSpinSpeed(50); setLuckMultiplier(1000); }} className="text-xs border border-neutral-700 p-2 hover:bg-neutral-800 text-neutral-400">{T.UI.LUCKY}</button>
                    <button onClick={() => { setAutoSpinSpeed(20); setLuckMultiplier(1000000000); }} className="text-xs border border-neutral-700 p-2 hover:bg-neutral-800 text-yellow-600 border-yellow-900">{T.UI.GOD_MODE}</button>
                 </div>
              </div>
              
              {/* Data Management */}
              <div className="pt-4 border-t border-neutral-800">
                 <button 
                    onClick={() => {
                        if(confirm("Clear all save data? This cannot be undone.")) {
                            localStorage.clear();
                            window.location.reload();
                        }
                    }}
                    className="w-full text-xs text-red-800 hover:text-red-500 p-2 border border-red-900/30 hover:border-red-600 transition-colors"
                >
                    WIPE DATA
                 </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Flash Overlay - Triggers on best drop */}
      {bestCurrentDrop && bestCurrentDrop.rarityId >= RarityId.DIVINE && !isCutscenePlaying && (
        <div 
            key={bestCurrentDrop.timestamp}
            className="absolute inset-0 bg-white pointer-events-none animate-flash z-40 mix-blend-overlay opacity-50"
        />
      )}
      
      <style>{`
        @keyframes flash {
            0% { opacity: 0.8; }
            100% { opacity: 0; }
        }
        .animate-flash {
            animation: flash 0.5s ease-out forwards;
        }
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}