import React, { useEffect, useState } from 'react';
import { X, Play, Clock, ShieldCheck, Tv, LayoutGrid, Award, History, Lock } from 'lucide-react';

export default function CasinoTableModal({ table, onClose }) {
  const [roundData, setRoundData] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [timer, setTimer] = useState(0);
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'stream'
  const [loading, setLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState('');

  // Fetch live stream URL from Diamond API
  useEffect(() => {
    if (!table) return;
    fetch(`/api/casino/${table.slug || table.id}/livetv`)
      .then(r => r.json())
      .then(res => {
        if (res.success && res.streamUrl) {
          setStreamUrl(res.streamUrl);
        }
      })
      .catch(() => {});
  }, [table]);

  // 1. Fetch live round data every 1 second
  useEffect(() => {
    if (!table) return;

    let isMounted = true;
    const fetchRound = () => {
      fetch(`/api/casino/round/${table.slug || table.id}`)
        .then(r => r.json())
        .then(res => {
          if (isMounted && res.success && res.data) {
            setRoundData(res.data);
            setTimer(res.data.timer);
            setLoading(false);
          }
        })
        .catch(() => {});
    };

    fetchRound();
    const interval = setInterval(fetchRound, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [table]);

  // 2. Fetch real recent results for this table
  useEffect(() => {
    if (!table) return;

    let isMounted = true;
    const fetchResults = () => {
      fetch(`/api/casino/results/${table.slug || table.id}`)
        .then(r => r.json())
        .then(res => {
          if (isMounted && res.success && Array.isArray(res.data)) {
            setRecentResults(res.data.slice(0, 15)); // Show last 15 results
          }
        })
        .catch(() => {});
    };

    fetchResults();
    const resultsInterval = setInterval(fetchResults, 5000);

    return () => {
      isMounted = false;
      clearInterval(resultsInterval);
    };
  }, [table]);

  if (!table) return null;

  // Helper to get styled badge for winner (100% matching Diamond Online)
  const getWinnerBadge = (winnerName) => {
    const w = (winnerName || '').trim();
    const lower = w.toLowerCase();

    // 1. Roulette Results (Numbers 0 to 36)
    if (/^\d{1,2}$/.test(w)) {
      const num = parseInt(w);
      const RED_NUMS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
      if (num === 0) {
        return { letter: '0', bg: 'bg-emerald-600 text-white border border-emerald-400 font-mono', title: '0 (Green)' };
      }
      const isRed = RED_NUMS.includes(num);
      return {
        letter: String(num),
        bg: isRed ? 'bg-red-600 text-white font-mono' : 'bg-slate-950 text-white border border-slate-700 font-mono',
        title: `Number ${num} (${isRed ? 'Red' : 'Black'})`
      };
    }

    // 2. Sic Bo / Dice Results (e.g. "1,2,4" or "4,4,6")
    if (w.includes(',')) {
      const parts = w.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      const sum = parts.reduce((a, b) => a + b, 0);
      return {
        letter: String(sum || w),
        bg: 'bg-amber-600 text-slate-950 font-black border border-amber-300',
        title: `Dice: ${w} (Total: ${sum})`
      };
    }

    // 3. Cricket Ball by Ball (e.g. "1 Run", "6 Run", "Wicket")
    if (lower.includes('run') || lower.includes('wicket')) {
      if (lower.includes('wicket') || lower.includes('w')) {
        return { letter: 'W', bg: 'bg-red-700 text-white font-black', title: 'Wicket' };
      }
      const match = w.match(/\d+/);
      const runs = match ? match[0] : '•';
      const bg = runs === '6' ? 'bg-emerald-600 text-white' : runs === '4' ? 'bg-sky-600 text-white' : 'bg-slate-700 text-slate-200';
      return { letter: runs, bg: `${bg} font-black font-mono`, title: w };
    }
    
    if (lower.includes('daga') || lower.includes('teja')) {
      return { letter: 'D', bg: 'bg-emerald-700 text-white', title: w };
    }
    if (lower.includes('mogambo')) {
      return { letter: 'M', bg: 'bg-emerald-700 text-white', title: w };
    }
    if (lower === 'ind' || lower.includes('india')) {
      return { letter: 'I', bg: 'bg-emerald-700 text-white', title: w };
    }
    if (lower === 'eng' || lower.includes('england')) {
      return { letter: 'E', bg: 'bg-emerald-700 text-white', title: w };
    }
    if (lower.includes('player a') || lower === 'a') {
      return { letter: 'A', bg: 'bg-red-600 text-white', title: w };
    }
    if (lower.includes('player b') || lower === 'b') {
      return { letter: 'B', bg: 'bg-blue-600 text-white', title: w };
    }
    if (lower.includes('dragon')) {
      return { letter: 'D', bg: 'bg-amber-600 text-white', title: w };
    }
    if (lower.includes('tiger')) {
      return { letter: 'T', bg: 'bg-yellow-500 text-black', title: w };
    }
    if (lower.includes('tie')) {
      return { letter: 'T', bg: 'bg-emerald-600 text-white', title: w };
    }
    if (lower.includes('low')) {
      return { letter: 'L', bg: 'bg-indigo-600 text-white', title: w };
    }
    if (lower.includes('high')) {
      return { letter: 'H', bg: 'bg-rose-600 text-white', title: w };
    }
    if (lower.includes('amar')) {
      return { letter: 'Am', bg: 'bg-purple-600 text-white', title: w };
    }
    if (lower.includes('akbar')) {
      return { letter: 'Ak', bg: 'bg-cyan-600 text-white', title: w };
    }
    if (lower.includes('anthony')) {
      return { letter: 'An', bg: 'bg-teal-600 text-white', title: w };
    }
    if (lower.includes('player 8')) {
      return { letter: '8', bg: 'bg-blue-700 text-white', title: w };
    }
    if (lower.includes('player 9')) {
      return { letter: '9', bg: 'bg-red-700 text-white', title: w };
    }
    if (lower.includes('player 10')) {
      return { letter: '10', bg: 'bg-amber-700 text-white', title: w };
    }
    if (lower.includes('player 11')) {
      return { letter: '11', bg: 'bg-emerald-700 text-white', title: w };
    }

    return { letter: w.slice(0, 1).toUpperCase() || 'R', bg: 'bg-emerald-700 text-white', title: w };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-3 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl text-white flex flex-col max-h-[94vh]">
        
        {/* 1. Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-3 flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
            <span className="bg-red-600 text-white font-black text-[10px] uppercase px-1.5 py-0.5 rounded tracking-wider">
              LIVE
            </span>
            <h3 className="font-extrabold text-base text-yellow-400">{table.name}</h3>
            <span className="text-xs bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-300 font-mono">
              {table.slug}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-bold transition ${
                  viewMode === 'board' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid size={13} />
                <span>Cards & Odds</span>
              </button>
              <button
                onClick={() => setViewMode('stream')}
                className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-bold transition ${
                  viewMode === 'stream' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tv size={13} />
                <span>Live Video</span>
              </button>
            </div>

            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 2. Round Info Bar */}
        <div className="bg-slate-950 px-4 py-2 flex flex-wrap justify-between items-center border-b border-slate-800 text-xs gap-2">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-slate-400">ROUND ID:</span>
            <span className="text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              #{roundData?.roundId || 'Connecting...'}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
              roundData?.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'
            }`}>
              {roundData?.status || 'SYNCING'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock size={14} className={timer <= 5 ? 'text-red-400 animate-pulse' : 'text-yellow-400'} />
            <span className="text-slate-300 font-medium">Betting Closes:</span>
            <span className={`font-black font-mono px-2.5 py-0.5 rounded text-xs ${
              timer <= 5 ? 'bg-red-600 text-white animate-bounce' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}>
              {timer}s
            </span>
          </div>
        </div>

        {/* 3. Real Recent Results Ribbon (Diamond Upstream) */}
        <div className="bg-[#0b1726] px-4 py-2 border-b border-slate-800 flex items-center justify-between overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wide shrink-0 mr-1">
              <History size={13} className="text-amber-400" />
              <span>Last Result:</span>
            </div>
            {recentResults.length > 0 ? (
              <div className="flex items-center gap-1.5">
                {recentResults.map((r, idx) => {
                  const b = getWinnerBadge(r.nat);
                  return (
                    <div 
                      key={idx}
                      title={`Round: #${r.mid} | Winner: ${r.nat}`}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm shrink-0 cursor-pointer hover:scale-110 transition-transform ${b.bg}`}
                    >
                      {b.letter}
                    </div>
                  );
                })}
              </div>
            ) : (
              <span className="text-[11px] text-slate-500 italic">
                Loading recent results from Diamond...
              </span>
            )}
          </div>
          <button className="text-[10px] font-bold text-slate-400 hover:text-yellow-400 hover:underline shrink-0 ml-3">
            View All
          </button>
        </div>

        {/* 4. Main Content: Stream or Table */}
        <div className="flex-1 overflow-y-auto">
          {viewMode === 'stream' ? (
            /* Live Stream Video Player */
            <div className="relative bg-black w-full aspect-video flex items-center justify-center">
              <iframe
                src={streamUrl || `https://playg3.external247services.com/live/${table.slug}`}
                title="Live Casino Stream"
                className="w-full h-full border-0"
                allow="autoplay; encrypted-media; fullscreen"
              />
            </div>
          ) : (
            /* Live Cards Felt Table */
            <div className="bg-gradient-to-b from-[#093522] via-[#0d4a30] to-[#08291b] p-4 border-b border-slate-800 relative">
              <div className="absolute top-2 right-2 text-[10px] text-emerald-300/60 font-mono tracking-widest uppercase">
                DIAMOND LIVE FELT TABLE
              </div>

              <div className="text-center mb-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-200 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30">
                  {roundData?.dealType === 'dice' ? '🎲 DICE IN PLAY'
                    : roundData?.dealType === 'roulette' ? '🎡 ROULETTE WHEEL & BALL'
                    : roundData?.dealType === 'cricket_ball' ? '🏏 CRICKET BALL IN PLAY'
                    : roundData?.dealType === 'football' ? '⚽ FOOTBALL / GOAL IN PLAY'
                    : '🃏 DEALT CARDS IN PLAY'}
                </span>
              </div>

              {/* Dynamic Dealt Items (Cards, 3D Dice, Roulette Ball, Cricket Ball, Football) */}
              {(() => {
                const dealType = roundData?.dealType || (
                  (table.slug || '').includes('sicbo') ? 'dice'
                  : (table.slug || '').includes('roulette') ? 'roulette'
                  : (table.slug || '').includes('ballbyball') ? 'cricket_ball'
                  : (table.slug || '').includes('goal') ? 'football'
                  : 'cards'
                );

                // 1. 3D Dice (Sic Bo, 7 Up 7 Down)
                if (dealType === 'dice') {
                  const pips = { 1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅' };
                  const items = roundData?.cards || [{ val: '?' }, { val: '?' }, { val: '?' }];
                  return (
                    <div className="flex justify-center items-center gap-4 my-3 min-h-[80px]">
                      {items.map((d, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-4xl shadow-2xl transition-transform hover:scale-105 border-2 ${
                            d?.isHidden 
                              ? 'bg-gradient-to-br from-amber-950 to-slate-950 border-amber-500/40 text-amber-400' 
                              : 'bg-white border-slate-300 text-red-600 shadow-amber-500/20'
                          }`}>
                            {d?.isHidden ? '🎲' : (pips[d?.val] || d?.val)}
                          </div>
                          <span className="text-[10px] text-amber-300 font-bold mt-1">Die {i + 1}</span>
                        </div>
                      ))}
                    </div>
                  );
                }

                // 2. Roulette Wheel Pocket & Ball
                if (dealType === 'roulette') {
                  const items = roundData?.cards || [{ number: '?' }];
                  const r = items[0] || { number: '?' };
                  return (
                    <div className="flex justify-center items-center gap-4 my-3 min-h-[80px]">
                      <div className="flex flex-col items-center">
                        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center font-black text-xl sm:text-2xl shadow-2xl border-4 ${
                          r?.isHidden 
                            ? 'bg-gradient-to-br from-emerald-950 to-slate-950 border-emerald-500/50 text-emerald-400'
                            : r?.color === 'green'
                              ? 'bg-emerald-600 border-yellow-400 text-white shadow-emerald-500/40'
                              : r?.color === 'red'
                                ? 'bg-red-600 border-yellow-400 text-white shadow-red-500/40'
                                : 'bg-slate-950 border-yellow-400 text-white shadow-slate-900/60'
                        }`}>
                          {r?.isHidden ? (
                            <span className="text-xl animate-spin">⚪</span>
                          ) : (
                            <>
                              <span className="font-mono leading-none">{r?.number}</span>
                              <span className="text-[8px] uppercase tracking-wider font-extrabold text-yellow-300 mt-0.5">
                                {r?.color}
                              </span>
                            </>
                          )}
                        </div>
                        <span className="text-[10px] text-yellow-300 font-bold mt-1">Winning Pocket & Ball</span>
                      </div>
                    </div>
                  );
                }

                // 3. Cricket Ball (Ball by Ball / Super Over)
                if (dealType === 'cricket_ball') {
                  const items = roundData?.cards || [{ outcome: '?' }];
                  return (
                    <div className="flex justify-center items-center gap-3 my-3 min-h-[80px]">
                      {items.map((b, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-black text-sm sm:text-base shadow-2xl border-2 border-white/30 ${
                            b?.isHidden 
                              ? 'bg-red-950 text-red-300' 
                              : 'bg-gradient-to-br from-red-600 to-red-800 text-white shadow-red-600/50'
                          }`}>
                            {b?.isHidden ? '🏏' : b?.outcome}
                          </div>
                          <span className="text-[10px] text-slate-300 font-bold mt-1">Ball {i + 1}</span>
                        </div>
                      ))}
                    </div>
                  );
                }

                // 4. Playing Cards (Mogambo, Teen Patti, Dragon Tiger, etc.)
                const renderCard = (c, i) => (
                  <div 
                    key={i} 
                    className={`w-12 h-16 sm:w-14 sm:h-20 rounded-lg flex flex-col items-center justify-between p-1 font-bold shadow-lg transition-transform hover:scale-105 ${
                      c?.isHidden 
                        ? 'bg-gradient-to-br from-indigo-900 to-slate-900 border-2 border-indigo-400/40 text-indigo-300' 
                        : 'bg-white border-2 border-slate-200'
                    }`}
                  >
                    {c?.isHidden ? (
                      <div className="w-full h-full rounded border border-indigo-400/30 flex items-center justify-center text-xs font-mono">
                        🂠
                      </div>
                    ) : (
                      <>
                        <div className={`text-xs sm:text-sm self-start leading-none ${c?.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
                          {c?.rank}
                        </div>
                        <div className={`text-xl sm:text-2xl leading-none ${c?.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
                          {c?.suit}
                        </div>
                        <div className={`text-xs sm:text-sm self-end leading-none ${c?.color === 'red' ? 'text-red-600' : 'text-slate-900'}`}>
                          {c?.rank}
                        </div>
                      </>
                    )}
                  </div>
                );

                if (table.slug === 'mogambo') {
                  return (
                    <div className="flex flex-col items-center gap-2.5 my-2">
                      {/* Row 1: DAGA / TEJA */}
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] font-black text-yellow-300 tracking-wider mb-1 uppercase drop-shadow">
                          DAGA / TEJA
                        </span>
                        <div className="flex gap-2">
                          {[0, 1].map((idx) => {
                            const c = roundData?.cards?.[idx] || { isHidden: true };
                            return renderCard(c, idx);
                          })}
                        </div>
                      </div>

                      {/* Row 2: MOGAMBO */}
                      <div className="flex flex-col items-center">
                        <span className="text-[11px] font-black text-emerald-300 tracking-wider mb-1 uppercase drop-shadow">
                          MOGAMBO
                        </span>
                        <div className="flex gap-2">
                          {[2].map((idx) => {
                            const c = roundData?.cards?.[idx] || { isHidden: true };
                            return renderCard(c, idx);
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="flex flex-wrap justify-center items-center gap-2.5 my-3 min-h-[80px]">
                    {roundData && roundData.cards && roundData.cards.length > 0 ? (
                      roundData.cards.map((c, i) => renderCard(c, i))
                    ) : (
                      <div className="text-xs text-emerald-300/80 italic py-4">
                        Dealing cards for next round...
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="flex justify-between items-center text-[11px] text-emerald-200/70 pt-2 border-t border-emerald-800/40">
                <span>Game: {table.name}</span>
                <span className="font-mono">Live Dealer Sync Active</span>
              </div>
            </div>
          )}

          {/* 5. Real Live Betting Odds Board */}
          <div className="p-4 bg-slate-900">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                LIVE BETTING MARKETS & RATES
              </h4>
              <span className="text-[11px] text-slate-400">
                Min: {roundData?.runners?.[0]?.min || 100} | Max: {roundData?.runners?.[0]?.max || 100000}
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Fetching live market rates from Diamond Exchange...
              </div>
            ) : roundData?.runners && roundData.runners.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[...roundData.runners]
                  .sort((a, b) => (a.sr || 0) - (b.sr || 0))
                  .map((r, idx) => {
                    const isSuspended = r.suspended || roundData?.status === 'SUSPENDED' || timer <= 0;
                    return (
                      <div 
                        key={idx}
                        className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-2.5 flex items-center justify-between hover:border-slate-600 transition"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="text-xs font-bold text-white truncate">{r.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {r.subtype ? `${r.subtype} • ` : ''}
                            Limit: {r.min} - {r.max}
                          </div>
                        </div>

                        {isSuspended ? (
                          /* Locked / Suspended Box matching Diamond Online */
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 sm:w-20 bg-[#2b3543] border border-slate-700 text-slate-400 flex items-center justify-center py-2.5 rounded select-none shadow-inner">
                              <Lock size={14} className="text-slate-300" />
                            </div>
                            {r.lay > 0 && (
                              <div className="w-16 sm:w-20 bg-[#2b3543] border border-slate-700 text-slate-400 flex items-center justify-center py-2.5 rounded select-none shadow-inner">
                                <Lock size={14} className="text-slate-300" />
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Active Betting Back / Lay Boxes */
                          <div className="flex items-center gap-1.5">
                            {/* Back Box */}
                            <div className="w-16 sm:w-20 bg-[#72bbef] hover:bg-[#5aaae6] text-slate-950 font-black text-center py-1 rounded cursor-pointer transition shadow-sm">
                              <div className="text-xs font-black leading-tight">
                                {r.back > 0 ? r.back : '-'}
                              </div>
                              <div className="text-[9px] font-bold text-slate-800 leading-none">
                                {r.backSize > 0 ? Number(r.backSize).toLocaleString() : '10k'}
                              </div>
                            </div>

                            {/* Lay Box */}
                            {r.lay > 0 ? (
                              <div className="w-16 sm:w-20 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-center py-1 rounded cursor-pointer transition shadow-sm">
                                <div className="text-xs font-black leading-tight">
                                  {r.lay}
                                </div>
                                <div className="text-[9px] font-bold text-slate-800 leading-none">
                                  {r.laySize > 0 ? Number(r.laySize).toLocaleString() : '10k'}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No active runners for this table currently.
              </div>
            )}
          </div>
        </div>

        {/* 6. Footer */}
        <div className="bg-slate-950 px-4 py-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Zero-Latency Upstream Sync Engine Active</span>
          </div>
          <button 
            onClick={onClose} 
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
