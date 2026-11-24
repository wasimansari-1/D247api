import React from 'react';
import { Lock } from 'lucide-react';

export default function Lucky6Board({ roundData, timer, isSuspended }) {
  return (
    <div className="flex flex-col gap-3 relative select-none">
      {/* Suspended Lock Overlay */}
      {isSuspended && (
        <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-[2px] rounded-lg flex flex-col items-center justify-center text-red-400 font-black text-sm tracking-wider gap-1 border border-red-500/50">
          <Lock size={24} className="text-red-500 animate-pulse" />
          <span>LOCKED / SUSPENDED</span>
        </div>
      )}

      <div className="flex justify-between items-center text-xs border-b border-slate-700/60 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sky-400 text-sm">LUCKY 6</span>
          <span className="text-[11px] text-slate-400 font-mono">Round ID: #{roundData?.roundId || 'Connecting...'}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-1 bg-sky-600 text-white font-black text-xs rounded shadow">GAME</span>
          <span className="px-2.5 py-1 bg-slate-800 text-slate-300 font-bold text-xs rounded border border-slate-700">PLACED BET (0)</span>
        </div>
      </div>

      {/* Row 1: Low Card | 6 | High Card */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-lg flex flex-col items-center justify-center cursor-pointer shadow-md transition active:scale-95">
          <span className="text-xs text-blue-200 font-bold">2</span>
          <span className="text-sm sm:text-base font-black">Low Card</span>
        </div>

        <div className="p-3 bg-white hover:bg-slate-100 text-slate-900 rounded-lg flex flex-col items-center justify-center cursor-pointer shadow-lg transition active:scale-95 border-2 border-yellow-400">
          <span className="text-xs text-slate-600 font-bold">10</span>
          <div className="flex items-center gap-1 font-black text-base sm:text-lg">
            <span>6</span>
            <span className="text-xs text-red-600">♦</span>
            <span className="text-xs text-slate-900">♣</span>
          </div>
        </div>

        <div className="p-3 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-lg flex flex-col items-center justify-center cursor-pointer shadow-md transition active:scale-95">
          <span className="text-xs text-blue-200 font-bold">2</span>
          <span className="text-sm sm:text-base font-black">High Card</span>
        </div>
      </div>

      {/* Row 2: Even | Odd | Red (♥ ♦) | Black (♠ ♣) */}
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

      {/* Row 3: 11 Card Rank Strip */}
      <div>
        <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
          <span>SINGLE CARD RUNNERS (ODDS: 10.00)</span>
          <span>MIN: 100 | MAX: 100,000</span>
        </div>
        <div className="grid grid-cols-11 gap-1 sm:gap-1.5">
          {['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J'].map((rank) => (
            <div
              key={rank}
              className={`py-2 px-0.5 rounded-lg border flex flex-col items-center justify-between cursor-pointer transition hover:scale-105 ${
                rank === '6'
                  ? 'bg-yellow-500/20 border-yellow-400 text-yellow-300'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-900'
              } shadow-sm`}
            >
              <span className="text-[9px] font-bold text-slate-500 leading-none">10</span>
              <span className="text-xs sm:text-sm font-black my-0.5">{rank}</span>
              <div className="flex gap-0.5 text-[7px] leading-none text-slate-600">
                <span className="text-black">♠</span>
                <span className="text-red-600">♥</span>
                <span className="text-red-600">♦</span>
                <span className="text-black">♣</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
