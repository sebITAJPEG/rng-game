
import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { RarityId, ItemData } from '../types';
import { RARITY_TIERS } from '../constants';

interface Props {
  item: ItemData & { rarityId: RarityId };
  onClose: () => void;
  onPlayCutscene?: () => void;
}

export const ItemVisualizer: React.FC<Props> = ({ item, onClose, onPlayCutscene }) => {
  const tier = RARITY_TIERS[item.rarityId];
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 50 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 50 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXRel = e.clientX - rect.left;
    const mouseYRel = e.clientY - rect.top;
    const xPct = mouseXRel / width - 0.5;
    const yPct = mouseYRel / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-md perspective-1000" onClick={onClose}>
      <motion.div
        ref={ref}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => e.stopPropagation()}
        className={`
            relative w-full max-w-md p-8 rounded-xl border-2 ${tier.color} bg-neutral-900 
            shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden group cursor-default
        `}
      >
        {/* Holographic Shine Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none mix-blend-overlay" />
        
        {/* Scanline Texture */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] filter contrast-150 brightness-1000" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-6 transform translate-z-10">
           <div className="w-full flex justify-between items-start border-b border-white/10 pb-4">
                <div className={`text-xs font-mono uppercase tracking-widest ${tier.textColor}`}>
                    {tier.name} // NO.{item.rarityId}
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">
                    SECURE ITEM
                </div>
           </div>

           <div className="py-8">
                <h1 className={`text-3xl md:text-4xl font-bold ${tier.textColor} drop-shadow-md mb-4`}>
                    {item.text}
                </h1>
                <p className="text-sm font-mono text-neutral-400 leading-relaxed max-w-xs mx-auto">
                    {item.description}
                </p>
           </div>

           <div className="w-full pt-4 border-t border-white/10 flex flex-col gap-3">
                {onPlayCutscene && item.rarityId >= RarityId.PRIMORDIAL && (
                    <button 
                        onClick={onPlayCutscene}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-white/50 text-white font-mono text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                    >
                        <span>▶ REPLAY SEQUENCE</span>
                    </button>
                )}
                <button 
                    onClick={onClose}
                    className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white font-mono text-xs tracking-widest uppercase transition-all"
                >
                    CLOSE VISUALIZER
                </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
};
    