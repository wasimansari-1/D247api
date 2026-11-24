import React from 'react';
import { Lock } from 'lucide-react';

export default function MiniSuperOverBoard({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];
  const score = roundData?.score || {
    team1: 'IND',
    team1Score: '3-0 (0.2)',
    team1CRR: 'CRR 6.00',
    team2: 'AUS',
    team2Score: '0-0 (0.0)',
    balls: ['3', '0']
  };

  const indRunner = runners.find(r => (r.name || '').toUpperCase().includes('IND')) || {
    name: 'IND',
    back: 1.96,
    lay: 0,
    min: 100,
    max: 300000
  };
  const ausRunner = runners.find(r => (r.name || '').toUpperCase().includes('AUS') || (r.name || '').toUpperCase().includes('ENG') || (r.name || '').toUpperCase().includes('RSA')) || {
    name: 'AUS',
    back: 1.96,
    lay: 0,
    min: 100,
    max: 300000
  };

  const fancyRunners = runners.filter(r => !r.name.toUpperCase().includes('IND') && !r.name.toUpperCase().includes('AUS') && !r.name.toUpperCase().includes('ENG') && !r.name.toUpperCase().includes('RSA'));

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* 1. Bookmaker Market (Image 5 Exact Match) */}
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
        {[indRunner, ausRunner].map((team, idx) => (
          <div key={idx} className="grid grid-cols-12 items-center border-b border-slate-800 p-2.5 text-center">
            <div className="col-span-8 text-left font-black text-sm text-white">{team.name}</div>
            <div className="col-span-2">
              {isSuspended ? (
                <div className="py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                  <Lock size={13} className="text-slate-300" />
                </div>
              ) : (
                <button className="w-full py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded transition shadow">
                  <div className="leading-tight">{team.back || '1.96'}</div>
                  <div className="text-[8px] text-slate-800 font-normal">300000</div>
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
                  <div className="leading-tight">{team.lay || '-'}</div>
                  <div className="text-[8px] text-slate-800 font-normal">200000</div>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 2. Fancy & Fancy1 Markets (Image 5 Exact Match) */}
      <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
        <div className="bg-[#0c1b29] px-3 py-1.5 border-b border-slate-700 flex justify-between items-center text-xs">
          <span className="font-extrabold text-amber-400">Fancy</span>
          <span className="text-[10px] text-slate-400 font-mono">Min: 100 | Max: 10,000</span>
        </div>
        <div className="grid grid-cols-12 bg-[#0c1b29]/80 text-[11px] font-bold text-slate-300 border-b border-slate-800 py-1 px-3 text-center">
          <div className="col-span-8 text-left font-black text-slate-400">Market</div>
          <div className="col-span-2 bg-rose-500/20 text-rose-300 rounded font-black py-0.5">No</div>
          <div className="col-span-2 bg-sky-500/20 text-sky-300 rounded font-black py-0.5 ml-1">Yes</div>
        </div>

        {fancyRunners.length > 0 ? (
          fancyRunners.slice(0, 6).map((r, idx) => (
            <div key={idx} className="grid grid-cols-12 items-center border-b border-slate-800 p-2 text-center text-xs">
              <div className="col-span-8 text-left font-bold text-slate-200 truncate pr-2">{r.name}</div>
              <div className="col-span-2">
                <button className="w-full py-1 bg-[#faa9ba] text-slate-950 font-black text-xs rounded">
                  {r.lay || '7'}
                </button>
              </div>
              <div className="col-span-2 ml-1">
                <button className="w-full py-1 bg-[#72bbef] text-slate-950 font-black text-xs rounded">
                  {r.back || '7'}
                </button>
              </div>
            </div>
          ))
        ) : (
          [
            { name: '1 over run bhav IND', no: '7', yes: '7' },
            { name: '1 over run IND', no: '7', yes: '7' },
            { name: 'Tie', no: '5.7', yes: '6.3' }
          ].map((r, idx) => (
            <div key={idx} className="grid grid-cols-12 items-center border-b border-slate-800 p-2 text-center text-xs">
              <div className="col-span-8 text-left font-bold text-slate-200">{r.name}</div>
              <div className="col-span-2">
                <button className="w-full py-1 bg-[#faa9ba] text-slate-950 font-black text-xs rounded">
                  {r.no}
                </button>
              </div>
              <div className="col-span-2 ml-1">
                <button className="w-full py-1 bg-[#72bbef] text-slate-950 font-black text-xs rounded">
                  {r.yes}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
