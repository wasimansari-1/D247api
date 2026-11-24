import React, { useMemo } from 'react';
import { Lock } from 'lucide-react';
import { getCardImgSrc } from '../../utils/cardUtils';

export default function AndarBaharBoard({ roundData, timer, isSuspended }) {
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  // Parse live dealt cards for Andar and Bahar
  const { andarRanks, baharRanks, andarCardCodes, baharCardCodes, andarDealtList, baharDealtList, jokerCard } = useMemo(() => {
    const rawCardStr = roundData?.card || '';
    const codes = rawCardStr
      ? rawCardStr.split(/[,|]/).map(s => s.trim().toUpperCase()).filter(Boolean)
      : [];

    const aRanks = new Set();
    const bRanks = new Set();
    const aCodes = new Map();
    const bCodes = new Map();

    let aDealt = [];
    let bDealt = [];
    let jCard = codes[0] && codes[0] !== '1' && codes[0] !== '?' ? codes[0] : null;

    // 1. Direct official Diamond Online fields (aall, ball, ares, bres)
    if (roundData?.ares || roundData?.bres || roundData?.aall || roundData?.ball) {
      if (roundData?.ares) {
        roundData.ares.split(',').map(s => s.trim().toUpperCase()).filter(Boolean).forEach(c => {
          if (c && c !== '1' && c !== '0') {
            const rank = c.replace(/(HH|DD|CC|SS|[HDCS])$/i, '');
            const stdRank = rank === '1' ? 'A' : rank;
            aRanks.add(stdRank);
            aCodes.set(stdRank, c);
          }
        });
      }
      if (roundData?.bres) {
        roundData.bres.split(',').map(s => s.trim().toUpperCase()).filter(Boolean).forEach(c => {
          if (c && c !== '1' && c !== '0') {
            const rank = c.replace(/(HH|DD|CC|SS|[HDCS])$/i, '');
            const stdRank = rank === '1' ? 'A' : rank;
            bRanks.add(stdRank);
            bCodes.set(stdRank, c);
          }
        });
      }
      if (roundData?.aall) {
        aDealt = roundData.aall.split(',').map(s => s.trim()).filter(c => c && c !== '1' && c !== '0').reverse();
      }
      if (roundData?.ball) {
        bDealt = roundData.ball.split(',').map(s => s.trim()).filter(c => c && c !== '1' && c !== '0').reverse();
      }
    }

    // 2. Fallback / Alternating parsing when ares/bres are empty
    if (aRanks.size === 0 && bRanks.size === 0 && codes.length > 0) {
      const jokerCode = codes[0];
      const isJokerBlack =
        jokerCode.endsWith('SS') ||
        jokerCode.endsWith('CC') ||
        jokerCode.endsWith('S') ||
        jokerCode.endsWith('C');

      for (let i = 1; i < codes.length; i++) {
        const code = codes[i];
        if (!code || code === '1' || code === '?' || code === '0') continue;
        const rank = code.replace(/(HH|DD|CC|SS|[HDCS])$/i, '');
        const stdRank = rank === '1' ? 'A' : rank;
        const isAndar = isJokerBlack ? (i % 2 === 1) : (i % 2 === 0);
        if (isAndar) {
          aRanks.add(stdRank);
          aCodes.set(stdRank, code);
          aDealt.push(code);
        } else {
          bRanks.add(stdRank);
          bCodes.set(stdRank, code);
          bDealt.push(code);
        }
      }
    }

    return {
      andarRanks: aRanks,
      baharRanks: bRanks,
      andarCardCodes: aCodes,
      baharCardCodes: bCodes,
      andarDealtList: aDealt,
      baharDealtList: bDealt,
      jokerCard: jCard
    };
  }, [roundData]);

  return (
    <div className="flex flex-col gap-2.5 select-none w-full">
      {/* 1. Dealt Cards Tray: ANDAR and BAHAR rows (Image 1 & 2 Exact Match) */}
      <div className="bg-[#0c1b29] border border-slate-700/80 rounded-xl p-3 flex flex-col gap-2.5 shadow-lg">
        {/* ANDAR Row */}
        <div className="flex items-center gap-3">
          <span className="w-16 font-extrabold text-xs text-[#fbc5a8] uppercase tracking-wider shrink-0">
            ANDAR
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {andarDealtList.length > 0 ? (
              andarDealtList.map((c, i) => (
                <div
                  key={`ad-${i}`}
                  className="w-7 h-10 sm:w-8 sm:h-12 rounded border border-slate-500 bg-white overflow-hidden shadow-sm shrink-0 flex items-center justify-center p-0.5 hover:scale-105 transition"
                >
                  <img
                    src={getCardImgSrc(c)}
                    alt="Andar Card"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/cards/1.jpg";
                    }}
                  />
                </div>
              ))
            ) : (
              <span className="text-[11px] text-slate-500 italic">No cards dealt yet</span>
            )}
          </div>
        </div>

        {/* BAHAR Row */}
        <div className="flex items-center gap-3 border-t border-slate-800/80 pt-2">
          <span className="w-16 font-extrabold text-xs text-[#b8e994] uppercase tracking-wider shrink-0">
            BAHAR
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {baharDealtList.length > 0 ? (
              baharDealtList.map((c, i) => (
                <div
                  key={`bd-${i}`}
                  className="w-7 h-10 sm:w-8 sm:h-12 rounded border border-slate-500 bg-white overflow-hidden shadow-sm shrink-0 flex items-center justify-center p-0.5 hover:scale-105 transition"
                >
                  <img
                    src={getCardImgSrc(c)}
                    alt="Bahar Card"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/cards/1.jpg";
                    }}
                  />
                </div>
              ))
            ) : (
              <span className="text-[11px] text-slate-500 italic">No cards dealt yet</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main 13-Rank Betting Board: ANDAR (Peach) & BAHAR (Light Green) (Image 1 & 2 Exact Match) */}
      <div className="bg-[#112435] rounded-xl border border-slate-700 overflow-hidden shadow-2xl relative">
        <div className="grid grid-cols-12 min-w-[620px] overflow-x-auto">
          {/* Left Vertical Labels: ANDAR (Peach) / BAHAR (Light Green) */}
          <div className="col-span-1 flex flex-col font-black text-xs text-center border-r border-slate-700/60">
            <div className="flex-1 bg-[#e28a74] text-slate-900 flex flex-col items-center justify-center py-4 border-b border-slate-700/60 font-black tracking-widest text-xs">
              {'ANDAR'.split('').map((char, i) => (
                <span key={i} className="leading-tight">{char}</span>
              ))}
            </div>
            <div className="flex-1 bg-[#82ccdd] text-slate-900 flex flex-col items-center justify-center py-4 font-black tracking-widest text-xs">
              {'BAHAR'.split('').map((char, i) => (
                <span key={i} className="leading-tight">{char}</span>
              ))}
            </div>
          </div>

          {/* Right Main 13 Ranks Grid */}
          <div className="col-span-11 flex flex-col">
            {/* Top ANDAR Row (Peach Background #fbc5a8) */}
            <div className="bg-[#fbc5a8] p-2 flex items-center justify-between gap-1 border-b border-slate-700/40">
              {ranks.map((r) => {
                const isDealt = andarRanks.has(r);
                const cCode = andarCardCodes.get(r);
                return (
                  <div key={r} className="flex-1 flex flex-col items-center gap-1">
                    {isDealt ? (
                      <div className="w-full aspect-[2/3] max-w-[42px] bg-white rounded overflow-hidden shadow-sm flex items-center justify-center p-0.5 cursor-pointer hover:scale-105 transition">
                        <img
                          src={getCardImgSrc(cCode || r)}
                          alt={r}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `/cards/${r}.webp`;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-[2/3] max-w-[42px] rounded overflow-hidden shadow-sm border border-slate-700/60 bg-[#0b2742] flex items-center justify-center">
                        <img
                          src="/cards/1.jpg"
                          alt="Card back"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/cards/1.jpg";
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom BAHAR Row (Light Green Background #b8e994) */}
            <div className="bg-[#b8e994] p-2 flex items-center justify-between gap-1">
              {ranks.map((r) => {
                const isDealt = baharRanks.has(r);
                const cCode = baharCardCodes.get(r);
                return (
                  <div key={r} className="flex-1 flex flex-col items-center gap-1">
                    {isDealt ? (
                      <div className="w-full aspect-[2/3] max-w-[42px] bg-white rounded overflow-hidden shadow-sm flex items-center justify-center p-0.5 cursor-pointer hover:scale-105 transition">
                        <img
                          src={getCardImgSrc(cCode || r)}
                          alt={r}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `/cards/${r}.webp`;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-[2/3] max-w-[42px] rounded overflow-hidden shadow-sm border border-slate-700/60 bg-[#0b2742] flex items-center justify-center">
                        <img
                          src="/cards/1.jpg"
                          alt="Card back"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/cards/1.jpg";
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Official Payout Notice (Image 1 & 2 Exact Match) */}
      <div className="bg-[#0c1824] border border-slate-700/60 rounded-md py-1.5 px-3 text-[11px] font-bold text-slate-300 flex items-center justify-between shadow">
        <span className="tracking-wide">Payout : Bahar 1st Card 25% and All Other Andar-Bahar Cards 100%.</span>
        {isSuspended && (
          <span className="text-red-400 flex items-center gap-1 font-black text-xs uppercase tracking-wider">
            <Lock size={12} /> Betting Locked
          </span>
        )}
      </div>
    </div>
  );
}
