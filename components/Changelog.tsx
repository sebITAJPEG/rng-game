import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const Changelog: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const updates = [
    {
      version: "1.3.0",
      date: "Current",
      changes: [
        "Added Shop System: Buy Multi-Roll upgrades.",
        "Added Changelog.",
        "Fixed Luck Slider (Logarithmic Scale).",
        "Revamped Cutscenes: Unique animations for Primordial, Infinite, Chaos, and The One.",
        "Added Item Inspection from Inventory."
      ]
    },
    {
      version: "1.2.0",
      date: "Previous",
      changes: [
        "Added Inventory System.",
        "Added Localization (EN/IT).",
        "Implemented LocalStorage persistence.",
        "Added 'God Mode' presets."
      ]
    },
    {
      version: "1.0.0",
      date: "Initial",
      changes: [
        "Core RNG Engine.",
        "Basic Rarity Tiers.",
        "Visual Effects."
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center p-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-white tracking-wider font-mono">SYSTEM LOGS</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white font-mono">[X]</button>
        </div>
        
        <div className="overflow-y-auto p-6 space-y-8">
          {updates.map((update, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-lg text-green-400 font-bold font-mono">v{update.version}</span>
                <span className="text-xs text-neutral-500 font-mono">{update.date}</span>
              </div>
              <ul className="space-y-1">
                {update.changes.map((change, cIdx) => (
                  <li key={cIdx} className="text-sm text-neutral-300 flex items-start gap-2 font-mono">
                    <span className="text-neutral-600 text-[10px] mt-1">{'>'}</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};