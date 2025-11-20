import React from 'react';
import { RarityId } from '../types';

interface Props {
  rarityId: RarityId;
}

export const SpecialEffects: React.FC<Props> = ({ rarityId }) => {
  // Only render effects for DIVINE tier and above
  if (rarityId < RarityId.DIVINE) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      
      {/* DIVINE: Angelic/Holy light */}
      {rarityId === RarityId.DIVINE && (
        <div className="absolute inset-0 opacity-40">
            <div className="absolute inset-[-50%] bg-[conic-gradient(at_center,_var(--tw-gradient-stops))] from-cyan-200 via-white to-cyan-200 animate-[spin_8s_linear_infinite] blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      )}

      {/* OTHERWORLDLY: Strange dimensional distortion */}
      {rarityId === RarityId.OTHERWORLDLY && (
        <div className="absolute inset-0">
            <div className="absolute inset-0 bg-indigo-900/30 mix-blend-overlay" />
            <div className="absolute top-0 left-0 w-full h-full animate-[pulse_3s_ease-in-out_infinite] opacity-50">
                 <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[120px] mix-blend-screen animate-blob" />
                 <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
            </div>
        </div>
      )}

      {/* COSMIC: Space, Stars, Nebula */}
      {rarityId === RarityId.COSMIC && (
        <div className="absolute inset-0 bg-black">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/50 via-black to-blue-900/50" />
            <div className="stars absolute inset-0 animate-twinkle">
                {[...Array(50)].map((_, i) => (
                    <div key={i} 
                        className="absolute bg-white rounded-full"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 3 + 1}px`,
                            height: `${Math.random() * 3 + 1}px`,
                            opacity: Math.random(),
                            animation: `twinkle ${Math.random() * 2 + 1}s infinite alternate`
                        }}
                    />
                ))}
            </div>
        </div>
      )}

      {/* EXTREME: Red Alert, Aggressive */}
      {rarityId === RarityId.EXTREME && (
        <div className="absolute inset-0">
             <div className="absolute inset-0 bg-red-900/20 animate-pulse-fast" />
             <div className="absolute inset-0 border-[50px] border-red-600/30 blur-xl animate-pulse" />
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-red-900/20 to-black" />
        </div>
      )}

      {/* ABYSSAL: Darkness consuming */}
      {rarityId === RarityId.ABYSSAL && (
        <div className="absolute inset-0 bg-black/90 z-10">
             <div className="absolute bottom-0 w-full h-3/4 bg-gradient-to-t from-slate-950 to-transparent" />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[180%] h-[180%] bg-black opacity-95 rounded-full blur-3xl animate-pulse-slow shadow-inner" />
             </div>
        </div>
      )}

      {/* PRIMORDIAL: Ancient, Lava, Heat */}
      {rarityId === RarityId.PRIMORDIAL && (
        <div className="absolute inset-0 bg-orange-950/40">
            <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-orange-600/40 via-red-600/20 to-transparent" />
            <div className="absolute inset-0 opacity-50 mix-blend-color-dodge">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-orange-500 rounded-full blur-[150px] animate-pulse" />
            </div>
        </div>
      )}

      {/* INFINITE: Rainbow, Holographic */}
      {rarityId === RarityId.INFINITE && (
        <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-green-500/20 to-blue-500/20 animate-gradient-xy" />
            <div className="absolute inset-0 backdrop-blur-[4px]" />
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] opacity-20 animate-[spin_3s_linear_infinite]" />
        </div>
      )}

      {/* CHAOS: Glitchy, Disorder */}
      {rarityId === RarityId.CHAOS && (
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-fuchsia-900/30 mix-blend-difference animate-pulse-fast" />
            <div className="absolute top-0 left-0 w-full h-4 bg-white/70 animate-scan blur-sm" />
            <div className="absolute top-1/2 left-0 w-full h-full bg-gradient-to-b from-transparent via-fuchsia-500/10 to-transparent transform skew-x-12" />
        </div>
      )}

      {/* THE ONE: Pure White Ascension */}
      {rarityId === RarityId.THE_ONE && (
        <div className="absolute inset-0 bg-white z-0 animate-ascension-fade">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-neutral-100 to-neutral-300 opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-full h-[1px] bg-black/20 animate-ping" />
                 <div className="h-full w-[1px] bg-black/20 animate-ping" />
            </div>
        </div>
      )}

      <style>{`
        @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
        }
        @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
            animation: blob 7s infinite;
        }
        .animation-delay-2000 {
            animation-delay: 2s;
        }
        .animate-pulse-slow {
            animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-pulse-fast {
            animation: pulse 0.05s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            50% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
            animation: scan 1.5s linear infinite;
        }
        @keyframes ascension-fade {
            0% { opacity: 0; }
            10% { opacity: 1; }
            100% { opacity: 1; }
        }
        .animate-ascension-fade {
            animation: ascension-fade 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};