import React from 'react';
import { Lock } from 'lucide-react';

export default function TeenPattiOpenBoard({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];

  const players = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="flex flex-col gap-3 select-none">
      <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
        {/* Table Header: Player | Odds | Pair Plus | Total */}
        <div className="grid grid-cols-4 bg-[#0c1b29] text-xs font-black text-slate-300 border-b border-slate-700 py-2.5 px-3 text-center">
          <div className="text-left text-slate-400 font-bold uppercase text-[11px]">Player</div>
          <div className="text-sky-400">Odds</div>
          <div className="text-amber-400">Pair Plus</div>
          <div className="text-emerald-400">Total</div>
        </div>

        {/* 8 Player Rows */}
        <div className="flex flex-col divide-y divide-slate-800">
          {players.map((num) => {
            const playerRunner = runners.find(r => (r.name || '').toLowerCase() === `player ${num}` || (r.name || '').toLowerCase() === `player${num}`);
            const pairRunner = runners.find(r => (r.name || '').toLowerCase().includes(`pair plus ${num}`) || (r.name || '').toLowerCase().includes(`pair ${num}`));
            const totalRunner = runners.find(r => (r.name || '').toLowerCase().includes(`total ${num}`) || (r.name || '').toLowerCase().includes(`total${num}`));

            const oddsRate = playerRunner?.back > 0 ? playerRunner.back : '1.98';
            const pairRate = pairRunner?.back > 0 ? pairRunner.back : `Pair Plus ${num}`;
            const totalRate = totalRunner?.back > 0 ? totalRunner.back : '1.98';

            return (
              <div key={num} className="grid grid-cols-4 items-center p-2 px-3 hover:bg-slate-800/40 transition text-center">
                <div className="text-left font-black text-xs text-white">
                  Player {num}
                </div>

                <div className="px-1">
                  {isSuspended ? (
                    <div className="py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                      <Lock size={12} className="text-slate-300" />
                    </div>
                  ) : (
                    <button className="w-full py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded transition shadow active:scale-95">
                      {oddsRate}
                    </button>
                  )}
                </div>

                <div className="px-1">
                  {isSuspended ? (
                    <div className="py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                      <Lock size={12} className="text-slate-300" />
                    </div>
                  ) : (
                    <button className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-600 font-bold text-xs rounded transition shadow active:scale-95 truncate">
                      {pairRate}
                    </button>
                  )}
                </div>

                <div className="px-1">
                  {isSuspended ? (
                    <div className="py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                      <Lock size={12} className="text-slate-300" />
                    </div>
                  ) : (
                    <button className="w-full py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded transition shadow active:scale-95">
                      {totalRate}
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
}
