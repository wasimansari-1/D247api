import React from 'react';
import { Lock } from 'lucide-react';

export default function OneCardMeterBoard({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];
  const fighterA = runners.find(r => (r.name || '').toLowerCase().includes('fighter a') || (r.name || '').toLowerCase() === 'a') || {
    name: 'Fighter A',
    back: 0
  };
  const fighterB = runners.find(r => (r.name || '').toLowerCase().includes('fighter b') || (r.name || '').toLowerCase() === 'b') || {
    name: 'Fighter B',
    back: 0
  };

  return (
    <div className="flex flex-col gap-2 select-none w-full">
      <div className="grid grid-cols-2 gap-3 w-full">
        {/* Fighter A (Image 2 Right Exact Match) */}
        <div className="relative bg-[#72bbef] hover:bg-[#62aae0] rounded border border-blue-400 py-3.5 px-4 flex items-center justify-center gap-3 cursor-pointer shadow-md transition active:scale-[0.99]">
          <span className="font-extrabold text-slate-900 tracking-wider text-sm sm:text-base">
            FIGHTER A
          </span>
          <span className="text-xl sm:text-2xl">👊</span>
          {fighterA.back ? (
            <span className="text-xs bg-black/10 px-1.5 py-0.5 rounded font-mono font-bold text-slate-800">
              {fighterA.back}
            </span>
          ) : null}
          {isSuspended && (
            <div className="absolute inset-0 bg-slate-900/60 rounded flex items-center justify-center backdrop-blur-[1px]">
              <Lock size={18} className="text-amber-400" />
            </div>
          )}
        </div>

        {/* Fighter B with Yellow Border (Image 2 Right Exact Match) */}
        <div className="relative bg-[#72bbef] hover:bg-[#62aae0] rounded border-2 border-yellow-400 py-3.5 px-4 flex items-center justify-center gap-3 cursor-pointer shadow-md transition active:scale-[0.99]">
          <span className="text-xl sm:text-2xl">👊</span>
          <span className="font-extrabold text-slate-900 tracking-wider text-sm sm:text-base">
            FIGHTER B
          </span>
          {fighterB.back ? (
            <span className="text-xs bg-black/10 px-1.5 py-0.5 rounded font-mono font-bold text-slate-800">
              {fighterB.back}
            </span>
          ) : null}
          {isSuspended && (
            <div className="absolute inset-0 bg-slate-900/60 rounded flex items-center justify-center backdrop-blur-[1px]">
              <Lock size={18} className="text-amber-400" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
