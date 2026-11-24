import React from 'react';
import { Lock } from 'lucide-react';

export default function DragonTigerBoard({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];

  const getRunner = (keyword) => {
    const kLow = keyword.toLowerCase();
    return runners.find(r => (r.name || '').toLowerCase() === kLow || (r.name || '').toLowerCase().includes(kLow));
  };

  const dragon = getRunner('dragon') || { back: '1.98' };
  const tiger = getRunner('tiger') || { back: '1.98' };
  const tie = getRunner('tie') || { back: '10' };

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* Main 3 Bets: Dragon | Tie | Tiger */}
      <div className="grid grid-cols-3 gap-2">
        {/* Dragon */}
        <div className="p-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-lg flex flex-col items-center justify-center cursor-pointer shadow-lg transition active:scale-95">
          <span className="text-xs text-rose-200 font-bold">{dragon.back || '1.98'}</span>
          <span className="text-sm sm:text-base font-black">Dragon</span>
        </div>

        {/* Tie */}
        <div className="p-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-lg flex flex-col items-center justify-center cursor-pointer shadow-lg transition active:scale-95">
          <span className="text-xs text-emerald-200 font-bold">{tie.back || '10'}</span>
          <span className="text-sm sm:text-base font-black">Tie</span>
        </div>

        {/* Tiger */}
        <div className="p-3 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white rounded-lg flex flex-col items-center justify-center cursor-pointer shadow-lg transition active:scale-95">
          <span className="text-xs text-amber-200 font-bold">{tiger.back || '1.98'}</span>
          <span className="text-sm sm:text-base font-black">Tiger</span>
        </div>
      </div>

      {/* Side Bets Matrix for Dragon & Tiger */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Dragon Side Bets */}
        <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
          <div className="bg-[#0c1b29] px-3 py-1.5 border-b border-slate-700 text-xs font-black text-rose-400">
            Dragon Side Bets
          </div>
          <div className="grid grid-cols-4 gap-1 p-2">
            {[
              { label: 'Even', rate: '2.1' },
              { label: 'Odd', rate: '1.79' },
              { label: '♥ ♦', rate: '1.95', color: 'text-red-400' },
              { label: '♠ ♣', rate: '1.95', color: 'text-slate-200' },
            ].map((b, idx) => (
              <div key={idx} className="bg-[#1e293b] p-2 rounded text-center cursor-pointer hover:bg-[#2b394f] transition">
                <span className="text-[10px] text-slate-400 block font-bold">{b.label}</span>
                <span className={`text-xs font-black ${b.color || 'text-white'}`}>{b.rate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tiger Side Bets */}
        <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
          <div className="bg-[#0c1b29] px-3 py-1.5 border-b border-slate-700 text-xs font-black text-amber-400">
            Tiger Side Bets
          </div>
          <div className="grid grid-cols-4 gap-1 p-2">
            {[
              { label: 'Even', rate: '2.1' },
              { label: 'Odd', rate: '1.79' },
              { label: '♥ ♦', rate: '1.95', color: 'text-red-400' },
              { label: '♠ ♣', rate: '1.95', color: 'text-slate-200' },
            ].map((b, idx) => (
              <div key={idx} className="bg-[#1e293b] p-2 rounded text-center cursor-pointer hover:bg-[#2b394f] transition">
                <span className="text-[10px] text-slate-400 block font-bold">{b.label}</span>
                <span className={`text-xs font-black ${b.color || 'text-white'}`}>{b.rate}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
