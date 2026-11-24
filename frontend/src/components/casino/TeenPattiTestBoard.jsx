import React from 'react';
import { Lock } from 'lucide-react';

export default function TeenPattiTestBoard({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];

  const columns = ['Tiger', 'Lion', 'Dragon'];
  const betRows = [
    { key: 'Winner', label: 'Winner', defaultRate: '2.94' },
    { key: 'Pair', label: 'Pair', defaultRate: '5' },
    { key: 'Flush', label: 'Flush', defaultRate: '12' },
    { key: 'Straight', label: 'Straight', defaultRate: '21' },
    { key: 'Trio', label: 'Trio', defaultRate: '126' },
    { key: 'Straight Flush', label: 'Straight Flush', defaultRate: '151' }
  ];

  const getRunner = (col, betKey) => {
    const colLow = col.toLowerCase();
    const keyLow = betKey.toLowerCase();
    return runners.find(r => {
      const n = (r.name || '').toLowerCase();
      return n.includes(colLow) && n.includes(keyLow);
    });
  };

  return (
    <div className="flex flex-col gap-3 select-none">
      <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
        {/* Table Header: Tiger | Lion | Dragon */}
        <div className="grid grid-cols-4 bg-[#0c1b29] text-xs font-black text-slate-300 border-b border-slate-700 py-2.5 px-3 text-center">
          <div className="text-left text-slate-400 font-bold uppercase text-[11px]">Bet Type</div>
          <div className="text-amber-400">Tiger</div>
          <div className="text-sky-400">Lion</div>
          <div className="text-rose-400">Dragon</div>
        </div>

        {/* Table Rows: Winner, Pair, Flush, Straight, Trio, Straight Flush */}
        <div className="flex flex-col divide-y divide-slate-800">
          {betRows.map((row, rIdx) => (
            <div key={rIdx} className="grid grid-cols-4 items-center p-2 px-3 hover:bg-slate-800/40 transition text-center">
              <div className="text-left font-bold text-xs text-slate-300">
                {row.label}
              </div>

              {columns.map((col, cIdx) => {
                const r = getRunner(col, row.key);
                const rate = r?.back > 0 ? r.back : row.defaultRate;
                const isLocked = isSuspended || r?.status === 'SUSPENDED';

                return (
                  <div key={cIdx} className="px-1">
                    {isLocked ? (
                      <div className="py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                        <Lock size={12} className="text-slate-300" />
                      </div>
                    ) : (
                      <button className="w-full py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded transition shadow active:scale-95">
                        {rate}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
