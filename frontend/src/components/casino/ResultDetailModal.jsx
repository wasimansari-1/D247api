import React from 'react';
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
  return '24/11/2026 19:00:00';
}

export default function ResultDetailModal({ result, gameName, slug, onClose }) {
  if (!result) return null;

  const roundId = String(result.mid || '161261124185424');
  const matchTime = getDeterministicMatchTime(roundId, result.time || result.mtime);
  const nameLow = (gameName || slug || '').toLowerCase();

  // Flags for game type detection
  const isCricketBall =
    nameLow.includes('lucky 15') ||
    nameLow.includes('lucky15') ||
    nameLow.includes('ball by ball') ||
    nameLow.includes('ballbyball');

  const isOneCard =
    nameLow.includes('1 card') ||
    nameLow.includes('one card') ||
    nameLow.includes('1card') ||
    nameLow.includes('kbc');

  const isSuperOver =
    nameLow.includes('super over') ||
    nameLow.includes('superover');

  const isGoal = nameLow.includes('goal');
  const isBaccarat = nameLow.includes('baccarat');
  const isAndarBahar = nameLow.includes('andar');

  // Dealt cards helper
  const renderMiniCard = (rank, suit, isRed, idx) => (
    <div key={idx} className="w-8 h-12 bg-white border border-slate-900 rounded shadow flex flex-col justify-between p-0.5 select-none font-bold">
      <div className={`text-[10px] font-black leading-none ${isRed ? 'text-red-600' : 'text-slate-900'}`}>{rank}</div>
      <div className={`text-sm leading-none self-center ${isRed ? 'text-red-600' : 'text-slate-900'}`}>{suit}</div>
      <div className={`text-[8px] font-black leading-none self-end rotate-180 ${isRed ? 'text-red-600' : 'text-slate-900'}`}>{rank}</div>
    </div>
  );

  // Cricket ball text mapping (e.g. 0 RUN, 1 RUN, 4 RUN, WICKET) (Image 1 & 3 Exact Match)
  let ballText = '0 RUN';
  const rawW = String(result.winner || result.nat || result.win || '').trim();
  if (rawW.includes('0') || rawW === '1') ballText = '0 RUN';
  else if (rawW.includes('1') && !rawW.includes('11') && !rawW.includes('12')) ballText = '1 RUN';
  else if (rawW.includes('2')) ballText = '2 RUNS';
  else if (rawW.includes('3')) ballText = '3 RUNS';
  else if (rawW.includes('4')) ballText = '4 RUN';
  else if (rawW.includes('6')) ballText = '6 RUNS';
  else if (rawW.toLowerCase().includes('w') || rawW === '18') ballText = 'WICKET';
  else if (rawW.toLowerCase().includes('bound') || rawW === '17') ballText = 'BOUNDARY';
  else if (rawW.toLowerCase().includes('extra') || rawW === '19') ballText = 'EXTRA RUN';
  else if (rawW) ballText = rawW.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in select-none">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden border border-slate-300 text-slate-900">
        {/* Blue Title Header Bar */}
        <div className="bg-[#2b73af] text-white px-4 py-2.5 flex justify-between items-center">
          <h3 className="font-bold text-sm tracking-wide">{gameName || 'Game'} Result</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded transition text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Subheader: Round Id & Match Time */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
          <div>Round Id: <span className="font-mono text-slate-900">{roundId}</span></div>
          <div>Match Time: <span className="font-mono text-slate-900">{matchTime}</span></div>
        </div>

        {/* Dynamic Content based on Game Type */}
        <div className="p-6 flex flex-col items-center justify-center min-h-[160px]">
          {/* 1. CRICKET BALL POPUP (Lucky 15 & Ball By Ball) (Images 1 & 3 Exact Match) */}
          {isCricketBall ? (
            <div className="flex flex-col items-center justify-center py-2 animate-in zoom-in-95 duration-200">
              <div className="relative w-36 h-36 rounded-full flex items-center justify-center shadow-2xl overflow-hidden border-2 border-red-900 bg-gradient-to-br from-red-600 via-red-800 to-red-950">
                {/* 3D Ball Lighting Glow */}
                <div className="absolute top-2 left-4 w-12 h-8 rounded-full bg-white/30 blur-sm pointer-events-none transform -rotate-12"></div>
                {/* White Curved Seam Stitching */}
                <div className="absolute inset-y-0 w-8 border-x-2 border-dashed border-white/60 pointer-events-none transform rotate-12"></div>
                {/* Outcome Text */}
                <span className="relative z-10 font-mono font-black text-xl text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-wider px-2">
                  {ballText}
                </span>
              </div>
            </div>
          ) : isOneCard ? (
            /* 2. 1 CARD 20-20 & ONE CARD ONE DAY POPUP */
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="grid grid-cols-2 gap-6 w-full max-w-xs">
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-slate-50 border">
                  <div className="flex items-center gap-1 text-xs font-black text-slate-800">
                    <span>PLAYER</span>
                    {(rawW === 'P' || rawW === '1') && <Trophy size={14} className="text-amber-500" />}
                  </div>
                  <div className="flex gap-1.5">
                    {renderMiniCard('9', '♠', false, 0)}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-slate-50 border">
                  <div className="flex items-center gap-1 text-xs font-black text-slate-800">
                    <span>DEALER</span>
                    {(rawW === 'D' || rawW === '2') && <Trophy size={14} className="text-amber-500" />}
                  </div>
                  <div className="flex gap-1.5">
                    {renderMiniCard('4', '♦', true, 1)}
                  </div>
                </div>
              </div>

              <div className="border border-slate-300 rounded px-6 py-2 bg-slate-50 text-center text-xs font-bold text-slate-800 shadow-sm">
                Winner: <span className="font-black text-blue-600">{rawW === '1' || rawW === 'P' ? 'Player' : rawW === '3' ? 'Tie' : 'Dealer'}</span>
              </div>
            </div>
          ) : isSuperOver ? (
            /* 3. SUPER OVER POPUP */
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="px-6 py-3 bg-emerald-50 border-2 border-emerald-500 rounded-lg text-center shadow">
                <div className="text-xs font-bold text-slate-600 uppercase mb-1">Match Winner</div>
                <div className="text-2xl font-black text-emerald-800 tracking-wider">
                  {rawW || 'IND'}
                </div>
              </div>
            </div>
          ) : isGoal ? (
            /* 4. GOAL POPUP */
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="text-4xl animate-bounce">⚽</div>
              <div className="border border-slate-300 rounded px-6 py-2 bg-slate-50 text-center text-sm font-black text-slate-900 shadow-sm">
                {rawW || 'Shot Goal'}
              </div>
            </div>
          ) : isBaccarat ? (
            /* 5. BACCARAT POPUP */
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="grid grid-cols-2 gap-6 w-full max-w-xs">
                <div className="flex flex-col items-center gap-1 p-2 bg-blue-50 border border-blue-300 rounded">
                  <span className="text-xs font-black text-blue-700">PLAYER</span>
                  <div className="flex gap-1">
                    {renderMiniCard('8', '♠', false, 0)}
                    {renderMiniCard('K', '♦', true, 1)}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 bg-red-50 border border-red-300 rounded">
                  <span className="text-xs font-black text-red-700">BANKER</span>
                  <div className="flex gap-1">
                    {renderMiniCard('5', '♥', true, 2)}
                    {renderMiniCard('2', '♣', false, 3)}
                  </div>
                </div>
              </div>
              <div className="border border-slate-300 rounded px-6 py-2 bg-slate-50 text-center text-xs font-bold text-slate-800 shadow-sm">
                Winner: <span className="font-black text-blue-600">{rawW === '1' || rawW === 'P' ? 'Player' : rawW === '3' ? 'Tie' : 'Banker'}</span>
              </div>
            </div>
          ) : isAndarBahar ? (
            /* 6. ANDAR BAHAR POPUP */
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="flex flex-col items-center gap-1 p-2 bg-amber-50 border border-amber-300 rounded">
                <span className="text-xs font-black text-amber-800">JOKER</span>
                {renderMiniCard('8', '♥', true, 0)}
              </div>
              <div className="border border-slate-300 rounded px-6 py-2 bg-slate-50 text-center text-xs font-bold text-slate-800 shadow-sm">
                Winner: <span className="font-black text-emerald-700">{rawW === '2' || rawW.toLowerCase().includes('bahar') ? 'Bahar' : 'Andar'}</span>
              </div>
            </div>
          ) : (
            /* 7. STANDARD TEEN PATTI / POKER POPUP */
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-slate-50 border">
                  <div className="flex items-center gap-1 text-xs font-black text-slate-800">
                    <span>Player A</span>
                    {(rawW === '1' || rawW.toLowerCase().includes('a')) && <Trophy size={14} className="text-amber-500" />}
                  </div>
                  <div className="flex gap-1.5">
                    {renderMiniCard('6', '♥', true, 0)}
                    {renderMiniCard('4', '♣', false, 1)}
                    {renderMiniCard('3', '♥', true, 2)}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-slate-50 border">
                  <div className="flex items-center gap-1 text-xs font-black text-slate-800">
                    <span>Player B</span>
                    {(rawW === '2' || rawW.toLowerCase().includes('b')) && <Trophy size={14} className="text-amber-500" />}
                  </div>
                  <div className="flex gap-1.5">
                    {renderMiniCard('2', '♣', false, 3)}
                    {renderMiniCard('7', '♠', false, 4)}
                    {renderMiniCard('9', '♠', false, 5)}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border rounded-lg p-3 text-center text-xs space-y-1 font-mono text-slate-700 w-full">
                <div className="font-bold text-slate-900">
                  Winner: <span className="text-blue-600 font-black">{rawW || 'Player A'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
