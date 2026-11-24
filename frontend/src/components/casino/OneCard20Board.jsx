import React from 'react';
import { Lock } from 'lucide-react';

export default function OneCard20Board({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];
  const isBettingClosed = isSuspended || timer <= 3;

  const playerRunner = runners.find(r => (r.name || '').toLowerCase() === 'player') || { name: 'Player', back: 1.98 };
  const dealerRunner = runners.find(r => (r.name || '').toLowerCase() === 'dealer') || { name: 'Dealer', back: 1.98 };
  const tieRunner = runners.find(r => (r.name || '').toLowerCase().includes('tie')) || { name: 'Tie', back: 11.0 };
  const pairRunner = runners.find(r => (r.name || '').toLowerCase().includes('pair')) || { name: 'Pair', back: 11.0 };

  const columns = [
    { title: 'Player', runner: playerRunner },
    { title: 'Dealer', runner: dealerRunner },
    { title: 'Tie', runner: tieRunner },
    { title: 'Pair', runner: pairRunner }
  ];

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* 4 Main Columns (Image 5 Exact Match) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {columns.map((col, idx) => {
          const isLocked = isBettingClosed || col.runner.status === 'SUSPENDED';

          return (
            <div key={idx} className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg flex flex-col">
              <div className="bg-[#0c1b29] p-2 text-center border-b border-slate-700">
                <span className="font-black text-xs text-slate-200 uppercase tracking-wide">
                  {col.title}
                </span>
              </div>

              <div className="p-3 bg-[#0f1d2c] flex-1 flex items-center justify-center">
                {isLocked ? (
                  <div className="w-full py-2.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                    <Lock size={14} className="text-slate-300" />
                  </div>
                ) : (
                  <button className="w-full py-2 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded shadow transition">
                    {col.runner.back || '1.98'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
