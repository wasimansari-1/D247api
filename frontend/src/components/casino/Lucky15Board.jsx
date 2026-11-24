import React from 'react';
import { Lock } from 'lucide-react';

export default function Lucky15Board({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];

  const runItems = [
    { key: '0 runs', label: '0 Runs' },
    { key: '1 runs', label: '1 Runs' },
    { key: '2 runs', label: '2 Runs' },
    { key: '4 runs', label: '4 Runs' },
    { key: '6 runs', label: '6 Runs' },
    { key: 'wicket', label: 'Wicket' }
  ];

  const getRunner = (key) => {
    return runners.find(r => (r.name || '').toLowerCase() === key || (r.name || '').toLowerCase().includes(key));
  };

  return (
    <div className="flex flex-col gap-3 select-none">
      <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
        {/* Table Header: Runs */}
        <div className="grid grid-cols-3 bg-[#0c1b29] text-xs font-black text-slate-300 border-b border-slate-700 py-2.5 px-3">
          <div className="flex items-center justify-between col-span-1 pr-2">
            <span className="text-sky-400">Runs</span>
            <span className="text-[10px] text-slate-400 font-mono">Back</span>
          </div>
          <div className="flex items-center justify-between col-span-1 px-2 border-x border-slate-800">
            <span className="text-sky-400">Runs</span>
            <span className="text-[10px] text-slate-400 font-mono">Back</span>
          </div>
          <div className="flex items-center justify-between col-span-1 pl-2">
            <span className="text-sky-400">Runs</span>
            <span className="text-[10px] text-slate-400 font-mono">Back</span>
          </div>
        </div>

        {/* 2 Rows x 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 p-2 gap-2 bg-[#081522]">
          {/* Column 1: 0 Runs & 4 Runs */}
          <div className="flex flex-col gap-2">
            {[runItems[0], runItems[3]].map((item, idx) => {
              const r = getRunner(item.key);
              const rate = r?.back > 0 ? r.back : null;
              return (
                <div key={idx} className="bg-[#112435] p-2.5 rounded border border-slate-700 flex items-center justify-between">
                  <span className="text-xs font-black text-white">{item.label}</span>
                  <div>
                    {isSuspended || !rate ? (
                      <div className="w-20 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex flex-col items-center justify-center">
                        <Lock size={12} className="text-slate-300" />
                        <span className="text-[8px] text-slate-400 font-mono leading-none mt-0.5">Min: 50 | Max: 25K</span>
                      </div>
                    ) : (
                      <button className="w-20 py-1 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 rounded flex flex-col items-center justify-center transition shadow">
                        <span className="text-xs font-black leading-none">{rate}</span>
                        <span className="text-[8px] text-slate-700 font-mono leading-none mt-0.5">Min: 50 | Max: 25K</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Column 2: 1 Runs & 6 Runs */}
          <div className="flex flex-col gap-2">
            {[runItems[1], runItems[4]].map((item, idx) => {
              const r = getRunner(item.key);
              const rate = r?.back > 0 ? r.back : null;
              return (
                <div key={idx} className="bg-[#112435] p-2.5 rounded border border-slate-700 flex items-center justify-between">
                  <span className="text-xs font-black text-white">{item.label}</span>
                  <div>
                    {isSuspended || !rate ? (
                      <div className="w-20 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex flex-col items-center justify-center">
                        <Lock size={12} className="text-slate-300" />
                        <span className="text-[8px] text-slate-400 font-mono leading-none mt-0.5">Min: 50 | Max: 25K</span>
                      </div>
                    ) : (
                      <button className="w-20 py-1 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 rounded flex flex-col items-center justify-center transition shadow">
                        <span className="text-xs font-black leading-none">{rate}</span>
                        <span className="text-[8px] text-slate-700 font-mono leading-none mt-0.5">Min: 50 | Max: 25K</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Column 3: 2 Runs & Wicket */}
          <div className="flex flex-col gap-2">
            {[runItems[2], runItems[5]].map((item, idx) => {
              const r = getRunner(item.key);
              const rate = r?.back > 0 ? r.back : null;
              return (
                <div key={idx} className="bg-[#112435] p-2.5 rounded border border-slate-700 flex items-center justify-between">
                  <span className="text-xs font-black text-white">{item.label}</span>
                  <div>
                    {isSuspended || !rate ? (
                      <div className="w-20 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex flex-col items-center justify-center">
                        <Lock size={12} className="text-slate-300" />
                        <span className="text-[8px] text-slate-400 font-mono leading-none mt-0.5">Min: 50 | Max: 25K</span>
                      </div>
                    ) : (
                      <button className="w-20 py-1 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 rounded flex flex-col items-center justify-center transition shadow">
                        <span className="text-xs font-black leading-none">{rate}</span>
                        <span className="text-[8px] text-slate-700 font-mono leading-none mt-0.5">Min: 50 | Max: 25K</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
