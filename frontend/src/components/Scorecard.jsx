import React from 'react';

export default function Scorecard({ scoreboard }) {
  if (!scoreboard) return null;

  return (
    <div className="bg-[#0b1f33] text-white p-3 border-b border-slate-700">
      <div className="flex justify-between items-center mb-2">
        <div>
          <span className="text-yellow-400 font-bold text-base block">{scoreboard.battingTeam || 'Batting Team'}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black">{scoreboard.runs ?? 0}/{scoreboard.wickets ?? 0}</span>
            <span className="text-xs text-slate-400">({scoreboard.overs || '0.0'} ov)</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">{scoreboard.bowlingTeam || 'Bowling Team'}</span>
          <span className="text-sm font-semibold text-slate-300">Target: {scoreboard.target || 'N/A'}</span>
        </div>
      </div>

      {scoreboard.currentOver && Array.isArray(scoreboard.currentOver) && (
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold">Over:</span>
          <div className="flex gap-1">
            {scoreboard.currentOver.map((ball, idx) => {
              let dotBg = 'bg-slate-700 text-white';
              if (ball === 'W') dotBg = 'bg-red-600 text-white font-bold';
              else if (ball === '4') dotBg = 'bg-sky-600 text-white font-bold';
              else if (ball === '6') dotBg = 'bg-emerald-600 text-white font-bold';

              return (
                <span key={idx} className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${dotBg}`}>
                  {ball}
                </span>
              );
            })}
          </div>
          {scoreboard.lastAction && (
            <span className="text-[11px] text-yellow-300 ml-auto truncate italic">
              {scoreboard.lastAction}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

