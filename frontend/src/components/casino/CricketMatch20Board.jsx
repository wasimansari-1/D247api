import React from 'react';
import { Lock } from 'lucide-react';

export default function CricketMatch20Board({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];
  const isBettingClosed = isSuspended || timer <= 3;

  // Runs 2 to 10 split into 2 columns: Left (2, 3, 4, 5, 6) & Right (7, 8, 9, 10)
  const leftRuns = [2, 3, 4, 5, 6];
  const rightRuns = [7, 8, 9, 10];

  // Default market odds fallback based on Diamond Online reference
  const defaultOdds = {
    2: { back: '9.5', lay: '10.5' },
    3: { back: '4.8', lay: '5.2' },
    4: { back: '3.23', lay: '3.43' },
    5: { back: '2.45', lay: '2.55' },
    6: { back: '1.98', lay: '2.02' },
    7: { back: '1.65', lay: '1.69' },
    8: { back: '1.42', lay: '1.45' },
    9: { back: '1.24', lay: '1.27' },
    10: { back: '1.1', lay: '1.13' }
  };

  const renderRunRow = (runNum) => {
    // Find matching runner from upstream
    const runRunner = runners.find(r => {
      const n = (r.name || '').toLowerCase();
      return n.includes(`run ${runNum}`) || n.includes(`${runNum} run`) || n === `${runNum}`;
    });

    const backVal = runRunner?.back > 0 ? runRunner.back : defaultOdds[runNum]?.back || '1.95';
    const layVal = runRunner?.lay > 0 ? runRunner.lay : defaultOdds[runNum]?.lay || '2.05';

    return (
      <div key={runNum} className="flex flex-col gap-1 bg-[#0c1824] p-2 rounded-lg border border-slate-700/80 shadow-md">
        {/* Row 1: Team A Banner, Center 3D Red Ball, Team B Banner */}
        <div className="flex items-center justify-between gap-1">
          {/* Team A Banner */}
          <div className="flex-1 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 px-2 py-1 rounded text-center shadow-inner">
            <span className="text-[10px] font-black text-slate-200 tracking-tight block truncate">
              Team A
            </span>
            <span className="text-[9px] font-bold text-slate-400 block truncate">
              241/5 20 Over
            </span>
          </div>

          {/* Center 3D Cricket Ball Badge */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-b from-red-500 via-rose-700 to-red-950 border-2 border-red-400/60 shadow-lg flex flex-col items-center justify-center shrink-0 ring-1 ring-red-900">
            <span className="text-white font-black text-[12px] leading-none drop-shadow">
              {runNum}
            </span>
            <span className="text-[7px] font-extrabold text-red-100 tracking-tighter leading-none mt-0.5">
              RUNS
            </span>
          </div>

          {/* Team B Banner */}
          <div className="flex-1 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 px-2 py-1 rounded text-center shadow-inner">
            <span className="text-[10px] font-black text-slate-200 tracking-tight block truncate">
              Team B
            </span>
            <span className="text-[9px] font-bold text-slate-400 block truncate">
              229/4 19.5 Overs
            </span>
          </div>
        </div>

        {/* Row 2: Back & Lay Odds Buttons */}
        <div className="flex items-center justify-center gap-2 pt-0.5">
          {isBettingClosed ? (
            <div className="w-24 py-1.5 bg-[#1e3a5f] rounded border border-blue-500/30 text-blue-200 flex items-center justify-center">
              <Lock size={12} className="text-blue-300" />
            </div>
          ) : (
            <button className="w-24 py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded transition shadow active:scale-95">
              {backVal}
            </button>
          )}

          {isBettingClosed ? (
            <div className="w-24 py-1.5 bg-[#4a2430] rounded border border-pink-500/30 text-pink-200 flex items-center justify-center">
              <Lock size={12} className="text-pink-300" />
            </div>
          ) : (
            <button className="w-24 py-1.5 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-xs rounded transition shadow active:scale-95">
              {layVal}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* 2-Column Scorecard Layout (Image 3 Exact Match) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Left Column: Runs 2, 3, 4, 5, 6 */}
        <div className="flex flex-col gap-2">
          {leftRuns.map(runNum => renderRunRow(runNum))}
        </div>

        {/* Right Column: Runs 7, 8, 9, 10 */}
        <div className="flex flex-col gap-2">
          {rightRuns.map(runNum => renderRunRow(runNum))}
        </div>
      </div>

      {/* Official Exchange Notice */}
      <div className="py-2 px-3 rounded-lg bg-[#0e1d2d] border border-slate-700/80 text-slate-400 text-[11px] font-bold text-center flex items-center justify-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Cricket Match 20-20 Live Stream Odds & Automatic Round Scoring</span>
      </div>
    </div>
  );
}
