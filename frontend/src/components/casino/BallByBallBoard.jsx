import React from 'react';
import { Lock } from 'lucide-react';

export default function BallByBallBoard({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];

  const runOptions = [
    [
      { name: '0 Runs', rate: '2.5' },
      { name: '3 Runs', rate: '15.0' },
      { name: 'Boundary', rate: '3.5' }
    ],
    [
      { name: '1 Runs', rate: '2.8' },
      { name: '4 Runs', rate: '4.5' },
      { name: 'Wicket', rate: '8.0' }
    ],
    [
      { name: '2 Runs', rate: '5.0' },
      { name: '6 Runs', rate: '7.5' },
      { name: 'Extra Runs', rate: '12.0' }
    ]
  ];

  return (
    <div className="flex flex-col gap-3 select-none">
      <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
        <div className="bg-[#0c1b29] px-3 py-1.5 border-b border-slate-700 flex justify-between items-center text-xs">
          <span className="font-extrabold text-sky-400">Runs</span>
          <span className="text-[10px] text-slate-400 font-mono">Min: 50.00 | Max: 25K</span>
        </div>

        {/* 3 Columns Grid (Image 2 Exact Match) */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {runOptions.map((col, cIdx) => (
            <div key={cIdx} className="flex flex-col divide-y divide-slate-800/80">
              <div className="bg-[#0c1b29]/60 px-3 py-1 flex justify-between text-[10px] font-bold text-slate-400">
                <span>Run</span>
                <span className="bg-[#72bbef]/20 text-[#72bbef] px-2 py-0.5 rounded">Back</span>
              </div>
              {col.map((item, idx) => {
                const liveR = runners.find(r => (r.name || '').toLowerCase() === item.name.toLowerCase());
                const rate = liveR?.back > 0 ? liveR.back : item.rate;
                return (
                  <div key={idx} className="p-2.5 px-3 flex items-center justify-between hover:bg-slate-800/40 transition">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{item.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono">Min: 50 | Max: 25K</span>
                    </div>
                    <div>
                      {isSuspended ? (
                        <div className="w-16 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                          <Lock size={12} className="text-slate-300" />
                        </div>
                      ) : (
                        <button className="w-16 py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded shadow transition">
                          {rate}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Green Disclaimer Banner (Image 2 Exact Match) */}
        <div className="m-3 p-2 bg-[#1b4332] border border-emerald-500/60 rounded flex items-center justify-center text-center gap-1.5 text-xs text-emerald-200 font-bold shadow">
          <span>💬</span>
          <span>Results are based on stream only. Score board may be different or updated later.</span>
        </div>
      </div>
    </div>
  );
}
