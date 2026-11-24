import React, { useState } from 'react';
import { Lock } from 'lucide-react';

export default function Poker6Board({ roundData, timer, isSuspended }) {
  const [selectedTab, setSelectedTab] = useState('Hands');
  const runners = roundData?.runners || [];
  const cards = roundData?.cards || [];

  // 6 Players with their respective 2 hole cards
  const players = [1, 2, 3, 4, 5, 6];

  const getHoleCards = (playerNum) => {
    const idx = (playerNum - 1) * 2;
    return [cards[idx] || null, cards[idx + 1] || null];
  };

  const renderMiniCard = (c, key) => {
    if (!c || c.isHidden) {
      return (
        <div key={key} className="w-5 h-7 rounded-[2px] bg-[#0b2742] border border-yellow-400/60 shadow-sm flex items-center justify-center text-[8px] text-yellow-300 font-serif">
          ✦
        </div>
      );
    }
    const isRed = c.color === 'red' || c.suit === '♥' || c.suit === '♦';
    return (
      <div key={key} className="w-5 h-7 bg-white border border-slate-900 rounded-[2px] shadow-sm flex flex-col justify-between p-0.5 select-none font-bold">
        <span className={`text-[8px] font-black leading-none ${isRed ? 'text-red-600' : 'text-black'}`}>{c.rank}</span>
        <span className={`text-[10px] leading-none self-center ${isRed ? 'text-red-600' : 'text-black'}`}>{c.suit}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3 select-none">
      {/* Top Tabs: Hands | Pattern */}
      <div className="flex items-center gap-2 border-b border-slate-700/60 pb-1">
        <button
          onClick={() => setSelectedTab('Hands')}
          className={`py-1.5 px-4 text-xs font-black rounded-t transition ${
            selectedTab === 'Hands'
              ? 'bg-[#1e3a5f] text-white border-b-2 border-sky-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Hands
        </button>
        <button
          onClick={() => setSelectedTab('Pattern')}
          className={`py-1.5 px-4 text-xs font-black rounded-t transition ${
            selectedTab === 'Pattern'
              ? 'bg-[#1e3a5f] text-white border-b-2 border-sky-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Pattern
        </button>
      </div>

      {/* Tab 1: Hands (6 Players Grid with 2 Dealt Hole Cards) */}
      {selectedTab === 'Hands' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {players.map((num) => {
            const runner = runners.find(r => (r.name || '').toLowerCase() === `player ${num}` || (r.name || '').toLowerCase() === `player${num}`);
            const holeCards = getHoleCards(num);
            const rate = runner?.back > 0 ? runner.back : (num === 1 ? '7.07' : num === 2 ? '7.9' : num === 3 ? '8.97' : num === 4 ? '3.26' : num === 5 ? '1.68' : '7.9');

            return (
              <div
                key={num}
                className="bg-[#112435] rounded-lg border border-slate-700 p-2.5 flex items-center justify-between hover:bg-slate-800/40 transition shadow"
              >
                {/* Left: Player Name + 2 Hole Cards */}
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-white w-14">
                    Player {num}
                  </span>
                  <div className="flex items-center gap-1">
                    {renderMiniCard(holeCards[0], `p${num}-c1`)}
                    {renderMiniCard(holeCards[1], `p${num}-c2`)}
                  </div>
                </div>

                {/* Right: Back Odds Button */}
                <div>
                  {isSuspended ? (
                    <div className="w-20 py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                      <Lock size={12} className="text-slate-300" />
                    </div>
                  ) : (
                    <button className="w-20 py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded transition shadow active:scale-95">
                      {rate}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Pattern */}
      {selectedTab === 'Pattern' && (
        <div className="bg-[#112435] p-3 rounded-lg border border-slate-700 text-center text-xs text-slate-400">
          Pattern view based on live round dealer dealing order.
        </div>
      )}

      {/* Green Disclaimer Banner (Image 5 Exact Match) */}
      <div className="py-2 px-3 rounded-lg bg-[#143224] border border-emerald-600/40 text-emerald-300 text-[11px] font-bold text-center">
        Results are based on stream only. Score board may be different or updated later.
      </div>
    </div>
  );
}
