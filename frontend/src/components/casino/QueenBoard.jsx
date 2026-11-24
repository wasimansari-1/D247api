import React from 'react';
import { Lock } from 'lucide-react';

export default function QueenBoard({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];
  const isBettingClosed = isSuspended || timer <= 3;

  const getRunner = (name) => {
    const nLow = name.toLowerCase();
    return runners.find(r => (r.name || '').toLowerCase() === nLow || (r.name || '').toLowerCase().includes(nLow));
  };

  const total0 = getRunner('total 0') || { name: 'Total 0', back: 4.34, lay: 4.64 };
  const total1 = getRunner('total 1') || { name: 'Total 1', back: 1.73, lay: 1.78 };
  const total2 = getRunner('total 2') || { name: 'Total 2', back: 10.29, lay: 11.29 };
  const total3 = getRunner('total 3') || { name: 'Total 3', back: 8.75, lay: 9.65 };

  const totals = [
    { label: 'Total 0', runner: total0 },
    { label: 'Total 1', runner: total1 },
    { label: 'Total 2', runner: total2 },
    { label: 'Total 3', runner: total3 },
  ];

  return (
    <div className="flex flex-col gap-2.5 select-none">
      {/* 1. 4 Totals Table (Image 3 Exact Match) */}
      <div className="grid grid-cols-4 gap-1.5 bg-[#112435] p-2 rounded-lg border border-slate-700 shadow-lg">
        {totals.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center">
            {/* Header */}
            <span className="text-[11px] sm:text-xs font-black text-slate-300 mb-1">
              {item.label}
            </span>

            {/* Back & Lay Buttons */}
            <div className="grid grid-cols-2 gap-1 w-full">
              {isBettingClosed ? (
                <div className="py-2.5 bg-[#1e3a5f] rounded border border-blue-500/30 text-blue-200 flex items-center justify-center">
                  <Lock size={13} className="text-blue-300" />
                </div>
              ) : (
                <button className="py-2 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded shadow transition">
                  {item.runner.back || '-'}
                </button>
              )}

              {isBettingClosed ? (
                <div className="py-2.5 bg-[#4a2430] rounded border border-pink-500/30 text-pink-200 flex items-center justify-center">
                  <Lock size={13} className="text-pink-300" />
                </div>
              ) : (
                <button className="py-2 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-xs rounded shadow transition">
                  {item.runner.lay || '-'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 2. Green Rules Strip (Image 3 Exact Match) */}
      <div className="px-3 py-1.5 bg-[#2e7d32] border border-emerald-400/40 rounded text-center shadow">
        <span className="text-[10px] sm:text-[11px] font-bold text-white tracking-tight">
          This is 21 cards game 2,3,4,5,6 x 4=20 and 1 Queen. Minimum total 10 or queen is required to win.
        </span>
      </div>
    </div>
  );
}