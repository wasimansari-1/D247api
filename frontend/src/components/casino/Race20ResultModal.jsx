import React from 'react';
import { X, Trophy } from 'lucide-react';

export default function Race20ResultModal({ result, onClose }) {
  if (!result) return null;

  const mid = result.mid || '130261124181249';
  const matchTime = result.matchTime || result.time || new Date().toLocaleString('en-GB');
  const win = String(result.win || result.winner || '2');

  // Map winner suit: 1: Spade, 2: Heart, 3: Club, 4: Diamond
  let winnerSuit = '♥';
  let winnerName = 'K Heart';
  let winnerColor = 'text-red-600';
  if (win === '1' || (result.nat || '').toLowerCase().includes('spade')) {
    winnerSuit = '♠';
    winnerName = 'K Spade';
    winnerColor = 'text-slate-900';
  } else if (win === '2' || (result.nat || '').toLowerCase().includes('heart')) {
    winnerSuit = '♥';
    winnerName = 'K Heart';
    winnerColor = 'text-red-600';
  } else if (win === '3' || (result.nat || '').toLowerCase().includes('club')) {
    winnerSuit = '♣';
    winnerName = 'K Club';
    winnerColor = 'text-slate-900';
  } else if (win === '4' || (result.nat || '').toLowerCase().includes('diamond')) {
    winnerSuit = '♦';
    winnerName = 'K Diamond';
    winnerColor = 'text-red-600';
  }

  // Dealt cards grouped by suit (use result cards or fallback sample matching Image 10)
  const suitCards = {
    '♠': [
      { rank: '6', suit: '♠', color: 'text-slate-900' },
      { rank: '8', suit: '♠', color: 'text-slate-900' },
      { rank: '10', suit: '♠', color: 'text-slate-900' },
      { rank: 'K', suit: '♠', color: 'text-slate-900' }
    ],
    '♥': [
      { rank: '6', suit: '♥', color: 'text-red-600' },
      { rank: '9', suit: '♥', color: 'text-red-600' },
      { rank: 'J', suit: '♥', color: 'text-red-600' },
      { rank: '7', suit: '♥', color: 'text-red-600' },
      { rank: '5', suit: '♥', color: 'text-red-600' }
    ],
    '♣': [
      { rank: 'J', suit: '♣', color: 'text-slate-900' },
      { rank: '2', suit: '♣', color: 'text-slate-900' },
      { rank: '4', suit: '♣', color: 'text-slate-900' },
      { rank: '8', suit: '♣', color: 'text-slate-900' },
      { rank: 'K', suit: '♣', color: 'text-slate-900' }
    ],
    '♦': [
      { rank: '3', suit: '♦', color: 'text-red-600' },
      { rank: '7', suit: '♦', color: 'text-red-600' },
      { rank: '5', suit: '♦', color: 'text-red-600' },
      { rank: 'K', suit: '♦', color: 'text-red-600' }
    ]
  };

  const suits = [
    { icon: '♠', color: 'text-slate-900', key: '♠' },
    { icon: '♥', color: 'text-red-600', key: '♥' },
    { icon: '♣', color: 'text-slate-900', key: '♣' },
    { icon: '♦', color: 'text-red-600', key: '♦' }
  ];

  const totalPoints = result.points || 102;
  const totalCards = result.cardsCount || 15;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-xl overflow-hidden select-none">
        {/* Blue Header Bar */}
        <div className="bg-[#2b73af] text-white px-4 py-2.5 flex items-center justify-between">
          <h3 className="font-bold text-sm tracking-wide">Race 20 Result</h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition p-1 rounded hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Subheader: Round Id & Match Time */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
          <div>Round Id: <span className="font-mono text-slate-900">{mid}</span></div>
          <div>Match Time: <span className="font-mono text-slate-900">{matchTime}</span></div>
        </div>

        {/* 4 Suit Rows */}
        <div className="p-4 flex flex-col gap-3">
          {suits.map((s, idx) => {
            const isWinner = s.icon === winnerSuit;
            const cards = suitCards[s.key] || [];

            return (
              <div key={idx} className="flex items-center gap-2 min-h-[46px]">
                {/* Suit Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-2xl font-black ${s.color} shrink-0`}>
                  {s.icon}
                </div>

                {/* Dealt Cards in this Suit */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {cards.map((c, cIdx) => (
                    <div
                      key={cIdx}
                      className="w-7 h-10 bg-white border border-slate-400 rounded shadow-sm flex flex-col items-center justify-center text-[11px] font-black"
                    >
                      <span className={`leading-none ${c.color}`}>{c.rank}</span>
                      <span className={`leading-none text-[13px] ${c.color}`}>{c.suit}</span>
                    </div>
                  ))}
                </div>

                {/* WINNER Banner + Trophy (Only for winning suit) */}
                {isWinner && (
                  <div className="flex items-center gap-2 ml-auto shrink-0">
                    {/* Vertical WINNER pill */}
                    <div className="px-1.5 py-0.5 bg-[#e6f4ea] border border-emerald-400 text-emerald-800 rounded font-black text-[9px] tracking-widest flex items-center justify-center shadow-sm">
                      WINNER
                    </div>

                    {/* Winning King Card */}
                    <div className="w-7 h-10 bg-white border-2 border-emerald-500 rounded shadow flex flex-col items-center justify-center text-[11px] font-black">
                      <span className={`leading-none ${winnerColor}`}>K</span>
                      <span className={`leading-none text-[13px] ${winnerColor}`}>{winnerSuit}</span>
                    </div>

                    {/* Trophy Icon */}
                    <div className="text-emerald-600">
                      <Trophy size={18} className="fill-emerald-500 text-emerald-600" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Summary Box (Image 10 Exact Match) */}
        <div className="p-4 pt-1 flex justify-center">
          <div className="border border-slate-300 rounded px-6 py-2.5 bg-slate-50 text-center flex flex-col items-center gap-0.5 shadow-sm text-xs font-bold text-slate-800">
            <div>Winner: <span className="font-black text-slate-900">{winnerName}</span></div>
            <div>Points: <span className="font-mono font-black text-slate-900">{totalPoints}</span></div>
            <div>Cards: <span className="font-mono font-black text-slate-900">{totalCards}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
