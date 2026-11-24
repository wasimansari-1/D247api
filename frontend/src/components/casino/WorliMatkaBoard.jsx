import React from 'react';
import { Lock } from 'lucide-react';

export default function WorliMatkaBoard({ roundData, timer, isSuspended }) {
  const isBettingClosed = isSuspended || timer <= 3;

  return (
    <div className="flex flex-col gap-2 select-none">
      <div className="bg-[#112435] rounded-xl border border-slate-700 overflow-hidden shadow-2xl p-3">
        {/* Header Row: '9' centered above columns 1..5, and '9' centered above Line/Odd columns */}
        <div className="grid grid-cols-7 gap-1.5 mb-1.5 text-center">
          <div className="col-span-5 bg-[#0a1826] border border-slate-700/80 rounded py-1 text-sky-400 font-mono font-black text-sm tracking-widest shadow-inner">
            9
          </div>
          <div className="col-span-2 bg-[#0a1826] border border-slate-700/80 rounded py-1 text-sky-400 font-mono font-black text-sm tracking-widest shadow-inner">
            9
          </div>
        </div>

        {/* Row 1: 1, 2, 3, 4, 5, LINE 1 (1|2|3|4|5), ODD (1|3|5|7|9) */}
        <div className="grid grid-cols-7 gap-1.5 text-slate-950 font-black mb-1.5">
          {[1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="relative">
              {isBettingClosed ? (
                <div className="py-3 bg-[#1e293b] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                  <Lock size={14} className="text-slate-400" />
                </div>
              ) : (
                <button className="w-full py-3 bg-[#72bbef] hover:bg-[#5caae6] rounded flex items-center justify-center text-lg sm:text-xl font-serif font-black shadow active:scale-95 transition">
                  {num}
                </button>
              )}
            </div>
          ))}

          {/* LINE 1 */}
          <div className="relative">
            {isBettingClosed ? (
              <div className="py-2.5 px-1 bg-[#1e293b] rounded border border-slate-700 text-slate-400 flex flex-col items-center justify-center">
                <Lock size={12} className="text-slate-400 mb-0.5" />
                <span className="text-[9px] font-bold">LINE 1</span>
              </div>
            ) : (
              <button className="w-full py-2 px-1 bg-[#72bbef] hover:bg-[#5caae6] rounded flex flex-col items-center justify-center text-center shadow active:scale-95 transition">
                <span className="text-[11px] font-black uppercase leading-tight">LINE 1</span>
                <span className="text-[8px] font-mono text-slate-800">1|2|3|4|5</span>
              </button>
            )}
          </div>

          {/* ODD */}
          <div className="relative">
            {isBettingClosed ? (
              <div className="py-2.5 px-1 bg-[#1e293b] rounded border border-slate-700 text-slate-400 flex flex-col items-center justify-center">
                <Lock size={12} className="text-slate-400 mb-0.5" />
                <span className="text-[9px] font-bold">ODD</span>
              </div>
            ) : (
              <button className="w-full py-2 px-1 bg-[#72bbef] hover:bg-[#5caae6] rounded flex flex-col items-center justify-center text-center shadow active:scale-95 transition">
                <span className="text-[11px] font-black uppercase leading-tight">ODD</span>
                <span className="text-[8px] font-mono text-slate-800">1|3|5|7|9</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: 6, 7, 8, 9, 0, LINE 2 (6|7|8|9|0), EVEN (2|4|6|8|0) */}
        <div className="grid grid-cols-7 gap-1.5 text-slate-950 font-black">
          {[6, 7, 8, 9, 0].map((num) => (
            <div key={num} className="relative">
              {isBettingClosed ? (
                <div className="py-3 bg-[#1e293b] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                  <Lock size={14} className="text-slate-400" />
                </div>
              ) : (
                <button className="w-full py-3 bg-[#72bbef] hover:bg-[#5caae6] rounded flex items-center justify-center text-lg sm:text-xl font-serif font-black shadow active:scale-95 transition">
                  {num}
                </button>
              )}
            </div>
          ))}

          {/* LINE 2 */}
          <div className="relative">
            {isBettingClosed ? (
              <div className="py-2.5 px-1 bg-[#1e293b] rounded border border-slate-700 text-slate-400 flex flex-col items-center justify-center">
                <Lock size={12} className="text-slate-400 mb-0.5" />
                <span className="text-[9px] font-bold">LINE 2</span>
              </div>
            ) : (
              <button className="w-full py-2 px-1 bg-[#72bbef] hover:bg-[#5caae6] rounded flex flex-col items-center justify-center text-center shadow active:scale-95 transition">
                <span className="text-[11px] font-black uppercase leading-tight">LINE 2</span>
                <span className="text-[8px] font-mono text-slate-800">6|7|8|9|0</span>
              </button>
            )}
          </div>

          {/* EVEN */}
          <div className="relative">
            {isBettingClosed ? (
              <div className="py-2.5 px-1 bg-[#1e293b] rounded border border-slate-700 text-slate-400 flex flex-col items-center justify-center">
                <Lock size={12} className="text-slate-400 mb-0.5" />
                <span className="text-[9px] font-bold">EVEN</span>
              </div>
            ) : (
              <button className="w-full py-2 px-1 bg-[#72bbef] hover:bg-[#5caae6] rounded flex flex-col items-center justify-center text-center shadow active:scale-95 transition">
                <span className="text-[11px] font-black uppercase leading-tight">EVEN</span>
                <span className="text-[8px] font-mono text-slate-800">2|4|6|8|0</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
