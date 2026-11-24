import React from 'react';
import { Lock } from 'lucide-react';

export default function BollywoodCasinoBoard({ roundData, timer, isSuspended }) {
  const movies = [
    { code: 'A', name: 'A.Don' },
    { code: 'B', name: 'B.Amar Akbar Anthony' },
    { code: 'C', name: 'C.Sahib Bibi Aur Ghulam' },
    { code: 'D', name: 'D.Dharam Veer' },
    { code: 'E', name: 'E.Kis Kis ko Pyaar Karoon' },
    { code: 'F', name: 'F.Ghulam' }
  ];

  return (
    <div className="flex flex-col gap-2.5 select-none">
      {/* 6 Bollywood Movie Cards (Image 3 Exact Match) */}
      <div className="grid grid-cols-3 gap-2">
        {movies.map((m) => (
          <div key={m.code} className="bg-[#112435] border border-slate-700 rounded-lg p-2 flex flex-col items-center justify-between text-center shadow">
            <span className="text-[11px] font-black text-slate-200 truncate w-full mb-1">{m.name}</span>
            <div className="flex items-center gap-1.5 w-full justify-center">
              <div className="flex-1 py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                {isSuspended ? <Lock size={12} className="text-slate-300" /> : <span className="text-xs font-black text-sky-300">2.0</span>}
              </div>
              <div className="flex-1 py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                {isSuspended ? <Lock size={12} className="text-slate-300" /> : <span className="text-xs font-black text-rose-300">2.0</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Side Bets: Odd | Dulha Dulhan K-Q | Barati J-A */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#112435] border border-slate-700 rounded-lg p-2 text-center shadow">
          <div className="text-[10px] font-bold text-slate-400 mb-1">Odd</div>
          <div className="flex gap-1 justify-center">
            <div className="flex-1 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
              <Lock size={12} className="text-slate-300" />
            </div>
            <div className="flex-1 py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
              <Lock size={12} className="text-slate-300" />
            </div>
          </div>
        </div>

        <div className="bg-[#112435] border border-slate-700 rounded-lg p-2 text-center shadow">
          <div className="text-[10px] font-bold text-slate-400 mb-1">Dulha Dulhan K-Q</div>
          <div className="py-1.5 bg-[#1e293b] rounded border border-slate-700 text-slate-300 font-black text-xs flex items-center justify-center">
            <Lock size={12} className="text-slate-300" />
          </div>
        </div>

        <div className="bg-[#112435] border border-slate-700 rounded-lg p-2 text-center shadow">
          <div className="text-[10px] font-bold text-slate-400 mb-1">Barati J-A</div>
          <div className="py-1.5 bg-[#1e293b] rounded border border-slate-700 text-slate-300 font-black text-xs flex items-center justify-center">
            <Lock size={12} className="text-slate-300" />
          </div>
        </div>
      </div>

      {/* Bottom Card Suit Rank Selector J, Q, K, A */}
      <div className="grid grid-cols-4 gap-2">
        {['J', 'Q', 'K', 'A'].map((card) => (
          <div key={card} className="bg-[#112435] border border-slate-700 rounded-lg p-1.5 flex flex-col items-center justify-center text-center shadow">
            <span className="text-xs font-black text-yellow-400 mb-1">{card}</span>
            <div className="w-full py-1.5 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
              <Lock size={12} className="text-slate-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
