import React from 'react';

interface Props {
    wins: number;
}

export const TrophySystem: React.FC<Props> = ({ wins }) => {

    // Determina il colore, lo stile e il bonus del trofeo
    const getTrophyStyle = (count: number) => {
        if (count >= 500) return { color: "text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-green-500 to-blue-500 animate-pulse", label: "RAINBOW", bonus: "3.00x", shadow: "drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" };
        if (count >= 300) return { color: "text-red-600", label: "RUBINO", bonus: "2.75x", shadow: "drop-shadow-[0_0_10px_rgba(220,38,38,0.6)]" };
        if (count >= 200) return { color: "text-emerald-500", label: "SMERALDO", bonus: "2.50x", shadow: "drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]" };
        if (count >= 100) return { color: "text-cyan-300", label: "DIAMANTE", bonus: "2.25x", shadow: "drop-shadow-[0_0_10px_rgba(103,232,249,0.6)]" };
        if (count >= 50) return { color: "text-slate-300", label: "PLATINO", bonus: "2.00x", shadow: "drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]" };
        if (count >= 30) return { color: "text-yellow-400", label: "ORO", bonus: "1.75x", shadow: "drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" };
        if (count >= 15) return { color: "text-gray-400", label: "ARGENTO", bonus: "1.50x", shadow: "drop-shadow-[0_0_0_transparent]" };
        if (count >= 5) return { color: "text-orange-700", label: "BRONZO", bonus: "1.25x", shadow: "drop-shadow-[0_0_0_transparent]" };

        return { color: "text-neutral-800", label: "LOCKED", bonus: "1.0x", shadow: "" };
    };

    const style = getTrophyStyle(wins);
    const isLocked = wins < 5;
    const hasBonus = !isLocked;

    return (
        <div className="flex items-center gap-2 bg-black/40 p-2 rounded border border-white/5 ml-2 relative">
            <div className={`relative ${style.shadow}`}>
                {/* Icona Trofeo SVG */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill={isLocked ? "none" : "currentColor"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`${style.color} transition-colors duration-500`}
                >
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                    <path d="M4 22h16" />
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
            </div>

            <div className="flex flex-col">
                <span className="text-[9px] font-mono text-neutral-500 leading-none">VITTORIE</span>
                <span className={`text-xs font-bold font-mono leading-none ${isLocked ? 'text-neutral-600' : 'text-white'}`}>
                    {wins} <span className="text-[8px] opacity-50">({style.label})</span>
                </span>
                {/* Bonus visualizzato sotto le vittorie */}
                {hasBonus && (
                    <span className="text-[8px] font-mono text-yellow-500 mt-0.5 animate-pulse">
                        BONUS: {style.bonus}
                    </span>
                )}
            </div>
        </div>
    );
};