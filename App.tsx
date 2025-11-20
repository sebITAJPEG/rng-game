
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameStats, Drop, InventoryItem, RarityId, Language, ItemData } from './types';
import { RARITY_TIERS, TRANSLATIONS } from './constants';
import { generateDrop } from './services/rngService';
import { audioService } from './services/audioService';
import { RarityBadge } from './components/RarityBadge';
import { Inventory } from './components/Inventory';
import { SpecialEffects } from './components/SpecialEffects';
import { Cutscene } from './components/Cutscene';
import { Shop } from './components/Shop';
import { Changelog } from './components/Changelog';
import { ItemVisualizer } from './components/ItemVisualizer';
import { IndexCatalog } from './components/IndexCatalog';

export default function App() {
  // State
  const [currentDrops, setCurrentDrops] = useState<Drop[]>([]);
  const [pendingDrops, setPendingDrops] = useState<Drop[]>([]); // For storing the batch during cutscene
  const [isCutscenePlaying, setIsCutscenePlaying] = useState(false);
  const [cutsceneDrop, setCutsceneDrop] = useState<Drop | null>(null); // The specific drop playing the cutscene
  const [isPreviewCutscene, setIsPreviewCutscene] = useState(false); // True if triggered from Index/Visualizer
  
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
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Visualizer State
  const [inspectedItem, setInspectedItem] = useState<(ItemData & { rarityId: RarityId }) | null>(null);

  // Settings State
  const [autoSpinSpeed, setAutoSpinSpeed] = useState(150);
  const [luckMultiplier, setLuckMultiplier] = useState(1);
  const [language, setLanguage] = useState<Language>(() => {
     return (localStorage.getItem('textbound_lang') as Language) || 'en';
  });

  // Filters / Thresholds
  const [autoStopRarity, setAutoStopRarity] = useState<RarityId>(() => {
    const saved = localStorage.getItem('textbound_settings_autostop');
    return saved ? parseInt(saved) : RarityId.DIVINE;
  });

  const [minCutsceneRarity, setMinCutsceneRarity] = useState<RarityId>(() => {
    const saved = localStorage.getItem('textbound_settings_cutscene');
    return saved ? parseInt(saved) : RarityId.PRIMORDIAL;
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

  useEffect(() => {
    localStorage.setItem('textbound_settings_autostop', autoStopRarity.toString());
  }, [autoStopRarity]);

  useEffect(() => {
    localStorage.setItem('textbound_settings_cutscene', minCutsceneRarity.toString());
  }, [minCutsceneRarity]);

  // Handle Mute Toggle
  const toggleMute = () => {
      const newState = !isMuted;
      setIsMuted(newState);
      audioService.toggleMute(newState);
  };

  // Helper to find best drop in a batch
  const getBestDrop = (drops: Drop[]) => {
      if (drops.length === 0) return null;
      return drops.reduce((prev, current) => (current.rarityId > prev.rarityId ? current : prev), drops[0]);
  };

  // Core Game Logic
  const handleRoll = useCallback(() => {
    audioService.playRollSound(); // Sound Effect

    // Multi-roll Loop
    const rollsToPerform = stats.multiRollLevel;
    const generatedDrops: Drop[] = [];
    
    for(let i = 0; i < rollsToPerform; i++) {
        generatedDrops.push(generateDrop(stats.totalRolls + i, luckMultiplier, language));
    }

    // Find the best drop to check for cutscenes
    const bestDrop = getBestDrop(generatedDrops);
    if (!bestDrop) return;

    // Process Cutsene Logic only for the best item using user defined threshold
    if (bestDrop.rarityId >= minCutsceneRarity) {
        setIsAutoSpinning(false);
        setPendingDrops(generatedDrops); // Store the whole batch
        setCutsceneDrop(bestDrop);
        setIsPreviewCutscene(false);
        setIsCutscenePlaying(true);
        setInspectedItem(null); // Close visualizer if open
    } else {
        setCurrentDrops(generatedDrops);
        // If cutscene plays, stats update after. If not, update here.
        batchUpdateStatsAndInventory(generatedDrops, rollsToPerform);
        
        // Play Rarity Sound for best item
        audioService.playRaritySound(bestDrop.rarityId);
    }

  }, [stats.totalRolls, stats.multiRollLevel, luckMultiplier, language, minCutsceneRarity]);

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

     // Check for auto-stop condition using user defined threshold
     if (drops.some(d => d.rarityId >= autoStopRarity)) {
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
      // If it was a preview (from Index), just stop playing and return to visualizer
      if (isPreviewCutscene) {
          setIsCutscenePlaying(false);
          setCutsceneDrop(null);
          // Visualizer remains open via state
          return;
      }

      // Actual game drop logic
      if (pendingDrops.length > 0) {
          setCurrentDrops(pendingDrops);
          batchUpdateStatsAndInventory(pendingDrops, stats.multiRollLevel);
          
          // Play impact sound after cutscene reveal
          const best = getBestDrop(pendingDrops);
          if(best) audioService.playRaritySound(best.rarityId);

          setPendingDrops([]);
      }
      setIsCutscenePlaying(false);
      setCutsceneDrop(null);
  };

  const handleInspectItem = (item: InventoryItem) => {
      audioService.playClick();
      setIsAutoSpinning(false);
      setInspectedItem({
          text: item.text,
          description: item.description,
          rarityId: item.rarityId,
          cutscenePhrase: '' // Inventory items don't strictly need this for visualizer, but index passes it
      });
      setIsInventoryOpen(false);
  };

  const handleIndexSelectItem = (item: ItemData, rarityId: RarityId) => {
      audioService.playClick();
      setIsAutoSpinning(false);
      setInspectedItem({
          text: item.text,
          description: item.description,
          rarityId: rarityId,
          cutscenePhrase: item.cutscenePhrase
      });
  };

  const handlePlayCutsceneFromVisualizer = () => {
      if (!inspectedItem) return;
      
      // Setup a mock drop for the cutscene
      setCutsceneDrop({
          text: inspectedItem.text,
          description: inspectedItem.description,
          rarityId: inspectedItem.rarityId,
          cutscenePhrase: inspectedItem.cutscenePhrase,
          timestamp: Date.now(),
          rollNumber: 0
      });
      setIsPreviewCutscene(true);
      setIsCutscenePlaying(true);
  };

  const handleBuyUpgrade = (level: number, cost: number) => {
      if (stats.balance >= cost) {
          audioService.playRaritySound(RarityId.EPIC); // Success sound
          setStats(prev => ({
              ...prev,
              balance: prev.balance - cost,
              multiRollLevel: level
          }));
      }
  };

  // Auto Spin Effect
  useEffect(() => {
    if (isAutoSpinning && !isCutscenePlaying && !inspectedItem) {
      autoSpinRef.current = window.setInterval(handleRoll, autoSpinSpeed);
    } else {
      if (autoSpinRef.current) clearInterval(autoSpinRef.current);
      autoSpinRef.current = null;
    }
    return () => {
      if (autoSpinRef.current) clearInterval(autoSpinRef.current);
    };
  }, [isAutoSpinning, handleRoll, autoSpinSpeed, isCutscenePlaying, inspectedItem]);

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
  // If we are inspecting an item, that determines the VFX
  // If not, the current drop on board
  const activeRarityVFX = isCutscenePlaying && cutsceneDrop 
        ? cutsceneDrop.rarityId 
        : inspectedItem 
            ? inspectedItem.rarityId 
            : getBestDrop(currentDrops)?.rarityId;

  const tierOptions = Object.values(RARITY_TIERS).sort((a, b) => a.id - b.id);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white selection:bg-white selection:text-black overflow-hidden">
      
      {/* Cutscene Overlay */}
      {isCutscenePlaying && cutsceneDrop && (
          <Cutscene 
            text={cutsceneDrop.text} 
            rarityId={cutsceneDrop.rarityId} 
            cutscenePhrase={cutsceneDrop.cutscenePhrase}
            onComplete={handleCutsceneComplete} 
          />
      )}

      {/* VFX Layer */}
      {activeRarityVFX && <SpecialEffects rarityId={activeRarityVFX} />}

      {/* Item Visualizer Overlay */}
      {inspectedItem && !isCutscenePlaying && (
          <ItemVisualizer 
            item={inspectedItem} 
            onClose={() => setInspectedItem(null)}
            onPlayCutscene={handlePlayCutsceneFromVisualizer}
          />
      )}

      {/* Header Stats */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 font-mono text-xs md:text-sm text-neutral-500 pointer-events-none">
        <div className="space-y-1 pointer-events-auto">
          <p>{T.UI.ROLLS}: <span className="text-white">{stats.totalRolls.toLocaleString()}</span></p>
          <p>BALANCE: <span className="text-yellow-500">{stats.balance.toLocaleString()}</span></p>
          <p>{T.UI.BEST}: <span className={`${RARITY_TIERS[stats.bestRarityFound].textColor}`}>{T.RARITY_NAMES[stats.bestRarityFound]}</span></p>
          {luckMultiplier > 1.01 && (
             <p className="text-green-500 animate-pulse">LUCK: {Math.round(luckMultiplier).toLocaleString()}x</p>
          )}
        </div>
        
        <div className="flex gap-2 pointer-events-auto">
            <button 
                onClick={toggleMute}
                className="border border-neutral-700 hover:border-white hover:text-white px-3 py-2 transition-all uppercase bg-black/50 backdrop-blur min-w-[40px]"
            >
                {isMuted ? '🔇' : '🔊'}
            </button>
            <button 
                onClick={() => {
                    audioService.playClick();
                    setIsIndexOpen(true);
                }}
                className="border border-indigo-900 text-indigo-400 hover:bg-indigo-900/30 hover:text-white px-4 py-2 transition-all uppercase bg-black/50 backdrop-blur"
            >
                INDEX
            </button>
            <button 
                onClick={() => {
                    audioService.playClick();
                    setIsShopOpen(true);
                }}
                className="border border-yellow-700 text-yellow-500 hover:bg-yellow-900/30 px-4 py-2 transition-all uppercase bg-black/50 backdrop-blur"
            >
                SHOP
            </button>
            <button 
                onClick={() => {
                    audioService.playClick();
                    setIsInventoryOpen(true);
                }}
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
                    const isTheOne = drop.rarityId === RarityId.THE_ONE;
                    const textColorClass = isTheOne ? "text-black drop-shadow-none" : tier.textColor;
                    const descColorClass = isTheOne ? "text-neutral-600" : "text-neutral-400";
                    
                    return (
                        <div key={`${drop.rollNumber}-${idx}`} className="flex flex-col items-center text-center animate-fade-in-up relative z-10">
                            <div className="mb-4">
                                <RarityBadge rarityId={drop.rarityId} size="md" label={T.RARITY_NAMES[drop.rarityId]} />
                                <p className={`text-[10px] mt-1 font-mono tracking-widest mix-blend-difference ${isTheOne ? 'text-black' : 'text-neutral-500'}`}>
                                    {formatProb(tier.probability)}
                                </p>
                            </div>

                            <h1 
                                className={`
                                    font-bold tracking-tight leading-tight transition-all duration-75 mb-4
                                    ${textColorClass}
                                    ${currentDrops.length > 1 ? 'text-2xl md:text-3xl' : 'text-3xl md:text-5xl lg:text-6xl'}
                                `}
                                style={{
                                    textShadow: !isTheOne && tier.id >= RarityId.MYTHICAL ? `0 0 20px ${tier.shadowColor}` : 'none',
                                    transform: tier.id >= RarityId.DIVINE ? 'scale(1.05)' : 'scale(1)'
                                }}
                            >
                                "{drop.text}"
                            </h1>

                            {drop.description && (
                                <p className={`
                                    font-mono
                                    ${descColorClass}
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
            disabled={isCutscenePlaying || inspectedItem !== null}
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
            onClick={() => {
                audioService.playClick();
                setIsAutoSpinning(!isAutoSpinning);
            }}
            disabled={isCutscenePlaying || inspectedItem !== null}
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
                v1.5.0
            </div>
            <button onClick={() => setIsChangelogOpen(true)} className="text-neutral-700 hover:text-white text-xs font-mono underline">
                CHANGELOG
            </button>
        </div>
        
        <button 
            onClick={() => {
                audioService.playClick();
                setIsAdminOpen(true);
            }}
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

      <IndexCatalog 
         isOpen={isIndexOpen}
         onClose={() => setIsIndexOpen(false)}
         language={language}
         inventory={inventory}
         onSelectItem={handleIndexSelectItem}
      />

      {/* Admin Panel Modal */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 p-6 rounded-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
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

              {/* Filters Section */}
              <div className="space-y-4 border-t border-neutral-800 pt-4">
                 <div className="text-sm font-mono text-white font-bold">FILTERS</div>
                 
                 {/* Auto Stop Filter */}
                 <div className="space-y-2">
                    <div className="flex justify-between text-sm font-mono text-neutral-400">
                        <label>AUTO-STOP AT RARITY</label>
                    </div>
                    <select 
                        value={autoStopRarity} 
                        onChange={(e) => setAutoStopRarity(Number(e.target.value))}
                        className="w-full bg-neutral-800 border border-neutral-600 text-white text-xs p-2 rounded font-mono"
                    >
                        {tierOptions.map(tier => (
                            <option key={tier.id} value={tier.id}>{T.RARITY_NAMES[tier.id]}</option>
                        ))}
                    </select>
                 </div>

                 {/* Cutscene Filter */}
                 <div className="space-y-2">
                    <div className="flex justify-between text-sm font-mono text-neutral-400">
                        <label>PLAY CUTSCENE MINIMUM</label>
                    </div>
                    <select 
                        value={minCutsceneRarity} 
                        onChange={(e) => setMinCutsceneRarity(Number(e.target.value))}
                        className="w-full bg-neutral-800 border border-neutral-600 text-white text-xs p-2 rounded font-mono"
                    >
                        {tierOptions.map(tier => (
                            <option key={tier.id} value={tier.id}>{T.RARITY_NAMES[tier.id]}</option>
                        ))}
                    </select>
                 </div>
              </div>
              
              {/* Auto Spin Speed Control */}
              <div className="space-y-2 border-t border-neutral-800 pt-4">
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
      {activeRarityVFX && activeRarityVFX >= RarityId.DIVINE && !isCutscenePlaying && (
        <div 
            key={Date.now()} // Simple force re-render on change
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
    