
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RarityId } from '../types';
import { audioService } from '../services/audioService';

interface Props {
  text: string;
  rarityId: RarityId;
  cutscenePhrase?: string;
  onComplete: () => void;
}

// Helper to generate random particles
const useParticles = (count: number) => {
    return useMemo(() => {
        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 4 + 1,
            duration: Math.random() * 2 + 1,
            delay: Math.random() * 2
        }));
    }, [count]);
};

export const Cutscene: React.FC<Props> = ({ text, rarityId, cutscenePhrase, onComplete }) => {
  const [stage, setStage] = useState(0);
  
  // Cinematic Shake Effect State
  const [shake, setShake] = useState(0);

  useEffect(() => {
    audioService.playCutsceneAmbience(rarityId);

    // Timing logic based on rarity complexity
    // 0: Init, 1: Buildup/Phrase, 2: Climax/Reveal, 3: Hold, 4: Complete
    let times = [1500, 3500, 6500, 8000];
    
    if (rarityId === RarityId.THE_ONE) {
        times = [2000, 5000, 8000, 11000]; 
    }

    const t1 = setTimeout(() => { setStage(1); setShake(5); }, times[0]);
    const t2 = setTimeout(() => { setStage(2); setShake(20); }, times[1]);
    const t3 = setTimeout(() => setStage(3), times[2]); // Calm down/Hold
    const t4 = setTimeout(() => onComplete(), times[3]);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete, rarityId]);

  const phrase = cutscenePhrase || "LEGENDARY DROP";
  const particles = useParticles(30);

  // Common Cinematic Bars (Widescreen feel)
  const CinematicBars = () => (
      <>
        <motion.div 
            initial={{ height: 0 }} animate={{ height: "10vh" }} 
            className="absolute top-0 left-0 w-full bg-black z-[150]" 
        />
        <motion.div 
            initial={{ height: 0 }} animate={{ height: "10vh" }} 
            className="absolute bottom-0 left-0 w-full bg-black z-[150]" 
        />
      </>
  );

  // --- PRIMORDIAL (Magma, Heartbeat, Ancient) ---
  if (rarityId === RarityId.PRIMORDIAL) {
    return (
      <motion.div 
        className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden font-mono text-white"
      >
        <CinematicBars />
        
        {/* Shaking Container */}
        <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            animate={{ x: [0, -shake, shake, 0], y: [0, shake, -shake, 0] }}
            transition={{ duration: 0.1, repeat: Infinity }}
        >
            {/* Background Magma Pulse */}
            <motion.div 
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-600 via-red-900 to-black"
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Rising Embers */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute bg-orange-400 rounded-full mix-blend-screen blur-[1px]"
                    style={{ 
                        left: `${p.x}%`, 
                        bottom: "-10%",
                        width: p.size, 
                        height: p.size 
                    }}
                    animate={{ y: "-120vh", opacity: [0, 1, 0] }}
                    transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
                />
            ))}

            {/* STAGE 1: Phrase */}
            <AnimatePresence>
                {stage === 1 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
                        className="relative z-20 text-4xl md:text-6xl font-bold text-orange-100 tracking-[0.5em] uppercase text-center drop-shadow-[0_0_15px_rgba(255,100,0,0.8)]"
                    >
                        {phrase}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* STAGE 2: The Reveal */}
            <AnimatePresence>
                {stage >= 2 && (
                    <motion.div 
                        className="relative z-20 flex flex-col items-center px-4"
                        initial={{ scale: 0.5, opacity: 0, filter: "brightness(5)" }}
                        animate={{ scale: 1, opacity: 1, filter: "brightness(1)" }}
                        transition={{ type: "spring", bounce: 0.4 }}
                    >
                        <div className="text-sm text-orange-500 font-bold tracking-[1em] mb-6 border-b border-orange-500 pb-2 uppercase">
                            Primordial Artifact
                        </div>
                        <motion.div
                            className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-orange-400 text-center"
                            style={{ textShadow: "0 0 30px rgba(255, 69, 0, 0.6)" }}
                        >
                            {text}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
      </motion.div>
    );
  }

  // --- INFINITE (Speed, Light, Hyperspace) ---
  if (rarityId === RarityId.INFINITE) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden font-sans">
        <CinematicBars />

        {/* Hyperspace Tunnel */}
        <motion.div 
            className="absolute inset-0 perspective-[500px]"
            animate={{ filter: stage >= 2 ? "blur(0px)" : "blur(0px)" }}
        >
            {/* Star Streaks */}
            <motion.div 
                className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] opacity-20"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
             <motion.div 
                className="absolute inset-[-100%] bg-[conic-gradient(from_90deg,transparent_0_340deg,cyan_360deg)] opacity-20 mix-blend-screen"
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
        </motion.div>

        {/* Center Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_90%)] z-10" />

        <AnimatePresence>
            {stage === 1 && (
                 <motion.div
                    initial={{ z: -1000, opacity: 0 }}
                    animate={{ z: 0, opacity: 1 }}
                    exit={{ z: 1000, opacity: 0 }}
                    className="relative z-20 text-3xl md:text-5xl font-light tracking-[2em] text-cyan-300 uppercase whitespace-nowrap"
                >
                    {phrase}
                </motion.div>
            )}
        </AnimatePresence>

        {/* Reveal with Chromatic Aberration */}
        <AnimatePresence>
            {stage >= 2 && (
                <motion.div className="relative z-20 text-center">
                    <motion.div 
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", duration: 1.5 }}
                        className="relative"
                    >
                         {/* RGB Split Layers */}
                        <motion.h1 className="absolute top-0 left-0 w-full text-6xl md:text-9xl font-bold text-red-500 mix-blend-screen opacity-50"
                            animate={{ x: [-2, 2], y: [1, -1] }} transition={{ repeat: Infinity, duration: 0.1 }}>{text}</motion.h1>
                        <motion.h1 className="absolute top-0 left-0 w-full text-6xl md:text-9xl font-bold text-blue-500 mix-blend-screen opacity-50"
                            animate={{ x: [2, -2], y: [-1, 1] }} transition={{ repeat: Infinity, duration: 0.1 }}>{text}</motion.h1>
                        
                        <h1 className="text-6xl md:text-9xl font-bold text-white drop-shadow-[0_0_20px_cyan] relative z-10">
                            {text}
                        </h1>
                    </motion.div>
                    <motion.div 
                        initial={{ width: 0 }} animate={{ width: "100%" }}
                        className="h-1 bg-cyan-400 mt-8 shadow-[0_0_20px_cyan]" 
                    />
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    );
  }

  // --- CHAOS (Glitch, Horror, Entropy) ---
  if (rarityId === RarityId.CHAOS) {
    return (
      <div className="fixed inset-0 z-[100] bg-neutral-900 flex items-center justify-center overflow-hidden font-mono">
         {/* Aggressive Background */}
         <motion.div 
            className="absolute inset-0 bg-white mix-blend-difference"
            animate={{ opacity: [0, 0.2, 0, 0.8, 0] }}
            transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
         />
         
         {/* Glitch Text Container */}
         <div className="relative z-20">
            <AnimatePresence>
                {stage === 1 && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-4xl md:text-6xl font-black bg-black text-white px-8 py-2 transform -skew-x-12 border-2 border-white"
                    >
                        {phrase}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {stage >= 2 && (
                    <motion.div
                        initial={{ scale: 2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                    >
                        {/* The "Broken" Effect */}
                        <motion.div 
                            className="absolute -inset-4 bg-fuchsia-600 blur-xl opacity-50"
                            animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.9, 1.1, 0.9] }}
                            transition={{ duration: 0.1, repeat: Infinity }}
                        />
                        <div className="text-6xl md:text-8xl font-black text-white relative z-10 mix-blend-hard-light">
                            {text.split('').map((char, i) => (
                                <motion.span 
                                    key={i} 
                                    className="inline-block"
                                    animate={{ 
                                        y: [0, Math.random()*20 - 10, 0], 
                                        x: [0, Math.random()*10 - 5, 0],
                                        opacity: [1, 0.5, 1]
                                    }}
                                    transition={{ duration: 0.2, repeat: Infinity }}
                                >
                                    {char}
                                </motion.span>
                            ))}
                        </div>
                         <div className="text-sm text-center mt-4 font-mono tracking-widest text-fuchsia-400">
                             FATAL_EXCEPTION_THROWN
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>
         </div>
      </div>
    );
  }

  // --- THE ONE (Ascension, Singularity, Code) ---
  if (rarityId === RarityId.THE_ONE) {
      return (
        <motion.div 
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden font-mono bg-black"
        >
            <CinematicBars />

            {/* Phase 1: Matrix Code Rain (Simplified vertical strips) */}
            <div className="absolute inset-0 flex justify-between opacity-20 pointer-events-none">
                {Array.from({length: 20}).map((_, i) => (
                    <motion.div 
                        key={i}
                        className="w-px bg-green-500 h-full"
                        initial={{ y: "-100%" }}
                        animate={{ y: "100%" }}
                        transition={{ duration: Math.random() * 2 + 1, repeat: Infinity, ease: "linear" }}
                    />
                ))}
            </div>

            {/* Phase 2: The Singularity (Implosion) */}
            {stage === 2 && (
                <motion.div 
                    className="absolute inset-0 bg-white"
                    initial={{ scale: 0, borderRadius: "100%" }}
                    animate={{ scale: [0, 0.1, 20] }} // Explode outward
                    transition={{ duration: 0.4, ease: "circIn", delay: 0.2 }}
                />
            )}

            {/* Phase 3: Ascension (White State) */}
            {stage >= 2 && (
                <motion.div 
                    className="absolute inset-0 bg-white z-10 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1, delay: 0.4 }}
                >
                    {/* Divine Particles */}
                    <div className="absolute inset-0 overflow-hidden">
                        {particles.map((p) => (
                            <motion.div
                                key={p.id}
                                className="absolute bg-neutral-200 rounded-full"
                                style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size * 2, height: p.size * 2 }}
                                animate={{ y: -100, opacity: 0 }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        ))}
                    </div>

                    <motion.div className="relative z-20 text-center">
                         <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6, duration: 1 }}
                         >
                            <div className="text-xs text-neutral-400 tracking-[1.5em] uppercase mb-8 ml-2">
                                Reality Simulation End
                            </div>
                            <h1 className="text-5xl md:text-9xl font-black text-black tracking-tighter drop-shadow-2xl">
                                {text}
                            </h1>
                         </motion.div>
                         <motion.div 
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 1, duration: 1.5 }}
                            className="w-full h-[2px] bg-black mt-8"
                         />
                    </motion.div>
                </motion.div>
            )}

            {/* Terminal Text (Stage 1) */}
            <AnimatePresence>
                {stage === 1 && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="z-20 text-xl md:text-3xl text-green-500 font-bold"
                    >
                        <span className="mr-4">{'>'}</span>
                        {phrase.split('').map((char, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                {char}
                            </motion.span>
                        ))}
                        <motion.span
                            animate={{ opacity: [0, 1] }}
                            transition={{ repeat: Infinity, duration: 0.1 }}
                            className="inline-block w-4 h-8 bg-green-500 ml-2 align-middle"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
      )
  }

  // Fallback
  return null;
};
