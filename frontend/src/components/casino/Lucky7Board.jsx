import React from 'react';
import { Lock } from 'lucide-react';

export default function Lucky7Board({ roundData, timer, isSuspended }) {
  const runners = roundData?.runners || [];

  const getRunner = (keyword) => {
    const kLow = keyword.toLowerCase();
    return runners.find(r => (r.name || '').toLowerCase() === kLow || (r.name || '').toLowerCase().includes(kLow));
  };

  const lowCard = getRunner('low') || { back: '2.0' };
  const card7 = getRunner('7') || { back: '11.0' };
  const highCard = getRunner('high') || { back: '2.0' };

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* Row 1: Low Card | 7 | High Card */}
      <div className="grid grid-cols-3 gap-2">
        {/* Low Card */}
        <div className="p-3 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-lg flex flex-col items-center justify-center cursor-pointer shadow-md transition active:scale-95">
          <span className="text-xs text-blue-200 font-bold">{lowCard.back || '2.0'}</span>
          <span className="text-sm sm:text-base font-black">Low Card (1-6)</span>
        </div>

        {/* 7 */}
        <div className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg flex flex-col items-center justify-center cursor-pointer shadow-lg transition active:scale-95 border-2 border-yellow-400">
          <span className="text-xs text-yellow-200 font-bold">{card7.back || '11.0'}</span>
          <span className="text-lg sm:text-xl font-black">7</span>
        </div>

        {/* High Card */}
        <div className="p-3 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-lg flex flex-col items-center justify-center cursor-pointer shadow-md transition active:scale-95">
          <span className="text-xs text-blue-200 font-bold">{highCard.back || '2.0'}</span>
          <span className="text-sm sm:text-base font-black">High Card (8-K)</span>
        </div>
      </div>

      {/* Row 2: Side Bets (Even, Odd, Red, Black) */}
      <div className="grid grid-cols-4 gap-2">
        <div className="py-2.5 px-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg flex flex-col items-center justify-center cursor-pointer shadow transition">
          <span className="text-xs text-blue-200 font-bold">2.1</span>
          <span className="text-xs font-black">Even</span>
        </div>
        <div className="py-2.5 px-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg flex flex-col items-center justify-center cursor-pointer shadow transition">
          <span className="text-xs text-blue-200 font-bold">1.79</span>
          <span className="text-xs font-black">Odd</span>
        </div>
        <div className="py-2.5 px-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded-lg flex flex-col items-center justify-center cursor-pointer shadow transition">
          <span className="text-xs text-rose-200 font-bold">1.95</span>
          <span className="text-sm font-black">♥ ♦</span>
        </div>
        <div className="py-2.5 px-2 bg-gradient-to-r from-slate-900 to-blue-950 hover:from-slate-800 hover:to-blue-900 text-white rounded-lg flex flex-col items-center justify-center cursor-pointer shadow transition">
          <span className="text-xs text-slate-300 font-bold">1.95</span>
          <span className="text-sm font-black">♠ ♣</span>
        </div>
      </div>
    </div>
  );
}
