import React from 'react';
import { Lock } from 'lucide-react';

export default function DusKaDumBoard({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];
  const isBettingClosed = isSuspended || timer <= 3;

  // Active Next Total market (e.g. Next Total 20 or More)
  const nextTotalRunner = runners.find(r => (r.name || '').toLowerCase().includes('next total')) || {
    name: 'Next Total 20 or More',
    back: 1.95,
    lay: 2.05
  };

  const evenRunner = runners.find(r => (r.name || '').toLowerCase() === 'even') || { name: 'Even', rate: 1.95 };
  const oddRunner = runners.find(r => (r.name || '').toLowerCase() === 'odd') || { name: 'Odd', rate: 1.95 };
  const redRunner = runners.find(r => (r.name || '').toLowerCase().includes('red')) || { name: 'Red', rate: 1.95 };
  const blackRunner = runners.find(r => (r.name || '').toLowerCase().includes('black')) || { name: 'Black', rate: 1.95 };

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* 1. Row 1: Active Market (Next Total 20 or More) */}
      <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg">
        <div className="flex items-center justify-between p-3 bg-[#0c1b29] border-b border-slate-700">
          <span className="font-black text-sm text-amber-300 uppercase tracking-wide">
            {nextTotalRunner.name || 'Next Total 20 or More'}
          </span>
          <div className="flex items-center gap-2">
            {isBettingClosed ? (
              <div className="w-20 py-2 bg-[#1e3a5f] rounded border border-blue-500/30 text-blue-200 flex items-center justify-center">
                <Lock size={14} className="text-blue-300" />
              </div>
            ) : (
              <button className="w-20 py-2 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded shadow transition">
                {nextTotalRunner.back || '1.95'}
              </button>
            )}

            {isBettingClosed ? (
              <div className="w-20 py-2 bg-[#4a2430] rounded border border-pink-500/30 text-pink-200 flex items-center justify-center">
                <Lock size={14} className="text-pink-300" />
              </div>
            ) : (
              <button className="w-20 py-2 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-xs rounded transition shadow">
                {nextTotalRunner.lay || '2.05'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Row 2: 2 Columns (Even / Odd on Left, Red / Black on Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Even / Odd */}
        <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg p-3 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            {/* Even */}
            <div className="bg-[#0c1b29] border border-slate-700/80 rounded p-2.5 flex flex-col items-center justify-center">
              <span className="text-xs font-black text-slate-200 mb-1">Even</span>
              {isBettingClosed ? (
                <div className="w-full py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                  <Lock size={12} className="text-slate-300" />
                </div>
              ) : (
                <button className="w-full py-2 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded shadow transition">
                  {evenRunner.rate || evenRunner.back || '1.95'}
                </button>
              )}
            </div>

            {/* Odd */}
            <div className="bg-[#0c1b29] border border-slate-700/80 rounded p-2.5 flex flex-col items-center justify-center">
              <span className="text-xs font-black text-slate-200 mb-1">Odd</span>
              {isBettingClosed ? (
                <div className="w-full py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                  <Lock size={12} className="text-slate-300" />
                </div>
              ) : (
                <button className="w-full py-2 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded shadow transition">
                  {oddRunner.rate || oddRunner.back || '1.95'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Red / Black */}
        <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden shadow-lg p-3 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            {/* Red */}
            <div className="bg-[#0c1b29] border border-slate-700/80 rounded p-2.5 flex flex-col items-center justify-center">
              <span className="text-xs font-black text-red-500 mb-1 flex items-center gap-1">
                Red <span>♥ ♦</span>
              </span>
              {isBettingClosed ? (
                <div className="w-full py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                  <Lock size={12} className="text-slate-300" />
                </div>
              ) : (
                <button className="w-full py-2 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded shadow transition">
                  {redRunner.rate || redRunner.back || '1.95'}
                </button>
              )}
            </div>

            {/* Black */}
            <div className="bg-[#0c1b29] border border-slate-700/80 rounded p-2.5 flex flex-col items-center justify-center">
              <span className="text-xs font-black text-slate-100 mb-1 flex items-center gap-1">
                Black <span>♠ ♣</span>
              </span>
              {isBettingClosed ? (
                <div className="w-full py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                  <Lock size={12} className="text-slate-300" />
                </div>
              ) : (
                <button className="w-full py-2 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded shadow transition">
                  {blackRunner.rate || blackRunner.back || '1.95'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
