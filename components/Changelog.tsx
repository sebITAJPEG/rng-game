
import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const Changelog: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const updates = [
    {
      version: "2.3.0",
      date: "Current",
      changes: [
        "MASSIVE CONTENT EXPANSION: Added 50 new Ores, 50 new Fish, and 100 new Plants.",
        "ITEM OVERHAUL: Added 300+ new discoverable items across all rarity tiers.",
        "BIZARRE DISCOVERIES: Encounter strange, abstract, and meta-physical objects.",
        "BALANCING: Adjusted drop tables to accommodate new discoveries."
      ]
    },
    {
      version: "2.2.0",
      date: "Previous",
      changes: [
        "NEW FEATURE: Customizable Themes - Switch between 4 visual styles (Default, Matrix, Cyberpunk, Paper).",
        "THEMES: Access theme switcher in Admin Panel to change the entire UI color scheme.",
        "PERSISTENCE: Your theme choice is saved and remembered across sessions.",
        "ITEM LOCKING: Lock items in your inventory to prevent accidental selling or deletion."
      ]
    },
    {
      version: "2.1.0",
      date: "Previous",
      changes: [
        "ECONOMY UPDATE: You can now SELL mined ores in the Ore Silo to earn Balance.",
        "NEW UPGRADES: Added Global Luck, Mining Speed, Mining Luck, and Multi-Mining upgrades to the Shop.",
        "VISUALS: Added floating text feedback and particle effects when mining manually.",
        "LORE: Added unique descriptions to all 100 ore types.",
        "UI: Improved shop layout to accommodate new modules."
      ]
    },
    {
      version: "2.0.0",
      date: "Previous",
      changes: [
        "SYSTEM UPGRADE: Shop is now open! Buy faster speeds and larger multi-roll batches.",
        "PITY SYSTEM: Added 'Entropy' bar. Filling it guarantees a massive luck boost.",
        "BURST MODE: Unlockable module to simulate 50 rolls instantly.",
        "CONTENT EXPANSION: Added 150+ new items across all rarity tiers.",
        "UI: Visuals now support displaying 10+ items at once without hiding them."
      ]
    },
    {
      version: "1.6.1",
      date: "Legacy",
      changes: [
        "INVENTORY OVERHAUL: Added a dedicated storage section for every Variant type.",
        "Added Sidebar Navigation to the Inventory for filtering by Normal, Gilded, Holographic, etc.",
        "Inventory layout is now wider and uses a grid system for better visibility.",
      ]
    },
    {
      version: "1.6.0",
      date: "Legacy",
      changes: [
        "ADDED VARIANT SYSTEM: Items of Epic rarity and above can now roll with 10 unique variants (e.g., Gilded, Volcanic, Quantum).",
        "ADDED RARITY MULTIPLIERS: Variants multiply the base rarity of an item (up to x10,000 for 'Pure').",
        "VISUAL OVERHAUL: Variants have unique text effects, glows, and borders in the main view and inventory.",
        "Inventory sorting now prioritizes variants."
      ]
    },
    {
      version: "1.5.0",
      date: "Legacy",
      changes: [
        "Added Index Catalog: View all discoverable items.",
        "Added Item Visualizer: 3D Holographic card view for items.",
        "Replay Cutscenes: You can now replay cutscenes from the Visualizer.",
        "Audio Overhaul: Added cinematic procedural audio engines for cutscenes."
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
