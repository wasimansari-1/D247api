import React from 'react';
import { Lock } from 'lucide-react';

export default function QueenJackTopBoard({ roundData, timer, isSuspended, title }) {
  const runners = roundData?.runners || [];

  const playerA = runners.find(r => (r.name || '').toLowerCase() === 'player a') || {
    name: 'Player A',
    back: 0,
    lay: 0
  };
  const playerB = runners.find(r => (r.name || '').toLowerCase() === 'player b') || {
    name: 'Player B',
    back: 0,
    lay: 0
  };
  const under21 = runners.find(r => (r.name || '').toLowerCase().includes('under 21')) || {
    name: 'Player B Under 21',
    back: 0
  };
  const over21 = runners.find(r => (r.name || '').toLowerCase().includes('over 21')) || {
    name: 'Player B Over 21',
    back: 0
  };

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* 2-Column Main Bets: Player A vs Player B (Image 3 & 4 Exact Match) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Left: Player A */}
        <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
          <div className="bg-[#0c1b29] px-3 py-1.5 border-b border-slate-700 flex justify-between items-center text-xs">
            <span className="font-extrabold text-white">Player A</span>
            <div className="flex gap-2 text-[10px] font-bold text-slate-300">
              <span className="w-16 text-center bg-[#72bbef]/20 text-[#72bbef] py-0.5 rounded">Back</span>
              <span className="w-16 text-center bg-[#faa9ba]/20 text-[#faa9ba] py-0.5 rounded">Lay</span>
            </div>
          </div>
          <div className="p-2.5 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Main</span>
            <div className="flex gap-2">
              <div className="w-16 py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                {isSuspended || !playerA.back ? <Lock size={13} className="text-slate-300" /> : <span className="text-xs font-black text-sky-300">{playerA.back}</span>}
              </div>
              <div className="w-16 py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                {isSuspended || !playerA.lay ? <Lock size={13} className="text-slate-300" /> : <span className="text-xs font-black text-rose-300">{playerA.lay}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Player B */}
        <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
          <div className="bg-[#0c1b29] px-3 py-1.5 border-b border-slate-700 flex justify-between items-center text-xs">
            <span className="font-extrabold text-white">Player B</span>
            <div className="flex gap-2 text-[10px] font-bold text-slate-300">
              <span className="w-16 text-center bg-[#72bbef]/20 text-[#72bbef] py-0.5 rounded">Back</span>
              <span className="w-16 text-center bg-[#faa9ba]/20 text-[#faa9ba] py-0.5 rounded">Lay</span>
            </div>
          </div>
          <div className="p-2.5 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Main</span>
            <div className="flex gap-2">
              <div className="w-16 py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                {isSuspended || !playerB.back ? <Lock size={13} className="text-slate-300" /> : <span className="text-xs font-black text-sky-300">{playerB.back}</span>}
              </div>
              <div className="w-16 py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                {isSuspended || !playerB.lay ? <Lock size={13} className="text-slate-300" /> : <span className="text-xs font-black text-rose-300">{playerB.lay}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Under Player B: Player B Under 21 | Player B Over 21 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="hidden md:block"></div>
        <div className="grid grid-cols-2 gap-2 bg-[#112435] p-2.5 rounded-lg border border-slate-700 shadow">
          <div className="flex items-center justify-between p-1.5 bg-[#0c1b29] rounded border border-slate-800">
            <span className="text-[11px] font-bold text-slate-300">Player B Under 21</span>
            <div className="w-12 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
              {isSuspended || !under21.back ? <Lock size={12} className="text-slate-300" /> : <span className="text-xs font-black text-sky-300">{under21.back}</span>}
            </div>
          </div>
          <div className="flex items-center justify-between p-1.5 bg-[#0c1b29] rounded border border-slate-800">
            <span className="text-[11px] font-bold text-slate-300">Player B Over 21</span>
            <div className="w-12 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
              {isSuspended || !over21.back ? <Lock size={12} className="text-slate-300" /> : <span className="text-xs font-black text-sky-300">{over21.back}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Green Promotional Banner (Image 3 & 4 Exact Match) */}
      <div className="p-2 bg-[#1b4332] border border-emerald-500/60 rounded-lg flex items-center justify-center text-center text-xs text-emerald-200 font-bold shadow">
        Play Our New Game Premium Teenpatti 1 Day
      </div>
    </div>
  );
}
