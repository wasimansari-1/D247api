import React from 'react';
import { Lock } from 'lucide-react';

export default function RouletteBoard({ roundData, timer, isSuspended }) {
  const RED_NUMS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  return (
    <div className="flex flex-col gap-3 select-none">
      <div className="flex justify-between items-center text-xs border-b border-slate-700/60 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-amber-400 text-sm">ROULETTE</span>
          <span className="text-[11px] text-slate-400 font-mono">Range: 25 to 100,000</span>
          <span className="text-[11px] text-slate-400 font-mono ml-2">Round ID: #{roundData?.roundId || 'Connecting...'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="px-3 py-1 bg-[#72bbef] text-slate-950 font-black text-xs rounded shadow">Back</button>
          <button className="px-3 py-1 bg-[#faa9ba] text-slate-950 font-black text-xs rounded shadow">Lay</button>
        </div>
      </div>

      {/* Roulette Layout & Chips palette */}
      <div className="flex flex-col lg:flex-row gap-3">
        {/* Roulette Felt Mat */}
        <div className="flex-1 overflow-x-auto bg-[#475569] p-2 rounded-xl shadow-2xl border border-slate-600 relative">
          {/* Suspended Lock Overlay */}
          {isSuspended && (
            <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center text-red-400 font-black text-sm tracking-wider gap-1 border border-red-500/50">
              <Lock size={24} className="text-red-500 animate-pulse" />
              <span>LOCKED / SUSPENDED</span>
            </div>
          )}

          <div className="min-w-[420px]">
            {/* Top Zero Row */}
            <div className="w-full bg-[#15803d] text-white font-mono font-black text-center py-1.5 rounded-t border border-emerald-500 cursor-pointer hover:bg-emerald-600 transition shadow">
              0
            </div>

            {/* Main Numbers & Outer Bets Grid */}
            <div className="grid grid-cols-12 gap-1 my-1">
              {/* Left: 1-18, Even, Red, Black, Odd, 19-36 */}
              <div className="col-span-2 grid grid-rows-6 gap-1 font-bold text-[10px] text-slate-900 text-center">
                <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer p-1">1 - 18</div>
                <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer p-1">Even</div>
                <div className="bg-red-600 text-white hover:bg-red-500 flex items-center justify-center rounded cursor-pointer p-1">Red</div>
                <div className="bg-slate-950 text-white hover:bg-slate-800 flex items-center justify-center rounded cursor-pointer p-1">Black</div>
                <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer p-1">Odd</div>
                <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer p-1">19 - 36</div>
              </div>

              {/* Middle-Left: 1st12, 2nd12, 3rd12 */}
              <div className="col-span-2 grid grid-rows-3 gap-1 font-bold text-[11px] text-slate-900 text-center">
                <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer">1st 12</div>
                <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer">2nd 12</div>
                <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer">3rd 12</div>
              </div>

              {/* Middle: 3 columns x 12 rows matrix */}
              <div className="col-span-8 grid grid-cols-3 gap-1">
                {[
                  [1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12],
                  [13, 14, 15], [16, 17, 18], [19, 20, 21], [22, 23, 24],
                  [25, 26, 27], [28, 29, 30], [31, 32, 33], [34, 35, 36]
                ].flatMap((row) => 
                  row.map(num => {
                    const isRed = RED_NUMS.includes(num);
                    return (
                      <div
                        key={num}
                        className={`py-1 text-center font-mono font-black text-xs rounded text-white cursor-pointer transition shadow-sm hover:scale-105 ${
                          isRed ? 'bg-red-600 hover:bg-red-500' : 'bg-slate-950 hover:bg-slate-800'
                        }`}
                      >
                        {num}
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
                <div className="bg-[#fef3c7] hover:bg-[#fde68a] text-slate-900 font-bold text-center text-xs py-1 rounded cursor-pointer">2to1</div>
                <div className="bg-[#fef3c7] hover:bg-[#fde68a] text-slate-900 font-bold text-center text-xs py-1 rounded cursor-pointer">2to1</div>
                <div className="bg-[#fef3c7] hover:bg-[#fde68a] text-slate-900 font-bold text-center text-xs py-1 rounded cursor-pointer">2to1</div>
              </div>
            </div>
          </div>
        </div>

        {/* Chips Palette on Right */}
        <div className="flex lg:flex-col items-center justify-center gap-2 shrink-0">
          {[25, 50, 100, 200, 500, '1K'].map((chip, cIdx) => {
            const colors = [
              'bg-sky-500 border-sky-300',
              'bg-blue-600 border-blue-400',
              'bg-teal-500 border-teal-300',
              'bg-emerald-600 border-emerald-400',
              'bg-amber-600 border-amber-300',
              'bg-purple-600 border-purple-300'
            ];
            return (
              <div
                key={cIdx}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 text-white font-black text-[10px] sm:text-xs flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition active:scale-95 ${colors[cIdx]}`}
              >
                {chip}
              </div>
            );
          })}
          <button className="px-2 py-1 text-[10px] font-bold bg-red-600 text-white rounded hover:bg-red-500 shadow">Undo</button>
          <button className="px-2 py-1 text-[10px] font-bold bg-sky-600 text-white rounded hover:bg-sky-500 shadow">Repeat</button>
          <button className="px-2 py-1 text-[10px] font-bold bg-amber-500 text-slate-950 rounded hover:bg-amber-400 shadow">Clear</button>
        </div>
      </div>
    </div>
  );
}
