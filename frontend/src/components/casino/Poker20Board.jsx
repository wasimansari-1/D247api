import React from 'react';
import { Lock } from 'lucide-react';

export default function Poker20Board({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];

  const pokerHands = [
    { key: 'Winner', label: 'Winner' },
    { key: 'One Pair', label: 'One Pair' },
    { key: 'Two Pair', label: 'Two Pair' },
    { key: 'Three of a Kind', label: 'Three of a Kind' },
    { key: 'Straight', label: 'Straight' },
    { key: 'Flush', label: 'Flush' },
    { key: 'Full House', label: 'Full House' },
    { key: 'Four of a Kind', label: 'Four of a Kind' },
    { key: 'Straight Flush', label: 'Straight Flush' }
  ];

  const getRunner = (side, handKey) => {
    const sLow = side.toLowerCase();
    const hLow = handKey.toLowerCase();
    return runners.find(r => {
      const n = (r.name || '').toLowerCase();
      return (n.includes(sLow) || !n.includes('player')) && n.includes(hLow);
    });
  };

  return (
    <div className="flex flex-col gap-3 select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Player A Box: 3x3 Grid (Image 4 Exact Match) */}
        <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
          <div className="bg-[#0c1b29] px-3 py-2 border-b border-slate-700 text-xs font-black text-amber-400 uppercase tracking-wide">
            Player A
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-2 bg-[#081522]">
            {pokerHands.map((hand, idx) => {
              const r = getRunner('a', hand.key);
              const rate = r?.back > 0 ? r.back : null;
              return (
                <div
                  key={idx}
                  className="py-2 px-1 bg-[#1e293b] hover:bg-[#2b394f] rounded border border-slate-700/80 flex flex-col items-center justify-center text-center shadow transition active:scale-95 cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-slate-300 truncate w-full mb-1">
                    {hand.label}
                  </span>
                  {isSuspended || !rate ? (
                    <Lock size={12} className="text-slate-400" />
                  ) : (
                    <span className="text-xs font-black text-sky-300">{rate}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Player B Box: 3x3 Grid (Image 4 Exact Match) */}
        <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
          <div className="bg-[#0c1b29] px-3 py-2 border-b border-slate-700 text-xs font-black text-sky-400 uppercase tracking-wide">
            Player B
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-2 bg-[#081522]">
            {pokerHands.map((hand, idx) => {
              const r = getRunner('b', hand.key);
              const rate = r?.back > 0 ? r.back : null;
              return (
                <div
                  key={idx}
                  className="py-2 px-1 bg-[#1e293b] hover:bg-[#2b394f] rounded border border-slate-700/80 flex flex-col items-center justify-center text-center shadow transition active:scale-95 cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-slate-300 truncate w-full mb-1">
                    {hand.label}
                  </span>
                  {isSuspended || !rate ? (
                    <Lock size={12} className="text-slate-400" />
                  ) : (
                    <span className="text-xs font-black text-sky-300">{rate}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
