import React from 'react';
import { Lock } from 'lucide-react';

export default function SuperOverBoard({ roundData, timer, isSuspended, slug }) {
  const runners = roundData?.runners || [];
  const sLower = (slug || '').toLowerCase();
  const isSO2 = sLower.includes('superover2');
  const team1 = isSO2 ? 'ENG' : 'IND';
  const team2 = isSO2 ? 'RSA' : 'ENG';

  // 1. Bookmaker Runners (Team 1 vs Team 2)
  const bookmakerRunners = [
    runners.find(r => (r.name || '').toUpperCase().includes(team1)) || {
      name: team1,
      back: 1.96,
      backSize: 300000,
      lay: 0,
      laySize: 300000
    },
    runners.find(r => (r.name || '').toUpperCase().includes(team2)) || {
      name: team2,
      back: 1.96,
      backSize: 300000,
      lay: 0,
      laySize: 300000
    }
  ];

  // 2. Fancy Runners (1 over run bhav, 1 over run)
  const fancyRunners = [
    runners.find(r => (r.name || '').toLowerCase().includes('bhav')) || {
      name: `1 over run bhav ${team1}`,
      no: 13,
      noSize: 84,
      yes: 13,
      yesSize: 74
    },
    runners.find(r => (r.name || '').toLowerCase().includes('1 over run') && !(r.name || '').toLowerCase().includes('bhav')) || {
      name: `1 over run ${team1}`,
      no: 13,
      noSize: 84,
      yes: 13,
      yesSize: 74
    }
  ];

  // 3. Fancy1 Runners (Common Wicket, Common Boundry)
  const fancy1Runners = [
    runners.find(r => (r.name || '').toLowerCase().includes('wicket')) || {
      name: `Common Wicket ${team1}`,
      back: 1.56,
      backSize: 100,
      lay: 1.61,
      laySize: 100
    },
    runners.find(r => (r.name || '').toLowerCase().includes('boundry') || (r.name || '').toLowerCase().includes('boundary')) || {
      name: `Common Boundry ${team1}`,
      back: 1.17,
      backSize: 100,
      lay: 1.22,
      laySize: 100
    }
  ];

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* 1. Bookmaker Market (Exact to Image 3 Right) */}
      <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
        <div className="bg-[#0c1b29] px-3 py-2 border-b border-slate-700 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sky-400">Bookmaker</span>
            <span className="text-[10px] text-slate-400 font-mono">Min: 100.00 Max: 3L</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-center">
            <div className="w-16 sm:w-20 bg-[#72bbef]/20 text-[#72bbef] rounded font-black py-0.5">Back</div>
            <div className="w-16 sm:w-20 bg-[#faa9ba]/20 text-[#faa9ba] rounded font-black py-0.5 ml-1">Lay</div>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-slate-800">
          {bookmakerRunners.map((runner, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 px-3 hover:bg-slate-800/40 transition">
              <span className="text-xs font-black text-white">{runner.name}</span>
              <div className="flex items-center gap-1">
                {isSuspended ? (
                  <div className="w-16 sm:w-20 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                    <Lock size={12} className="text-slate-300" />
                  </div>
                ) : (
                  <button className="w-16 sm:w-20 py-1 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 rounded flex flex-col items-center justify-center transition shadow">
                    <span className="text-xs font-black leading-none">{runner.back || '1.96'}</span>
                    <span className="text-[9px] text-slate-700 font-mono leading-none">{runner.backSize || '300000'}</span>
                  </button>
                )}

                {isSuspended ? (
                  <div className="w-16 sm:w-20 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center ml-1">
                    <Lock size={12} className="text-slate-300" />
                  </div>
                ) : (
                  <button className="w-16 sm:w-20 py-1 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 rounded flex flex-col items-center justify-center transition shadow ml-1">
                    <span className="text-xs font-black leading-none">{runner.lay || '-'}</span>
                    <span className="text-[9px] text-slate-700 font-mono leading-none">{runner.laySize || '300000'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Fancy Market (1 over run bhav, 1 over run) */}
      <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
        <div className="bg-[#0c1b29] px-3 py-2 border-b border-slate-700 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-amber-400">Fancy</span>
            <span className="text-[10px] text-slate-400 font-mono">Min: 100 Max: 1L</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-center">
            <div className="w-16 sm:w-20 bg-[#faa9ba]/20 text-[#faa9ba] rounded font-black py-0.5">No</div>
            <div className="w-16 sm:w-20 bg-[#72bbef]/20 text-[#72bbef] rounded font-black py-0.5 ml-1">Yes</div>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-slate-800">
          {fancyRunners.map((runner, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 px-3 hover:bg-slate-800/40 transition">
              <span className="text-xs font-bold text-white">{runner.name}</span>
              <div className="flex items-center gap-1">
                {isSuspended ? (
                  <div className="w-16 sm:w-20 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                    <Lock size={12} className="text-slate-300" />
                  </div>
                ) : (
                  <button className="w-16 sm:w-20 py-1 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 rounded flex flex-col items-center justify-center transition shadow">
                    <span className="text-xs font-black leading-none">{runner.no || runner.lay || '13'}</span>
                    <span className="text-[9px] text-slate-700 font-mono leading-none">{runner.noSize || runner.laySize || '84'}</span>
                  </button>
                )}

                {isSuspended ? (
                  <div className="w-16 sm:w-20 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center ml-1">
                    <Lock size={12} className="text-slate-300" />
                  </div>
                ) : (
                  <button className="w-16 sm:w-20 py-1 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 rounded flex flex-col items-center justify-center transition shadow ml-1">
                    <span className="text-xs font-black leading-none">{runner.yes || runner.back || '13'}</span>
                    <span className="text-[9px] text-slate-700 font-mono leading-none">{runner.yesSize || runner.backSize || '74'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Fancy1 Market (Common Wicket, Common Boundry) */}
      <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
        <div className="bg-[#0c1b29] px-3 py-2 border-b border-slate-700 flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-emerald-400">Fancy1</span>
            <span className="text-[10px] text-slate-400 font-mono">Min: 100 Max: 10K</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-center">
            <div className="w-16 sm:w-20 bg-[#72bbef]/20 text-[#72bbef] rounded font-black py-0.5">Back</div>
            <div className="w-16 sm:w-20 bg-[#faa9ba]/20 text-[#faa9ba] rounded font-black py-0.5 ml-1">Lay</div>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-slate-800">
          {fancy1Runners.map((runner, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 px-3 hover:bg-slate-800/40 transition">
              <span className="text-xs font-bold text-white">{runner.name}</span>
              <div className="flex items-center gap-1">
                {isSuspended ? (
                  <div className="w-16 sm:w-20 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                    <Lock size={12} className="text-slate-300" />
                  </div>
                ) : (
                  <button className="w-16 sm:w-20 py-1 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 rounded flex flex-col items-center justify-center transition shadow">
                    <span className="text-xs font-black leading-none">{runner.back || '1.56'}</span>
                    <span className="text-[9px] text-slate-700 font-mono leading-none">{runner.backSize || '100'}</span>
                  </button>
                )}

                {isSuspended ? (
                  <div className="w-16 sm:w-20 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center ml-1">
                    <Lock size={12} className="text-slate-300" />
                  </div>
                ) : (
                  <button className="w-16 sm:w-20 py-1 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 rounded flex flex-col items-center justify-center transition shadow ml-1">
                    <span className="text-xs font-black leading-none">{runner.lay || '1.61'}</span>
                    <span className="text-[9px] text-slate-700 font-mono leading-none">{runner.laySize || '100'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
