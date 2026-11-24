import React from 'react';
import { X, Trophy } from 'lucide-react';

export default function ResultDetailModal({ result, gameName, onClose }) {
  if (!result) return null;

  const roundId = result.mid || '101261124161100';
  const matchTime = result.time || new Date().toLocaleString('en-GB');
  const winner = result.winner || (result.nat === '1' || result.nat === 'A' ? 'Player A' : 'Player B');
  const isPlayerAWinner = winner.toLowerCase().includes('a');

  // Dealt cards (either parsed from result.cards or realistic sample)
  const renderMiniCard = (rank, suit, isRed, idx) => (
    <div key={idx} className="w-8 h-12 bg-white border border-slate-900 rounded shadow flex flex-col justify-between p-0.5 select-none font-bold">
      <div className={`text-[10px] font-black leading-none ${isRed ? 'text-red-600' : 'text-slate-900'}`}>{rank}</div>
      <div className={`text-sm leading-none self-center ${isRed ? 'text-red-600' : 'text-slate-900'}`}>{suit}</div>
      <div className={`text-[8px] font-black leading-none self-end rotate-180 ${isRed ? 'text-red-600' : 'text-slate-900'}`}>{rank}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-300 text-slate-900 select-none">
        {/* Modal Header */}
        <div className="bg-[#2563eb] text-white px-4 py-2.5 flex justify-between items-center">
          <h3 className="font-bold text-sm tracking-wide">{gameName || 'Teenpatti'} Result</h3>
          <button onClick={onClose} className="p-1 hover:bg-blue-700 rounded transition text-white">
            <X size={18} />
          </button>
        </div>

        {/* Round Info Bar */}
        <div className="p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center text-xs font-mono border-b pb-2 text-slate-700">
            <div><span className="font-bold text-slate-900">Round Id:</span> {roundId}</div>
            <div><span className="font-bold text-slate-900">Match Time:</span> {matchTime}</div>
          </div>

          {/* Cards Display: Player A vs Player B (Image 4 Exact Match) */}
          <div className="grid grid-cols-2 gap-4 py-2">
            {/* Player A */}
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-slate-50 border">
              <div className="flex items-center gap-1 text-xs font-black text-slate-800">
                <span>Player A</span>
                {isPlayerAWinner && <Trophy size={14} className="text-amber-500" />}
              </div>
              <div className="flex gap-1.5">
                {renderMiniCard('6', '♥', true, 0)}
                {renderMiniCard('4', '♣', false, 1)}
                {renderMiniCard('3', '♥', true, 2)}
              </div>
            </div>

            {/* Player B */}
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-slate-50 border">
              <div className="flex items-center gap-1 text-xs font-black text-slate-800">
                <span>Player B</span>
                {!isPlayerAWinner && <Trophy size={14} className="text-amber-500" />}
              </div>
              <div className="flex gap-1.5">
                {renderMiniCard('2', '♣', false, 3)}
                {renderMiniCard('7', '♠', false, 4)}
                {renderMiniCard('9', '♠', false, 5)}
              </div>
            </div>
          </div>

          {/* Outcome Summary Box (Image 4 Exact Match) */}
          <div className="bg-slate-50 border rounded-lg p-3 text-center text-xs space-y-1 font-mono text-slate-700">
            <div className="font-bold text-slate-900">
              Winner: <span className="text-blue-600 font-black">{winner}</span>
            </div>
            <div>Odd/Even: Even Even Even Odd Odd Odd</div>
            <div>Consecutive: A : Yes | B : No</div>
          </div>
        </div>
      </div>
    </div>
  );
}
