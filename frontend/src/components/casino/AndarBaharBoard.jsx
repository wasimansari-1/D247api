import React, { useMemo } from 'react';
import { Lock } from 'lucide-react';
import { getCardImgSrc } from '../../utils/cardUtils';

export default function AndarBaharBoard({ roundData, timer, isSuspended }) {
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  // Parse live dealt cards for Andar and Bahar
  const { andarRanks, baharRanks, andarCardCodes, baharCardCodes } = useMemo(() => {
    const rawCardStr = roundData?.card || '';
    const codes = rawCardStr
      ? rawCardStr.split(/[,|]/).map(s => s.trim().toUpperCase()).filter(Boolean)
      : [];

    const aRanks = new Set();
    const bRanks = new Set();
    const aCodes = new Map();
    const bCodes = new Map();

    if (codes.length > 0) {
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
        } else {
          bRanks.add(stdRank);
          bCodes.set(stdRank, code);
        }
      }
    } else if (Array.isArray(roundData?.cards) && roundData.cards.length > 0) {
      const jokerCard = roundData.cards[0];
      const jSuit = String(jokerCard?.suit || jokerCard?.raw || '').toUpperCase();
      const isJokerBlack =
        jSuit.includes('S') ||
        jSuit.includes('C') ||
        jSuit.includes('♠') ||
        jSuit.includes('♣');

      roundData.cards.forEach((c, idx) => {
        if (!c || c.isHidden || idx === 0) return;
        const r = String(c.rank || '').toUpperCase().trim();
        const stdR = r === '1' ? 'A' : r;
        const code = c.code || `${stdR}${c.suitCode || 'SS'}`;
        const isAndar = isJokerBlack ? (idx % 2 === 1) : (idx % 2 === 0);
        if (isAndar) {
          aRanks.add(stdR);
          aCodes.set(stdR, code);
        } else {
          bRanks.add(stdR);
          bCodes.set(stdR, code);
        }
      });
    }

    return {
      andarRanks: aRanks,
      baharRanks: bRanks,
      andarCardCodes: aCodes,
      baharCardCodes: bCodes,
    };
  }, [roundData]);

  return (
    <div className="flex flex-col gap-2 select-none">
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
            {/* Top ANDAR Row (Peach Background) */}
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

            {/* Bottom BAHAR Row (Light Green Background) */}
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

      {/* Payout Information Notice (Image 9 Right Exact Match) */}
      <div className="bg-[#0c1824] border border-slate-700/60 rounded-md py-1.5 px-3 text-[11px] font-bold text-slate-300 flex items-center justify-between shadow">
        <span className="tracking-wide">Payout: Bahar 1st Card 25% and All Other Andar-Bahar Cards 100%.</span>
        {isSuspended && (
          <span className="text-red-400 flex items-center gap-1 font-black text-xs uppercase tracking-wider">
            <Lock size={12} /> Betting Locked
          </span>
        )}
      </div>
    </div>
  );
}
