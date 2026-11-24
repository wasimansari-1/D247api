import React from 'react';
import { Lock } from 'lucide-react';

export default function TeenPattiJoker20Board({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];
  const isBettingClosed = isSuspended || timer <= 3;

  const playerA = runners.find(r => (r.name || '').toLowerCase() === 'player a') || {
    name: 'Player A',
    back: 1.95,
    lay: 2.05
  };
  const playerB = runners.find(r => (r.name || '').toLowerCase() === 'player b') || {
    name: 'Player B',
    back: 1.95,
    lay: 2.05
  };

  const getRunner = (key) => {
    const k = key.toLowerCase();
    return runners.find(r => (r.name || '').toLowerCase().includes(k));
  };

  const rEven = getRunner('even');
  const rOdd = getRunner('odd');
  const rRed = getRunner('red');
  const rBlack = getRunner('black');

  const rSpade = getRunner('spade');
  const rHeart = getRunner('heart');
  const rDiamond = getRunner('diamond');
  const rClub = getRunner('club');

  return (
    <div className="flex flex-col gap-3 select-none">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Left Table: Player A & Player B (Width ~45%) */}
        <div className="md:col-span-5 bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg flex flex-col justify-between">
          <div className="grid grid-cols-3 bg-[#0c1b29] text-[11px] font-bold text-slate-300 border-b border-slate-700 py-2 px-3 text-center">
            <div className="text-left font-black text-slate-400">Runner</div>
            <div className="bg-[#72bbef]/20 text-[#72bbef] rounded font-black py-0.5">Back</div>
            <div className="bg-[#faa9ba]/20 text-[#faa9ba] rounded font-black py-0.5 ml-1">Lay</div>
          </div>
          <div className="flex flex-col divide-y divide-slate-800">
            {[playerA, playerB].map((runner, pIdx) => (
              <div key={pIdx} className="grid grid-cols-3 items-center p-2.5 px-3 text-center">
                <div className="text-left font-black text-xs text-white">{runner.name}</div>
                {isBettingClosed ? (
                  <div className="py-2 bg-[#1e3a5f] rounded border border-blue-500/30 text-blue-200 flex items-center justify-center">
                    <Lock size={12} className="text-blue-300" />
                  </div>
                ) : (
                  <button className="py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded transition shadow">
                    {runner.back || '1.95'}
                  </button>
                )}
                {isBettingClosed ? (
                  <div className="py-2 bg-[#4a2430] rounded border border-pink-500/30 text-pink-200 flex items-center justify-center ml-1">
                    <Lock size={12} className="text-pink-300" />
                  </div>
                ) : (
                  <button className="py-1.5 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-xs rounded transition shadow ml-1">
                    {runner.lay || '2.05'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Table: Joker Side Bets (Width ~55%) (Image 2 Exact Match) */}
        <div className="md:col-span-7 bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg flex flex-col justify-between">
          <div>
            {/* Row 1: Header Even | Odd | Red ♥♦ | Black ♠♣ */}
            <div className="grid grid-cols-5 bg-[#0c1b29] text-[10px] sm:text-[11px] font-bold text-slate-300 border-b border-slate-700 py-1.5 px-2 text-center items-center">
              <div className="text-left font-extrabold text-amber-400 pl-1">Joker</div>
              <div>Even</div>
              <div>Odd</div>
              <div className="text-red-400 font-black">Red ♥♦</div>
              <div className="text-slate-200 font-black">Black ♠♣</div>
            </div>
            <div className="grid grid-cols-5 items-center p-2 border-b border-slate-800 text-center gap-1.5">
              <div className="text-left text-[11px] font-bold text-slate-400 pl-1">Joker</div>
              {[
                { r: rEven, defaultRate: '1.95' },
                { r: rOdd, defaultRate: '1.95' },
                { r: rRed, defaultRate: '1.95' },
                { r: rBlack, defaultRate: '1.95' }
              ].map((opt, i) => (
                <div key={i} className="flex justify-center">
                  {isBettingClosed ? (
                    <div className="w-full py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                      <Lock size={12} className="text-slate-300" />
                    </div>
                  ) : (
                    <button className="w-full py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded shadow transition">
                      {opt.r?.back || opt.defaultRate}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Row 2: Suits Header ♠ | ♥ | ♦ | ♣ */}
            <div className="grid grid-cols-5 bg-[#0c1b29] text-[11px] font-bold text-slate-300 border-b border-slate-700 py-1.5 px-2 text-center items-center">
              <div className="text-left font-extrabold text-amber-400 pl-1">Joker</div>
              <div className="text-slate-200 text-sm">♠</div>
              <div className="text-red-500 text-sm">♥</div>
              <div className="text-red-500 text-sm">♦</div>
              <div className="text-slate-200 text-sm">♣</div>
            </div>
            <div className="grid grid-cols-5 items-center p-2 text-center gap-1.5">
              <div className="text-left text-[11px] font-bold text-slate-400 pl-1">Joker</div>
              {[
                { r: rSpade, defaultRate: '3.75' },
                { r: rHeart, defaultRate: '3.75' },
                { r: rDiamond, defaultRate: '3.75' },
                { r: rClub, defaultRate: '3.75' }
              ].map((s, i) => (
                <div key={i} className="flex justify-center">
                  {isBettingClosed ? (
                    <div className="w-full py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                      <Lock size={12} className="text-slate-300" />
                    </div>
                  ) : (
                    <button className="w-full py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded shadow transition">
                      {s.r?.back || s.defaultRate}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
