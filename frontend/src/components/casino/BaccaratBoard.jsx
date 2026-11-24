import React from 'react';
import { Lock } from 'lucide-react';

export default function BaccaratBoard({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];

  const getRunner = (keyword) => {
    const kLow = keyword.toLowerCase();
    return runners.find(r => (r.name || '').toLowerCase() === kLow || (r.name || '').toLowerCase().includes(kLow));
  };

  const playerRunner = getRunner('player') && !getRunner('player')?.name.toLowerCase().includes('pair') ? getRunner('player') : { back: 1, max: '500,000' };
  const bankerRunner = getRunner('banker') && !getRunner('banker')?.name.toLowerCase().includes('pair') ? getRunner('banker') : { back: 1, max: '500,000' };
  const tieRunner = getRunner('tie') || { back: 8, max: '450,000' };
  const playerPairRunner = runners.find(r => (r.name || '').toLowerCase().includes('player pair')) || { back: 11, max: '450,000' };
  const bankerPairRunner = runners.find(r => (r.name || '').toLowerCase().includes('banker pair')) || { back: 11, max: '450,000' };

  const perfectPairRunner = getRunner('perfect pair') || { back: 25 };
  const bigRunner = getRunner('big') || { back: 0.54 };
  const smallRunner = getRunner('small') || { back: 1.5 };
  const eitherPairRunner = getRunner('either pair') || { back: 5 };

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* Top Section: Statistics Donut on Left & 4 Side-Bet Boxes on Right */}
      <div className="grid grid-cols-12 gap-3">
        {/* Left: Statistics Donut Chart (Image 1 Exact Match) */}
        <div className="col-span-12 sm:col-span-5 bg-[#112435] p-3 rounded-lg border border-slate-700 shadow-lg flex items-center justify-around gap-2">
          {/* Donut Chart SVG */}
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              {/* Background circle */}
              <circle cx="18" cy="18" r="14" fill="none" stroke="#1e293b" strokeWidth="6" />
              {/* Player 63% (Blue) */}
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#2563eb"
                strokeWidth="6"
                strokeDasharray="55 100"
                strokeDashoffset="0"
              />
              {/* Banker 33% (Red) */}
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#dc2626"
                strokeWidth="6"
                strokeDasharray="29 100"
                strokeDashoffset="-55"
              />
              {/* Tie 4% (Green) */}
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#16a34a"
                strokeWidth="6"
                strokeDasharray="4 100"
                strokeDashoffset="-84"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[9px] font-black text-slate-300">
              <span>STAT</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-1 text-[11px] font-bold">
            <div className="text-xs font-black text-slate-300 uppercase tracking-wider mb-0.5">
              Statistics
            </div>
            <div className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>Player 63%</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span>Banker 33%</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>Tie 4%</span>
            </div>
          </div>
        </div>

        {/* Right: 4 Side-Bet Boxes (Image 1 Exact Match) */}
        <div className="col-span-12 sm:col-span-7 grid grid-cols-4 gap-1.5">
          {[
            { label: 'Perfect Pair', rate: '25:1', r: perfectPairRunner },
            { label: 'Big', rate: '0.54:1', r: bigRunner },
            { label: 'Small', rate: '1.5:1', r: smallRunner },
            { label: 'Either Pair', rate: '5:1', r: eitherPairRunner },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-[#112435] hover:bg-[#1a334d] rounded-lg border border-slate-700 p-2 flex flex-col items-center justify-center text-center cursor-pointer transition shadow active:scale-95"
            >
              <span className="text-[10px] font-bold text-slate-300 truncate w-full mb-0.5">
                {item.label}
              </span>
              <span className="text-xs font-black text-amber-300 font-mono">
                {item.rate}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Main Betting Row: Player Pair | Player | Tie | Banker | Banker Pair */}
      <div className="grid grid-cols-5 gap-1 shadow-2xl rounded-lg overflow-hidden border border-slate-700">
        {/* Player Pair (11:1) */}
        <div className="bg-[#1e40af] hover:bg-[#1d4ed8] p-3 text-white flex flex-col items-center justify-center cursor-pointer transition active:scale-95 text-center">
          <span className="text-xs sm:text-sm font-black leading-tight">Player Pair</span>
          <span className="text-[11px] text-blue-200 font-bold mt-0.5">11:1</span>
        </div>

        {/* Player (1:1) with card icons */}
        <div className="bg-[#2563eb] hover:bg-[#1d4ed8] p-3 text-white flex flex-col items-center justify-center cursor-pointer transition active:scale-95 text-center border-l border-blue-400/30">
          <span className="text-sm sm:text-base font-black leading-tight">Player</span>
          <span className="text-xs text-blue-100 font-bold">1:1</span>
          <div className="flex gap-1 mt-1 opacity-80">
            <div className="w-3.5 h-4.5 border border-white rounded-[1px] bg-white/20"></div>
            <div className="w-3.5 h-4.5 border border-white rounded-[1px] bg-white/20"></div>
          </div>
        </div>

        {/* Tie (8:1) */}
        <div className="bg-[#16a34a] hover:bg-[#15803d] p-3 text-white flex flex-col items-center justify-center cursor-pointer transition active:scale-95 text-center border-x border-emerald-400/30">
          <span className="text-sm sm:text-base font-black leading-tight">Tie</span>
          <span className="text-xs text-emerald-100 font-bold">8:1</span>
        </div>

        {/* Banker (1:1) with card icons */}
        <div className="bg-[#dc2626] hover:bg-[#b91c1c] p-3 text-white flex flex-col items-center justify-center cursor-pointer transition active:scale-95 text-center border-r border-red-400/30">
          <span className="text-sm sm:text-base font-black leading-tight">Banker</span>
          <span className="text-xs text-red-100 font-bold">1:1</span>
          <div className="flex gap-1 mt-1 opacity-80">
            <div className="w-3.5 h-4.5 border border-white rounded-[1px] bg-white/20"></div>
            <div className="w-3.5 h-4.5 border border-white rounded-[1px] bg-white/20"></div>
          </div>
        </div>

        {/* Banker Pair (11:1) */}
        <div className="bg-[#991b1b] hover:bg-[#7f1d1d] p-3 text-white flex flex-col items-center justify-center cursor-pointer transition active:scale-95 text-center">
          <span className="text-xs sm:text-sm font-black leading-tight">Banker Pair</span>
          <span className="text-[11px] text-red-200 font-bold mt-0.5">11:1</span>
        </div>
      </div>
    </div>
  );
}
