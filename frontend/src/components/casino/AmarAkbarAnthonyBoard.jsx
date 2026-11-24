import React from 'react';
import { Lock } from 'lucide-react';

export default function AmarAkbarAnthonyBoard({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];
  const isBettingClosed = isSuspended || timer <= 3;

  // 1. Find Main Runners (Amar, Akbar, Anthony)
  const amar = runners.find(r => (r.name || '').toLowerCase().includes('amar')) || {
    name: 'A. Amar',
    back: 2.12,
    lay: 2.22
  };
  const akbar = runners.find(r => (r.name || '').toLowerCase().includes('akbar')) || {
    name: 'B. Akbar',
    back: 3.15,
    lay: 3.35
  };
  const anthony = runners.find(r => (r.name || '').toLowerCase().includes('anthony')) || {
    name: 'C. Anthony',
    back: 4.15,
    lay: 4.45
  };

  // 2. Find Side Bet Runners
  const evenRunner = runners.find(r => (r.name || '').toLowerCase().includes('even')) || { back: 2.12 };
  const oddRunner = runners.find(r => (r.name || '').toLowerCase().includes('odd')) || { back: 1.83 };
  const redRunner = runners.find(r => (r.name || '').toLowerCase().includes('red') || (r.name || '').includes('♥')) || { back: 1.97 };
  const blackRunner = runners.find(r => (r.name || '').toLowerCase().includes('black') || (r.name || '').includes('♠')) || { back: 1.97 };
  const under7Runner = runners.find(r => (r.name || '').toLowerCase().includes('under')) || { back: 2.0 };
  const over7Runner = runners.find(r => (r.name || '').toLowerCase().includes('over')) || { back: 2.0 };

  // 13 Card Ranks for Row 3
  const cardRanks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* 1. Row 1: A. Amar, B. Akbar, C. Anthony with Back & Lay (Image 4 Exact Match) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {[
          { label: 'A. Amar', runner: amar, defBack: '2.12', defLay: '2.22' },
          { label: 'B. Akbar', runner: akbar, defBack: '3.15', defLay: '3.35' },
          { label: 'C. Anthony', runner: anthony, defBack: '4.15', defLay: '4.45' }
        ].map((item, idx) => (
          <div key={idx} className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
            <div className="bg-[#0c1b29] py-1.5 px-3 border-b border-slate-800 text-center font-black text-xs text-white">
              {item.label}
            </div>
            <div className="grid grid-cols-2 p-2 gap-2 bg-[#112435]">
              {/* Back Odds */}
              {isBettingClosed ? (
                <div className="py-2 bg-[#1e3a5f] rounded border border-blue-500/30 text-blue-200 flex items-center justify-center">
                  <Lock size={12} className="text-blue-300" />
                </div>
              ) : (
                <button className="py-2 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded transition shadow active:scale-95">
                  {item.runner?.back || item.defBack}
                </button>
              )}

              {/* Lay Odds */}
              {isBettingClosed ? (
                <div className="py-2 bg-[#4a2430] rounded border border-pink-500/30 text-pink-200 flex items-center justify-center">
                  <Lock size={12} className="text-pink-300" />
                </div>
              ) : (
                <button className="py-2 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-xs rounded transition shadow active:scale-95">
                  {item.runner?.lay || item.defLay}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 2. Row 2: 3 Side-Bet Columns (Even/Odd, Suits, Under/Over 7) (Image 4 Exact Match) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Col 1: Even / Odd */}
        <div className="bg-[#112435] rounded-lg border border-slate-700 p-2 flex flex-col gap-2 shadow-lg">
          {/* Even */}
          <div className="flex flex-col gap-0.5 text-center">
            <span className="text-[11px] font-bold text-slate-300 font-mono">
              {evenRunner?.back || '2.12'}
            </span>
            {isBettingClosed ? (
              <div className="py-2 bg-[#1e293b] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                <Lock size={12} className="text-slate-300" />
              </div>
            ) : (
              <button className="py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-xs rounded transition shadow active:scale-95">
                Even
              </button>
            )}
          </div>

          {/* Odd */}
          <div className="flex flex-col gap-0.5 text-center">
            <span className="text-[11px] font-bold text-slate-300 font-mono">
              {oddRunner?.back || '1.83'}
            </span>
            {isBettingClosed ? (
              <div className="py-2 bg-[#1e293b] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                <Lock size={12} className="text-slate-300" />
              </div>
            ) : (
              <button className="py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-xs rounded transition shadow active:scale-95">
                Odd
              </button>
            )}
          </div>
        </div>

        {/* Col 2: Suits (♥ ♦ / ♠ ♣) */}
        <div className="bg-[#112435] rounded-lg border border-slate-700 p-2 flex flex-col gap-2 shadow-lg">
          {/* Red Suits ♥ ♦ */}
          <div className="flex flex-col gap-0.5 text-center">
            <span className="text-[11px] font-bold text-slate-300 font-mono">
              {redRunner?.back || '1.97'}
            </span>
            {isBettingClosed ? (
              <div className="py-2 bg-[#1e293b] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                <Lock size={12} className="text-slate-300" />
              </div>
            ) : (
              <button className="py-2 bg-[#2b3543] hover:bg-[#374558] text-red-500 font-black text-base rounded transition shadow flex items-center justify-center gap-1.5 active:scale-95">
                <span>♥</span>
                <span>♦</span>
              </button>
            )}
          </div>

          {/* Black Suits ♠ ♣ */}
          <div className="flex flex-col gap-0.5 text-center">
            <span className="text-[11px] font-bold text-slate-300 font-mono">
              {blackRunner?.back || '1.97'}
            </span>
            {isBettingClosed ? (
              <div className="py-2 bg-[#1e293b] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                <Lock size={12} className="text-slate-300" />
              </div>
            ) : (
              <button className="py-2 bg-[#2b3543] hover:bg-[#374558] text-white font-black text-base rounded transition shadow flex items-center justify-center gap-1.5 active:scale-95">
                <span>♠</span>
                <span>♣</span>
              </button>
            )}
          </div>
        </div>

        {/* Col 3: Under 7 / Over 7 */}
        <div className="bg-[#112435] rounded-lg border border-slate-700 p-2 flex flex-col gap-2 shadow-lg">
          {/* Under 7 */}
          <div className="flex flex-col gap-0.5 text-center">
            <span className="text-[11px] font-bold text-slate-300 font-mono">
              {under7Runner?.back || '2'}
            </span>
            {isBettingClosed ? (
              <div className="py-2 bg-[#1e293b] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                <Lock size={12} className="text-slate-300" />
              </div>
            ) : (
              <button className="py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-xs rounded transition shadow active:scale-95">
                Under 7
              </button>
            )}
          </div>

          {/* Over 7 */}
          <div className="flex flex-col gap-0.5 text-center">
            <span className="text-[11px] font-bold text-slate-300 font-mono">
              {over7Runner?.back || '2'}
            </span>
            {isBettingClosed ? (
              <div className="py-2 bg-[#1e293b] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                <Lock size={12} className="text-slate-300" />
              </div>
            ) : (
              <button className="py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-xs rounded transition shadow active:scale-95">
                Over 7
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Row 3: 13-Card Rank Strip with '12' odds (Image 4 Exact Match) */}
      <div className="bg-[#112435] rounded-lg border border-slate-700 p-2.5 shadow-lg flex flex-col items-center gap-2">
        <span className="text-sm font-black text-amber-400 font-mono">12</span>
        <div className="grid grid-cols-13 gap-1 w-full max-w-full overflow-x-auto pb-1">
          {cardRanks.map((rank, idx) => (
            <div
              key={idx}
              className="bg-white border border-yellow-400/80 rounded-[3px] p-1 flex flex-col items-center justify-center shadow hover:scale-105 transition cursor-pointer select-none min-w-[24px]"
            >
              <span className="text-black font-black text-xs leading-none">
                {rank}
              </span>
              <div className="flex items-center gap-0.5 text-[7px] leading-none mt-0.5">
                <span className="text-black">♠</span>
                <span className="text-red-600">♥</span>
                <span className="text-red-600">♦</span>
                <span className="text-black">♣</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
