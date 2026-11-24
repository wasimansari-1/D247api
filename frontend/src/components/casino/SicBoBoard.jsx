import React from 'react';
import { Lock } from 'lucide-react';

export default function SicBoBoard({ roundData, timer, isSuspended }) {
  const diceIcons = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  const totals = [
    { num: 4, odds: '50:1' },
    { num: 5, odds: '20:1' },
    { num: 6, odds: '15:1' },
    { num: 7, odds: '12:1' },
    { num: 8, odds: '8:1' },
    { num: 9, odds: '6:1' },
    { num: 10, odds: '6:1' },
    { num: 11, odds: '6:1' },
    { num: 12, odds: '6:1' },
    { num: 13, odds: '8:1' },
    { num: 14, odds: '12:1' },
    { num: 15, odds: '15:1' },
    { num: 16, odds: '20:1' },
    { num: 17, odds: '50:1' },
  ];

  const twoDicePairs = [
    [1, 2], [1, 3], [1, 4], [1, 5], [1, 6],
    [2, 3], [2, 4], [2, 5], [2, 6],
    [3, 4], [3, 5], [3, 6],
    [4, 5], [4, 6],
    [5, 6]
  ];

  return (
    <div className="flex flex-col gap-2 select-none">
      <div className="bg-[#4a5568] p-2.5 rounded-xl border border-slate-600 shadow-2xl relative overflow-x-auto">
        {/* Suspended Lock Overlay */}
        {isSuspended && (
          <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center text-red-400 font-black text-sm tracking-wider gap-1 border border-red-500/50">
            <Lock size={24} className="text-red-500 animate-pulse" />
            <span>LOCKED / SUSPENDED</span>
          </div>
        )}

        <div className="min-w-[700px] flex flex-col gap-1.5">
          {/* Row 1: SMALL 4-10 | ODD 1:1 | ANY TRIPLE 30:1 | EVEN 1:1 | BIG 11-17 (Image 5 Exact Match) */}
          <div className="grid grid-cols-12 gap-1.5">
            <div className="col-span-3 bg-[#e2e8f0] hover:bg-white text-slate-900 rounded p-1.5 text-center cursor-pointer shadow">
              <span className="text-[10px] text-slate-600 font-bold block leading-none">1:1 Lose to Any Triple</span>
              <span className="text-xs sm:text-sm font-black">SMALL 4-10</span>
            </div>
            <div className="col-span-2 bg-[#cbd5e1] hover:bg-white text-slate-900 rounded p-1.5 text-center cursor-pointer shadow flex items-center justify-center">
              <span className="text-xs font-black">ODD 1:1</span>
            </div>
            <div className="col-span-2 bg-[#f8fafc] hover:bg-white text-slate-900 rounded p-1.5 text-center cursor-pointer shadow border border-slate-300">
              <span className="text-[10px] text-slate-600 font-bold block leading-none">30:1</span>
              <span className="text-xs font-black">ANY TRIPLE</span>
            </div>
            <div className="col-span-2 bg-[#cbd5e1] hover:bg-white text-slate-900 rounded p-1.5 text-center cursor-pointer shadow flex items-center justify-center">
              <span className="text-xs font-black">EVEN 1:1</span>
            </div>
            <div className="col-span-3 bg-[#e2e8f0] hover:bg-white text-slate-900 rounded p-1.5 text-center cursor-pointer shadow">
              <span className="text-[10px] text-slate-600 font-bold block leading-none">1:1 Lose to Any Triple</span>
              <span className="text-xs sm:text-sm font-black">BIG 11-17</span>
            </div>
          </div>

          {/* Row 2: 9:1 Each Double (6 pairs) */}
          <div className="bg-[#cbd5e1] p-1.5 rounded flex items-center justify-between gap-1 shadow-sm">
            <span className="text-[9px] font-black text-slate-700 uppercase shrink-0 px-1">9:1 Each Double</span>
            <div className="flex-1 grid grid-cols-6 gap-1">
              {[1, 2, 3, 4, 5, 6].map((d) => (
                <div key={d} className="bg-white rounded py-1 flex items-center justify-center gap-1 text-red-600 text-lg cursor-pointer hover:bg-slate-50 shadow-sm border border-slate-300">
                  <span>{diceIcons[d - 1]}</span>
                  <span>{diceIcons[d - 1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: 150:1 Each Triple (6 triples) */}
          <div className="bg-[#e2e8f0] p-1.5 rounded flex items-center justify-between gap-1 shadow-sm">
            <span className="text-[9px] font-black text-slate-700 uppercase shrink-0 px-1">150:1 Each Triple</span>
            <div className="flex-1 grid grid-cols-6 gap-1">
              {[1, 2, 3, 4, 5, 6].map((d) => (
                <div key={d} className="bg-white rounded py-1 flex items-center justify-center gap-0.5 text-red-600 text-base cursor-pointer hover:bg-slate-50 shadow-sm border border-slate-300">
                  <span>{diceIcons[d - 1]}</span>
                  <span>{diceIcons[d - 1]}</span>
                  <span>{diceIcons[d - 1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Row 4: Totals 4 to 17 (Image 5 Exact Match) */}
          <div className="grid grid-cols-14 gap-1">
            {totals.map((t) => (
              <div key={t.num} className="bg-white rounded p-1 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 shadow border border-slate-300">
                <span className="text-xs sm:text-sm font-black text-slate-900 leading-tight">{t.num}</span>
                <span className="text-[9px] font-bold text-slate-600 leading-tight">{t.odds}</span>
              </div>
            ))}
          </div>

          {/* Row 5: 5:1 Two Dice Combinations (15 pairs) */}
          <div className="bg-[#cbd5e1] p-1.5 rounded flex flex-col gap-1 shadow-sm">
            <span className="text-[9px] font-black text-slate-700 uppercase text-center">5:1 Two Dice</span>
            <div className="grid grid-cols-15 gap-1">
              {twoDicePairs.map(([d1, d2], idx) => (
                <div key={idx} className="bg-white rounded py-1 flex items-center justify-center gap-0.5 text-red-600 text-sm cursor-pointer hover:bg-slate-50 shadow border border-slate-300">
                  <span>{diceIcons[d1 - 1]}</span>
                  <span>{diceIcons[d2 - 1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Row 6: Single Dice (1..6) */}
          <div className="bg-[#e2e8f0] p-1.5 rounded flex items-center justify-between gap-2 shadow-sm">
            <span className="text-[9px] font-black text-slate-700 uppercase shrink-0 px-1">
              1:1 on Single | 2:1 on Double | 3:1 on Triple
            </span>
            <div className="flex-1 grid grid-cols-6 gap-1">
              {[1, 2, 3, 4, 5, 6].map((d) => (
                <div key={d} className="bg-white rounded py-1.5 flex items-center justify-center text-red-600 text-2xl cursor-pointer hover:bg-slate-50 shadow border border-slate-300">
                  {diceIcons[d - 1]}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
