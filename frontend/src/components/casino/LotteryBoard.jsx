import React, { useState } from 'react';
import { Lock } from 'lucide-react';

export default function LotteryBoard({ roundData, timer, isSuspended }) {
  const [activeTab, setActiveTab] = useState('single');
  const [selectedCards, setSelectedCards] = useState([]);
  const isBettingClosed = isSuspended || timer <= 3;

  const runners = roundData?.runners || [];
  const singleRunner = runners.find(r => (r.name || '').toLowerCase() === 'single') || { back: 9.5 };
  const doubleRunner = runners.find(r => (r.name || '').toLowerCase() === 'double') || { back: 95 };
  const tripleRunner = runners.find(r => (r.name || '').toLowerCase() === 'triple') || { back: 900 };

  const tabs = [
    { id: 'single', label: `Single (${activeTab === 'single' ? selectedCards.length : 0})`, rate: singleRunner.back || 9.5 },
    { id: 'double', label: `Double (${activeTab === 'double' ? selectedCards.length : 0})`, rate: doubleRunner.back || 95 },
    { id: 'triple', label: `Tripple (${activeTab === 'triple' ? selectedCards.length : 0})`, rate: tripleRunner.back || 900 }
  ];

  const cards = [
    { rank: 'A', display: 'A' },
    { rank: '2', display: '2' },
    { rank: '3', display: '3' },
    { rank: '4', display: '4' },
    { rank: '5', display: '5' },
    { rank: '6', display: '6' },
    { rank: '7', display: '7' },
    { rank: '8', display: '8' },
    { rank: '9', display: '9' },
    { rank: '10', display: '10' }
  ];

  const toggleCard = (rank) => {
    if (isBettingClosed) return;
    setSelectedCards(prev => 
      prev.includes(rank) ? prev.filter(c => c !== rank) : [...prev, rank]
    );
  };

  return (
    <div className="flex flex-col gap-2 select-none">
      {/* 1. Category Tabs (Single, Double, Tripple) */}
      <div className="flex items-center gap-1 border-b border-slate-700 pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSelectedCards([]); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-t transition ${
                isActive
                  ? 'bg-slate-200 text-slate-900 border-t-2 border-blue-600'
                  : 'bg-[#112435] text-slate-300 hover:bg-[#1a334d]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 2. 10 Cards Grid (Image 2 Exact Match) */}
      <div className="bg-[#112435] p-3 rounded-lg border border-slate-700 shadow-lg">
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-3">
          {cards.map((c) => {
            const isSelected = selectedCards.includes(c.rank);
            return (
              <div
                key={c.rank}
                onClick={() => toggleCard(c.rank)}
                className={`w-full aspect-[2/3] bg-white rounded border-2 cursor-pointer transition flex flex-col items-center justify-between p-1 shadow ${
                  isSelected ? 'border-blue-600 ring-2 ring-blue-400 bg-blue-50/50' : 'border-amber-400/80 hover:border-amber-500'
                } ${isBettingClosed ? 'opacity-80 cursor-not-allowed' : 'active:scale-95'}`}
              >
                {/* Top Rank */}
                <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                  {c.display}
                </span>

                {/* Mini Suit Icons in Center (Image 2 Match) */}
                <div className="flex gap-0.5 text-xs leading-none">
                  <span className="text-slate-900">♠</span>
                  <span className="text-red-600">♥</span>
                </div>

                {/* Empty bottom balance */}
                <div className="w-2 h-2" />
              </div>
            );
          })}
        </div>

        {/* 3. Action Buttons: Repeat | Clear | Remove (Cyan colored matching Image 2) */}
        <div className="flex items-center gap-2">
          {['Repeat', 'Clear', 'Remove'].map((action) => (
            <button
              key={action}
              onClick={() => {
                if (action === 'Clear' || action === 'Remove') setSelectedCards([]);
              }}
              className="px-4 py-1 bg-[#3894be] hover:bg-[#2e7fa5] text-white text-xs font-bold rounded shadow transition active:scale-95"
            >
              {action}
            </button>
          ))}

          {isBettingClosed && (
            <div className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-red-950/80 border border-red-500/40 rounded text-red-200 text-xs font-bold">
              <Lock size={12} />
              <span>SUSPENDED</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}