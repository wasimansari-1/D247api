import React from 'react';

export default function UniqueTeenPattiBoard({ roundData, timer, isSuspended }) {
  return (
    <div className="flex flex-col gap-3 select-none">
      <div className="bg-[#112435] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-t-lg flex items-center justify-between border-b border-slate-700 shadow-lg">
        <span className="flex items-center gap-2">
          <span className="text-yellow-400 font-black">👆</span>
          Select any 3 cards of your choice and experience TeenPatti in a unique way.
        </span>
        <span className="text-[11px] font-mono text-slate-400">Round ID: #{roundData?.roundId || 'Connecting...'}</span>
      </div>
      <div className="flex items-center justify-center gap-2 sm:gap-4 py-4 bg-[#0c1b29] rounded-b-lg border border-slate-700/80 overflow-x-auto scrollbar-none px-2 shadow-inner">
        {[0, 1, 2, 3, 4, 5].map((idx) => {
          const c = roundData?.cards?.[idx];
          const isRed = c?.color === 'red' || c?.suit === '♥' || c?.suit === '♦';
          return (
            <div key={idx} className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center shadow">
                {idx + 1}
              </div>
              {c && !c.isHidden ? (
                <div className="w-12 h-18 sm:w-16 sm:h-24 bg-white border-2 border-yellow-400 rounded-lg shadow-xl flex flex-col justify-between p-1 select-none font-bold">
                  <div className={`text-sm sm:text-base font-black leading-none ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                    {c.rank}
                  </div>
                  <div className={`text-xl sm:text-3xl leading-none self-center ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                    {c.suit}
                  </div>
                  <div className={`text-[10px] sm:text-xs font-black leading-none self-end rotate-180 ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                    {c.rank}
                  </div>
                </div>
              ) : (
                <div className="w-12 h-18 sm:w-16 sm:h-24 rounded-lg bg-[#0b2742] border-2 border-yellow-400/80 shadow-md flex items-center justify-center">
                  <div className="text-yellow-300 font-serif text-xl">✦</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
