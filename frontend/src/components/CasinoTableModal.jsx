import React, { useEffect, useState, useMemo } from "react";
import {
  X,
  Play,
  Clock,
  ShieldCheck,
  Tv,
  Award,
  History,
  Lock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import WorliMatkaBoard from './casino/WorliMatkaBoard';
import PoisonTeenPattiBoard from './casino/PoisonTeenPattiBoard';
import TeenPattiJoker20Board from './casino/TeenPattiJoker20Board';
import UnlimitedJokerBoard from './casino/UnlimitedJokerBoard';
import BollywoodCasinoBoard from './casino/BollywoodCasinoBoard';
import MiniSuperOverBoard from './casino/MiniSuperOverBoard';
import UniqueTeenPattiBoard from './casino/UniqueTeenPattiBoard';
import UniqueRouletteBoard from './casino/UniqueRouletteBoard';
import RouletteBoard from './casino/RouletteBoard';
import Lucky6Board from './casino/Lucky6Board';
import GoalBoard from './casino/GoalBoard';
import AndarBaharBoard from './casino/AndarBaharBoard';
import QueenJackTopBoard from './casino/QueenJackTopBoard';
import SicBoBoard from './casino/SicBoBoard';

export default function CasinoTableModal({ table, onClose }) {
  const [roundData, setRoundData] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState("");
  const [streamKey, setStreamKey] = useState(0);
  const [lucky15Popup, setLucky15Popup] = useState(null);

  const slug = (table?.slug || table?.id || '').toLowerCase();
  const nameLow = (table?.name || '').toLowerCase();

  const isWorli = slug === 'worli' || slug === 'worli2' || slug === 'worli3' || nameLow.includes('worli') || nameLow.includes('matka');
  const isPoison = slug.includes('poison') || nameLow.includes('poison');
  const isUniqueTeen = slug.includes('unique') && (slug.includes('teen') || slug.includes('patti') || nameLow.includes('unique teen'));
  const isTeenPattiJoker = slug === 'joker20' || slug === 'teen20b' || nameLow.includes('teenpatti joker') || nameLow.includes('joker 20');
  const isUnlimitedJoker = slug === 'joker120' || slug === 'joker1' || slug === 'teen1' || slug === 'teen120' || nameLow.includes('unlimited joker');
  const isBollywood = slug.includes('btable') || slug.includes('bollywood') || nameLow.includes('bollywood');
  const isMiniSuperOver = slug === 'superover3' || slug === 'minisuperover' || nameLow.includes('mini super');
  const isSuperOver = slug.includes('superover') || slug.includes('ballbyball') || nameLow.includes('super over');
  const isUniqueRoulette = slug === 'ourroullete' || slug === 'uroulette' || nameLow.includes('unique roulette');
  const isLucky6 = slug === 'lucky6' || slug === 'lucky5' || nameLow.includes('lucky 6');
  const isRoulette = slug.includes('roulette') || nameLow.includes('roulette');
  const isGoal = slug === 'goal' || slug === 'goal2' || nameLow.includes('goal');
  const isAndarBahar = slug.includes('ab') || nameLow.includes('andar bahar') || slug.includes('andar');
  const isQueenTop = slug === 'queentop' || slug === 'teen41' || nameLow.includes('queen');
  const isJackTop = slug === 'jacktop' || slug === 'teen42' || nameLow.includes('jack');
  const isSicBo = slug.includes('sicbo') || nameLow.includes('sic bo');
  const isLucky15 = slug === 'lucky15' || nameLow.includes('lucky 15');
  const isSuspended = timer <= 0 || roundData?.status === 'SUSPENDED';

  // Fetch live stream URL from Diamond / D247 API
  useEffect(() => {
    if (!slug) return;
    fetch(`/api/casino/${slug}/livetv`)
      .then((r) => r.json())
      .then((res) => {
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
        .then((r) => r.json())
        .then((res) => {
          if (isMounted && res.success && res.data) {
            setRoundData(res.data);
            if (res.data.timer !== undefined) {
              setTimer(res.data.timer);
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
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  // 2. Fetch real recent results for this table
  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    const fetchResults = () => {
      fetch(`/api/casino/results/${slug}`)
        .then((r) => r.json())
        .then((res) => {
          if (isMounted && res.success && Array.isArray(res.data)) {
            setRecentResults(res.data.slice(0, 16));
            if (isLucky15 && res.data.length > 0) {
              const latest = res.data[0]?.nat;
              if (latest) {
                setLucky15Popup(latest);
                setTimeout(() => setLucky15Popup(null), 2000);
              }
            }
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
  }, [slug, isLucky15]);

  // Calculate Total for games like Mogambo, Sic Bo
  const calculatedTotal = useMemo(() => {
    if (!roundData) return null;

    const totalRunner = roundData.runners?.find(
      (r) =>
        (r.name || "").toLowerCase().includes("total") ||
        (r.subtype || "").toLowerCase().includes("total"),
    );
    if (totalRunner && totalRunner.back > 0) {
      return totalRunner.back;
    }

    if (roundData.dealType === "dice" && Array.isArray(roundData.cards)) {
      const sum = roundData.cards.reduce(
        (acc, d) => acc + (parseInt(d.val) || 0),
        0,
      );
      return sum > 0 ? sum : null;
    }

    if (
      slug === "mogambo" &&
      Array.isArray(roundData.cards) &&
      roundData.cards.length >= 3
    ) {
      const rankToVal = (r) => {
        if (!r) return 0;
        if (r === "A") return 1;
        if (r === "J") return 11;
        if (r === "Q") return 12;
        if (r === "K") return 13;
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
    const w = (winnerName || "").trim();
    const lower = w.toLowerCase();

    // 1. Goal & Andar Bahar: Green badge with letter 'R' (Image 1 & 2 Exact Match)
    if (isGoal || isAndarBahar) {
      return {
        letter: "R",
        bg: "bg-emerald-600 text-white font-bold",
        title: w || "Result",
      };
    }

    // 2. Super Over: Team letters I (India), E (England), A (Australia), R (RSA), T (Tie)
    if (isSuperOver || isMiniSuperOver) {
      if (w === "1" || lower.includes("ind") || lower.includes("india")) {
        return { letter: "I", bg: "bg-blue-600 text-white font-black", title: "IND" };
      }
      if (w === "2") {
        if (slug.includes("superover2")) {
          return { letter: "E", bg: "bg-red-600 text-white font-black", title: "ENG" };
        }
        if (slug.includes("superover3") || isMiniSuperOver) {
          return { letter: "A", bg: "bg-amber-600 text-white font-black", title: "AUS" };
        }
        return { letter: "R", bg: "bg-emerald-700 text-white font-black", title: "RSA" };
      }
      if (lower.includes("eng")) {
        return { letter: "E", bg: "bg-red-600 text-white font-black", title: "ENG" };
      }
      if (lower.includes("aus")) {
        return { letter: "A", bg: "bg-amber-600 text-white font-black", title: "AUS" };
      }
      if (lower.includes("rsa")) {
        return { letter: "R", bg: "bg-emerald-700 text-white font-black", title: "RSA" };
      }
      if (w === "3" || w === "0" || lower.includes("tie")) {
        return { letter: "T", bg: "bg-purple-600 text-white font-black", title: "Tie" };
      }
      return { letter: w.slice(0, 1).toUpperCase() || "I", bg: "bg-blue-600 text-white font-black", title: w };
    }

    // 3. Teen Patti & Variants: A (Red), B (Green), T (Blue) (Image 3 & 4 Exact Match)
    if (
      isQueenTop ||
      isJackTop ||
      isTeenPattiJoker ||
      isUnlimitedJoker ||
      isPoison ||
      slug.includes("teen") ||
      slug.includes("patti")
    ) {
      if (w === "1" || lower === "a" || lower.includes("player a")) {
        return { letter: "A", bg: "bg-red-600 text-white font-black", title: "Player A" };
      }
      if (w === "2" || lower === "b" || lower.includes("player b")) {
        return { letter: "B", bg: "bg-emerald-600 text-white font-black", title: "Player B" };
      }
      if (w === "3" || lower === "t" || lower.includes("tie")) {
        return { letter: "T", bg: "bg-blue-600 text-white font-black", title: "Tie" };
      }
    }

    // 4. Sic Bo & Sic Bo 2: Dice total sum in green circles (Image 5 Exact Match)
    if (isSicBo) {
      const num = parseInt(w);
      return {
        letter: isNaN(num) ? w : String(num),
        bg: "bg-emerald-700 text-white font-mono font-bold",
        title: `Dice Sum: ${w}`,
      };
    }

    // 5. Lucky 15: Cricket outcomes 0, 1, 2, 4, 6, W (Point 3)
    if (isLucky15 || lower.includes("run") || lower.includes("wicket")) {
      if (lower.includes("w") || w === "W" || w === "w" || lower.includes("wicket")) {
        return { letter: "W", bg: "bg-red-700 text-white font-black", title: "Wicket" };
      }
      if (w === "6" || lower.includes("6")) {
        return { letter: "6", bg: "bg-emerald-600 text-white font-black", title: "6 Runs" };
      }
      if (w === "4" || lower.includes("4")) {
        return { letter: "4", bg: "bg-sky-600 text-white font-black", title: "4 Runs" };
      }
      return { letter: w || "0", bg: "bg-slate-700 text-white font-bold font-mono", title: w };
    }

    // 6. Roulette: Numbers 0..36 with Green, Red, Black
    if (isRoulette || isUniqueRoulette) {
      const num = parseInt(w);
      if (!isNaN(num)) {
        const RED_ROULETTE = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        const display = String(w).trim().padStart(2, "0");
        if (num === 0 || w === "0" || w === "00") {
          return { letter: display, bg: "bg-emerald-600 text-white font-mono font-black", title: `Result: ${display}` };
        }
        if (RED_ROULETTE.includes(num)) {
          return { letter: display, bg: "bg-red-600 text-white font-mono font-black", title: `Result: ${display}` };
        }
        return { letter: display, bg: "bg-black text-white font-mono font-black border border-slate-700", title: `Result: ${display}` };
      }
    }

    // Generic defaults
    if (lower.includes("dragon") || lower === "d") return { letter: "D", bg: "bg-amber-600 text-white font-bold", title: w };
    if (lower.includes("tiger") || lower === "t") return { letter: "T", bg: "bg-yellow-500 text-black font-bold", title: w };
    if (lower.includes("low") || lower === "l") return { letter: "L", bg: "bg-indigo-600 text-white font-bold", title: w };
    if (lower.includes("high") || lower === "h") return { letter: "H", bg: "bg-rose-600 text-white font-bold", title: w };

    return {
      letter: w.slice(0, 1).toUpperCase() || "R",
      bg: "bg-emerald-700 text-white font-bold",
      title: w,
    };
  };

  // Flip Clock dual digit formatting
  const timerStr = String(Math.max(0, timer)).padStart(2, "0");
  const d1 = timerStr.charAt(0);
  const d2 = timerStr.charAt(1);

  // Authentic Playing Card Component
  const renderCard = (c, key, isFaceDown = false) => {
    if (isFaceDown || c?.isHidden || !c) {
      return (
        <div
          key={key}
          className="w-8 h-12 sm:w-10 sm:h-14 rounded bg-[#0b2742] border border-yellow-400/90 shadow-md flex items-center justify-center p-0.5 shrink-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #1e3a5f 0, #1e3a5f 2px, #0f2238 2px, #0f2238 4px)",
          }}
        >
          <div className="w-full h-full border border-yellow-400/40 rounded-[2px] flex items-center justify-center text-[10px] text-yellow-300/80 font-serif">
            ✦
          </div>
        </div>
      );
    }

    const isRed = c.color === "red" || c.suit === "♥" || c.suit === "♦";

    return (
      <div
        key={key}
        className="w-8 h-12 sm:w-10 sm:h-14 bg-white border border-slate-900 rounded shadow-md flex flex-col justify-between p-0.5 select-none font-bold shrink-0"
      >
        <div
          className={`text-[11px] sm:text-xs font-black leading-none self-start ${isRed ? "text-red-600" : "text-black"}`}
        >
          {c.rank}
        </div>
        <div
          className={`text-base sm:text-lg leading-none self-center ${isRed ? "text-red-600" : "text-black"}`}
        >
          {c.suit}
        </div>
        <div
          className={`text-[9px] font-black leading-none self-end rotate-180 ${isRed ? "text-red-600" : "text-black"}`}
        >
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
            <h3 className="font-extrabold text-sm sm:text-base text-yellow-400">
              {table.name}
            </h3>
            <span className="hidden sm:inline-block text-[11px] bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-slate-300 font-mono">
              {table.slug}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStreamKey((k) => k + 1)}
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
              #{roundData?.roundId || "Connecting..."}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                roundData?.status === "OPEN"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-red-500/20 text-red-400 border border-red-500/40"
              }`}
            >
              {roundData?.status || (timer > 0 ? "OPEN" : "SUSPENDED")}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            <Clock
              size={13}
              className={
                timer <= 5 ? "text-red-400 animate-pulse" : "text-yellow-400"
              }
            />
            <span className="text-slate-400 text-[11px]">Closes in:</span>
            <span
              className={`font-black px-2 py-0.5 rounded text-xs ${
                timer <= 5
                  ? "bg-red-600 text-white animate-bounce"
                  : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              }`}
            >
              {timer}s
            </span>
          </div>
        </div>

        {/* Worli Matka Market Countdown Schedule */}
        {isWorli && (
          <div className="bg-[#0b1f36] px-2 py-1.5 border-b border-sky-900/60 flex items-center gap-2 overflow-x-auto scrollbar-none select-none">
            {[
              { name: 'ASIA CLOSE', time: '00:47:57', date: '24 NOV 26 04:00 PM' },
              { name: 'TAJ OPEN', time: '01:47:57', date: '24 NOV 26 05:00 PM' },
              { name: 'TAJ CLOSE', time: '02:47:57', date: '24 NOV 26 06:00 PM' },
              { name: 'GULF OPEN', time: '03:47:57', date: '24 NOV 26 07:00 PM' },
              { name: 'GULF CLOSE', time: '04:47:57', date: '24 NOV 26 08:00 PM' },
              { name: 'DIAMOND OPEN', time: '05:47:57', date: '24 NOV 26 09:00 PM' },
              { name: 'DIAMOND CLOSE', time: '06:47:57', date: '24 NOV 26 10:00 PM' },
              { name: 'WORLD OPEN', time: '07:47:57', date: '24 NOV 26 11:00 PM' },
            ].map((m, idx) => (
              <div key={idx} className="bg-[#14324f] px-2.5 py-1 rounded border border-sky-500/40 shrink-0 text-center font-mono">
                <div className="text-sky-300 font-black text-[10px] leading-tight">{m.name}</div>
                <div className="text-yellow-400 font-bold text-[10px] leading-tight">⏱ {m.time}</div>
                <div className="text-[8px] text-slate-400 leading-none">{m.date}</div>
              </div>
            ))}
          </div>
        )}

        {/* 3. Live Video Container with Floating HUD Overlay */}
        <div className="relative w-full aspect-video bg-black overflow-hidden select-none border-b border-slate-800 shrink-0">
          {/* Iframe Live TV Stream */}
          <iframe
            key={streamKey}
            src={streamUrl || `/api/casino/mediaplayer/${slug}`}
            title="Live Casino TV"
            className="w-full h-full border-0 absolute inset-0 z-0 bg-black"
            allow="autoplay; encrypted-media; fullscreen"
          />

          <div className="absolute inset-0 -z-10 bg-black" />

          {/* Lucky 15 Animated Result Zoom Popup (User Point 3) */}
          {lucky15Popup && (
            <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none animate-in zoom-in-50 fade-in duration-300">
              <div className="w-24 h-24 rounded-full bg-red-600 border-4 border-yellow-400 flex items-center justify-center text-white text-5xl font-black font-mono shadow-2xl animate-pulse">
                {lucky15Popup}
              </div>
            </div>
          )}

          {/* Top-Left Floating HUD: Cards, Daga/Teja, Mogambo, Total */}
          <div className="absolute top-2 left-2 z-20 flex flex-col items-start gap-1 pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {/* Yellow TOTAL Badge */}
            {calculatedTotal !== null && (
              <div className="bg-yellow-400 text-black font-black text-xs sm:text-sm px-2 py-0.5 rounded shadow-lg uppercase tracking-wider mb-0.5">
                TOTAL: {calculatedTotal}
              </div>
            )}

            {/* Game Specific Overlay Components */}
            {(() => {
              // Super Over: Clean video without clutter (User Point 4)
              if (isSuperOver || isMiniSuperOver) {
                return null;
              }

              // Unique Teen Patti: Rendered below video
              if (isUniqueTeen) {
                return null;
              }

              // Andar Bahar Carousel HUD (Image 2 Exact Match)
              if (isAndarBahar) {
                const cards = roundData?.cards || [];
                const andarCards = cards.slice(0, 3);
                const baharCards = cards.slice(3, 6);
                return (
                  <div className="flex flex-col items-start gap-1 bg-black/60 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                    <span className="text-[10px] font-mono text-yellow-400 font-bold">
                      Next Card Count: 110 / Bahar
                    </span>
                    <div className="flex flex-col gap-1">
                      {/* ANDAR Row */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black text-amber-200 w-12 uppercase">ANDAR</span>
                        <ChevronLeft size={14} className="text-slate-400" />
                        <div className="flex gap-1">
                          {andarCards.length > 0
                            ? andarCards.map((c, i) => renderCard(c, `ab-a-${i}`, !c || c.isHidden))
                            : [0, 1, 2].map((i) => renderCard(null, `ab-a-d-${i}`, true))}
                        </div>
                        <ChevronRight size={14} className="text-slate-400" />
                      </div>
                      {/* BAHAR Row */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black text-yellow-400 w-12 uppercase">BAHAR</span>
                        <ChevronLeft size={14} className="text-slate-400" />
                        <div className="flex gap-1">
                          {baharCards.length > 0
                            ? baharCards.map((c, i) => renderCard(c, `ab-b-${i}`, !c || c.isHidden))
                            : [0, 1, 2].map((i) => renderCard(null, `ab-b-d-${i}`, true))}
                        </div>
                        <ChevronRight size={14} className="text-slate-400" />
                      </div>
                    </div>
                  </div>
                );
              }

              // Queen Top Open Teenpatti (Image 3: Player A Q top card + Player B 3 cards)
              if (isQueenTop) {
                const cards = roundData?.cards || [];
                const playerA = cards.slice(0, 3);
                const playerB = cards.slice(3, 6);
                return (
                  <div className="flex flex-col items-start gap-1">
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider drop-shadow-md mb-0.5">
                        PLAYER A
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map(idx => renderCard(playerA[idx], `qa-${idx}`, !playerA[idx] || playerA[idx].isHidden))}
                      </div>
                    </div>
                    <div className="mt-0.5">
                      <div className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider drop-shadow-md mb-0.5">
                        PLAYER B
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map(idx => renderCard(playerB[idx], `qb-${idx}`, !playerB[idx] || playerB[idx].isHidden))}
                      </div>
                    </div>
                  </div>
                );
              }

              // Jack Top Open Teenpatti (Image 4: Player A J top card + Player B 3 cards)
              if (isJackTop) {
                const cards = roundData?.cards || [];
                const playerA = cards.slice(0, 3);
                const playerB = cards.slice(3, 6);
                return (
                  <div className="flex flex-col items-start gap-1">
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider drop-shadow-md mb-0.5">
                        PLAYER A
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map(idx => renderCard(playerA[idx], `ja-${idx}`, !playerA[idx] || playerA[idx].isHidden))}
                      </div>
                    </div>
                    <div className="mt-0.5">
                      <div className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider drop-shadow-md mb-0.5">
                        PLAYER B
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map(idx => renderCard(playerB[idx], `jb-${idx}`, !playerB[idx] || playerB[idx].isHidden))}
                      </div>
                    </div>
                  </div>
                );
              }

              // Bollywood Casino: ONLY 1 single card (Image 3 & 10)
              if (isBollywood) {
                const c = roundData?.cards?.[0];
                return (
                  <div className="flex flex-col items-start gap-1">
                    {renderCard(c, "bollywood-card", !c || c.isHidden)}
                  </div>
                );
              }

              // Poison Teenpatti (Poison 1 card, Player A 3 cards, Player B 3 cards)
              if (isPoison) {
                const cards = roundData?.cards || [];
                const poisonCard = cards[0];
                const playerA = cards.slice(1, 4);
                const playerB = cards.slice(4, 7);
                return (
                  <div className="flex flex-col items-start gap-1">
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider drop-shadow-md mb-0.5">
                        POISON
                      </div>
                      <div className="flex gap-1">
                        {renderCard(poisonCard, 'poison-card', !poisonCard || poisonCard.isHidden)}
                      </div>
                    </div>
                    <div className="mt-0.5">
                      <div className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider drop-shadow-md mb-0.5">
                        PLAYER A
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map(idx => renderCard(playerA[idx], `pa-${idx}`, !playerA[idx] || playerA[idx].isHidden))}
                      </div>
                    </div>
                    <div className="mt-0.5">
                      <div className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider drop-shadow-md mb-0.5">
                        PLAYER B
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map(idx => renderCard(playerB[idx], `pb-${idx}`, !playerB[idx] || playerB[idx].isHidden))}
                      </div>
                    </div>
                  </div>
                );
              }

              // Unlimited Joker & Teen Patti Joker
              if (isTeenPattiJoker || isUnlimitedJoker) {
                const cards = roundData?.cards || [];
                const jokerCard = cards[0];
                const playerA = cards.slice(1, 4);
                const playerB = cards.slice(4, 7);
                return (
                  <div className="flex flex-col items-start gap-1">
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-black text-red-400 uppercase tracking-wider drop-shadow-md mb-0.5">
                        JOKER
                      </div>
                      <div className="flex gap-1">
                        {renderCard(jokerCard, 'joker-card', !jokerCard || jokerCard.isHidden)}
                      </div>
                    </div>
                    <div className="mt-0.5">
                      <div className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider drop-shadow-md mb-0.5">
                        PLAYER A
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map(idx => renderCard(playerA[idx], `pa-${idx}`, !playerA[idx] || playerA[idx].isHidden))}
                      </div>
                    </div>
                    <div className="mt-0.5">
                      <div className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider drop-shadow-md mb-0.5">
                        PLAYER B
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map(idx => renderCard(playerB[idx], `pb-${idx}`, !playerB[idx] || playerB[idx].isHidden))}
                      </div>
                    </div>
                  </div>
                );
              }

              // Worli Matka: 3 cards dealt
              if (isWorli) {
                const cards = roundData?.cards || [];
                return (
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(idx => renderCard(cards[idx], `worli-${idx}`, !cards[idx] || cards[idx].isHidden))}
                    </div>
                  </div>
                );
              }

              // Lucky 6 Table: 1 card
              if (isLucky6) {
                const c = roundData?.cards?.[0];
                return (
                  <div className="flex flex-col items-start gap-1">
                    {renderCard(c, "lucky6-card", !c || c.isHidden)}
                  </div>
                );
              }

              // Mogambo Table (Daga / Teja + Mogambo)
              if (slug === "mogambo") {
                const c1 = roundData?.cards?.[0];
                const c2 = roundData?.cards?.[1];
                const c3 = roundData?.cards?.[2];
                return (
                  <div className="flex flex-col items-start gap-1">
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-wider drop-shadow-md mb-0.5">
                        DAGA / TEJA
                      </div>
                      <div className="flex gap-1.5">
                        {renderCard(c1, "dt1", !c1 || c1.isHidden)}
                        {renderCard(c2, "dt2", !c2 || c2.isHidden)}
                      </div>
                    </div>
                    <div className="mt-0.5">
                      <div className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-wider drop-shadow-md mb-0.5">
                        MOGAMBO
                      </div>
                      <div className="flex gap-1.5">
                        {renderCard(c3, "mg1", !c3 || c3.isHidden)}
                      </div>
                    </div>
                  </div>
                );
              }

              // Standard Teen Patti / 20-20 / VIP
              if (slug.includes("teen") || slug.includes("patti")) {
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
                        {[0, 1, 2].map((idx) => renderCard(playerA[idx], `pa-${idx}`, !playerA[idx]))}
                      </div>
                    </div>
                    <div className="mt-0.5">
                      <div className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-wider drop-shadow-md mb-0.5">
                        PLAYER B
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((idx) => renderCard(playerB[idx], `pb-${idx}`, !playerB[idx]))}
                      </div>
                    </div>
                  </div>
                );
              }

              // Dragon Tiger
              if (slug.includes("dt") || slug.includes("dragon")) {
                const dragonCard = roundData?.cards?.[0];
                const tigerCard = roundData?.cards?.[1];
                return (
                  <div className="flex gap-3 items-start">
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider drop-shadow-md mb-0.5">
                        DRAGON
                      </div>
                      {renderCard(dragonCard, "dragon", !dragonCard)}
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-black text-yellow-400 uppercase tracking-wider drop-shadow-md mb-0.5">
                        TIGER
                      </div>
                      {renderCard(tigerCard, "tiger", !tigerCard)}
                    </div>
                  </div>
                );
              }

              // Sic Bo (3D Dice)
              if (roundData?.dealType === "dice" || isSicBo) {
                const pips = { 1: "⚀", 2: "⚁", 3: "⚂", 4: "⚃", 5: "⚄", 6: "⚅" };
                const dice = roundData?.cards || [{ val: "?" }, { val: "?" }, { val: "?" }];
                return (
                  <div className="flex gap-1.5 items-center">
                    {dice.map((d, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white border border-slate-900 text-red-600 flex items-center justify-center text-2xl sm:text-3xl shadow-lg"
                      >
                        {pips[d.val] || "🎲"}
                      </div>
                    ))}
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

          {/* Bottom-Right 3D Flip Clock Counter [ 0 ] [ 1 ] */}
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
          {isWorli ? (
            <WorliMatkaBoard roundData={roundData} timer={timer} isSuspended={isSuspended} />
          ) : isPoison ? (
            <PoisonTeenPattiBoard roundData={roundData} timer={timer} isSuspended={isSuspended} />
          ) : isUniqueTeen ? (
            <UniqueTeenPattiBoard roundData={roundData} timer={timer} isSuspended={isSuspended} />
          ) : isTeenPattiJoker ? (
            <TeenPattiJoker20Board roundData={roundData} timer={timer} isSuspended={isSuspended} />
          ) : isUnlimitedJoker ? (
            <UnlimitedJokerBoard roundData={roundData} timer={timer} isSuspended={isSuspended} />
          ) : isBollywood ? (
            <BollywoodCasinoBoard roundData={roundData} timer={timer} isSuspended={isSuspended} />
          ) : isMiniSuperOver || isSuperOver ? (
            <MiniSuperOverBoard roundData={roundData} timer={timer} isSuspended={isSuspended} />
          ) : isUniqueRoulette ? (
            <UniqueRouletteBoard roundData={roundData} timer={timer} isSuspended={isSuspended} recentResults={recentResults} />
          ) : isLucky6 ? (
            <Lucky6Board roundData={roundData} timer={timer} isSuspended={isSuspended} />
          ) : isRoulette ? (
            <RouletteBoard roundData={roundData} timer={timer} isSuspended={isSuspended} />
          ) : isGoal ? (
            <GoalBoard roundData={roundData} timer={timer} isSuspended={isSuspended} />
          ) : isAndarBahar ? (
            <AndarBaharBoard roundData={roundData} timer={timer} isSuspended={isSuspended} />
          ) : isQueenTop || isJackTop ? (
            <QueenJackTopBoard roundData={roundData} timer={timer} isSuspended={isSuspended} title={table.name} />
          ) : isSicBo ? (
            <SicBoBoard roundData={roundData} timer={timer} isSuspended={isSuspended} />
          ) : (
            /* Standard Live Runners Exchange Board */
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                  LIVE BETTING MARKETS & RATES
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  Min: {roundData?.runners?.[0]?.min || 100} | Max:{" "}
                  {roundData?.runners?.[0]?.max
                    ? Number(roundData.runners[0].max).toLocaleString()
                    : "300,000"}
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
                      const isRunnerSuspended =
                        r.suspended ||
                        roundData?.status === "SUSPENDED" ||
                        timer <= 0;
                      return (
                        <div
                          key={idx}
                          className="bg-slate-800/80 border border-slate-700/80 rounded-lg p-2.5 flex items-center justify-between hover:border-slate-600 transition"
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="text-xs font-bold text-white truncate">
                              {r.name}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {r.subtype ? `${r.subtype} • ` : ""}
                              Limit: {r.min} -{" "}
                              {Number(r.max || 100000).toLocaleString()}
                            </div>
                          </div>

                          {isRunnerSuspended ? (
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
                            <div className="flex items-center gap-1.5">
                              <div className="w-16 sm:w-20 bg-[#72bbef] hover:bg-[#5aaae6] text-slate-950 font-black text-center py-1 rounded cursor-pointer transition shadow-sm">
                                <div className="text-xs font-black leading-tight">
                                  {r.back > 0 ? r.back : "-"}
                                </div>
                                <div className="text-[9px] font-bold text-slate-800 leading-none">
                                  {r.backSize > 0
                                    ? Number(r.backSize).toLocaleString()
                                    : "100,000"}
                                </div>
                              </div>

                              {r.lay > 0 ? (
                                <div className="w-16 sm:w-20 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-center py-1 rounded cursor-pointer transition shadow-sm">
                                  <div className="text-xs font-black leading-tight">
                                    {r.lay}
                                  </div>
                                  <div className="text-[9px] font-bold text-slate-800 leading-none">
                                    {r.laySize > 0
                                      ? Number(r.laySize).toLocaleString()
                                      : "100,000"}
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
