import React, { useRef, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  Stars,
} from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { RarityId, ItemData, VariantId } from '../types';
import { RARITY_TIERS, VARIANTS, ORES, GOLD_ORES } from '../constants';

// Import all localized models
import { BlackHoleModel } from './models/BlackHoleModel';
import { GoldenRatioModel } from './models/GoldenRatioModel';
import { LiquidLuckModel } from './models/LiquidLuckModel';
import { SoundShardModel } from './models/SoundShardModel';
import { HypercubeFragmentModel } from './models/HypercubeFragmentModel';
import { FrozenTimeModel } from './models/FrozenTimeModel';
import { SolarPlasmaModel } from './models/SolarPlasmaModel';
import { AntimatterModel } from './models/AntimatterModel';
import { AngelFeatherModel } from './models/AngelFeatherModel';
import { LunarDustModel } from './models/LunarDustModel';
import { MartianSoilModel } from './models/MartianSoilModel';
import { StardustModel } from './models/StardustModel';
import { TimeLostTreasureModel } from './models/TimeLostTreasureModel';
import { SolidLightModel } from './models/SolidLightModel'; // New Import
import { PhilosophersGoldModel } from './models/PhilosophersGoldModel'; // New Import
import { StandardOreModel } from './models/StandardOreModel';
import { UniverseNuggetModel } from './models/UniverseNuggetModel'; // New Import   
import { MoonstoneModel } from './models/MoonstoneModel'; // New Import    

// --- SCENE CONTENT ---

const SceneContent: React.FC<{ item: ItemData; color: string; intensity: number }> = ({ item, color, intensity }) => {
  const isBlackHole = item.text === "Black Hole Core";
  const isLiquidLuck = item.text === "Liquid Luck";
  const isSoundShard = item.text === "Sound Shard";
  const isHypercube = item.text === "Hypercube Fragment";
  const isFrozenTime = item.text === "Frozen Time";
  const isSolarPlasma = item.text === "Solar Plasma";
  const isAntimatter = item.text === "Antimatter";
  const isAngelFeather = item.text === "Angel Feather";
  const isLunarDust = item.text === "Lunar Dust";
  const isMartianSoil = item.text === "Martian Soil";
  const isStardust = item.text === "Stardust";
  const isGoldenRatio = item.text === "The Golden Ratio";
  const isTimeLostTreasure = item.text === "Time-Lost Treasure";
  const isSolidLight = item.text === "Solid Light"; // Check for Solid Light
  const isPhilosophersGold = item.text === "Philosopher's Gold";
  const isUniverseNugget = item.text === "Universe Nugget"; // Check for Universe Nugget
  const isMoonstone = item.text === "Moonstone"; // Check for Moonstone
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} color={color} intensity={2} />

      {isBlackHole ? <BlackHoleModel />
        : isLiquidLuck ? <LiquidLuckModel />
          : isSoundShard ? <SoundShardModel />
            : isHypercube ? <HypercubeFragmentModel />
              : isFrozenTime ? <FrozenTimeModel />
                : isSolarPlasma ? <SolarPlasmaModel />
                  : isAntimatter ? <AntimatterModel />
                    : isAngelFeather ? <AngelFeatherModel />
                      : isLunarDust ? <LunarDustModel />
                        : isMartianSoil ? <MartianSoilModel />
                          : isStardust ? <StardustModel />
                            : isGoldenRatio ? <GoldenRatioModel />
                              : isTimeLostTreasure ? <TimeLostTreasureModel />
                                : isSolidLight ? <SolidLightModel /> // Render Solid Light
                                  : isPhilosophersGold ? <PhilosophersGoldModel />
                                    : isUniverseNugget ? <UniverseNuggetModel />
                                      : isMoonstone ? <MoonstoneModel />
                                        : <StandardOreModel color={color} intensity={intensity} />}

      {isBlackHole ? (
        <>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <EffectComposer>
            <Bloom luminanceThreshold={0} mipmapBlur intensity={1.5} radius={0.6} />
            <Noise opacity={0.1} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </>
      ) : isGoldenRatio || isTimeLostTreasure || isSolidLight || isPhilosophersGold ? ( // Add Solid Light to bloom effect
        <EffectComposer>
          <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} radius={0.8} />
          <Noise opacity={0.05} />
        </EffectComposer>
      ) : (
        <EffectComposer>
          <Bloom luminanceThreshold={1} mipmapBlur intensity={0.5} radius={0.4} />
        </EffectComposer>
      )}

      <OrbitControls enablePan={false} autoRotate autoRotateSpeed={isBlackHole ? 0.5 : 2} />
    </>
  );
};

