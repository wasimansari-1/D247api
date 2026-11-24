import React, { useState, useEffect } from 'react';
import { X, Trophy } from 'lucide-react';

function parseRace20Card(code) {
  if (!code || code === '1' || code === '?') return null;
  const upper = String(code).toUpperCase().trim();
  let suit = '♠';
  let isRed = false;
  let rank = upper;

  if (upper.endsWith('HH') || upper.endsWith('H')) {
    suit = '♥';
    isRed = true;
    rank = upper.replace(/H+$/, '');
  } else if (upper.endsWith('DD') || upper.endsWith('D')) {
    suit = '♦';
    isRed = true;
    rank = upper.replace(/D+$/, '');
  } else if (upper.endsWith('CC') || upper.endsWith('C')) {
    suit = '♣';
    isRed = false;
    rank = upper.replace(/C+$/, '');
  } else if (upper.endsWith('SS') || upper.endsWith('S')) {
    suit = '♠';
    isRed = false;
    rank = upper.replace(/S+$/, '');
  }
  return { rank: rank || '?', suit, isRed, color: isRed ? 'text-red-600' : 'text-slate-900' };
}

export default function Race20ResultModal({ result, onClose }) {
  if (!result) return null;

  const mid = String(result.mid || '');
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/casino/round-detail/race20/${mid}`);
        const json = await res.json();
        if (isMounted && json?.success && json?.data) {
          setDetailData(json.data);
        }
      } catch (e) {
        console.error('Error fetching Race 20 detail:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (mid) fetchDetail();
    return () => { isMounted = false; };
  }, [mid]);

  const matchTime = detailData?.mtime || result.matchTime || result.time || new Date().toLocaleString('en-GB');
  const win = String(detailData?.win || result.win || result.winner || '1');
  const descParts = (detailData?.rdesc || '').split('#');

  // Map winner suit: 1: Spade, 2: Heart, 3: Club, 4: Diamond
  let winnerSuit = '♠';
  let winnerName = detailData?.winnat || descParts[0] || 'K Spade';
  let winnerColor = 'text-slate-900';

  const wStr = String(detailData?.winnat || result.nat || win).toLowerCase();
  if (win === '1' || wStr.includes('spade')) {
    winnerSuit = '♠';
    winnerName = 'K Spade';
    winnerColor = 'text-slate-900';
  } else if (win === '2' || wStr.includes('heart')) {
    winnerSuit = '♥';
    winnerName = 'K Heart';
    winnerColor = 'text-red-600';
  } else if (win === '3' || wStr.includes('club')) {
    winnerSuit = '♣';
    winnerName = 'K Club';
    winnerColor = 'text-slate-900';
  } else if (win === '4' || wStr.includes('diamond')) {
    winnerSuit = '♦';
    winnerName = 'K Diamond';
    winnerColor = 'text-red-600';
  }

  // Dealt cards from live upstream
  const rawCards = (detailData?.card || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const parsedCards = rawCards.map(c => parseRace20Card(c)).filter(Boolean);

  const suitCards = {
    '♠': parsedCards.filter(c => c.suit === '♠'),
    '♥': parsedCards.filter(c => c.suit === '♥'),
    '♣': parsedCards.filter(c => c.suit === '♣'),
    '♦': parsedCards.filter(c => c.suit === '♦')
  };

  const suits = [
    { icon: '♠', color: 'text-slate-900', key: '♠' },
    { icon: '♥', color: 'text-red-600', key: '♥' },
    { icon: '♣', color: 'text-slate-900', key: '♣' },
    { icon: '♦', color: 'text-red-600', key: '♦' }
  ];

  const totalPoints = descParts[1] || result.points || 84;
  const totalCards = descParts[2] || result.cardsCount || parsedCards.length || 14;

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
          <div>Round Id: <span className="font-mono text-slate-900">{detailData?.rid || mid}</span></div>
          <div>Match Time: <span className="font-mono text-slate-900">{matchTime}</span></div>
        </div>

        {loading ? (
          <div className="p-8 flex flex-col items-center justify-center gap-2 text-slate-500 text-xs font-bold">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading authentic Race 20 round details...</span>
          </div>
        ) : (
          <>
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
                      {cards.length > 0 ? (
                        cards.map((c, cIdx) => (
                          <div
                            key={cIdx}
                            className="w-7 h-10 bg-white border border-slate-400 rounded shadow-sm flex flex-col items-center justify-center text-[11px] font-black"
                          >
                            <span className={`leading-none ${c.color}`}>{c.rank}</span>
                            <span className={`leading-none text-[13px] ${c.color}`}>{c.suit}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No cards</span>
                      )}
                    </div>

                    {/* WINNER Banner + Trophy (Only for winning suit) */}
                    {isWinner && (
                      <div className="flex items-center gap-2 ml-auto shrink-0">
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
          </>
        )}
      </div>
    </div>
  );
}