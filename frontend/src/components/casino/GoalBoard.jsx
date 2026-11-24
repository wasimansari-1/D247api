import React from 'react';
import { Lock } from 'lucide-react';

export default function GoalBoard({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];

  const goalScorers = [
    { name: 'Cristiano Ronaldo', rate: '5.05' },
    { name: 'Lionel Messi', rate: '5.59' },
    { name: 'Robert Lewandowski', rate: '6.59' },
    { name: 'Neymar', rate: '7.53' },
    { name: 'Harry Kane', rate: '9.00' },
    { name: 'Zlatan Ibrahimovic', rate: '11.90' },
    { name: 'Romelu Lukaku', rate: '13.17' },
    { name: 'Kylian Mbappe', rate: '15.37' },
    { name: 'Erling Haaland', rate: '16.04' },
    { name: 'No Goal', rate: '33.53' }
  ];

  const goalMethods = [
    { name: 'Shot Goal', rate: '1.78' },
    { name: 'Header Goal', rate: '4.44' },
    { name: 'Penalty Goal', rate: '6.83' },
    { name: 'Free Kick Goal', rate: '10.25' },
    { name: 'No Goal', rate: '33.53' }
  ];

  return (
    <div className="flex flex-col gap-3 select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Column 1: Who Will Goal Next? (Image 1 Exact Match) */}
        <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
          <div className="bg-[#0c1b29] px-3 py-2 border-b border-slate-700 flex justify-between items-center text-xs">
            <span className="font-extrabold text-sky-400">Who Will Goal Next?</span>
            <span className="text-[10px] text-slate-400 font-mono">Back</span>
          </div>

          <div className="flex flex-col divide-y divide-slate-800">
            {goalScorers.map((player, idx) => {
              const liveR = runners.find(r => (r.name || '').toLowerCase() === player.name.toLowerCase());
              const rate = liveR?.back > 0 ? liveR.back : player.rate;
              return (
                <div key={idx} className="flex items-center justify-between p-2 px-3 hover:bg-slate-800/40 transition">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white leading-tight">{player.name}</span>
                    <span className="text-[9px] text-slate-400 font-mono">Min: 100 | Max: 1L</span>
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
        </div>

        {/* Column 2: Method Of Next Goal (Image 1 Exact Match) */}
        <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg flex flex-col justify-between">
          <div>
            <div className="bg-[#0c1b29] px-3 py-2 border-b border-slate-700 flex justify-between items-center text-xs">
              <span className="font-extrabold text-amber-400">Method Of Next Goal</span>
              <span className="text-[10px] text-slate-400 font-mono">Back</span>
            </div>

            <div className="flex flex-col divide-y divide-slate-800">
              {goalMethods.map((method, idx) => {
                const liveR = runners.find(r => (r.name || '').toLowerCase() === method.name.toLowerCase());
                const rate = liveR?.back > 0 ? liveR.back : method.rate;
                return (
                  <div key={idx} className="flex items-center justify-between p-2.5 px-3 hover:bg-slate-800/40 transition">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white leading-tight">{method.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono">Min: 100 | Max: 1L</span>
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
          </div>

          {/* Green Notice Banner (Image 1 Exact Match) */}
          <div className="m-3 p-2 bg-[#1b4332] border border-emerald-500/60 rounded flex items-center justify-center text-center gap-1.5 text-xs text-emerald-200 font-bold shadow">
            <span>💬</span>
            <span>Results are based on stream only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
