import React, { useState, useEffect } from 'react';
import { X, Trophy } from 'lucide-react';

/**
 * Deterministically formats match time from mid string so it NEVER drifts or ticks!
 * e.g. 161261124185424 -> 24/11/2026 18:54:24
 */
function getDeterministicMatchTime(mid, fallbackTime) {
  const str = String(mid || '').trim();
  if (/^\d{14,16}$/.test(str)) {
    const y = '20' + str.slice(3, 5);
    const m = str.slice(5, 7);
    const d = str.slice(7, 9);
    const hh = str.slice(9, 11);
    const mm = str.slice(11, 13);
    const ss = str.slice(13, 15);
    const mNum = parseInt(m);
    const dNum = parseInt(d);
    if (mNum >= 1 && mNum <= 12 && dNum >= 1 && dNum <= 31) {
      return `${d}/${m}/${y} ${hh}:${mm}:${ss}`;
    }
  }
  if (fallbackTime && typeof fallbackTime === 'string') return fallbackTime;
  return '24/11/2026 20:00:00';
}

function parseCardCode(code) {
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
  return { rank: rank || '?', suit, isRed, code };
}

export default function ResultDetailModal({ result, gameName, slug, onClose }) {
  if (!result) return null;

  const roundId = String(result.mid || '');
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/casino/round-detail/${slug || 'teen20'}/${roundId}`);
        const json = await res.json();
        if (isMounted && json?.success && json?.data) {
          setDetailData(json.data);
        }
      } catch (e) {
        console.error('Error fetching round detail:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (roundId) fetchDetail();
    return () => { isMounted = false; };
  }, [slug, roundId]);

  const activeTitle = detailData?.ename || gameName || 'Game';
  const displayTime = detailData?.mtime || getDeterministicMatchTime(roundId, result.time || result.mtime);
  const nameLow = (activeTitle + ' ' + (slug || '')).toLowerCase();

  // Flags for game type detection
  const isCricketBall =
    nameLow.includes('lucky 15') ||
    nameLow.includes('lucky15') ||
    nameLow.includes('ball by ball') ||
    nameLow.includes('ballbyball');

  const isBaccarat = nameLow.includes('baccarat');
  const isRace20 = nameLow.includes('race 20') || nameLow.includes('race20');
  const isDusKaDum = nameLow.includes('dus ka dum') || nameLow.includes('dum10');
  const isSuperOver = nameLow.includes('super over') || nameLow.includes('superover');
  const isGoal = nameLow.includes('goal');
  const isAndarBahar = nameLow.includes('andar') || nameLow.includes('ab20') || nameLow.includes('ab3') || nameLow.includes('ab4') || nameLow.includes('ab150');
  const isOneCard = nameLow.includes('1 card') || nameLow.includes('one card') || nameLow.includes('1card') || nameLow.includes('kbc');
  const isPoker = nameLow.includes('poker');

  // Dealt cards helper
  const renderCardGraphic = (card, idx, size = 'normal') => {
    if (!card) return null;
    const isSmall = size === 'small';
    return (
      <div
        key={idx}
        className={`${
          isSmall ? 'w-6 h-9 p-0.5' : 'w-8 h-12 p-0.5'
        } bg-white border border-slate-900 rounded shadow flex flex-col justify-between select-none font-bold`}
      >
        <div className={`${isSmall ? 'text-[8px]' : 'text-[10px]'} font-black leading-none ${card.isRed ? 'text-red-600' : 'text-slate-900'}`}>
          {card.rank}
        </div>
        <div className={`${isSmall ? 'text-xs' : 'text-sm'} leading-none self-center ${card.isRed ? 'text-red-600' : 'text-slate-900'}`}>
          {card.suit}
        </div>
        <div className={`${isSmall ? 'text-[7px]' : 'text-[8px]'} font-black leading-none self-end rotate-180 ${card.isRed ? 'text-red-600' : 'text-slate-900'}`}>
          {card.rank}
        </div>
      </div>
    );
  };

  // Cricket ball outcome text
  let cricketOutcome = (detailData?.rdesc || result.winner || result.nat || '').trim();
  if (!cricketOutcome || cricketOutcome === '1' || cricketOutcome === '0') cricketOutcome = '0 RUN';
  else if (cricketOutcome === '2') cricketOutcome = '1 RUN';
  else if (cricketOutcome === '3') cricketOutcome = '2 RUNS';
  else if (cricketOutcome === '4') cricketOutcome = '4 RUNS';
  else if (cricketOutcome === '5' || cricketOutcome === '6') cricketOutcome = '6 RUNS';
  else if (cricketOutcome.toLowerCase().includes('w')) cricketOutcome = 'WICKET';
  else cricketOutcome = cricketOutcome.toUpperCase();

  // Cards array parsing
  const cardCodes = (detailData?.card || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const parsedCards = cardCodes.map(c => parseCardCode(c)).filter(Boolean);

  // Outcome split by '#'
  const descParts = (detailData?.rdesc || '').split('#');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in select-none">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden border border-slate-300 text-slate-900">
        {/* Blue Title Header Bar */}
        <div className="bg-[#2b73af] text-white px-4 py-2.5 flex justify-between items-center">
          <h3 className="font-bold text-sm tracking-wide">{activeTitle} Result</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded transition text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Subheader: Round Id & Match Time */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
          <div>Round Id: <span className="font-mono text-slate-900">{detailData?.rid || roundId}</span></div>
          <div>Match Time: <span className="font-mono text-slate-900">{displayTime}</span></div>
        </div>

        {/* Dynamic Content based on Game Type */}
        <div className="p-6 flex flex-col items-center justify-center min-h-[160px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-500 text-xs font-bold">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Loading authentic round details...</span>
            </div>
          ) : isCricketBall ? (
            /* 1. CRICKET BALL POPUP (Lucky 15 & Ball By Ball) (Image 1 Exact Match) */
            <div className="flex flex-col items-center justify-center py-2 animate-in zoom-in-95 duration-200">
              <div className="relative w-36 h-36 rounded-full flex items-center justify-center shadow-2xl overflow-hidden border-2 border-red-900 bg-gradient-to-br from-red-600 via-red-800 to-red-950">
                <div className="absolute top-2 left-4 w-12 h-8 rounded-full bg-white/30 blur-sm pointer-events-none transform -rotate-12"></div>
                <div className="absolute inset-y-0 w-8 border-x-2 border-dashed border-white/60 pointer-events-none transform rotate-12"></div>
                <span className="relative z-10 font-mono font-black text-xl text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wider px-2">
                  {cricketOutcome}
                </span>
              </div>
            </div>
          ) : isBaccarat ? (
            /* 2. BACCARAT & BACCARAT 2 POPUP (Image 3 Exact Match) */
            <div className="flex flex-col items-center gap-4 w-full">
              {/* Player vs Banker Columns */}
              <div className="grid grid-cols-2 gap-4 w-full">
                {/* Player Column */}
                <div className="flex flex-col items-center gap-2 p-3 bg-blue-50/60 border border-blue-200 rounded-lg shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs font-black text-blue-900 uppercase">
                    <span>Player</span>
                    {(detailData?.win === '1' || (detailData?.winnat || '').toLowerCase().includes('player')) && (
                      <Trophy size={15} className="text-amber-500 fill-amber-500" />
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    {[parsedCards[0], parsedCards[2], parsedCards[4]].filter(Boolean).map((c, i) => renderCardGraphic(c, i))}
                  </div>
                </div>

                {/* Banker Column */}
                <div className="flex flex-col items-center gap-2 p-3 bg-red-50/60 border border-red-200 rounded-lg shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs font-black text-red-900 uppercase">
                    <span>Banker</span>
                    {(detailData?.win === '2' || (detailData?.winnat || '').toLowerCase().includes('banker')) && (
                      <Trophy size={15} className="text-amber-500 fill-amber-500" />
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    {[parsedCards[1], parsedCards[3], parsedCards[5]].filter(Boolean).map((c, i) => renderCardGraphic(c, i))}
                  </div>
                </div>
              </div>

              {/* Center Summary Box */}
              <div className="w-full max-w-xs bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs space-y-1.5 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-600">Winner:</span>
                  <span className="font-black text-blue-700">{descParts[0] || detailData?.winnat || 'Player'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                  <span className="font-bold text-slate-600">Winner Pair:</span>
                  <span className="font-black text-slate-800">{descParts[1] || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-600">Score:</span>
                  <span className="font-black text-emerald-700 font-mono text-sm">{descParts[2] || '-'}</span>
                </div>
              </div>
            </div>
          ) : isRace20 ? (
            /* 3. RACE 20 POPUP (Image 5 Exact Match) */
            <div className="flex flex-col items-center gap-3 w-full">
              {/* Winner Header Box */}
              <div className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase">Winning King</div>
                <div className="text-lg font-black text-slate-900 mt-0.5 flex items-center justify-center gap-2">
                  <span>{detailData?.winnat || descParts[0] || 'K of Spade'}</span>
                  <Trophy size={16} className="text-amber-500 fill-amber-500" />
                </div>
                <div className="flex justify-center gap-4 text-xs font-bold text-slate-700 mt-1">
                  <span>Points: <span className="text-blue-600 font-mono font-black">{descParts[1] || '-'}</span></span>
                  <span>Cards: <span className="text-emerald-600 font-mono font-black">{descParts[2] || parsedCards.length}</span></span>
                </div>
              </div>

              {/* 4 Suit Rows */}
              <div className="w-full space-y-1.5 bg-slate-50 border border-slate-300 rounded-lg p-3">
                {['♠', '♥', '♣', '♦'].map((sIcon) => {
                  const sCards = parsedCards.filter(c => c.suit === sIcon);
                  const isRed = ['♥', '♦'].includes(sIcon);
                  return (
                    <div key={sIcon} className="flex items-center gap-2">
                      <span className={`text-base font-black w-4 text-center ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                        {sIcon}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {sCards.length > 0 ? (
                          sCards.map((c, i) => renderCardGraphic(c, i, 'small'))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No cards</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : isDusKaDum ? (
            /* 4. DUS KA DUM POPUP */
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase">Outcome</div>
                <div className="text-sm font-black text-slate-900 mt-1">
                  {detailData?.rdesc || detailData?.winnat || 'Yes'}
                </div>
              </div>
              <div className="w-full flex flex-wrap gap-1.5 justify-center bg-slate-50 border border-slate-300 rounded-lg p-3">
                {parsedCards.map((c, i) => renderCardGraphic(c, i, 'small'))}
              </div>
            </div>
          ) : isGoal ? (
            /* 5. GOAL POPUP */
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="text-5xl animate-bounce">⚽</div>
              <div className="border border-slate-300 rounded-lg px-6 py-2.5 bg-slate-50 text-center shadow-sm">
                <div className="text-xs text-slate-500 font-bold uppercase">Scorer & Shot</div>
                <div className="text-base font-black text-slate-900 mt-0.5">
                  {detailData?.rdesc || detailData?.winnat || 'Shot Goal'}
                </div>
              </div>
            </div>
          ) : isSuperOver ? (
            /* 6. SUPER OVER POPUP */
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="px-8 py-3 bg-emerald-50 border-2 border-emerald-500 rounded-lg text-center shadow">
                <div className="text-xs font-bold text-slate-600 uppercase mb-1">Match Winner</div>
                <div className="text-2xl font-black text-emerald-800 tracking-wider">
                  {detailData?.winnat || detailData?.rdesc || result.winner || 'IND'}
                </div>
              </div>
            </div>
          ) : isOneCard ? (
            /* 7. ONE CARD POPUP */
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="grid grid-cols-2 gap-6 w-full max-w-xs">
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-slate-50 border">
                  <div className="flex items-center gap-1 text-xs font-black text-slate-800">
                    <span>PLAYER</span>
                    {(detailData?.win === '1' || (detailData?.winnat || '').includes('Player')) && (
                      <Trophy size={14} className="text-amber-500" />
                    )}
                  </div>
                  {renderCardGraphic(parsedCards[0] || parseCardCode('9SS'), 0)}
                </div>
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-slate-50 border">
                  <div className="flex items-center gap-1 text-xs font-black text-slate-800">
                    <span>DEALER</span>
                    {(detailData?.win === '2' || (detailData?.winnat || '').includes('Dealer')) && (
                      <Trophy size={14} className="text-amber-500" />
                    )}
                  </div>
                  {renderCardGraphic(parsedCards[1] || parseCardCode('4DD'), 1)}
                </div>
              </div>
              <div className="border border-slate-300 rounded px-6 py-2 bg-slate-50 text-center text-xs font-bold text-slate-800 shadow-sm">
                Winner: <span className="font-black text-blue-600">{detailData?.winnat || (detailData?.win === '1' ? 'Player' : 'Dealer')}</span>
              </div>
            </div>
          ) : isAndarBahar ? (
            /* 8. ANDAR BAHAR POPUP */
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="flex flex-col items-center gap-1 p-2 bg-amber-50 border border-amber-300 rounded">
                <span className="text-xs font-black text-amber-800">OPENING CARD</span>
                {renderCardGraphic(parsedCards[0] || parseCardCode('8HH'), 0)}
              </div>
              <div className="border border-slate-300 rounded px-6 py-2 bg-slate-50 text-center text-xs font-bold text-slate-800 shadow-sm">
                Winner: <span className="font-black text-emerald-700">{detailData?.winnat || 'Andar'}</span>
              </div>
            </div>
          ) : (
            /* 9. TEEN PATTI & 20-20 & POKER POPUP */
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-slate-50 border shadow-sm">
                  <div className="flex items-center gap-1 text-xs font-black text-slate-800">
                    <span>Player A</span>
                    {(detailData?.win === '1' || (detailData?.winnat || '').includes('A')) && (
                      <Trophy size={14} className="text-amber-500 fill-amber-500" />
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    {[parsedCards[0], parsedCards[1], parsedCards[2]].filter(Boolean).map((c, i) => renderCardGraphic(c, i))}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-slate-50 border shadow-sm">
                  <div className="flex items-center gap-1 text-xs font-black text-slate-800">
                    <span>Player B</span>
                    {(detailData?.win === '2' || (detailData?.winnat || '').includes('B')) && (
                      <Trophy size={14} className="text-amber-500 fill-amber-500" />
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    {[parsedCards[3], parsedCards[4], parsedCards[5]].filter(Boolean).map((c, i) => renderCardGraphic(c, i))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-center text-xs space-y-1 font-mono text-slate-700 w-full shadow-sm">
                <div className="font-bold text-slate-900">
                  Winner: <span className="text-blue-600 font-black">{detailData?.winnat || descParts[0] || (detailData?.win === '1' ? 'Player A' : 'Player B')}</span>
                </div>
                {descParts[1] && (
                  <div className="text-[11px] text-slate-500">
                    Combination: <span className="font-bold text-slate-800">{descParts[1]}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}