interface Props {
  item: ItemData & { rarityId: RarityId, variantId?: VariantId };
  onClose: () => void;
}

export const ItemVisualizer: React.FC<Props> = ({ item, onClose }) => {
  const tier = RARITY_TIERS[item.rarityId];
  const variant = VARIANTS[item.variantId || 0]; // Default to NONE
  const hasVariant = (item.variantId ?? 0) !== 0;

  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 500, damping: 50 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 50 });
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  const oreData = useMemo(() => {
    return ORES.find(o => o.name === item.text) || GOLD_ORES.find(o => o.name === item.text);
  }, [item.text]);

  const isSpecial = [
    "Black Hole Core", "Liquid Luck", "Sound Shard", "Hypercube Fragment",
    "Frozen Time", "Solar Plasma", "Antimatter", "Angel Feather",
    "Lunar Dust", "Martian Soil", "Stardust", "The Golden Ratio",
    "Time-Lost Treasure", "Solid Light", "Philosopher's Gold" // Add to special list
  ].includes(item.text);

  const isOre = !!oreData;
  const modelColor = oreData ? oreData.glowColor : '#888';
  const borderClass = hasVariant ? variant.borderClass : tier.color;
  const intensity = (tier.id / 2) + (variant.multiplier > 1 ? 2 : 0);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-md perspective-1000" onClick={onClose}>
      <motion.div
        ref={ref}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        // @ts-ignore
        onPointerMove={handlePointerMove}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg h-[600px] rounded-xl border-2 ${borderClass} bg-neutral-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden group cursor-default flex flex-col`}
      >
        {(isOre || isSpecial) && (
          <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }} gl={{ antialias: false, alpha: true }}>
              <SceneContent item={item} color={modelColor} intensity={intensity} />
            </Canvas>
          </div>
        )}

        <div className="relative z-10 h-full flex flex-col justify-between p-6 pointer-events-none">
          <div className="flex justify-between items-start border-b border-white/10 pb-4 bg-gradient-to-b from-neutral-900/80 to-transparent">
            <div className="text-left">
              <div className={`text-xs font-mono uppercase tracking-widest ${tier.textColor} drop-shadow-md`}>
                {tier.name} // NO.{item.rarityId}
              </div>
              {hasVariant && (
                <div className={`text-xs font-mono uppercase tracking-widest mt-1 ${variant.styleClass.split(' ')[0]}`}>
                  VARIANT: {variant.name}
                </div>
              )}
            </div>
            <div className="text-xs font-mono text-neutral-500 uppercase tracking-widest border border-neutral-700 px-2 py-1 rounded bg-black/50">
              {isSpecial ? 'ARTIFACT' : 'MATERIAL'}
            </div>
          </div>

          <div className="pt-8 bg-gradient-to-t from-neutral-900 via-neutral-900/80 to-transparent pointer-events-auto">
            <h1 className={`text-3xl md:text-4xl font-bold ${tier.textColor} drop-shadow-md mb-2 ${hasVariant ? variant.styleClass : ''}`}>
              {hasVariant ? variant.prefix : ''} {item.text}
            </h1>
            <p className="text-sm font-mono text-neutral-400 leading-relaxed max-w-xs">
              {item.description}
            </p>
            <div className="mt-6 flex gap-2">
              <div className="flex-1 text-[10px] font-mono text-neutral-600 uppercase border-t border-white/10 pt-2">
                ID: {Math.random().toString(36).substring(7).toUpperCase()}
              </div>
              <button onClick={onClose} className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white font-mono text-xs tracking-widest uppercase transition-all border border-neutral-700 hover:border-white">
                CLOSE
              </button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 pointer-events-none border-4 border-transparent rounded-xl mix-blend-overlay opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-20" />
        {hasVariant && <div className={`absolute inset-0 pointer-events-none border-2 ${variant.borderClass} opacity-50 z-20`} />}
      </motion.div>
    </div>
  );
};