import React from 'react';
import { Lock } from 'lucide-react';

export default function TeenPatti1DayBoard({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];

  const playerA = runners.find(r => (r.name || '').toLowerCase() === 'player a') || {
    name: 'Player A',
    back: 1.64,
    lay: 1.68
  };
  const playerB = runners.find(r => (r.name || '').toLowerCase() === 'player b') || {
    name: 'Player B',
    back: 0,
    lay: 0
  };

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* 1. Main Bets: Player A vs Player B (Image 3 Exact Match) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Player A */}
        <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
          <div className="bg-[#0c1b29] px-3 py-1.5 border-b border-slate-700 flex justify-between items-center text-xs">
            <span className="font-extrabold text-white">Player A</span>
            <div className="flex gap-2 text-[10px] font-bold text-slate-300">
              <span className="w-16 text-center bg-[#72bbef]/20 text-[#72bbef] py-0.5 rounded">Back</span>
              <span className="w-16 text-center bg-[#faa9ba]/20 text-[#faa9ba] py-0.5 rounded">Lay</span>
            </div>
          </div>
          <div className="divide-y divide-slate-800">
            <div className="p-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Main</span>
              <div className="flex gap-2">
                <button className="w-16 py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded shadow">
                  {playerA.back > 0 ? playerA.back : '1.64'}
                </button>
                <button className="w-16 py-1.5 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-xs rounded shadow">
                  {playerA.lay > 0 ? playerA.lay : '1.68'}
                </button>
              </div>
            </div>
            <div className="p-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Consecutive</span>
              <div className="flex gap-2">
                <div className="w-16 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                  <Lock size={12} className="text-slate-300" />
                </div>
                <div className="w-16 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                  <Lock size={12} className="text-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Player B */}
        <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
          <div className="bg-[#0c1b29] px-3 py-1.5 border-b border-slate-700 flex justify-between items-center text-xs">
            <span className="font-extrabold text-white">Player B</span>
            <div className="flex gap-2 text-[10px] font-bold text-slate-300">
              <span className="w-16 text-center bg-[#72bbef]/20 text-[#72bbef] py-0.5 rounded">Back</span>
              <span className="w-16 text-center bg-[#faa9ba]/20 text-[#faa9ba] py-0.5 rounded">Lay</span>
            </div>
          </div>
          <div className="divide-y divide-slate-800">
            <div className="p-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Main</span>
              <div className="flex gap-2">
                <div className="w-16 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                  {playerB.back > 0 ? <span className="font-black text-sky-300 text-xs">{playerB.back}</span> : <Lock size={12} className="text-slate-300" />}
                </div>
                <div className="w-16 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                  {playerB.lay > 0 ? <span className="font-black text-rose-300 text-xs">{playerB.lay}</span> : <Lock size={12} className="text-slate-300" />}
                </div>
              </div>
            </div>
            <div className="p-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Consecutive</span>
              <div className="flex gap-2">
                <div className="w-16 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                  <Lock size={12} className="text-slate-300" />
                </div>
                <div className="w-16 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                  <Lock size={12} className="text-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Card 1..6 Odd / Even Grid (Image 3 Exact Match) */}
      <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg overflow-x-auto">
        <div className="min-w-[500px]">
          <div className="grid grid-cols-7 bg-[#0c1b29] text-[10px] font-bold text-slate-400 border-b border-slate-700 p-2 text-center">
            <div></div>
            {['Card 1', 'Card 2', 'Card 3', 'Card 4', 'Card 5', 'Card 6'].map((c, i) => (
              <div key={i} className="font-black text-slate-300">{c}</div>
            ))}
          </div>

          {/* Odd Row */}
          <div className="grid grid-cols-7 items-center p-2 border-b border-slate-800 text-center gap-1.5">
            <div className="text-left text-xs font-bold text-amber-300 px-2">Odd</div>
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="flex justify-center">
                {idx === 3 ? (
                  <button className="w-full py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded shadow">
                    1.86
                  </button>
                ) : (
                  <div className="w-full py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                    <Lock size={11} className="text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Even Row */}
          <div className="grid grid-cols-7 items-center p-2 text-center gap-1.5">
            <div className="text-left text-xs font-bold text-amber-300 px-2">Even</div>
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="flex justify-center">
                {idx === 3 ? (
                  <button className="w-full py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded shadow">
                    2.1
                  </button>
                ) : (
                  <div className="w-full py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                    <Lock size={11} className="text-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
