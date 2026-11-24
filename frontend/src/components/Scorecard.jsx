import React, { useState } from 'react';

// Helper to parse card codes (e.g. AC, 3C, 2CC, 4CC, KD, 10H)
export function parsePlayingCard(raw) {
  if (!raw || raw === '?' || raw === 'back') {
    return { isFaceDown: true };
  }
  const str = String(raw).trim().toUpperCase();
  const match = str.match(/^([2-9]|10|[AKQJ])([CDHS])(?:[CDHS])?$/i);
  if (!match) {
    if (str.length === 1 && !isNaN(str)) {
      return { isDigit: true, digit: str };
    }
    return { isFaceDown: false, rank: str, suit: '', isRed: false };
  }
  const rank = match[1];
  const suitChar = match[2];
  let suit = '♣';
  let isRed = false;
  if (suitChar === 'H') { suit = '♥'; isRed = true; }
  else if (suitChar === 'D') { suit = '♦'; isRed = true; }
  else if (suitChar === 'S') { suit = '♠'; isRed = false; }
  else if (suitChar === 'C') { suit = '♣'; isRed = false; }

  return { isFaceDown: false, rank, suit, isRed };
}

// Flip clock digit matching Diamond Online's authentic style
export function FlipClockCounter({ value }) {
  const num = Math.max(0, parseInt(value, 10) || 0);
  const str = String(num).padStart(2, '0');
  const d1 = str[0];
  const d2 = str[1];

  return (
    <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-lg border border-slate-700/60 shadow-2xl backdrop-blur-sm">
      <div className="relative w-8 h-12 sm:w-10 sm:h-14 bg-gradient-to-b from-[#1b2838] via-[#0f172a] to-black text-white font-mono font-black text-2xl sm:text-3xl rounded border border-slate-700 flex items-center justify-center overflow-hidden shadow-inner select-none">
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/90 shadow-sm z-10"></div>
        <span className="relative z-0 leading-none">{d1}</span>
      </div>
      <div className="relative w-8 h-12 sm:w-10 sm:h-14 bg-gradient-to-b from-[#1b2838] via-[#0f172a] to-black text-white font-mono font-black text-2xl sm:text-3xl rounded border border-slate-700 flex items-center justify-center overflow-hidden shadow-inner select-none">
        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/90 shadow-sm z-10"></div>
        <span className="relative z-0 leading-none">{d2}</span>
      </div>
    </div>
  );
}

// Single Playing Card Component
export function PlayingCardItem({ cardRaw }) {
  const parsed = parsePlayingCard(cardRaw);

  if (parsed.isFaceDown) {
    return (
      <div className="w-8 h-11 sm:w-9 sm:h-12 rounded border-2 border-white/90 shadow-md bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:4px_4px]"></div>
        <div className="w-4 h-6 border border-white/50 rounded-sm"></div>
      </div>
    );
  }

  return (
    <div className="w-8 h-11 sm:w-9 sm:h-12 rounded border border-slate-400/90 shadow-md bg-white flex flex-col items-center justify-between p-0.5 select-none transition-transform hover:scale-105">
      <span className={`text-[11px] sm:text-xs font-black leading-none self-start ${parsed.isRed ? 'text-red-600' : 'text-slate-900'}`}>
        {parsed.rank}
      </span>
      <span className={`text-base sm:text-lg font-black leading-none ${parsed.isRed ? 'text-red-600' : 'text-slate-900'}`}>
        {parsed.suit}
      </span>
      <span className={`text-[9px] font-black leading-none self-end ${parsed.isRed ? 'text-red-600' : 'text-slate-900'}`}>
        {parsed.rank}
      </span>
    </div>
  );
}

