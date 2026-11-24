import React, { useState } from 'react';
import { Lock, ChevronDown, ChevronUp } from 'lucide-react';

export default function Poker1DayBoard({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];
  const [showRules, setShowRules] = useState(true);

  const playerA = runners.find(r => (r.name || '').toLowerCase() === 'player a') || {
    name: 'Player A',
    back: 1.98,
    lay: 0
  };
  const playerB = runners.find(r => (r.name || '').toLowerCase() === 'player b') || {
    name: 'Player B',
    back: 1.98,
    lay: 0
  };

  const a2Bonus = runners.find(r => (r.name || '').toLowerCase().includes('a 2 card') || (r.name || '').toLowerCase().includes('player a 2'));
  const a7Bonus = runners.find(r => (r.name || '').toLowerCase().includes('a 7 card') || (r.name || '').toLowerCase().includes('player a 7'));
  const b2Bonus = runners.find(r => (r.name || '').toLowerCase().includes('b 2 card') || (r.name || '').toLowerCase().includes('player b 2'));
  const b7Bonus = runners.find(r => (r.name || '').toLowerCase().includes('b 7 card') || (r.name || '').toLowerCase().includes('player b 7'));

  const bonus1Rules = [
    { hand: 'Pair (2-10)', payout: '1 TO 3' },
    { hand: 'A/Q or A/J Off Suited', payout: '1 TO 5' },
    { hand: 'Pair (JQK)', payout: '1 TO 10' },
    { hand: 'A/K Off Suited', payout: '1 TO 15' },
    { hand: 'A/Q or A/J Suited', payout: '1 TO 20' },
    { hand: 'A/K Suited', payout: '1 TO 25' },
    { hand: 'A/A', payout: '1 TO 30' }
  ];

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* 1. Main Match Odds: Player A vs Player B */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Player A Box */}
        <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
          <div className="flex items-center justify-between p-2.5 px-3 border-b border-slate-800">
            <span className="font-black text-sm text-white">Player A</span>
            <div className="flex items-center gap-1">
              {isSuspended ? (
                <div className="w-16 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                  <Lock size={12} className="text-slate-300" />
                </div>
              ) : (
                <button className="w-16 py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded transition shadow">
                  {playerA.back || '1.98'}
                </button>
              )}
              {isSuspended ? (
                <div className="w-16 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center ml-1">
                  <Lock size={12} className="text-slate-300" />
                </div>
              ) : (
                <button className="w-16 py-1.5 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-xs rounded transition shadow ml-1">
                  {playerA.lay || '0'}
                </button>
              )}
            </div>
          </div>

          {/* Player A Side Bets: 2 Cards Bonus & 7 Cards Bonus */}
          <div className="grid grid-cols-2 p-2 gap-2 bg-[#0c1b29]">
            <button className="py-2 px-2 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-bold text-xs rounded transition shadow active:scale-95 truncate">
              {a2Bonus?.back ? `2 Cards: ${a2Bonus.back}` : '2 Cards Bonus'}
            </button>
            <button className="py-2 px-2 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-bold text-xs rounded transition shadow active:scale-95 truncate">
              {a7Bonus?.back ? `7 Cards: ${a7Bonus.back}` : '7 Cards Bonus'}
            </button>
          </div>
        </div>

        {/* Player B Box */}
        <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
          <div className="flex items-center justify-between p-2.5 px-3 border-b border-slate-800">
            <span className="font-black text-sm text-white">Player B</span>
            <div className="flex items-center gap-1">
              {isSuspended ? (
                <div className="w-16 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                  <Lock size={12} className="text-slate-300" />
                </div>
              ) : (
                <button className="w-16 py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded transition shadow">
                  {playerB.back || '1.98'}
                </button>
              )}
              {isSuspended ? (
                <div className="w-16 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center ml-1">
                  <Lock size={12} className="text-slate-300" />
                </div>
              ) : (
                <button className="w-16 py-1.5 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-xs rounded transition shadow ml-1">
                  {playerB.lay || '0'}
                </button>
              )}
            </div>
          </div>

          {/* Player B Side Bets: 2 Cards Bonus & 7 Cards Bonus */}
          <div className="grid grid-cols-2 p-2 gap-2 bg-[#0c1b29]">
            <button className="py-2 px-2 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-bold text-xs rounded transition shadow active:scale-95 truncate">
              {b2Bonus?.back ? `2 Cards: ${b2Bonus.back}` : '2 Cards Bonus'}
            </button>
            <button className="py-2 px-2 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-bold text-xs rounded transition shadow active:scale-95 truncate">
              {b7Bonus?.back ? `7 Cards: ${b7Bonus.back}` : '7 Cards Bonus'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Promo Banner (Image 3 Exact Match) */}
      <div className="py-2 px-4 rounded-lg bg-emerald-700 text-white font-extrabold text-xs text-center shadow tracking-wide">
        Play Our New Game Premium Teenpatti 1 Day
      </div>

      {/* 3. Rules Table Accordion (Image 3 Exact Match) */}
      <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
        <button
          onClick={() => setShowRules(!showRules)}
          className="w-full bg-[#1e3a5f] hover:bg-[#254673] px-3 py-2 flex items-center justify-between text-white font-black text-xs transition"
        >
          <span>Rules - Bonus 1 (2 Cards Bonus)</span>
          {showRules ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showRules && (
          <div className="flex flex-col divide-y divide-slate-800 text-xs">
            {bonus1Rules.map((rule, idx) => (
              <div key={idx} className="flex justify-between items-center py-1.5 px-4 text-slate-300 hover:bg-slate-800/40 font-mono">
                <span>{rule.hand}</span>
                <span className="font-bold text-amber-400">{rule.payout}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
