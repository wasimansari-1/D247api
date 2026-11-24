import React from 'react';
import { Lock } from 'lucide-react';

export default function AndarBaharBoard({ roundData, timer, isSuspended }) {
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const dummyCounts = [5, 2, 5, 0, 2, 5, 5, 4, 2, 5, 3, 5, 4];

  return (
    <div className="flex flex-col gap-3 select-none">
      <div className="bg-[#112435] rounded-xl border border-slate-700 overflow-hidden shadow-2xl relative">
        {/* Suspended Lock Overlay */}
        {isSuspended && (
          <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center text-red-400 font-black text-sm tracking-wider gap-1 border border-red-500/50">
            <Lock size={24} className="text-red-500 animate-pulse" />
            <span>LOCKED / SUSPENDED</span>
          </div>
        )}

        <div className="grid grid-cols-12 min-w-[600px] overflow-x-auto">
          {/* Left Vertical Label: ANDAR (Brown) / BAHAR (Gold) */}
          <div className="col-span-1 flex flex-col font-black text-xs text-center border-r border-slate-700">
            <div className="flex-1 bg-[#4a3b32] text-amber-200 flex items-center justify-center py-4 border-b border-slate-700 tracking-widest font-serif writing-vertical">
              A N D A R
            </div>
            <div className="flex-1 bg-[#f59e0b] text-slate-950 flex items-center justify-center py-4 tracking-widest font-serif writing-vertical">
              B A H A R
            </div>
          </div>

          {/* Right Main Grid */}
          <div className="col-span-11 flex flex-col">
            {/* Top ANDAR Row: 13 Facedown Cards (Image 2 Exact Match) */}
            <div className="bg-[#594a42] p-2 flex items-center justify-between gap-1 border-b border-slate-700">
              {ranks.map((r, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-amber-200/80 font-bold leading-none">{dummyCounts[idx]}</span>
                  <div className="w-full aspect-[2/3] max-w-[42px] rounded bg-[#0b2742] border border-yellow-400/80 shadow flex items-center justify-center cursor-pointer hover:border-yellow-300">
                    {idx === 4 ? (
                      <Lock size={12} className="text-yellow-400" />
                    ) : (
                      <div className="w-full h-full border border-yellow-400/40 rounded-[2px] flex items-center justify-center text-[9px] text-yellow-300/80 font-serif">
                        ✦
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom BAHAR Row: 13 Ranks A..K with suits (Image 2 Exact Match) */}
            <div className="bg-[#fef3c7] p-2 flex items-center justify-between gap-1">
              {ranks.map((r, idx) => {
                const isFour = r === '4';
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-slate-800 font-bold leading-none">{dummyCounts[idx]}</span>
                    {isFour ? (
                      <div className="w-full aspect-[2/3] max-w-[42px] rounded bg-[#0b2742] border border-yellow-400/80 shadow flex items-center justify-center">
                        <div className="w-full h-full border border-yellow-400/40 rounded-[2px] flex items-center justify-center text-[9px] text-yellow-300/80 font-serif">
                          ✦
                        </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-[2/3] max-w-[42px] bg-white rounded border border-slate-400 shadow flex flex-col items-center justify-center p-0.5 cursor-pointer hover:scale-105 transition">
                        <span className="text-xs sm:text-sm font-black text-slate-900 leading-none">{r}</span>
                        <div className="flex gap-0.5 text-[6px] text-slate-700 leading-none mt-0.5">
                          <span className="text-black">♠</span>
                          <span className="text-red-600">♥</span>
                          <span className="text-red-600">♦</span>
                          <span className="text-black">♣</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
