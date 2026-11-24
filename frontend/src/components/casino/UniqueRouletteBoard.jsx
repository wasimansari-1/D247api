import React from 'react';
import { Lock } from 'lucide-react';

export default function UniqueRouletteBoard({ roundData, timer, isSuspended, recentResults }) {
  const RED_NUMS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  // In Diamond Unique Roulette (Image 4): column 3 (3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36) has locked cells, and 19, 23, 26, 28, 32 are locked
  const LOCKED_CELLS = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 19, 23, 26, 28, 32];

  return (
    <div className="flex flex-col gap-3 select-none">
      <div className="flex justify-between items-center text-xs border-b border-slate-700/60 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-amber-400 text-sm">UNIQUE ROULETTE</span>
          <span className="text-[11px] text-slate-400 font-mono">Range: 25 to 1L</span>
          <span className="text-[11px] text-slate-400 font-mono ml-2">Round ID: #{roundData?.roundId || 'Connecting...'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="px-3 py-1 bg-[#72bbef] text-slate-950 font-black text-xs rounded shadow">Back</button>
          <button className="px-3 py-1 bg-[#faa9ba] text-slate-950 font-black text-xs rounded shadow">Lay</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        {/* Felt Mat (Image 4 Exact Match) */}
        <div className="flex-1 overflow-x-auto bg-[#475569] p-2 rounded-xl shadow-2xl border border-slate-600 relative">
          {isSuspended && (
            <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center text-red-400 font-black text-sm tracking-wider gap-1 border border-red-500/50">
              <Lock size={24} className="text-red-500 animate-pulse" />
              <span>LOCKED / SUSPENDED</span>
            </div>
          )}

          <div className="min-w-[420px]">
            {/* Top Zero Row */}
            <div className="w-full bg-[#15803d] text-white font-mono font-black text-center py-1.5 rounded-t border border-emerald-500 cursor-pointer shadow">
              0
            </div>

            {/* Grid */}
            <div className="grid grid-cols-12 gap-1 my-1">
              {/* Left Column 1: 1-18, Even, Red, Black, Odd, 19-36 */}
              <div className="col-span-2 grid grid-rows-6 gap-1 font-bold text-[10px] text-slate-900 text-center">
                <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer p-1">1 - 18</div>
                <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer p-1">Even</div>
                <div className="bg-red-600 text-white flex items-center justify-center rounded cursor-pointer p-1">Red</div>
                <div className="bg-slate-950 text-white flex items-center justify-center rounded cursor-pointer p-1">Black</div>
                <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer p-1">Odd</div>
                <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer p-1">19 - 36</div>
              </div>

              {/* Column 2: 1st12, 2nd12, 3rd12 */}
              <div className="col-span-2 grid grid-rows-3 gap-1 font-bold text-[11px] text-slate-900 text-center">
                <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer">1st 12</div>
                <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer">2nd 12</div>
                <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer">3rd 12</div>
              </div>

              {/* Numbers 1..36 with authentic lock state on Unique Roulette */}
              <div className="col-span-8 grid grid-cols-3 gap-1">
                {[
                  [1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12],
                  [13, 14, 15], [16, 17, 18], [19, 20, 21], [22, 23, 24],
                  [25, 26, 27], [28, 29, 30], [31, 32, 33], [34, 35, 36]
                ].flatMap((row) => 
                  row.map(num => {
                    const isRed = RED_NUMS.includes(num);
                    const isCellLocked = LOCKED_CELLS.includes(num);
                    return (
                      <div
                        key={num}
                        className={`py-1 text-center font-mono font-black text-xs rounded transition shadow-sm flex items-center justify-center ${
                          isCellLocked
                            ? 'bg-[#cbd5e1] text-slate-800 border border-slate-400'
                            : isRed
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-950 text-white'
                        }`}
                      >
                        {isCellLocked ? <Lock size={10} className="text-slate-800" /> : num}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom 2to1 Row */}
            <div className="grid grid-cols-12 gap-1">
              <div className="col-span-4"></div>
              <div className="col-span-8 grid grid-cols-3 gap-1">
                <div className="bg-[#fef3c7] text-slate-900 font-bold text-center text-xs py-1 rounded">2to1</div>
                <div className="bg-[#fef3c7] text-slate-900 font-bold text-center text-xs py-1 rounded">2to1</div>
                <div className="bg-[#fef3c7] text-slate-900 font-bold text-center text-xs py-1 rounded">2to1</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Palette & Unique Payouts (Image 4 Exact Match) */}
        <div className="flex flex-col justify-between shrink-0 gap-2">
          {/* Chip palette */}
          <div className="flex lg:flex-col items-center justify-center gap-1.5">
            {[25, 50, 100, 200, 500, '1K'].map((chip, cIdx) => (
              <div
                key={cIdx}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-cyan-700 border-2 border-cyan-400 text-white font-bold text-[10px] flex items-center justify-center cursor-pointer shadow hover:scale-105 active:scale-95"
              >
                {chip}
              </div>
            ))}
            <button className="px-2 py-0.5 text-[9px] font-bold bg-red-600 text-white rounded">Undo</button>
            <button className="px-2 py-0.5 text-[9px] font-bold bg-sky-600 text-white rounded">Repeat</button>
            <button className="px-2 py-0.5 text-[9px] font-bold bg-amber-500 text-slate-950 rounded">Clear</button>
          </div>

          {/* Unique Roulette Odds Table (Single 28 | Split 14.1 | Street 9.4 | Corner 7.05) */}
          <div className="bg-[#0f1d2a] p-2 rounded-lg border border-slate-700 text-[10px] font-mono text-center shadow">
            <div className="grid grid-cols-4 gap-1 text-slate-400 font-bold border-b border-slate-800 pb-1">
              <div>Single</div>
              <div>Split</div>
              <div>Street</div>
              <div>Corner</div>
            </div>
            <div className="grid grid-cols-4 gap-1 text-yellow-400 font-black pt-1">
              <div>28</div>
              <div>14.1</div>
              <div>9.4</div>
              <div>7.05</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
