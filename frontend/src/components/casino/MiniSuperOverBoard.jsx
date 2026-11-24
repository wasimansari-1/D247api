import React from 'react';
import { Lock } from 'lucide-react';

export default function MiniSuperOverBoard({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];

  // Bookmaker runners (IND vs AUS or ENG)
  const indRunner = runners.find(r => r.name === 'IND' || (r.name || '').toUpperCase().startsWith('IND')) || {
    name: 'IND',
    back: 1.7,
    lay: 1.74,
    backSize: 300000,
    laySize: 300000
  };
  const ausRunner = runners.find(r => r.name === 'AUS' || r.name === 'ENG' || (r.name || '').toUpperCase().startsWith('AUS')) || {
    name: 'AUS',
    back: 0,
    lay: 0,
    backSize: 200000,
    laySize: 200000
  };

  // Tie runner
  const tieRunner = runners.find(r => (r.name || '').toLowerCase() === 'tie') || {
    name: 'Tie',
    back: 9.4,
    lay: 11.4,
    min: 100,
    max: 10000
  };

  // Fancy1 runners (all over ball markets)
  const fancy1Runners = runners.filter(r => 
    r.marketName === 'Fancy1' || 
    (r.name && !['IND', 'AUS', 'ENG', 'RSA', 'Tie'].includes(r.name) && !r.name.includes('bhav'))
  );

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* 1. Bookmaker Market (Image 1 Exact Match) */}
      <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
        <div className="bg-[#0c1b29] px-3 py-1.5 border-b border-slate-700 flex justify-between items-center text-xs">
          <span className="font-extrabold text-sky-400">Bookmaker</span>
          <span className="text-[10px] text-slate-400 font-mono">Min: 100.00 Max: 3L</span>
        </div>
        <div className="grid grid-cols-12 bg-[#0c1b29]/80 text-[11px] font-bold text-slate-300 border-b border-slate-800 py-1 px-3 text-center">
          <div className="col-span-8 text-left font-black text-slate-400">Team</div>
          <div className="col-span-2 bg-[#72bbef]/20 text-[#72bbef] rounded font-black py-0.5">Back</div>
          <div className="col-span-2 bg-[#faa9ba]/20 text-[#faa9ba] rounded font-black py-0.5 ml-1">Lay</div>
        </div>
        {[indRunner, ausRunner].map((team, idx) => {
          const isTeamSuspended = isSuspended || (!team.back && !team.lay) || team.suspended;
          return (
            <div key={idx} className="grid grid-cols-12 items-center border-b border-slate-800 p-2.5 text-center">
              <div className="col-span-8 text-left font-black text-sm text-white">{team.name}</div>
              <div className="col-span-2">
                {isTeamSuspended ? (
                  <div className="py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                    <Lock size={13} className="text-slate-300" />
                  </div>
                ) : (
                  <button className="w-full py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded transition shadow">
                    <div className="leading-tight">{team.back || '1.7'}</div>
                    <div className="text-[8px] text-slate-800 font-normal">{team.backSize || '300000'}</div>
                  </button>
                )}
              </div>
              <div className="col-span-2 ml-1">
                {isTeamSuspended ? (
                  <div className="py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                    <Lock size={13} className="text-slate-300" />
                  </div>
                ) : (
                  <button className="w-full py-1.5 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-xs rounded transition shadow">
                    <div className="leading-tight">{team.lay || '1.74'}</div>
                    <div className="text-[8px] text-slate-800 font-normal">{team.laySize || '300000'}</div>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Tie Market (Image 1 Exact Match) */}
      <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
        <div className="bg-[#0c1b29] px-3 py-1.5 border-b border-slate-700 flex justify-between items-center text-xs">
          <span className="font-extrabold text-amber-400">Tie</span>
          <span className="text-[10px] text-slate-400 font-mono">Min: 100 Max: 10K</span>
        </div>
        <div className="grid grid-cols-12 items-center p-2.5 text-center">
          <div className="col-span-8 text-left font-black text-sm text-white">Tie</div>
          <div className="col-span-2">
            {isSuspended ? (
              <div className="py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                <Lock size={13} className="text-slate-300" />
              </div>
            ) : (
              <button className="w-full py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded transition shadow">
                <div className="leading-tight">{tieRunner.back || '9.4'}</div>
                <div className="text-[8px] text-slate-800 font-normal">100</div>
              </button>
            )}
          </div>
          <div className="col-span-2 ml-1">
            {isSuspended ? (
              <div className="py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                <Lock size={13} className="text-slate-300" />
              </div>
            ) : (
              <button className="w-full py-1.5 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-xs rounded transition shadow">
                <div className="leading-tight">{tieRunner.lay || '11.4'}</div>
                <div className="text-[8px] text-slate-800 font-normal">100</div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Fancy1 Markets (2-Column Grid matching Image 1 Exact) */}
      <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
        <div className="bg-[#0c1b29] px-3 py-1.5 border-b border-slate-700 flex justify-between items-center text-xs">
          <span className="font-extrabold text-emerald-400">Fancy1</span>
          <span className="text-[10px] text-slate-400 font-mono">Min: 100 | Max: 10,000</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {fancy1Runners.length > 0 ? (
            fancy1Runners.map((r, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 px-3 border-b border-slate-800 hover:bg-slate-800/40 transition">
                <div className="flex flex-col pr-2 min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-200 truncate">{r.name}</span>
                  <span className="text-[9px] text-slate-400 font-mono">Min: 100 Max: 10K</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button className="w-14 py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded shadow">
                    {r.back > 0 ? r.back : '-'}
                  </button>
                  <button className="w-14 py-1.5 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-xs rounded shadow">
                    {r.lay > 0 ? r.lay : '-'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            [
              { name: '0.3 Over Wicket AUS', back: 5.95, lay: '-' },
              { name: '0.3 Over Zero AUS', back: 8.8, lay: '-' },
              { name: '0.3 Over One AUS', back: 5.95, lay: '-' },
              { name: '0.3 Over Two AUS', back: 5.95, lay: '-' },
              { name: '0.3 Over Three AUS', back: 8.8, lay: '-' },
              { name: '0.3 Over Boundry AUS', back: 3.0, lay: '-' },
            ].map((r, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 px-3 border-b border-slate-800 hover:bg-slate-800/40 transition">
                <div className="flex flex-col pr-2 min-w-0 flex-1">
                  <span className="text-xs font-bold text-slate-200 truncate">{r.name}</span>
                  <span className="text-[9px] text-slate-400 font-mono">Min: 100 Max: 10K</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button className="w-14 py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded shadow">
                    {r.back}
                  </button>
                  <button className="w-14 py-1.5 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-xs rounded shadow">
                    {r.lay}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
