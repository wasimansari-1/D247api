import React from 'react';
import { Lock } from 'lucide-react';

export default function TeenPatti20Board({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];

  const paRunners = [
    { key: 'player a', label: 'Player A' },
    { key: '3 baccarat a', label: '3 Baccarat A' },
    { key: 'total a', label: 'Total A' },
    { key: 'pair plus a', label: 'Pair Plus A' }
  ];

  const pbRunners = [
    { key: 'player b', label: 'Player B' },
    { key: '3 baccarat b', label: '3 Baccarat B' },
    { key: 'total b', label: 'Total B' },
    { key: 'pair plus b', label: 'Pair Plus B' }
  ];

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* Main 20-20 Grid (Image 5 Exact Match) */}
      <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg overflow-x-auto">
        <div className="min-w-[650px]">
          {/* Header Row */}
          <div className="grid grid-cols-2 bg-[#0c1b29] border-b border-slate-700 divide-x divide-slate-700">
            <div className="p-2 text-xs font-black text-white px-3">Player A</div>
            <div className="p-2 text-xs font-black text-white px-3">Player B</div>
          </div>

          {/* Subheaders Row */}
          <div className="grid grid-cols-8 bg-[#0c1b29]/80 text-[10px] font-bold text-slate-300 border-b border-slate-700 p-2 text-center">
            {paRunners.map(r => <div key={r.key} className="truncate">{r.label}</div>)}
            {pbRunners.map(r => <div key={r.key} className="truncate">{r.label}</div>)}
          </div>

          {/* Rates Row */}
          <div className="grid grid-cols-8 items-center p-2.5 border-b border-slate-800 text-center gap-1.5">
            {[...paRunners, ...pbRunners].map((item) => {
              const liveR = runners.find(r => (r.name || '').toLowerCase() === item.key);
              return (
                <div key={item.key} className="flex justify-center">
                  {isSuspended || !liveR?.back ? (
                    <div className="w-full py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                      <Lock size={12} className="text-slate-300" />
                    </div>
                  ) : (
                    <button className="w-full py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded shadow">
                      {liveR.back}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Suits Color Bets Row (♣ ♠ vs ♥ ♦) */}
          <div className="grid grid-cols-4 items-center p-2 text-center gap-2 bg-[#0c1b29]/40">
            <div className="flex items-center justify-between p-1.5 bg-[#142333] rounded border border-slate-700/80">
              <span className="text-xs font-black text-slate-300">♣ ♠</span>
              <div className="w-12 py-1 bg-[#2b3543] rounded text-slate-400 flex items-center justify-center">
                <Lock size={11} className="text-slate-300" />
              </div>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-[#142333] rounded border border-slate-700/80">
              <span className="text-xs font-black text-red-500">♥ ♦</span>
              <div className="w-12 py-1 bg-[#2b3543] rounded text-slate-400 flex items-center justify-center">
                <Lock size={11} className="text-slate-300" />
              </div>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-[#142333] rounded border border-slate-700/80">
              <span className="text-xs font-black text-slate-300">♣ ♠</span>
              <div className="w-12 py-1 bg-[#2b3543] rounded text-slate-400 flex items-center justify-center">
                <Lock size={11} className="text-slate-300" />
              </div>
            </div>
            <div className="flex items-center justify-between p-1.5 bg-[#142333] rounded border border-slate-700/80">
              <span className="text-xs font-black text-red-500">♥ ♦</span>
              <div className="w-12 py-1 bg-[#2b3543] rounded text-slate-400 flex items-center justify-center">
                <Lock size={11} className="text-slate-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Accordion Table (Image 5 Exact Match) */}
      <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
        <div className="bg-[#1d4ed8] px-3 py-1.5 text-xs font-black text-white flex justify-between items-center">
          <span>Rules</span>
          <span className="font-mono text-[10px] text-blue-200">Pair Plus</span>
        </div>
        <div className="divide-y divide-slate-800 text-xs">
          {[
            { name: 'Pair', payout: '1 TO 1' },
            { name: 'Flush', payout: '1 TO 4' },
            { name: 'Straight', payout: '1 TO 6' },
            { name: 'Trio', payout: '1 TO 30' },
            { name: 'Straight Flush', payout: '1 TO 40' }
          ].map((rule, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 px-3 hover:bg-slate-800/40 transition">
              <span className="font-bold text-slate-300">{rule.name}</span>
              <span className="font-mono font-black text-yellow-400">{rule.payout}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
