import React from 'react';
import { Lock } from 'lucide-react';

export default function UnlimitedJokerBoard({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];
  const playerA = runners.find(r => (r.name || '').toLowerCase() === 'player a') || {
    name: 'Player A',
    back: 1.98,
    lay: 0,
    min: 100,
    max: 500000
  };
  const playerB = runners.find(r => (r.name || '').toLowerCase() === 'player b') || {
    name: 'Player B',
    back: 1.98,
    lay: 0,
    min: 100,
    max: 500000
  };

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* Select your Joker strip (Image 2 & 4 Exact Match) */}
      <div className="bg-[#112435] rounded-lg border border-slate-700 p-2.5 flex flex-col sm:flex-row items-center gap-2.5 shadow-lg">
        <div className="px-3 py-1.5 bg-sky-600 text-white font-black text-xs rounded shrink-0 shadow">
          Select your Joker
        </div>
        <div className="grid grid-cols-13 gap-1 w-full overflow-x-auto scrollbar-none">
          {['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].map((r) => (
            <div
              key={r}
              className="py-1 px-1 bg-white hover:bg-slate-100 rounded border border-slate-300 text-slate-900 flex flex-col items-center justify-center cursor-pointer shadow-sm min-w-[24px] hover:scale-105 transition"
            >
              <span className="text-[11px] font-black">{r}</span>
              <div className="flex gap-0.5 text-[6px] text-slate-600 leading-none">
                <span className="text-black">♠</span>
                <span className="text-red-600">♥</span>
                <span className="text-red-600">♦</span>
                <span className="text-black">♣</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Player A & Player B Back/Lay */}
      <div className="bg-[#112435] rounded-lg border border-slate-700 p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 shadow-lg">
        {[playerA, playerB].map((runner, pIdx) => (
          <div key={pIdx} className="flex items-center justify-between bg-[#0c1b29] p-2.5 rounded-lg border border-slate-700/80">
            <span className="font-black text-sm text-white">{runner.name}</span>
            <div className="flex items-center gap-2">
              {isSuspended ? (
                <div className="w-16 py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                  <Lock size={14} className="text-slate-300" />
                </div>
              ) : (
                <button className="w-16 py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded transition shadow">
                  {runner.back || '1.98'}
                </button>
              )}
              {isSuspended ? (
                <div className="w-16 py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                  <Lock size={14} className="text-slate-300" />
                </div>
              ) : (
                <button className="w-16 py-1.5 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-xs rounded transition shadow">
                  {runner.lay || '-'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
