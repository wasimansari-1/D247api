import React from 'react';
import { Lock } from 'lucide-react';

export default function Race20Board({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];
  const isBettingClosed = isSuspended || timer <= 3;

  // 4 Kings Runners (Spade, Heart, Club, Diamond)
  const getKingRunner = (suitKey) => {
    return runners.find(r => {
      const n = (r.name || '').toLowerCase();
      return n.includes(suitKey) || n.includes(`k of ${suitKey}`) || n.includes(`king of ${suitKey}`);
    });
  };

  const kingSpade = getKingRunner('spade') || { name: 'K of spade', back: 3.75, lay: 4.1 };
  const kingHeart = getKingRunner('heart') || { name: 'K of heart', back: 3.75, lay: 4.1 };
  const kingClub = getKingRunner('club') || { name: 'K of club', back: 3.75, lay: 4.1 };
  const kingDiamond = getKingRunner('diamond') || { name: 'K of diamond', back: 3.75, lay: 4.1 };

  const kings = [
    { label: 'K', suit: '♠', color: 'text-slate-900', runner: kingSpade, border: 'border-slate-800' },
    { label: 'K', suit: '♥', color: 'text-red-600', runner: kingHeart, border: 'border-red-500/40' },
    { label: 'K', suit: '♣', color: 'text-slate-900', runner: kingClub, border: 'border-slate-800' },
    { label: 'K', suit: '♦', color: 'text-red-600', runner: kingDiamond, border: 'border-red-500/40' }
  ];

  // Side bets
  const totalPoints = runners.find(r => (r.name || '').toLowerCase().includes('total points')) || { name: 'Total points', no: 1.95, yes: 1.95 };
  const totalCards = runners.find(r => (r.name || '').toLowerCase().includes('total cards')) || { name: 'Total cards', no: 1.95, yes: 1.95 };

  const winWithOptions = [
    { label: 'Win with 5', key: '5', rate: '25' },
    { label: 'Win with 6', key: '6', rate: '15' },
    { label: 'Win with 7', key: '7', rate: '10' },
    { label: 'Win with 15', key: '15', rate: '8' },
    { label: 'Win with 16', key: '16', rate: '12' },
    { label: 'Win with 17', key: '17', rate: '20' }
  ];

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* 1. Top Section: 4 Kings Back / Lay (Image 9 Exact Match) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {kings.map((k, idx) => (
          <div key={idx} className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg flex flex-col">
            {/* King Card Header */}
            <div className="bg-[#0c1b29] p-2 flex items-center justify-center border-b border-slate-700">
              <div className="w-9 h-11 bg-white rounded shadow flex flex-col items-center justify-center border border-slate-300">
                <span className={`text-xs font-black leading-none ${k.color}`}>{k.label}</span>
                <span className={`text-sm font-black leading-none ${k.color}`}>{k.suit}</span>
              </div>
            </div>

            {/* Back / Lay Buttons */}
            <div className="grid grid-cols-2 p-1.5 gap-1.5 bg-[#0f1d2c] flex-1 items-center">
              {isBettingClosed ? (
                <div className="py-2.5 bg-[#1e3a5f] rounded border border-blue-500/30 text-blue-200 flex items-center justify-center">
                  <Lock size={14} className="text-blue-300" />
                </div>
              ) : (
                <button className="py-2 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded shadow transition">
                  {k.runner.back || '3.75'}
                </button>
              )}

              {isBettingClosed ? (
                <div className="py-2.5 bg-[#4a2430] rounded border border-pink-500/30 text-pink-200 flex items-center justify-center">
                  <Lock size={14} className="text-pink-300" />
                </div>
              ) : (
                <button className="py-2 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-xs rounded transition shadow">
                  {k.runner.lay || '4.10'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 2. Bottom Section: Total Points/Cards (Left) + Win With Grid (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Left: Total Points & Total Cards */}
        <div className="md:col-span-5 bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
          <div className="grid grid-cols-3 bg-[#0c1b29] text-[11px] font-bold text-slate-300 border-b border-slate-700 py-2 px-3 text-center">
            <div className="text-left font-black text-slate-400">Market</div>
            <div className="bg-[#faa9ba]/20 text-[#faa9ba] rounded font-black py-0.5">No</div>
            <div className="bg-[#72bbef]/20 text-[#72bbef] rounded font-black py-0.5 ml-1">Yes</div>
          </div>

          {[totalPoints, totalCards].map((mkt, mIdx) => (
            <div key={mIdx} className="grid grid-cols-3 items-center border-b border-slate-800 p-2.5 text-center">
              <div className="text-left font-black text-xs text-white truncate pr-1">{mkt.name}</div>
              {isBettingClosed ? (
                <div className="py-2 bg-[#4a2430] rounded border border-pink-500/30 text-pink-200 flex items-center justify-center">
                  <Lock size={12} className="text-pink-300" />
                </div>
              ) : (
                <button className="py-1.5 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-xs rounded transition shadow">
                  {mkt.no || '1.95'}
                </button>
              )}

              {isBettingClosed ? (
                <div className="py-2 bg-[#1e3a5f] rounded border border-blue-500/30 text-blue-200 flex items-center justify-center ml-1">
                  <Lock size={12} className="text-blue-300" />
                </div>
              ) : (
                <button className="py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded transition shadow ml-1">
                  {mkt.yes || '1.95'}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Right: Win With (3 Columns x 2 Rows) */}
        <div className="md:col-span-7 bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg p-2.5">
          <div className="grid grid-cols-3 gap-2">
            {winWithOptions.map((item, wIdx) => {
              const liveR = runners.find(r => (r.name || '').toLowerCase().includes(item.label.toLowerCase()));
              const rate = liveR?.back > 0 ? liveR.back : item.rate;

              return (
                <div key={wIdx} className="bg-[#0c1b29] border border-slate-700/80 rounded p-2 flex flex-col items-center justify-center shadow">
                  <span className="text-[10px] font-bold text-slate-300 mb-1">{item.label}</span>
                  {isBettingClosed ? (
                    <div className="w-full py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                      <Lock size={12} className="text-slate-300" />
                    </div>
                  ) : (
                    <button className="w-full py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded transition shadow">
                      {rate}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
