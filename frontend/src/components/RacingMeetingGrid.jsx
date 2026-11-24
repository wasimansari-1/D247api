import React from 'react';
import { Tv } from 'lucide-react';

export default function RacingMeetingGrid({
  racingTree = [],
  selectedCountry = 'AU',
  onSelectCountry,
  onSelectRace,
  selectedMatchGmid
}) {
  if (!Array.isArray(racingTree) || racingTree.length === 0) {
    return (
      <div className="bg-white border border-slate-300 p-8 text-center text-slate-500 text-xs italic">
        Loading live race meetings from Diamond Online...
      </div>
    );
  }

  // Get available countries
  const countries = racingTree.map(c => c.cname || c.name || 'AU');
  const currentCountry = racingTree.find(c => (c.cname || c.name) === selectedCountry) || racingTree[0];
  const venues = currentCountry?.children || [];

  return (
    <div className="bg-white border-b border-slate-300 shadow-sm flex flex-col">
      {/* 1. Country Tabs Bar matching Image 8 (AU, GB, IE, FR) */}
      <div className="bg-[#1e293b] px-2 pt-2 flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-slate-700">
        {countries.map(c => {
          const isActive = (currentCountry?.cname || currentCountry?.name) === c;
          return (
            <button
              key={c}
              onClick={() => onSelectCountry && onSelectCountry(c)}
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-t transition cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 border-t-2 border-sky-500 shadow-md'
                  : 'bg-[#334155] text-slate-200 hover:bg-[#475569] hover:text-white'
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* 2. Track & Race Time Meeting Grid matching Image 8 */}
      <div className="divide-y divide-slate-200 bg-white">
        {venues.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs italic">
            No race meetings scheduled for {currentCountry?.cname || 'this region'}.
          </div>
        ) : (
          venues.map((venue, vIdx) => {
            const venueName = venue.ename || venue.name || 'Track';
            const races = venue.children || [];

            return (
              <div 
                key={vIdx} 
                className="py-2.5 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/80 transition"
              >
                {/* Track Name & Live TV Icon */}
                <div className="flex items-center gap-2 min-w-[160px] sm:min-w-[200px]">
                  <Tv size={15} className="text-slate-600 shrink-0" />
                  <span className="font-extrabold text-xs text-slate-900">
                    {venueName}
                  </span>
                </div>

                {/* Horizontal Race Time Buttons matching Image 8 */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {races.map((race) => {
                    const isSelected = String(race.gmid) === String(selectedMatchGmid);
                    const isInPlay = Boolean(race.iplay);

                    // Format start time e.g. "11:46:00 AM" -> "11:46"
                    let timeDisplay = race.stime || '';
                    if (timeDisplay.includes(' ')) {
                      const parts = timeDisplay.split(' ');
                      const timePart = parts[1] || '';
                      const tArr = timePart.split(':');
                      if (tArr.length >= 2) {
                        timeDisplay = `${tArr[0]}:${tArr[1]}`;
                      }
                    }

                    return (
                      <button
                        key={race.gmid}
                        onClick={() => onSelectRace && onSelectRace(race.gmid)}
                        className={`px-2.5 py-1 text-xs font-bold rounded transition border shadow-sm cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-sky-600 text-white border-sky-700 shadow-md font-black'
                            : isInPlay
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-black hover:bg-emerald-200'
                            : 'bg-[#e2e8f0] text-slate-800 border-slate-300 hover:bg-sky-500 hover:text-white hover:border-sky-600'
                        }`}
                        title={`Race ID: ${race.gmid} - Click to view live odds`}
                      >
                        {isInPlay && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                        )}
                        <span>{timeDisplay || 'Race'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
