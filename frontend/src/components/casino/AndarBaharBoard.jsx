import React, { useMemo } from 'react';
import { Lock } from 'lucide-react';

export default function AndarBaharBoard({ roundData, timer, isSuspended }) {
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  // Parse live dealt cards for Andar and Bahar
  const { andarRanks, baharRanks } = useMemo(() => {
    const rawCardStr = roundData?.card || '';
    const codes = rawCardStr
      ? rawCardStr.split(/[,|]/).map(s => s.trim().toUpperCase()).filter(Boolean)
      : [];

    const aRanks = new Set();
    const bRanks = new Set();

    // In Andar Bahar: Card 0 is Opening/Joker.
    // Card 1 = Bahar, Card 2 = Andar, Card 3 = Bahar, Card 4 = Andar...
    for (let i = 1; i < codes.length; i++) {
      const code = codes[i];
      if (!code || code === '1' || code === '?' || code === '0') continue;
      const rank = code.replace(/(HH|DD|CC|SS|[HDCS])$/i, '');
      const stdRank = rank === '1' ? 'A' : rank;
      if (i % 2 === 1) {
        bRanks.add(stdRank);
      } else {
        aRanks.add(stdRank);
      }
    }

    // Also check if roundData has cards array
    if (Array.isArray(roundData?.cards)) {
      roundData.cards.forEach((c, idx) => {
        if (!c || c.isHidden || idx === 0) return;
        const r = String(c.rank || '').toUpperCase().trim();
        const stdR = r === '1' ? 'A' : r;
        if (idx % 2 === 1) bRanks.add(stdR);
        else aRanks.add(stdR);
      });
    }

    return { andarRanks: aRanks, baharRanks: bRanks };
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
                return (
                  <div key={r} className="flex-1 flex flex-col items-center gap-1">
                    {isDealt ? (
                      <div className="w-full aspect-[2/3] max-w-[42px] bg-white rounded border border-slate-400 shadow-sm flex flex-col items-center justify-center p-0.5 cursor-pointer hover:scale-105 transition">
                        <span className="text-xs sm:text-sm font-black text-slate-900 leading-none">{r}</span>
                        <div className="flex gap-0.5 text-[6px] leading-none mt-1">
                          <span className="text-slate-900">♠</span>
                          <span className="text-red-600">♥</span>
                          <span className="text-slate-900">♣</span>
                          <span className="text-red-600">♦</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-[2/3] max-w-[42px] rounded overflow-hidden shadow-sm border border-slate-700/60 bg-[#0b2742] flex items-center justify-center">
                        <img
                          src="/cards/back.webp"
                          alt="Card back"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/cards/back.webp";
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
                return (
                  <div key={r} className="flex-1 flex flex-col items-center gap-1">
                    {isDealt ? (
                      <div className="w-full aspect-[2/3] max-w-[42px] bg-white rounded border border-slate-400 shadow-sm flex flex-col items-center justify-center p-0.5 cursor-pointer hover:scale-105 transition">
                        <span className="text-xs sm:text-sm font-black text-slate-900 leading-none">{r}</span>
                        <div className="flex gap-0.5 text-[6px] leading-none mt-1">
                          <span className="text-slate-900">♠</span>
                          <span className="text-red-600">♥</span>
                          <span className="text-slate-900">♣</span>
                          <span className="text-red-600">♦</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-[2/3] max-w-[42px] rounded overflow-hidden shadow-sm border border-slate-700/60 bg-[#0b2742] flex items-center justify-center">
                        <img
                          src="/cards/back.webp"
                          alt="Card back"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/cards/back.webp";
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
        <span>Payout : Bahar 1st Card 25% and All Other Andar-Bahar Cards 100%.</span>
        {isSuspended && (
          <span className="flex items-center gap-1 text-amber-400 text-[10px] font-black uppercase">
            <Lock size={11} />
            <span>Betting Locked</span>
          </span>
        )}
      </div>
    </div>
  );
}
