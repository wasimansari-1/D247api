import React, { useState } from 'react';
import { Lock } from 'lucide-react';

export default function WorliMatkaBoard({ roundData, timer, isSuspended }) {
  const [selectedWorliTab, setSelectedWorliTab] = useState('Single');

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* Coin Amount & 1-Click Bet Palette */}
      <div className="bg-[#112435] p-2.5 rounded-lg border border-slate-700 flex flex-wrap items-center justify-between gap-2 shadow-lg">
        <div className="text-[11px] font-black text-slate-300 uppercase tracking-wide">
          SET YOUR COIN AMOUNT AND START 1-CLICK BET!
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded shadow">
            Reset
          </button>
          <div className="px-2.5 py-1 bg-purple-700 text-white font-bold text-xs rounded-full border border-purple-400">
            0 =
          </div>
          {[25, 50, 100, 200, 500, '1K'].map((coin, cIdx) => (
            <div
              key={cIdx}
              className="w-8 h-8 rounded-full bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-[11px] flex items-center justify-center cursor-pointer shadow border border-cyan-400 active:scale-95 transition"
            >
              +{coin}
            </div>
          ))}
        </div>
      </div>

      {/* Matka Tabs & Interactive Grid */}
      <div className="grid grid-cols-12 gap-2 relative">
        {/* Suspended Lock Overlay */}
        {isSuspended && (
          <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-[2px] rounded-lg flex flex-col items-center justify-center text-red-400 font-black text-sm tracking-wider gap-1 border border-red-500/50">
            <Lock size={24} className="text-red-500 animate-pulse" />
            <span>LOCKED / SUSPENDED</span>
          </div>
        )}

        {/* Left Vertical Tabs (Exact to Image 6 & 7) */}
        <div className="col-span-3 sm:col-span-2 flex flex-col gap-1 bg-[#0f1d2c] p-1 rounded-lg border border-slate-700/80 shadow">
          {[
            'Jodi', 'Single', 'Pana', 'SP', 'DP', 'Trio', 'Cycle', 
            'Motor SP', '56 Charts', '64 Charts', 'ABR', 'Common SP', 
            'Common DP', 'Color DP'
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedWorliTab(tab)}
              className={`py-1.5 px-2 text-center text-xs font-black rounded transition truncate ${
                selectedWorliTab === tab
                  ? 'bg-[#1e3a5f] text-white border-l-4 border-sky-400 font-extrabold shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right Interactive Single Grid (Exact to Image 6 & 7) */}
        <div className="col-span-9 sm:col-span-10 flex flex-col gap-1.5">
          {/* Row 1: 1, 2, 3, 4, 5, LINE 1, ODD */}
          <div className="grid grid-cols-7 gap-1 text-slate-900 font-black">
            {[1, 2, 3, 4, 5].map((num) => (
              <div
                key={num}
                className="py-3 bg-[#72bbef] hover:bg-[#5caae6] rounded flex items-center justify-center text-lg sm:text-xl font-serif font-black cursor-pointer shadow active:scale-95 transition"
              >
                {num}
              </div>
            ))}
            <div className="py-2 px-1 bg-[#72bbef] hover:bg-[#5caae6] rounded flex flex-col items-center justify-center text-center cursor-pointer shadow active:scale-95 transition">
              <span className="text-[11px] font-black uppercase leading-tight">LINE 1</span>
              <span className="text-[8px] font-mono text-slate-800">1|2|3|4|5</span>
            </div>
            <div className="py-2 px-1 bg-[#72bbef] hover:bg-[#5caae6] rounded flex flex-col items-center justify-center text-center cursor-pointer shadow active:scale-95 transition">
              <span className="text-[11px] font-black uppercase leading-tight">ODD</span>
              <span className="text-[8px] font-mono text-slate-800">1|3|5|7|9</span>
            </div>
          </div>

          {/* Row 2: 6, 7, 8, 9, 0, LINE 2, EVEN */}
          <div className="grid grid-cols-7 gap-1 text-slate-900 font-black">
            {[6, 7, 8, 9, 0].map((num) => (
              <div
                key={num}
                className="py-3 bg-[#72bbef] hover:bg-[#5caae6] rounded flex items-center justify-center text-lg sm:text-xl font-serif font-black cursor-pointer shadow active:scale-95 transition"
              >
                {num}
              </div>
            ))}
            <div className="py-2 px-1 bg-[#72bbef] hover:bg-[#5caae6] rounded flex flex-col items-center justify-center text-center cursor-pointer shadow active:scale-95 transition">
              <span className="text-[11px] font-black uppercase leading-tight">LINE 2</span>
              <span className="text-[8px] font-mono text-slate-800">6|7|8|9|0</span>
            </div>
            <div className="py-2 px-1 bg-[#72bbef] hover:bg-[#5caae6] rounded flex flex-col items-center justify-center text-center cursor-pointer shadow active:scale-95 transition">
              <span className="text-[11px] font-black uppercase leading-tight">EVEN</span>
              <span className="text-[8px] font-mono text-slate-800">2|4|6|8|0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Matka Markets Ribbon */}
      <div className="bg-[#112435] px-3 py-2 rounded-lg border border-slate-700 flex items-center justify-between text-xs overflow-x-auto scrollbar-none shadow-lg">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-slate-400 font-bold text-[11px] mr-1">Last Result</span>
          {['Diamond', 'World', 'Taj', 'Lords', 'Riga', 'Asia', 'Gulf'].map((m) => (
            <div key={m} className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded text-[10px] font-bold">
              {m}
            </div>
          ))}
        </div>
        <button className="text-[10px] font-bold text-sky-400 hover:underline shrink-0 ml-2">
          View All
        </button>
      </div>
    </div>
  );
}
