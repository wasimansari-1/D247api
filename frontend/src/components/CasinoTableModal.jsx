import React, { useEffect, useState, useMemo } from 'react';
import { X, Play, Clock, ShieldCheck, Tv, Award, History, Lock, RefreshCw } from 'lucide-react';

export default function CasinoTableModal({ table, onClose }) {
  const [roundData, setRoundData] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState('');
  const [streamKey, setStreamKey] = useState(0);

  const slug = (table?.slug || table?.id || '').toLowerCase();
  const isLucky6 = slug === 'lucky6' || slug === 'lucky5' || (table?.name || '').toLowerCase().includes('lucky 6');
  const isRoulette = slug.includes('roulette') || (table?.name || '').toLowerCase().includes('roulette');

  // Fetch live stream URL from Diamond / D247 API
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/casino/${slug}/livetv`)
      .then(r => r.json())
      .then(res => {
        if (res.success && res.streamUrl) {
          setStreamUrl(res.streamUrl);
        } else {
          setStreamUrl(`/api/casino/player/${slug}`);
        }
      })
      .catch(() => {
        setStreamUrl(`/api/casino/player/${slug}`);
      });
  }, [slug]);

  // 1. Fetch live round data every 1 second
  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    const fetchRound = () => {
      fetch(`/api/casino/round/${slug}`)
        .then(r => r.json())
        .then(res => {
          if (isMounted && res.success && res.data) {
            setRoundData(res.data);
            if (res.data.timer !== undefined) {
              setTimer(res.data.timer);
            }
            if (Array.isArray(res.data.recentResults) && res.data.recentResults.length > 0) {
              setRecentResults(res.data.recentResults.slice(0, 16));
            }
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
  }, [slug]);

  // Local ticker to decrement timer smoothly
  useEffect(() => {
    const t = setInterval(() => {
      setTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // 2. Fetch real recent results for this table
  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    const fetchResults = () => {
      fetch(`/api/casino/results/${slug}`)
        .then(r => r.json())
        .then(res => {
          if (isMounted && res.success && Array.isArray(res.data)) {
            setRecentResults(res.data.slice(0, 16));
          }
        })
        .catch(() => {});
    };

    fetchResults();
    const resultsInterval = setInterval(fetchResults, 4000);

    return () => {
      isMounted = false;
      clearInterval(resultsInterval);
    };
  }, [slug]);

  // Calculate Total for games like Mogambo, Baccarat, 32 Cards, Sic Bo
  const calculatedTotal = useMemo(() => {
    if (!roundData) return null;

    // Check if runners has a "total" runner with back price
    const totalRunner = roundData.runners?.find(r => 
      (r.name || '').toLowerCase().includes('total') || (r.subtype || '').toLowerCase().includes('total')
    );
    if (totalRunner && totalRunner.back > 0) {
      return totalRunner.back;
    }

    // For Sic Bo: sum of dice values
    if (roundData.dealType === 'dice' && Array.isArray(roundData.cards)) {
      const sum = roundData.cards.reduce((acc, d) => acc + (parseInt(d.val) || 0), 0);
      return sum > 0 ? sum : null;
    }

    // For Mogambo: calculate rank sum if all 3 cards present
    if (slug === 'mogambo' && Array.isArray(roundData.cards) && roundData.cards.length >= 3) {
      const rankToVal = (r) => {
        if (!r) return 0;
        if (r === 'A') return 1;
        if (r === 'J') return 11;
        if (r === 'Q') return 12;
        if (r === 'K') return 13;
        const n = parseInt(r);
        return isNaN(n) ? 0 : n;
      };
      const c1 = rankToVal(roundData.cards[0]?.rank);
      const c2 = rankToVal(roundData.cards[1]?.rank);
      const c3 = rankToVal(roundData.cards[2]?.rank);
      const sum = c1 + c2 + c3;
      return sum > 0 ? sum : 13;
    }

    return null;
  }, [roundData, slug]);

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
      return { letter: 'D', bg: 'bg-emerald-700 text-white font-bold', title: w };
    }
    if (lower.includes('mogambo')) {
      return { letter: 'M', bg: 'bg-emerald-700 text-white font-bold', title: w };
    }
    if (lower === 'ind' || lower.includes('india')) {
      return { letter: 'I', bg: 'bg-emerald-700 text-white font-bold', title: w };
    }
    if (lower === 'eng' || lower.includes('england')) {
      return { letter: 'E', bg: 'bg-emerald-700 text-white font-bold', title: w };
    }
    if (lower.includes('player a') || lower === 'a') {
      return { letter: 'A', bg: 'bg-red-600 text-white font-bold', title: w };
    }
    if (lower.includes('player b') || lower === 'b') {
      return { letter: 'B', bg: 'bg-blue-600 text-white font-bold', title: w };
    }
    if (lower.includes('dragon')) {
      return { letter: 'D', bg: 'bg-amber-600 text-white font-bold', title: w };
    }
    if (lower.includes('tiger')) {
      return { letter: 'T', bg: 'bg-yellow-500 text-black font-bold', title: w };
    }
    if (lower.includes('tie')) {
      return { letter: 'T', bg: 'bg-emerald-600 text-white font-bold', title: w };
    }
    if (lower.includes('low')) {
      return { letter: 'L', bg: 'bg-indigo-600 text-white font-bold', title: w };
    }
    if (lower.includes('high')) {
      return { letter: 'H', bg: 'bg-rose-600 text-white font-bold', title: w };
    }
    if (lower.includes('amar')) {
      return { letter: 'Am', bg: 'bg-purple-600 text-white font-bold', title: w };
    }
    if (lower.includes('akbar')) {
      return { letter: 'Ak', bg: 'bg-cyan-600 text-white font-bold', title: w };
    }
    if (lower.includes('anthony')) {
      return { letter: 'An', bg: 'bg-teal-600 text-white font-bold', title: w };
    }
    if (lower.includes('player 8')) {
      return { letter: '8', bg: 'bg-blue-700 text-white font-bold', title: w };
    }
    if (lower.includes('player 9')) {
      return { letter: '9', bg: 'bg-red-700 text-white font-bold', title: w };
    }
    if (lower.includes('player 10')) {
      return { letter: '10', bg: 'bg-amber-700 text-white font-bold', title: w };
    }
    if (lower.includes('player 11')) {
      return { letter: '11', bg: 'bg-emerald-700 text-white font-bold', title: w };
    }

    return { letter: w.slice(0, 1).toUpperCase() || 'R', bg: 'bg-emerald-700 text-white font-bold', title: w };
  };

  // Flip Clock dual digit formatting
  const timerStr = String(Math.max(0, timer)).padStart(2, '0');
  const d1 = timerStr.charAt(0);
  const d2 = timerStr.charAt(1);

  // Authentic Playing Card Component (Matching Diamond Online Image 10)
  const renderCard = (c, key, isFaceDown = false) => {
    if (isFaceDown || c?.isHidden || !c) {
      return (
        <div 
          key={key}
          className="w-8 h-12 sm:w-10 sm:h-14 rounded bg-[#0b2742] border border-yellow-400/90 shadow-md flex items-center justify-center p-0.5"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #1e3a5f 0, #1e3a5f 2px, #0f2238 2px, #0f2238 4px)'
          }}
        >
          <div className="w-full h-full border border-yellow-400/40 rounded-[2px] flex items-center justify-center text-[10px] text-yellow-300/80 font-serif">
            ✦
          </div>
        </div>
      );
    }

    const isRed = c.color === 'red' || c.suit === '♥' || c.suit === '♦';

    return (
      <div 
        key={key} 
        className="w-8 h-12 sm:w-10 sm:h-14 bg-white border border-slate-900 rounded shadow-md flex flex-col justify-between p-0.5 select-none font-bold"
      >
        <div className={`text-[11px] sm:text-xs font-black leading-none self-start ${isRed ? 'text-red-600' : 'text-black'}`}>
          {c.rank}
        </div>
        <div className={`text-base sm:text-lg leading-none self-center ${isRed ? 'text-red-600' : 'text-black'}`}>
          {c.suit}
        </div>
        <div className={`text-[9px] font-black leading-none self-end rotate-180 ${isRed ? 'text-red-600' : 'text-black'}`}>
          {c.rank}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-1 sm:p-3 animate-fade-in">
      <div className="bg-[#0b1726] border border-slate-700 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl text-white flex flex-col max-h-[96vh]">
        
        {/* 1. Modal Header */}
        <div className="bg-[#112435] px-4 py-2.5 flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
            <span className="bg-red-600 text-white font-black text-[10px] uppercase px-1.5 py-0.5 rounded tracking-wider">
              LIVE
            </span>
            <h3 className="font-extrabold text-sm sm:text-base text-yellow-400">{table.name}</h3>
            <span className="hidden sm:inline-block text-[11px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-300 font-mono">
              {table.slug}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStreamKey(k => k + 1)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition flex items-center gap-1 text-xs"
              title="Reload Live Feed"
            >
              <RefreshCw size={14} />
              <span className="hidden sm:inline text-[11px]">Reload TV</span>
            </button>

            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 2. Round Info Bar */}
        <div className="bg-[#07101a] px-4 py-2 flex flex-wrap justify-between items-center border-b border-slate-800 text-xs gap-2">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-slate-400 text-[11px]">ROUND:</span>
            <span className="text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40 text-[11px]">
              #{roundData?.roundId || 'Connecting...'}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
              roundData?.status === 'OPEN' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                : 'bg-red-500/20 text-red-400 border border-red-500/40'
            }`}>
              {roundData?.status || (timer > 0 ? 'OPEN' : 'SUSPENDED')}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            <Clock size={13} className={timer <= 5 ? 'text-red-400 animate-pulse' : 'text-yellow-400'} />
            <span className="text-slate-400 text-[11px]">Closes in:</span>
            <span className={`font-black px-2 py-0.5 rounded text-xs ${
              timer <= 5 ? 'bg-red-600 text-white animate-bounce' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}>
              {timer}s
            </span>
          </div>
        </div>

        {/* 3. Live Video Container with Floating HUD Overlay (Image 10 Exact Parity) */}
        <div className="relative w-full aspect-video bg-black overflow-hidden select-none border-b border-slate-800 shrink-0">
          
          {/* Iframe Live TV Stream */}
          <iframe
            key={streamKey}
            src={streamUrl || `/api/casino/mediaplayer/${slug}`}
            title="Live Casino TV"
            className="w-full h-full border-0 absolute inset-0 z-0 bg-black"
            allow="autoplay; encrypted-media; fullscreen"
          />

          {/* Clean black studio stage canvas */}
          <div className="absolute inset-0 -z-10 bg-black" />

          {/* Top-Left Floating HUD: Cards, Daga/Teja, Mogambo, Total (Exact Diamond Image 10) */}
          <div className="absolute top-2 left-2 z-20 flex flex-col items-start gap-1 pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            
            {/* Yellow TOTAL Badge */}
            {calculatedTotal !== null && (
              <div className="bg-yellow-400 text-black font-black text-xs sm:text-sm px-2 py-0.5 rounded shadow-lg uppercase tracking-wider mb-0.5">
                TOTAL: {calculatedTotal}
              </div>
            )}

            {/* Game Specific Overlay Components */}
            {(() => {
              // 0. Lucky 6 Table (Exact match to Image 1 top left)
              if (slug === 'lucky6' || slug === 'lucky5') {
                const c = roundData?.cards?.[0];
                return (
                  <div className="flex flex-col items-start gap-1">
                    <div className="text-[10px] font-black text-white uppercase tracking-wider drop-shadow">
                      LUCKY 6
                    </div>
                    {renderCard(c, 'lucky6-card', !c || c.isHidden)}
                  </div>
                );
              }

              // 0.1 Virtual Cricket (Super Over / Ball by Ball)
              if (slug.includes('superover') || slug.includes('ballbyball') || roundData?.dealType === 'cricket_ball') {
                const balls = roundData?.cards || [];
                return (
                  <div className="flex flex-col items-start gap-1">
                    <div className="text-[10px] font-black text-amber-300 uppercase tracking-wider drop-shadow-md">
                      OVER BALLS DEALT
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {balls.length > 0 ? (
                        balls.map((b, i) => (
                          <div 
                            key={i}
                            className="px-2 py-0.5 bg-black/90 border border-amber-400 text-amber-300 font-mono font-black text-xs rounded shadow"
                          >
                            {b.outcome || b.rank || b.code || b.val || '•'}
                          </div>
                        ))
                      ) : (
                        <div className="text-[11px] text-slate-300 font-mono">Balls in play</div>
                      )}
                    </div>
                  </div>
                );
              }
              // 1. Mogambo Table (Exact match to User Image 10)
              if (slug === 'mogambo') {
                const c1 = roundData?.cards?.[0];
                const c2 = roundData?.cards?.[1];
                const c3 = roundData?.cards?.[2];
                return (
                  <div className="flex flex-col items-start gap-1">
                    {/* DAGA / TEJA */}
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-wider drop-shadow-md mb-0.5">
                        DAGA / TEJA
                      </div>
                      <div className="flex gap-1.5">
                        {renderCard(c1, 'dt1', !c1 || c1.isHidden)}
                        {renderCard(c2, 'dt2', !c2 || c2.isHidden)}
                      </div>
                    </div>

                    {/* MOGAMBO */}
                    <div className="mt-0.5">
                      <div className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-wider drop-shadow-md mb-0.5">
                        MOGAMBO
                      </div>
                      <div className="flex gap-1.5">
                        {renderCard(c3, 'mg1', !c3 || c3.isHidden)}
                      </div>
                    </div>
                  </div>
                );
              }

              // 2. Teen Patti / 20-20 / VIP
              if (slug.includes('teen') || slug.includes('patti')) {
                const cards = roundData?.cards || [];
                const playerA = cards.slice(0, 3);
                const playerB = cards.slice(3, 6);
                return (
                  <div className="flex flex-col items-start gap-1">
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-wider drop-shadow-md mb-0.5">
                        PLAYER A
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map(idx => renderCard(playerA[idx], `pa-${idx}`, !playerA[idx]))}
                      </div>
                    </div>
                    <div className="mt-0.5">
                      <div className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-wider drop-shadow-md mb-0.5">
                        PLAYER B
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map(idx => renderCard(playerB[idx], `pb-${idx}`, !playerB[idx]))}
                      </div>
                    </div>
                  </div>
                );
              }

              // 3. Dragon Tiger
              if (slug.includes('dt') || slug.includes('dragon')) {
                const dragonCard = roundData?.cards?.[0];
                const tigerCard = roundData?.cards?.[1];
                return (
                  <div className="flex gap-3 items-start">
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider drop-shadow-md mb-0.5">
                        DRAGON
                      </div>
                      {renderCard(dragonCard, 'dragon', !dragonCard)}
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-black text-yellow-400 uppercase tracking-wider drop-shadow-md mb-0.5">
                        TIGER
                      </div>
                      {renderCard(tigerCard, 'tiger', !tigerCard)}
                    </div>
                  </div>
                );
              }

              // 4. Lucky 7
              if (slug.includes('lucky7') || slug === 'lucky7eu') {
                const c = roundData?.cards?.[0];
                return (
                  <div>
                    <div className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-wider drop-shadow-md mb-0.5">
                      CARD
                    </div>
                    {renderCard(c, 'lucky-card', !c)}
                  </div>
                );
              }

              // 5. 32 Cards
              if (slug.includes('card32') || slug.includes('32')) {
                const cards = roundData?.cards || [];
                return (
                  <div className="grid grid-cols-4 gap-1.5">
                    {[8, 9, 10, 11].map((p, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-sky-300 drop-shadow">P{p}</span>
                        {renderCard(cards[idx], `c32-${idx}`, !cards[idx])}
                      </div>
                    ))}
                  </div>
                );
              }

              // 6. Sic Bo (3D Dice)
              if (roundData?.dealType === 'dice' || slug.includes('sicbo')) {
                const pips = { 1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅' };
                const dice = roundData?.cards || [{ val: '?' }, { val: '?' }, { val: '?' }];
                return (
                  <div className="flex gap-1.5 items-center">
                    {dice.map((d, i) => (
                      <div 
                        key={i} 
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white border border-slate-900 text-red-600 flex items-center justify-center text-2xl sm:text-3xl shadow-lg"
                      >
                        {pips[d.val] || '🎲'}
                      </div>
                    ))}
                  </div>
                );
              }

              // 7. Roulette
              if (roundData?.dealType === 'roulette' || slug.includes('roulette')) {
                const r = roundData?.cards?.[0] || {};
                const num = r.number || '0';
                const isGreen = num === '0' || num === '00';
                const isRed = r.color === 'red';
                return (
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-yellow-400 flex items-center justify-center font-mono font-black text-lg sm:text-xl shadow-2xl text-white ${
                      isGreen ? 'bg-emerald-600' : isRed ? 'bg-red-600' : 'bg-slate-950'
                    }`}>
                      {num}
                    </div>
                  </div>
                );
              }

              // Generic fallback cards
              if (roundData?.cards && roundData.cards.length > 0) {
                return (
                  <div className="flex gap-1">
                    {roundData.cards.slice(0, 4).map((c, i) => renderCard(c, `gen-${i}`))}
                  </div>
                );
              }

              return null;
            })()}
          </div>

          {/* Bottom-Right 3D Flip Clock Counter [ 0 ] [ 1 ] (Exact Image 10 bottom right) */}
          <div className="absolute bottom-2.5 right-2.5 z-20 pointer-events-none flex items-center gap-1">
            <div className="flex gap-1 bg-black/70 p-1 rounded-lg backdrop-blur-sm border border-white/10 shadow-2xl">
              <div className="w-8 h-11 sm:w-10 sm:h-13 bg-[#1e293b] border border-slate-600 rounded-md flex flex-col items-center justify-center relative shadow-2xl overflow-hidden">
                <span className="font-mono font-black text-xl sm:text-2xl text-white leading-none drop-shadow">
                  {d1}
                </span>
                <div className="w-full h-[1px] bg-slate-950/80 absolute top-1/2 left-0 z-10"></div>
              </div>
              <div className="w-8 h-11 sm:w-10 sm:h-13 bg-[#1e293b] border border-slate-600 rounded-md flex flex-col items-center justify-center relative shadow-2xl overflow-hidden">
                <span className="font-mono font-black text-xl sm:text-2xl text-white leading-none drop-shadow">
                  {d2}
                </span>
                <div className="w-full h-[1px] bg-slate-950/80 absolute top-1/2 left-0 z-10"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Real Recent Results Ribbon (Diamond Upstream) */}
        <div className="bg-[#07101a] px-4 py-2 border-b border-slate-800 flex items-center justify-between overflow-x-auto scrollbar-thin">
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

        {/* 5. Real Live Betting Odds Board */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#0b1726]">
          {isLucky6 ? (
            /* Lucky 6 Custom Betting Board (Exact Match to Diamond Online Image 1) */
            <div className="flex flex-col gap-3">
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
          ) : isRoulette ? (
            /* Roulette / VIP Roulette Custom Betting Board (Exact Match to Diamond Online Image 2) */
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs border-b border-slate-700/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-amber-400 text-sm">ROULETTE</span>
                  <span className="text-[11px] text-slate-400 font-mono">Range: 25 to 100,000</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="px-3 py-1 bg-[#72bbef] text-slate-950 font-black text-xs rounded shadow">Back</button>
                  <button className="px-3 py-1 bg-[#faa9ba] text-slate-950 font-black text-xs rounded shadow">Lay</button>
                </div>
              </div>

              {/* Roulette Layout & Chips palette */}
              <div className="flex flex-col lg:flex-row gap-3">
                {/* Roulette Felt Mat */}
                <div className="flex-1 overflow-x-auto bg-[#475569] p-2 rounded-xl shadow-2xl border border-slate-600">
                  <div className="min-w-[420px]">
                    {/* Top Zero Row */}
                    <div className="w-full bg-[#15803d] text-white font-mono font-black text-center py-1.5 rounded-t border border-emerald-500 cursor-pointer hover:bg-emerald-600 transition shadow">
                      0
                    </div>

                    {/* Main Numbers & Outer Bets Grid */}
                    <div className="grid grid-cols-12 gap-1 my-1">
                      {/* Left: 1-18, Even, Red, Black, Odd, 19-36 */}
                      <div className="col-span-2 grid grid-rows-6 gap-1 font-bold text-[10px] text-slate-900 text-center">
                        <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer p-1">1 - 18</div>
                        <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer p-1">Even</div>
                        <div className="bg-red-600 text-white hover:bg-red-500 flex items-center justify-center rounded cursor-pointer p-1">Red</div>
                        <div className="bg-slate-950 text-white hover:bg-slate-800 flex items-center justify-center rounded cursor-pointer p-1">Black</div>
                        <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer p-1">Odd</div>
                        <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer p-1">19 - 36</div>
                      </div>

                      {/* Middle-Left: 1st12, 2nd12, 3rd12 */}
                      <div className="col-span-2 grid grid-rows-3 gap-1 font-bold text-[11px] text-slate-900 text-center">
                        <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer">1st 12</div>
                        <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer">2nd 12</div>
                        <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer">3rd 12</div>
                      </div>

                      {/* Middle: 3 columns x 12 rows matrix */}
                      <div className="col-span-8 grid grid-cols-3 gap-1">
                        {[
                          [1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12],
                          [13, 14, 15], [16, 17, 18], [19, 20, 21], [22, 23, 24],
                          [25, 26, 27], [28, 29, 30], [31, 32, 33], [34, 35, 36]
                        ].flatMap((row, rIdx) => 
                          row.map(num => {
                            const RED_NUMS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
                            const isRed = RED_NUMS.includes(num);
                            return (
                              <div
                                key={num}
                                className={`py-1 text-center font-mono font-black text-xs rounded text-white cursor-pointer transition shadow-sm hover:scale-105 ${
                                  isRed ? 'bg-red-600 hover:bg-red-500' : 'bg-slate-950 hover:bg-slate-800'
                                }`}
                              >
                                {num}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Bottom 2to1 Row */}
                    <div className="grid grid-cols-12 gap-1">
                      <div className="col-span-4"></div>
                      <div className="col-span-8 grid grid-cols-3 gap-1">
                        <div className="bg-[#fef3c7] hover:bg-[#fde68a] text-slate-900 font-bold text-center text-xs py-1 rounded cursor-pointer">2to1</div>
                        <div className="bg-[#fef3c7] hover:bg-[#fde68a] text-slate-900 font-bold text-center text-xs py-1 rounded cursor-pointer">2to1</div>
                        <div className="bg-[#fef3c7] hover:bg-[#fde68a] text-slate-900 font-bold text-center text-xs py-1 rounded cursor-pointer">2to1</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chips Palette on Right (Image 2 right side) */}
                <div className="flex lg:flex-col items-center justify-center gap-2 shrink-0">
                  {[25, 50, 100, 200, 500, '1K'].map((chip, cIdx) => {
                    const colors = [
                      'bg-sky-500 border-sky-300',
                      'bg-blue-600 border-blue-400',
                      'bg-teal-500 border-teal-300',
                      'bg-emerald-600 border-emerald-400',
                      'bg-amber-600 border-amber-300',
                      'bg-purple-600 border-purple-300'
                    ];
                    return (
                      <div
                        key={cIdx}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 text-white font-black text-[10px] sm:text-xs flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition active:scale-95 ${colors[cIdx]}`}
                      >
                        {chip}
                      </div>
                    );
                  })}
                  <button className="px-2 py-1 text-[10px] font-bold bg-red-600 text-white rounded hover:bg-red-500 shadow">Undo</button>
                  <button className="px-2 py-1 text-[10px] font-bold bg-sky-600 text-white rounded hover:bg-sky-500 shadow">Repeat</button>
                  <button className="px-2 py-1 text-[10px] font-bold bg-amber-500 text-slate-950 rounded hover:bg-amber-400 shadow">Clear</button>
                </div>
              </div>
            </div>
          ) : (
            /* Standard Live Runners Exchange Board */
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                  LIVE BETTING MARKETS & RATES
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  Min: {roundData?.runners?.[0]?.min || 100} | Max: {roundData?.runners?.[0]?.max ? Number(roundData.runners[0].max).toLocaleString() : '300,000'}
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
                              Limit: {r.min} - {Number(r.max || 100000).toLocaleString()}
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
                                  {r.backSize > 0 ? Number(r.backSize).toLocaleString() : '100,000'}
                                </div>
                              </div>

                              {/* Lay Box */}
                              {r.lay > 0 ? (
                                <div className="w-16 sm:w-20 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-center py-1 rounded cursor-pointer transition shadow-sm">
                                  <div className="text-xs font-black leading-tight">
                                    {r.lay}
                                  </div>
                                  <div className="text-[9px] font-bold text-slate-800 leading-none">
                                    {r.laySize > 0 ? Number(r.laySize).toLocaleString() : '100,000'}
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
          )}
        </div>

        {/* 6. Footer */}
        <div className="bg-[#07101a] px-4 py-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>D247 Official Zero-Latency Exchange Feed</span>
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
