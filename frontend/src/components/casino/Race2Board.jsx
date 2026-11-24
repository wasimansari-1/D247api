import React from 'react';
import { Lock } from 'lucide-react';

export default function Race2Board({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];
  const isBettingClosed = isSuspended || timer <= 3;

  const players = [
    { name: 'Player A', key: 'a' },
    { name: 'Player B', key: 'b' },
    { name: 'Player C', key: 'c' },
    { name: 'Player D', key: 'd' }
  ];

  return (
    <div className="flex flex-col gap-3 select-none">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {players.map((p, idx) => {
          const liveR = runners.find(r => (r.name || '').toLowerCase().includes(p.name.toLowerCase())) || {
            name: p.name,
            back: 3.75,
            lay: 4.10
          };

          return (
            <div key={idx} className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg flex flex-col">
              <div className="bg-[#0c1b29] p-2 text-center border-b border-slate-700">
                <span className="font-black text-xs text-white">{p.name}</span>
              </div>

              <div className="grid grid-cols-2 p-2 gap-1.5 bg-[#0f1d2c] flex-1 items-center">
                {isBettingClosed ? (
                  <div className="py-2.5 bg-[#1e3a5f] rounded border border-blue-500/30 text-blue-200 flex items-center justify-center">
                    <Lock size={14} className="text-blue-300" />
                  </div>
                ) : (
                  <button className="py-2 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded shadow transition">
                    {liveR.back || '3.75'}
                  </button>
                )}

                {isBettingClosed ? (
                  <div className="py-2.5 bg-[#4a2430] rounded border border-pink-500/30 text-pink-200 flex items-center justify-center">
                    <Lock size={14} className="text-pink-300" />
                  </div>
                ) : (
                  <button className="py-2 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-xs rounded transition shadow">
                    {liveR.lay || '4.10'}
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
