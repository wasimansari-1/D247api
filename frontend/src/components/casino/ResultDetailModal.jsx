import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCardImgSrc } from '../../utils/cardUtils';

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

  const isCMatch20 =
    nameLow.includes('cricket match 20') ||
    nameLow.includes('cmatch') ||
    slug === 'cmatch20';

  const isBaccarat = nameLow.includes('baccarat');
  const isRace20 = nameLow.includes('race 20') || nameLow.includes('race20');
  const isDusKaDum = nameLow.includes('dus ka dum') || nameLow.includes('dum10');
  const isSuperOver = nameLow.includes('super over') || nameLow.includes('superover');
  const isGoal = nameLow.includes('goal');
  const isAndarBahar = nameLow.includes('andar') || nameLow.includes('ab20') || nameLow.includes('ab3') || nameLow.includes('ab4') || nameLow.includes('ab150');
  const isOneCard = nameLow.includes('1 card') || nameLow.includes('one card') || nameLow.includes('1card') || nameLow.includes('kbc');
  const isPoker = nameLow.includes('poker');
  const isQueen = (slug === 'queen' || nameLow === 'queen' || nameLow.includes('queen')) && !slug?.includes('queentop') && !nameLow.includes('queen top');
  const isLottery = slug === 'lottcard' || nameLow.includes('lottery') || nameLow.includes('lott');

  const andarScrollRef = useRef(null);
  const baharScrollRef = useRef(null);

  // Dealt cards helper using authentic /cards/*.webp
  const renderCardGraphic = (card, idx, size = 'normal') => {
    if (!card) return null;
    const imgSrc = getCardImgSrc(card);
    const sizeClasses =
      size === 'small'
        ? 'w-6 h-9'
        : size === 'large'
        ? 'w-10 h-14'
        : 'w-8 h-12';

    return (
      <div
        key={idx}
        className={`${sizeClasses} bg-white border border-slate-700 rounded overflow-hidden shadow-sm flex items-center justify-center shrink-0 select-none`}
      >
        <img
          src={imgSrc}
          alt={card.code || 'Card'}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/cards/back.webp';
          }}
        />
      </div>
    );
  };

  // Cricket ball outcome text
  let cricketOutcome = (detailData?.win || detailData?.rdesc || result.winner || result.nat || '').trim();
  const coLow = cricketOutcome.toLowerCase();
  if (!coLow || coLow === '0' || coLow === '1' || coLow === '0 run' || coLow.includes('zero')) cricketOutcome = '0 RUN';
  else if (coLow === '2' || coLow === '1 run' || coLow.includes('one')) cricketOutcome = '1 RUN';
  else if (coLow === '3' || coLow === '2 run' || coLow === '2 runs' || coLow.includes('two')) cricketOutcome = '2 RUN';
  else if (coLow === '4' || coLow === '4 run' || coLow === '4 runs' || coLow.includes('four')) cricketOutcome = '4 RUN';
  else if (coLow === '5' || coLow === '6' || coLow === '6 run' || coLow === '6 runs' || coLow.includes('six')) cricketOutcome = '6 RUN';
  else if (coLow.includes('w') || coLow.includes('wick')) cricketOutcome = 'WICKET';
  else if (!isNaN(cricketOutcome)) cricketOutcome = `${cricketOutcome} RUN`;
  else cricketOutcome = cricketOutcome.toUpperCase();

  // Cards array parsing
  const cardCodes = (detailData?.card || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const parsedCards = cardCodes.map(c => parseCardCode(c)).filter(Boolean);

  // Andar Bahar cards parsing (Card 0 = Opening / Joker, Alternate = Bahar, Andar...)
  const { andarCards, baharCards } = useMemo(() => {
    const a = [];
    const b = [];
    for (let i = 1; i < parsedCards.length; i++) {
      if (i % 2 === 1) {
        b.push(parsedCards[i]);
      } else {
        a.push(parsedCards[i]);
      }
    }
    if (a.length === 0 && b.length === 0 && parsedCards.length > 0) {
      b.push(parsedCards[0]);
    }
    return { andarCards: a, baharCards: b };
  }, [parsedCards]);

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
            /* 1. CRICKET BALL POPUP (Lucky 15 & Ball By Ball) (Image 6 Right Exact Match) */
            <div className="flex flex-col items-center justify-center py-4 animate-in zoom-in-95 duration-200">
              <div className="relative w-36 h-36 flex items-center justify-center select-none filter drop-shadow-xl">
                <svg viewBox="0 0 140 140" className="w-full h-full">
                  <defs>
                    <radialGradient id="cricketBallGrad" cx="35%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="45%" stopColor="#b91c1c" />
                      <stop offset="85%" stopColor="#7f1d1d" />
                      <stop offset="100%" stopColor="#450a0a" />
                    </radialGradient>
                    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.8"/>
                    </filter>
                  </defs>

                  {/* Ball Body */}
                  <circle cx="70" cy="70" r="66" fill="url(#cricketBallGrad)" stroke="#450a0a" strokeWidth="1.5" />

                  {/* Top-Left Gloss Highlight */}
                  <ellipse cx="48" cy="35" rx="22" ry="12" fill="white" opacity="0.15" transform="rotate(-20 48 35)" />

                  {/* Horizontal Curved Seam with White Stitches */}
                  <path d="M 6 70 Q 70 82 134 70" fill="none" stroke="#ffffff" strokeWidth="2.5" opacity="0.85" />
                  <path d="M 6 70 Q 70 82 134 70" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.95" />

                  {/* Cross-stitches along the seam */}
                  {[16, 26, 36, 46, 56, 66, 76, 86, 96, 106, 116, 124].map((x) => {
                    // Approximate y on quadratic curve y = 70 + 12 * (1 - ((x-70)/64)^2)
                    const norm = (x - 70) / 64;
                    const y = 70 + 12 * (1 - norm * norm);
                    return (
                      <g key={x} opacity="0.75">
                        <line x1={x - 2} y1={y - 4} x2={x + 2} y2={y + 4} stroke="#ffffff" strokeWidth="1" />
                        <line x1={x - 2} y1={y + 4} x2={x + 2} y2={y - 4} stroke="#ffffff" strokeWidth="1" />
                      </g>
                    );
                  })}

                  {/* Centered Outcome Text (0 RUN, 1 RUN, 2 RUN, 4 RUN, 6 RUN, WICKET) */}
                  <text
                    x="70"
                    y="76"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="18"
                    fontWeight="900"
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                    letterSpacing="0.05em"
                    filter="url(#shadow)"
                  >
                    {cricketOutcome}
                  </text>
                </svg>
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
          ) : isQueen ? (
            /* QUEEN POPUP */
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase">Winning Total</div>
                <div className="text-lg font-black text-emerald-700 mt-0.5 flex items-center justify-center gap-2">
                  <span>{detailData?.winnat || descParts[0] || 'Total 0'}</span>
                  <Trophy size={18} className="text-amber-500 fill-amber-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                {[0, 1, 2, 3].map((gIdx) => {
                  const grpCards = parsedCards.filter((_, idx) => idx % 4 === gIdx);
                  const isWinner = (detailData?.win === String(gIdx + 1)) || (detailData?.winnat || '').includes(`Total ${gIdx}`);
                  return (
                    <div key={gIdx} className={`p-2 rounded border flex flex-col items-center gap-1 ${isWinner ? 'bg-emerald-50 border-emerald-400' : 'bg-slate-50 border-slate-200'}`}>
                      <span className={`text-[11px] font-black ${isWinner ? 'text-emerald-800' : 'text-slate-700'}`}>
                        Total {gIdx}
                      </span>
                      <div className="flex flex-wrap gap-1 justify-center">
                        {grpCards.map((c, cIdx) => renderCardGraphic(c, cIdx, 'small'))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : isLottery ? (
            /* LOTTERY POPUP */
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-center shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase">Winning Lottery Number</div>
                <div className="text-2xl font-black text-slate-900 font-mono tracking-widest mt-1">
                  {String(detailData?.rdesc || result.winner || '0 0 0').replace(/\s+/g, ' ')}
                </div>
              </div>
              <div className="flex gap-2 justify-center p-3 bg-slate-50 border border-slate-300 rounded-lg w-full">
                {parsedCards.slice(0, 3).map((c, i) => renderCardGraphic(c, i))}
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
            /* 8. ANDAR BAHAR RESULT POPUP (Image 10 Right Exact Match) */
            <div className="flex flex-col gap-3 w-full px-2 py-1 select-none">
              {/* Row 1: Andar */}
              <div className="flex flex-col gap-1 w-full">
                <span className="text-xs font-black text-slate-800 text-center uppercase tracking-wide">
                  Andar
                </span>
                <div className="flex items-center gap-1 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      if (andarScrollRef.current) {
                        andarScrollRef.current.scrollBy({ left: -120, behavior: 'smooth' });
                      }
                    }}
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 shadow-sm shrink-0 active:scale-95 transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div
                    ref={andarScrollRef}
                    className="flex-1 flex gap-1.5 overflow-x-auto py-1 px-1 scrollbar-none items-center"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {andarCards.length > 0 ? (
                      andarCards.map((c, i) => renderCardGraphic(c, `ab-res-a-${i}`, 'normal'))
                    ) : (
                      <span className="text-xs text-slate-400 italic mx-auto">No cards dealt</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (andarScrollRef.current) {
                        andarScrollRef.current.scrollBy({ left: 120, behavior: 'smooth' });
                      }
                    }}
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 shadow-sm shrink-0 active:scale-95 transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Row 2: Bahar */}
              <div className="flex flex-col gap-1 w-full border-t border-slate-200 pt-2">
                <span className="text-xs font-black text-slate-800 text-center uppercase tracking-wide">
                  Bahar
                </span>
                <div className="flex items-center gap-1 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      if (baharScrollRef.current) {
                        baharScrollRef.current.scrollBy({ left: -120, behavior: 'smooth' });
                      }
                    }}
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 shadow-sm shrink-0 active:scale-95 transition"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div
                    ref={baharScrollRef}
                    className="flex-1 flex gap-1.5 overflow-x-auto py-1 px-1 scrollbar-none items-center"
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {baharCards.length > 0 ? (
                      baharCards.map((c, i) => renderCardGraphic(c, `ab-res-b-${i}`, 'normal'))
                    ) : (
                      <span className="text-xs text-slate-400 italic mx-auto">No cards dealt</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (baharScrollRef.current) {
                        baharScrollRef.current.scrollBy({ left: 120, behavior: 'smooth' });
                      }
                    }}
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 shadow-sm shrink-0 active:scale-95 transition"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ) : isCMatch20 ? (
            /* CRICKET MATCH 20-20 POPUP (Winning Runs & Single Card - NEVER Player A/B) */
            <div className="flex flex-col items-center gap-3 w-full py-3 select-none">
              <div className="flex items-center justify-center gap-6">
                {parsedCards[0] && renderCardGraphic(parsedCards[0], 'cm-card', 'large')}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-600 via-rose-700 to-red-950 border-4 border-white shadow-2xl flex flex-col items-center justify-center text-white ring-2 ring-red-900 drop-shadow-xl">
                  <span className="text-xl font-black font-mono tracking-wider drop-shadow text-center">
                    {detailData?.winnat || cricketOutcome || '2 RUNS'}
                  </span>
                </div>
              </div>
              <div className="border border-slate-300 rounded px-6 py-2 bg-slate-50 text-center text-xs font-bold text-slate-800 shadow-sm mt-1">
                Winning Outcome: <span className="font-black text-emerald-700">{detailData?.winnat || cricketOutcome}</span>
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
