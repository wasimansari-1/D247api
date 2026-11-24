import React from 'react';
import { Lock } from 'lucide-react';
import { getCardImgSrc } from '../../utils/cardUtils';

export default function BaccaratBoard({ roundData, timer, isSuspended, slug }) {
  const runners = roundData?.runners || [];
  const isBettingClosed = isSuspended || timer <= 3;
  const isBaccarat2 = (slug || '').includes('baccarat2') || (roundData?.gameType || '').includes('baccarat2');

  const getRunner = (keyword) => {
    const kLow = keyword.toLowerCase();
    return runners.find(r => (r.name || '').toLowerCase() === kLow || (r.name || '').toLowerCase().includes(kLow));
  };

  const playerRunner = getRunner('player') && !getRunner('player')?.name.toLowerCase().includes('pair') ? getRunner('player') : { back: 1, max: '500,000' };
  const bankerRunner = getRunner('banker') && !getRunner('banker')?.name.toLowerCase().includes('pair') ? getRunner('banker') : { back: 1, max: '500,000' };
  const tieRunner = getRunner('tie') || { back: 8, max: '450,000' };
  const playerPairRunner = runners.find(r => (r.name || '').toLowerCase().includes('player pair')) || { back: 11, max: '450,000' };
  const bankerPairRunner = runners.find(r => (r.name || '').toLowerCase().includes('banker pair')) || { back: 11, max: '450,000' };

  const isRunnerSuspended = (r) => {
    if (isSuspended || timer <= 3) return true;
    if (!r) return true;
    if (r.suspended === true || r.status === 'SUSPENDED') return true;
    if (r.gstatus === 'SUSPENDED' || r.gstatus === '0' || r.gstatus === 0) return true;
    if (r.back === 0) return true;
    return false;
  };

  const isPlayerPairSuspended = isRunnerSuspended(playerPairRunner);
  const isPlayerSuspended = isRunnerSuspended(playerRunner);
  const isTieSuspended = isRunnerSuspended(tieRunner);
  const isBankerSuspended = isRunnerSuspended(bankerRunner);
  const isBankerPairSuspended = isRunnerSuspended(bankerPairRunner);

  // Baccarat 1 side bets
  const perfectPairRunner = getRunner('perfect pair') || { back: 25 };
  const bigRunner = getRunner('big') || { back: 0.54 };
  const smallRunner = getRunner('small') || { back: 1.5 };
  const eitherPairRunner = getRunner('either pair') || { back: 5 };

  // Baccarat 2 side bets
  const score14 = getRunner('score 1-4') || { back: 7.5 };
  const score56 = getRunner('score 5-6') || { back: 4 };
  const score7 = getRunner('score 7') || { back: 4.5 };
  const score8 = getRunner('score 8') || { back: 3 };
  const score9 = getRunner('score 9') || { back: 3.5 };

  // Parse live dealt cards inside Player & Banker buttons (Image 1, 2 & 3 Exact Match)
  const cardStr = roundData?.card || '';
  const cardCodes = cardStr
    ? cardStr.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const parseMiniCard = (code) => {
    if (!code || code === '1' || code === '?') return null;
    const upper = code.toUpperCase().trim();
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
    return { code: upper, rank: rank || '?', suit, isRed };
  };

  // Player cards are at indices 0, 2, 4; Banker at indices 1, 3, 5
  const playerCards = [parseMiniCard(cardCodes[0]), parseMiniCard(cardCodes[2]), parseMiniCard(cardCodes[4])].filter(Boolean);
  const bankerCards = [parseMiniCard(cardCodes[1]), parseMiniCard(cardCodes[3]), parseMiniCard(cardCodes[5])].filter(Boolean);

  const renderMiniCardGraphic = (card, idx) => {
    if (!card) return null;
    const imgSrc = getCardImgSrc(card.code || card);
    return (
      <div
        key={idx}
        className="w-4 h-6 sm:w-5 sm:h-7 rounded-[2px] overflow-hidden shadow border border-slate-900/60 bg-white flex items-center justify-center shrink-0 select-none"
      >
        <img
          src={imgSrc}
          alt="Card"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/cards/1.jpg";
          }}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* Top Section: Statistics Donut on Left & Side-Bet Boxes on Right */}
      <div className="grid grid-cols-12 gap-3">
        {/* Left: Statistics Donut Chart (Image 1 & 2 Exact Match) */}
        <div className="col-span-12 sm:col-span-5 bg-[#112435] p-3 rounded-lg border border-slate-700 shadow-lg flex items-center justify-around gap-2">
          {/* Donut Chart SVG */}
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="#1e293b" strokeWidth="6" />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#2563eb"
                strokeWidth="6"
                strokeDasharray="55 100"
                strokeDashoffset="0"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#dc2626"
                strokeWidth="6"
                strokeDasharray="29 100"
                strokeDashoffset="-55"
              />
              <circle
                cx="18"
                cy="18"
                r="14"
                fill="none"
                stroke="#16a34a"
                strokeWidth="6"
                strokeDasharray="4 100"
                strokeDashoffset="-84"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[9px] font-black text-slate-300">
              <span>STAT</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-1 text-[11px] font-bold">
            <div className="text-xs font-black text-slate-300 uppercase tracking-wider mb-0.5">
              Statistics
            </div>
            <div className="flex items-center gap-1.5 text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>Player 63%</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
              <span>Banker 33%</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span>Tie 4%</span>
            </div>
          </div>
        </div>

        {/* Right: Side-Bet Boxes (Baccarat 2: 5 Boxes | Baccarat 1: 4 Boxes) */}
        <div className={`col-span-12 sm:col-span-7 grid ${isBaccarat2 ? 'grid-cols-5' : 'grid-cols-4'} gap-1.5`}>
          {(isBaccarat2
            ? [
                { label: 'Score 1-4', rate: '7.5:1', r: score14 },
                { label: 'Score 5-6', rate: '4:1', r: score56 },
                { label: 'Score 7', rate: '4.5:1', r: score7 },
                { label: 'Score 8', rate: '3:1', r: score8 },
                { label: 'Score 9', rate: '3.5:1', r: score9 },
              ]
            : [
                { label: 'Perfect Pair', rate: '25:1', r: perfectPairRunner },
                { label: 'Big', rate: '0.54:1', r: bigRunner },
                { label: 'Small', rate: '1.5:1', r: smallRunner },
                { label: 'Either Pair', rate: '5:1', r: eitherPairRunner },
              ]
          ).map((item, idx) => {
            const isSideSuspended = isRunnerSuspended(item.r);
            return (
              <div
                key={idx}
                className="bg-[#112435] hover:bg-[#1a334d] rounded-lg border border-slate-700 p-2 flex flex-col items-center justify-center text-center cursor-pointer transition shadow active:scale-95 min-h-[56px]"
              >
                <span className="text-[10px] font-bold text-slate-300 truncate w-full mb-0.5">
                  {item.label}
                </span>
                {isSideSuspended ? (
                  <Lock size={13} className="text-slate-400" />
                ) : (
                  <span className="text-xs font-black text-amber-300 font-mono">
                    {item.rate}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Main Betting Row: Player Pair | Player | Tie | Banker | Banker Pair */}
      <div className="grid grid-cols-5 gap-1 shadow-2xl rounded-lg overflow-hidden border border-slate-700">
        {/* Player Pair (11:1) */}
        <div className="bg-[#1e40af] hover:bg-[#1d4ed8] p-3 text-white flex flex-col items-center justify-center cursor-pointer transition active:scale-95 text-center min-h-[68px]">
          <span className="text-xs sm:text-sm font-black leading-tight">Player Pair</span>
          {isPlayerPairSuspended ? (
            <Lock size={14} className="text-blue-200 mt-1" />
          ) : (
            <span className="text-[11px] text-blue-200 font-bold mt-0.5">11:1</span>
          )}
        </div>

        {/* Player (1:1) with card icons / dealt cards (Image 2 & 3 Exact Match) */}
        <div className="bg-[#2563eb] hover:bg-[#1d4ed8] p-2.5 text-white flex flex-col items-center justify-center cursor-pointer transition active:scale-95 text-center border-l border-blue-400/30 min-h-[68px]">
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base font-black leading-tight">Player</span>
            {isPlayerSuspended && <Lock size={12} className="text-blue-200" />}
          </div>
          {!isPlayerSuspended && <span className="text-xs text-blue-100 font-bold">1:1</span>}

          {/* Cards Display inside button */}
          <div className="flex gap-1 mt-1">
            {playerCards.length > 0 ? (
              playerCards.map((c, cIdx) => renderMiniCardGraphic(c, cIdx))
            ) : (
              <>
                <div className="w-3.5 h-5 border border-white/70 rounded-[1px] bg-white/20"></div>
                <div className="w-3.5 h-5 border border-white/70 rounded-[1px] bg-white/20"></div>
              </>
            )}
          </div>
        </div>

        {/* Tie (8:1) */}
        <div className="bg-[#16a34a] hover:bg-[#15803d] p-3 text-white flex flex-col items-center justify-center cursor-pointer transition active:scale-95 text-center border-x border-emerald-400/30 min-h-[68px]">
          <span className="text-sm sm:text-base font-black leading-tight">Tie</span>
          {isTieSuspended ? (
            <Lock size={14} className="text-emerald-200 mt-1" />
          ) : (
            <span className="text-xs text-emerald-100 font-bold">8:1</span>
          )}
        </div>

        {/* Banker (1:1) with card icons / dealt cards (Image 2 & 3 Exact Match) */}
        <div className="bg-[#dc2626] hover:bg-[#b91c1c] p-2.5 text-white flex flex-col items-center justify-center cursor-pointer transition active:scale-95 text-center border-r border-red-400/30 min-h-[68px]">
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base font-black leading-tight">Banker</span>
            {isBankerSuspended && <Lock size={12} className="text-red-200" />}
          </div>
          {!isBankerSuspended && <span className="text-xs text-red-100 font-bold">1:1</span>}

          {/* Cards Display inside button */}
          <div className="flex gap-1 mt-1">
            {bankerCards.length > 0 ? (
              bankerCards.map((c, cIdx) => renderMiniCardGraphic(c, cIdx))
            ) : (
              <>
                <div className="w-3.5 h-5 border border-white/70 rounded-[1px] bg-white/20"></div>
                <div className="w-3.5 h-5 border border-white/70 rounded-[1px] bg-white/20"></div>
              </>
            )}
          </div>
        </div>

        {/* Banker Pair (11:1) */}
        <div className="bg-[#991b1b] hover:bg-[#7f1d1d] p-3 text-white flex flex-col items-center justify-center cursor-pointer transition active:scale-95 text-center min-h-[68px]">
          <span className="text-xs sm:text-sm font-black leading-tight">Banker Pair</span>
          {isBankerPairSuspended ? (
            <Lock size={14} className="text-red-200 mt-1" />
          ) : (
            <span className="text-[11px] text-red-200 font-bold mt-0.5">11:1</span>
          )}
        </div>
      </div>
    </div>
  );
}