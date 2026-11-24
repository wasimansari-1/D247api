import React from 'react';
import { Lock } from 'lucide-react';

export default function TeenPattiJoker20Board({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];
  const playerA = runners.find(r => (r.name || '').toLowerCase() === 'player a') || {
    name: 'Player A',
    back: 1.95,
    lay: 2.05,
    min: 100,
    max: 300000
  };
  const playerB = runners.find(r => (r.name || '').toLowerCase() === 'player b') || {
    name: 'Player B',
    back: 1.95,
    lay: 2.05,
    min: 100,
    max: 300000
  };

  return (
    <div className="flex flex-col gap-3 select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Left: Player A & Player B Back / Lay */}
        <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
          <div className="grid grid-cols-3 bg-[#0c1b29] text-[11px] font-bold text-slate-300 border-b border-slate-700 py-2 px-3 text-center">
            <div className="text-left font-black text-slate-400">Runner</div>
            <div className="bg-[#72bbef]/20 text-[#72bbef] rounded font-black py-0.5">Back</div>
            <div className="bg-[#faa9ba]/20 text-[#faa9ba] rounded font-black py-0.5 ml-1">Lay</div>
          </div>
          {[playerA, playerB].map((runner, pIdx) => (
            <div key={pIdx} className="grid grid-cols-3 items-center border-b border-slate-800 p-2.5 text-center">
              <div className="text-left font-black text-xs text-white">{runner.name}</div>
              {isSuspended ? (
                <div className="py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                  <Lock size={14} className="text-slate-300" />
                </div>
              ) : (
                <button className="py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded transition shadow">
                  {runner.back || '1.95'}
                </button>
              )}
              {isSuspended ? (
                <div className="py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center ml-1">
                  <Lock size={14} className="text-slate-300" />
                </div>
              ) : (
                <button className="py-1.5 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-xs rounded transition shadow ml-1">
                  {runner.lay || '2.05'}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Right: Joker Side Bets (Even, Odd, Red, Black, Suits) */}
        <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
          {/* Row 1: Header Even | Odd | Red | Black */}
          <div className="grid grid-cols-5 bg-[#0c1b29] text-[10px] font-bold text-slate-300 border-b border-slate-700 py-1.5 px-2 text-center">
            <div className="text-left font-bold text-amber-400">Joker</div>
            <div>Even</div>
            <div>Odd</div>
            <div className="text-red-400">Red ♥♦</div>
            <div className="text-slate-200">Black ♠♣</div>
          </div>
          <div className="grid grid-cols-5 items-center p-2 border-b border-slate-800 text-center gap-1">
            <div className="text-left text-[11px] font-bold text-slate-400">Rate</div>
            {['Even', 'Odd', 'Red', 'Black'].map((opt, i) => (
              <div key={i} className="py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                {isSuspended ? <Lock size={12} className="text-slate-300" /> : <span className="text-xs font-black text-sky-300">2.0</span>}
              </div>
            ))}
          </div>

          {/* Row 2: Suits Header ♠ | ♥ | ♦ | ♣ */}
          <div className="grid grid-cols-5 bg-[#0c1b29] text-[11px] font-bold text-slate-300 border-b border-slate-700 py-1.5 px-2 text-center">
            <div className="text-left font-bold text-amber-400">Joker</div>
            <div>♠</div>
            <div className="text-red-400">♥</div>
            <div className="text-red-400">♦</div>
            <div>♣</div>
          </div>
          <div className="grid grid-cols-5 items-center p-2 text-center gap-1">
            <div className="text-left text-[11px] font-bold text-slate-400">Rate</div>
            {['♠', '♥', '♦', '♣'].map((s, i) => (
              <div key={i} className="py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                {isSuspended ? <Lock size={12} className="text-slate-300" /> : <span className="text-xs font-black text-amber-300">4.0</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