export default function Scorecard({ scoreboard, timer, cards }) {
  if (!scoreboard) return null;

  const [iframeFailed, setIframeFailed] = useState(false);

  // 1. Virtual Cricket Scoreboard & Pitch Canvas (Matching Diamond Online Image 7)
  if (scoreboard.isVirtual || scoreboard.spnnation1) {
    const team1 = scoreboard.spnnation1 || scoreboard.battingTeam || 'Team 1';
    const score1 = scoreboard.score1 || '125-5 (10.0)';
    const crr1 = scoreboard.spnrunrate1;
    const rrr1 = scoreboard.spnreqrate1;

    const team2 = scoreboard.spnnation2 || scoreboard.bowlingTeam || 'Team 2';
    const score2 = scoreboard.score2 || '27-3 (2.2)';
    const crr2 = scoreboard.spnrunrate2 || '11.57';
    const rrr2 = scoreboard.spnreqrate2 || '12.91';

    const message = scoreboard.spnmessage || `${team2} Needed 99 runs from 46 balls`;
    const balls = Array.isArray(scoreboard.balls) && scoreboard.balls.length > 0 
      ? scoreboard.balls 
      : ['2', 'WW', '4', '2', '1', '3'];

    // Vertical cards on canvas ONLY if provided by API
    const rawCardsList = Array.isArray(cards) && cards.length > 0 
      ? cards 
      : (Array.isArray(scoreboard.cards) && scoreboard.cards.length > 0 ? scoreboard.cards : null);

    const activeTimer = timer !== undefined && timer !== null ? timer : (scoreboard.timer || 0);

    return (
      <div className="rounded-lg overflow-hidden border border-slate-700 shadow-xl mb-3">
        {/* Top Green Pitch Scorecard Banner matching Image 7 */}
        <div className="bg-[#1b4332] text-white px-3 py-2 border-b border-[#2d6a4f]">
          {/* Row 1: Team 1 & Target Message */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-yellow-300 tracking-wide">{team1}</span>
              <span className="font-black text-sm text-white">{score1}</span>
              {crr1 && <span className="text-[10px] text-emerald-200">CRR {crr1}</span>}
              {rrr1 && <span className="text-[10px] text-amber-200">RR {rrr1}</span>}
            </div>
            {message && (
              <div className="text-[11px] font-bold text-amber-200 bg-black/30 px-2 py-0.5 rounded">
                {message}
              </div>
            )}
          </div>

          {/* Row 2: Team 2, CRR, RR & Ball Pills */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-1.5 pt-1.5 border-t border-[#2d6a4f]/50">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-yellow-300 tracking-wide">{team2}</span>
              <span className="font-black text-sm text-white">{score2}</span>
              {crr2 && <span className="text-[10px] text-emerald-200">CRR {crr2}</span>}
              {rrr2 && <span className="text-[10px] text-amber-200">RR {rrr2}</span>}
            </div>

            {/* Over Ball Badges */}
            <div className="flex items-center gap-1">
              {balls.map((b, idx) => {
                let badgeClass = 'bg-sky-500 text-white';
                if (b === 'W' || b === 'WW') badgeClass = 'bg-red-600 text-white animate-pulse';
                else if (b === '4') badgeClass = 'bg-emerald-500 text-white';
                else if (b === '6') badgeClass = 'bg-amber-400 text-slate-950 font-black';

                return (
                  <span 
                    key={idx} 
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] shadow ${badgeClass}`}
                  >
                    {b}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pitch Canvas Area with 6 Vertical Cards & Flip Timer matching Image 7 */}
        <div className="relative bg-gradient-to-b from-[#0a1f16] via-[#05140d] to-black p-3 min-h-[170px] sm:min-h-[190px] flex justify-between items-center overflow-hidden border-t border-[#1b4332]">
          {/* Subtle cricket pitch stripes background */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[repeating-linear-gradient(90deg,#22c55e_0,#22c55e_40px,#15803d_40px,#15803d_80px)]"></div>

          {/* Left: Vertical Playing Cards Column - ONLY IF API HAS CARDS */}
          {Array.isArray(rawCardsList) && rawCardsList.length > 0 && (
            <div className="relative z-10 flex flex-col gap-1.5">
              {rawCardsList.map((c, idx) => (
                <PlayingCardItem key={idx} cardRaw={c} />
              ))}
            </div>
          )}

          {/* Right Bottom: Authentic Flip Clock Countdown Box */}
          <div className="relative z-10 self-end">
            <FlipClockCounter value={activeTimer} />
          </div>
        </div>
      </div>
    );
  }

  // 2. Official CloudFront Live Scoreboard Embed (Only for Real International Matches)
  if (scoreboard.embedUrl && !iframeFailed) {
    return (
      <div className="w-full bg-[#0b1f33] rounded-lg overflow-hidden border border-slate-700 shadow-md">
        <iframe
          src={scoreboard.embedUrl}
          title="Official Live Scorecard"
          className="w-full h-40 sm:h-44 border-0"
          onError={() => setIframeFailed(true)}
          allow="autoplay; encrypted-media"
        />
      </div>
    );
  }

  // 3. Structured Scoreboard Fallback
  return (
    <div className="bg-[#0b1f33] text-white p-3 border-b border-slate-700 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-yellow-400 font-bold text-base block">{scoreboard.battingTeam || 'Batting Team'}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black">{scoreboard.runs ?? 0}/{scoreboard.wickets ?? 0}</span>
            <span className="text-xs text-slate-400">({scoreboard.overs || '0.0'} ov)</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">{scoreboard.bowlingTeam || 'Bowling Team'}</span>
          <span className="text-sm font-semibold text-slate-300">Target: {scoreboard.target || 'N/A'}</span>
        </div>
      </div>

      {scoreboard.currentOver && Array.isArray(scoreboard.currentOver) && (
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold">Over:</span>
          <div className="flex gap-1">
            {scoreboard.currentOver.map((ball, idx) => {
              let dotBg = 'bg-slate-700 text-white';
              if (ball === 'W') dotBg = 'bg-red-600 text-white font-bold';
              else if (ball === '4') dotBg = 'bg-sky-600 text-white font-bold';
              else if (ball === '6') dotBg = 'bg-emerald-600 text-white font-bold';

              return (
                <span key={idx} className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${dotBg}`}>
                  {ball}
                </span>
              );
            })}
          </div>
          {scoreboard.lastAction && (
            <span className="text-[11px] text-yellow-300 ml-auto truncate italic">
              {scoreboard.lastAction}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
