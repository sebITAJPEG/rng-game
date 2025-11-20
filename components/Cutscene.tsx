import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RarityId } from '../types';

interface Props {
  text: string;
  rarityId: RarityId;
  onComplete: () => void;
}

export const Cutscene: React.FC<Props> = ({ text, rarityId, onComplete }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Timing based on rarity intensity
    let times = [500, 2500, 5000];
    
    if (rarityId === RarityId.THE_ONE) {
        times = [1000, 4000, 8000]; // Longer for The One
    }

    const t1 = setTimeout(() => setStage(1), times[0]);
    const t2 = setTimeout(() => setStage(2), times[1]);
    const t3 = setTimeout(() => onComplete(), times[2]);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete, rarityId]);

  // --- PRIMORDIAL CUTSCENE (Magma, Earthquake, Ancient) ---
  if (rarityId === RarityId.PRIMORDIAL) {
    return (
      <motion.div className="fixed inset-0 z-[100] bg-orange-950 flex items-center justify-center overflow-hidden font-mono text-white">
        <motion.div 
            className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,69,0,0.8)_0%,_rgba(0,0,0,1)_100%)]"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Cracks */}
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cracked-ground.png')]" />
        
        <AnimatePresence>
            {stage === 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.5 }}
                    className="relative z-10 text-4xl font-bold tracking-widest text-orange-500 uppercase"
                >
                    AWAKENING
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {stage >= 2 && (
                <div className="relative z-10 flex flex-col items-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ 
                            scale: 1,
                            rotate: [0, -1, 1, -1, 0], // Shake
                        }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-red-600 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]"
                    >
                        {text.toUpperCase()}
                    </motion.div>
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        className="h-2 mt-4 bg-orange-600 rounded-full box-shadow-[0_0_20px_orange]"
                    />
                </div>
            )}
        </AnimatePresence>
        
        {/* Embers */}
        {Array.from({ length: 20 }).map((_, i) => (
             <motion.div
                key={i}
                className="absolute bg-orange-500 w-2 h-2 rounded-full"
                initial={{ y: "100vh", x: Math.random() * 100 + "vw", opacity: 0 }}
                animate={{ y: "-10vh", opacity: [0, 1, 0] }}
                transition={{ duration: Math.random() * 2 + 2, repeat: Infinity, delay: Math.random() }}
             />
        ))}
      </motion.div>
    );
  }

  // --- INFINITE CUTSCENE (Mirrors, Fractals, Cyan) ---
  if (rarityId === RarityId.INFINITE) {
    return (
      <motion.div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden font-sans text-white">
        
        {/* Expanding Rings */}
        {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
                key={i}
                className="absolute border border-cyan-500/30 rounded-full aspect-square"
                initial={{ width: "0%", opacity: 1 }}
                animate={{ width: "200%", opacity: 0 }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: "linear" }}
            />
        ))}

        <AnimatePresence>
            {stage === 1 && (
                <motion.div
                    initial={{ opacity: 0, filter: "blur(20px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(20px)" }}
                    className="relative z-10 text-2xl font-light tracking-[1em] text-cyan-200 uppercase"
                >
                    BOUNDLESS
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence>
            {stage >= 2 && (
                <div className="relative z-10 text-center">
                     {/* Background Echoes */}
                     <motion.h1 
                        className="absolute top-0 left-0 w-full text-center text-6xl md:text-8xl font-bold text-cyan-900 opacity-50 select-none"
                        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                     >
                        {text}
                     </motion.h1>
                    
                    <motion.h1
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative text-6xl md:text-8xl font-bold text-white drop-shadow-[0_0_30px_rgba(6,182,212,0.8)]"
                    >
                        {text}
                    </motion.h1>
                </div>
            )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // --- CHAOS CUTSCENE (Glitch, Noise, Aggressive) ---
  if (rarityId === RarityId.CHAOS) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden font-mono">
         <motion.div 
            className="absolute inset-0 bg-fuchsia-900"
            animate={{ opacity: [0, 0.2, 0, 0.4, 0] }}
            transition={{ duration: 0.2, repeat: Infinity }}
         />
         
         <AnimatePresence>
            {stage === 1 && (
                <motion.div
                    initial={{ x: -1000 }}
                    animate={{ x: 0 }}
                    exit={{ x: 1000 }}
                    className="relative z-10 text-4xl bg-white text-black px-8 py-2 font-bold tracking-tighter uppercase transform -skew-x-12"
                >
                    REALITY FAILURE
                </motion.div>
            )}
         </AnimatePresence>

         <AnimatePresence>
            {stage >= 2 && (
                <div className="relative z-10">
                    <motion.div
                        className="text-6xl md:text-8xl font-bold text-fuchsia-500 mix-blend-exclusion absolute top-1 left-1"
                        animate={{ x: [-2, 2, -1, 0], y: [1, -2, 2, 0] }}
                        transition={{ repeat: Infinity, duration: 0.1 }}
                    >
                        {text}
                    </motion.div>
                    <motion.div
                        className="text-6xl md:text-8xl font-bold text-green-500 mix-blend-exclusion absolute top-[-1px] left-[-1px]"
                        animate={{ x: [2, -2, 1, 0], y: [-1, 2, -2, 0] }}
                        transition={{ repeat: Infinity, duration: 0.15 }}
                    >
                        {text}
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative text-6xl md:text-8xl font-bold text-white"
                    >
                        {text}
                    </motion.h1>
                </div>
            )}
         </AnimatePresence>
      </div>
    );
  }

  // --- THE ONE CUTSCENE (Ascension, White Room, Finality) ---
  if (rarityId === RarityId.THE_ONE) {
      return (
        <motion.div 
            initial={{ backgroundColor: "#000" }}
            animate={{ backgroundColor: "#FFF" }}
            transition={{ duration: 3, ease: "circIn" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden font-mono"
        >
            <AnimatePresence>
                {stage < 2 && (
                    <motion.div 
                        className="text-xs text-neutral-500 absolute bottom-10"
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        DECRYPTING SOURCE...
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {stage >= 2 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center z-10"
                    >
                        <div className="text-sm tracking-[1em] text-neutral-400 mb-4 uppercase">You found</div>
                        <div className="text-6xl md:text-9xl font-black tracking-tighter text-black">
                            {text}
                        </div>
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2, delay: 0.5 }}
                            className="h-px bg-black mt-6 mx-auto"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
      )
  }

  // --- FALLBACK (For other tiers if configured to show) ---
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center text-white"
    >
        <h1 className="text-4xl font-bold">{text}</h1>
    </motion.div>
  );
};