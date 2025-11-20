import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  multiRollLevel: number;
  onBuyUpgrade: (level: number, cost: number) => void;
}

export const Shop: React.FC<Props> = ({ isOpen, onClose, balance, multiRollLevel, onBuyUpgrade }) => {
  if (!isOpen) return null;

  const upgrades = [
    {
      level: 2,
      name: "DOUBLE PROCESSOR",
      desc: "Roll 2 items at once.",
      cost: 1000,
      owned: multiRollLevel >= 2
    },
    {
      level: 3,
      name: "TRIPLE THREADING",
      desc: "Roll 3 items at once.",
      cost: 2000,
      owned: multiRollLevel >= 3
    }
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-white tracking-wider font-mono">UPGRADE STATION</h2>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <span className="block text-xs text-neutral-500 font-mono">BALANCE</span>
                <span className="block text-lg text-yellow-500 font-bold font-mono">{balance.toLocaleString()} PTS</span>
             </div>
             <button onClick={onClose} className="text-neutral-500 hover:text-white font-mono ml-4">[X]</button>
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {upgrades.map((u) => {
            const canAfford = balance >= u.cost;
            const isLocked = u.level > multiRollLevel + 1; // Must buy sequentially

            return (
              <div 
                key={u.level} 
                className={`
                    relative p-6 border rounded-lg flex flex-col justify-between h-48 transition-all
                    ${u.owned 
                        ? 'border-green-900 bg-green-900/10' 
                        : isLocked 
                            ? 'border-neutral-800 bg-neutral-900 opacity-50'
                            : 'border-neutral-600 bg-neutral-800 hover:border-white'
                    }
                `}
              >
                <div>
                    <h3 className={`text-lg font-bold font-mono mb-1 ${u.owned ? 'text-green-400' : 'text-white'}`}>
                        {u.name}
                    </h3>
                    <p className="text-sm text-neutral-400 font-mono">{u.desc}</p>
                </div>

                <div className="mt-4">
                    {u.owned ? (
                        <div className="w-full py-2 bg-green-900/20 text-green-500 border border-green-800 text-center font-mono text-sm font-bold">
                            INSTALLED
                        </div>
                    ) : (
                        <button
                            onClick={() => onBuyUpgrade(u.level, u.cost)}
                            disabled={!canAfford || isLocked}
                            className={`
                                w-full py-2 font-mono text-sm font-bold border transition-all
                                ${canAfford && !isLocked
                                    ? 'bg-white text-black hover:bg-neutral-200 border-white'
                                    : 'bg-transparent text-neutral-600 border-neutral-700 cursor-not-allowed'
                                }
                            `}
                        >
                            {isLocked ? "LOCKED" : `BUY [${u.cost} PTS]`}
                        </button>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};