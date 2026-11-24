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

export default function CasinoTableModal({ table, onClose }) {
  const [roundData, setRoundData] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState("");
  const [streamKey, setStreamKey] = useState(0);

  const slug = (table?.slug || table?.id || '').toLowerCase();
  const nameLow = (table?.name || '').toLowerCase();

  const isWorli = slug === 'worli' || slug === 'worli2' || slug === 'worli3' || nameLow.includes('worli') || nameLow.includes('matka');
  const isPoison = slug.includes('poison') || nameLow.includes('poison');
  const isUniqueTeen = slug.includes('unique') && (slug.includes('teen') || slug.includes('patti') || nameLow.includes('unique teen'));
  const isTeenPattiJoker = slug === 'joker20' || slug === 'teen20b' || nameLow.includes('teenpatti joker');
  const isUnlimitedJoker = slug === 'joker120' || slug === 'joker1' || slug === 'teen1' || slug === 'teen120' || nameLow.includes('unlimited joker');
  const isBollywood = slug.includes('btable') || slug.includes('bollywood') || nameLow.includes('bollywood');
  const isMiniSuperOver = slug === 'superover3' || slug === 'minisuperover' || nameLow.includes('mini super');
  const isSuperOver = slug.includes('superover') || slug.includes('ballbyball') || nameLow.includes('super over');
  const isUniqueRoulette = slug === 'ourroullete' || slug === 'uroulette' || nameLow.includes('unique roulette');
  const isLucky6 = slug === 'lucky6' || slug === 'lucky5' || nameLow.includes('lucky 6');
  const isRoulette = slug.includes('roulette') || nameLow.includes('roulette');
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
    const totalRunner = roundData.runners?.find(
      (r) =>
        (r.name || "").toLowerCase().includes("total") ||
        (r.subtype || "").toLowerCase().includes("total"),
    );
    if (totalRunner && totalRunner.back > 0) {
      return totalRunner.back;
    }

    // For Sic Bo: sum of dice values
    if (roundData.dealType === "dice" && Array.isArray(roundData.cards)) {
      const sum = roundData.cards.reduce(
        (acc, d) => acc + (parseInt(d.val) || 0),
        0,
      );
      return sum > 0 ? sum : null;
    }

    // For Mogambo: calculate rank sum if all 3 cards present
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

    // 1. Roulette Results (Numbers 0..36, 00 - Red, Black, Green)
    if (
      isRoulette ||
      (/^\d{1,2}$/.test(w) &&
        (slug.includes("roulette") || !isNaN(parseInt(w))))
    ) {
      const num = parseInt(w);
      if (!isNaN(num)) {
        const RED_ROULETTE = [
          1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
        ];
        const display = String(w).trim().padStart(2, "0");
        if (num === 0 || w === "0" || w === "00") {
          return {
            letter: display,
            bg: "bg-emerald-600 text-white font-mono font-black",
            title: `Result: ${display}`,
          };
        }
        if (RED_ROULETTE.includes(num)) {
          return {
            letter: display,
            bg: "bg-red-600 text-white font-mono font-black",
            title: `Result: ${display}`,
          };
        }
        return {
          letter: display,
          bg: "bg-black text-white font-mono font-black border border-slate-700",
          title: `Result: ${display}`,
        };
      }
    }

    // 3. Cricket Ball by Ball (e.g. "1 Run", "6 Run", "Wicket")
    if (lower.includes("run") || lower.includes("wicket")) {
      if (lower.includes("wicket") || lower.includes("w")) {
        return {
          letter: "W",
          bg: "bg-red-700 text-white font-black",
          title: "Wicket",
        };
      }
      const match = w.match(/\d+/);
      const runs = match ? match[0] : "•";
      const bg =
        runs === "6"
          ? "bg-emerald-600 text-white"
          : runs === "4"
            ? "bg-sky-600 text-white"
            : "bg-slate-700 text-slate-200";
      return { letter: runs, bg: `${bg} font-black font-mono`, title: w };
    }

    if (lower.includes("daga") || lower.includes("teja")) {
      return {
        letter: "D",
        bg: "bg-emerald-700 text-white font-bold",
        title: w,
      };
    }
    if (lower.includes("mogambo")) {
      return {
        letter: "M",
        bg: "bg-emerald-700 text-white font-bold",
        title: w,
      };
    }
    if (lower === "ind" || lower.includes("india")) {
      return {
        letter: "I",
        bg: "bg-emerald-700 text-white font-bold",
        title: w,
      };
    }
    if (lower === "eng" || lower.includes("england")) {
      return {
        letter: "E",
        bg: "bg-emerald-700 text-white font-bold",
        title: w,
      };
    }
    if (lower.includes("player a") || lower === "a") {
      return { letter: "A", bg: "bg-red-600 text-white font-bold", title: w };
    }
    if (lower.includes("player b") || lower === "b") {
      return { letter: "B", bg: "bg-blue-600 text-white font-bold", title: w };
    }
    if (lower.includes("dragon")) {
      return { letter: "D", bg: "bg-amber-600 text-white font-bold", title: w };
    }
    if (lower.includes("tiger")) {
      return {
        letter: "T",
        bg: "bg-yellow-500 text-black font-bold",
        title: w,
      };
    }
    if (lower.includes("tie")) {
      return {
        letter: "T",
        bg: "bg-emerald-600 text-white font-bold",
        title: w,
      };
    }
    if (lower.includes("low")) {
      return {
        letter: "L",
        bg: "bg-indigo-600 text-white font-bold",
        title: w,
      };
    }
    if (lower.includes("high")) {
      return { letter: "H", bg: "bg-rose-600 text-white font-bold", title: w };
    }
    if (lower.includes("amar")) {
      return {
        letter: "Am",
        bg: "bg-purple-600 text-white font-bold",
        title: w,
      };
    }
    if (lower.includes("akbar")) {
      return { letter: "Ak", bg: "bg-cyan-600 text-white font-bold", title: w };
    }
    if (lower.includes("anthony")) {
      return { letter: "An", bg: "bg-teal-600 text-white font-bold", title: w };
    }
    if (lower.includes("player 8")) {
      return { letter: "8", bg: "bg-blue-700 text-white font-bold", title: w };
    }
    if (lower.includes("player 9")) {
      return { letter: "9", bg: "bg-red-700 text-white font-bold", title: w };
    }
    if (lower.includes("player 10")) {
      return {
        letter: "10",
        bg: "bg-amber-700 text-white font-bold",
        title: w,
      };
    }
    if (lower.includes("player 11")) {
      return {
        letter: "11",
        bg: "bg-emerald-700 text-white font-bold",
        title: w,
      };
    }

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

  // Authentic Playing Card Component (Matching Diamond Online Image 10)
  const renderCard = (c, key, isFaceDown = false) => {
    if (isFaceDown || c?.isHidden || !c) {
      return (
        <div
          key={key}
          className="w-8 h-12 sm:w-10 sm:h-14 rounded bg-[#0b2742] border border-yellow-400/90 shadow-md flex items-center justify-center p-0.5"
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
        className="w-8 h-12 sm:w-10 sm:h-14 bg-white border border-slate-900 rounded shadow-md flex flex-col justify-between p-0.5 select-none font-bold"
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

        {/* Worli Matka Market Countdown Schedule (Image 6 & 7) */}
        {isWorli && (
          <div className="bg-[#0b1f36] px-2 py-1.5 border-b border-sky-900/60 flex items-center gap-2 overflow-x-auto scrollbar-none select-none">
            {[
              {
                name: "ASIA CLOSE",
                time: "00:47:57",
                date: "24 NOV 26 04:00 PM",
              },
              {
                name: "TAJ OPEN",
                time: "01:47:57",
                date: "24 NOV 26 05:00 PM",
              },
              {
                name: "TAJ CLOSE",
                time: "02:47:57",
                date: "24 NOV 26 06:00 PM",
              },
              {
                name: "GULF OPEN",
                time: "03:47:57",
                date: "24 NOV 26 07:00 PM",
              },
              {
                name: "GULF CLOSE",
                time: "04:47:57",
                date: "24 NOV 26 08:00 PM",
              },
              {
                name: "DIAMOND OPEN",
                time: "05:47:57",
                date: "24 NOV 26 09:00 PM",
              },
              {
                name: "DIAMOND CLOSE",
                time: "06:47:57",
                date: "24 NOV 26 10:00 PM",
              },
              {
                name: "WORLD OPEN",
                time: "07:47:57",
                date: "24 NOV 26 11:00 PM",
              },
            ].map((m, idx) => (
              <div
                key={idx}
                className="bg-[#14324f] px-2.5 py-1 rounded border border-sky-500/40 shrink-0 text-center font-mono"
              >
                <div className="text-sky-300 font-black text-[10px] leading-tight">
                  {m.name}
                </div>
                <div className="text-yellow-400 font-bold text-[10px] leading-tight">
                  ⏱ {m.time}
                </div>
                <div className="text-[8px] text-slate-400 leading-none">
                  {m.date}
                </div>
              </div>
            ))}
          </div>
        )}

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
              // Unique Teen Patti: No cards in video HUD (cards rendered in 6-card strip below video)
              if (isUniqueTeen) {
                return null;
              }

              // Poison Teenpatti (Image 1 & 3: Poison 1 card, Player A 3 cards, Player B 3 cards)
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
                        {renderCard(
                          poisonCard,
                          "poison-card",
                          !poisonCard || poisonCard.isHidden,
                        )}
                      </div>
                    </div>
                    <div className="mt-0.5">
                      <div className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider drop-shadow-md mb-0.5">
                        PLAYER A
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((idx) =>
                          renderCard(
                            playerA[idx],
                            `pa-${idx}`,
                            !playerA[idx] || playerA[idx].isHidden,
                          ),
                        )}
                      </div>
                    </div>
                    <div className="mt-0.5">
                      <div className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider drop-shadow-md mb-0.5">
                        PLAYER B
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((idx) =>
                          renderCard(
                            playerB[idx],
                            `pb-${idx}`,
                            !playerB[idx] || playerB[idx].isHidden,
                          ),
                        )}
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

              // Unlimited Joker 20-20 & One-Day & Teen Patti Joker
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
                        {renderCard(
                          jokerCard,
                          "joker-card",
                          !jokerCard || jokerCard.isHidden,
                        )}
                      </div>
                    </div>
                    <div className="mt-0.5">
                      <div className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider drop-shadow-md mb-0.5">
                        PLAYER A
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((idx) =>
                          renderCard(
                            playerA[idx],
                            `pa-${idx}`,
                            !playerA[idx] || playerA[idx].isHidden,
                          ),
                        )}
                      </div>
                    </div>
                    <div className="mt-0.5">
                      <div className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider drop-shadow-md mb-0.5">
                        PLAYER B
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((idx) =>
                          renderCard(
                            playerB[idx],
                            `pb-${idx}`,
                            !playerB[idx] || playerB[idx].isHidden,
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Worli Matka (Image 6 & 7: 3 cards dealt for Pana)
              if (isWorli) {
                const cards = roundData?.cards || [];
                return (
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((idx) =>
                        renderCard(
                          cards[idx],
                          `worli-${idx}`,
                          !cards[idx] || cards[idx].isHidden,
                        ),
                      )}
                    </div>
                  </div>
                );
              }

              // Lucky 6 Table (Image 5: 1 card)
              if (isLucky6) {
                const c = roundData?.cards?.[0];
                return (
                  <div className="flex flex-col items-start gap-1">
                    {renderCard(c, "lucky6-card", !c || c.isHidden)}
                  </div>
                );
              }

              // Virtual Cricket (Super Over / Mini Super Over / Ball by Ball)
              if (isSuperOver || isMiniSuperOver || roundData?.dealType === 'cricket_ball') {
                const score = roundData?.score || {
                  team1: 'IND',
                  team1Score: '0-0 (0.0)',
                  team1CRR: 'CRR 0.00',
                  team2: slug.includes('superover2') ? 'ENG' : slug.includes('superover3') || isMiniSuperOver ? 'AUS' : 'RSA',
                  team2Score: '0-0 (0.0)',
                  balls: []
                };
                const cardList = Array.isArray(roundData?.cards) ? roundData.cards : [];
                return (
                  <div className="flex flex-col items-start gap-1 w-full max-w-xs pointer-events-none">
                    <div className="bg-[#0b2416]/95 border border-emerald-500/60 rounded px-2.5 py-1 text-white shadow-xl w-full">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="font-black text-amber-300">{score.team1} {score.team1Score}</span>
                        <span className="text-emerald-400 font-bold">{score.team1CRR}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono mt-0.5">
                        <span className="font-bold text-slate-200">{score.team2} {score.team2Score}</span>
                      </div>
                    </div>
                    {/* Left vertical dealt cards */}
                    <div className="flex flex-col gap-1 mt-0.5">
                      {[0, 1, 2, 3, 4, 5].map((idx) => {
                        const c = cardList[idx];
                        return renderCard(c, `so-card-${idx}`, !c || c.isHidden);
                      })}
                    </div>
                  </div>
                );
              }

              // Mogambo Table (Exact match to User Image 10)
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
                        {[0, 1, 2].map((idx) =>
                          renderCard(playerA[idx], `pa-${idx}`, !playerA[idx]),
                        )}
                      </div>
                    </div>
                    <div className="mt-0.5">
                      <div className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-wider drop-shadow-md mb-0.5">
                        PLAYER B
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((idx) =>
                          renderCard(playerB[idx], `pb-${idx}`, !playerB[idx]),
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // 3. Dragon Tiger
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

              // 4. Lucky 7
              if (slug.includes("lucky7") || slug === "lucky7eu") {
                const c = roundData?.cards?.[0];
                return (
                  <div>
                    <div className="text-[10px] sm:text-[11px] font-black text-white uppercase tracking-wider drop-shadow-md mb-0.5">
                      CARD
                    </div>
                    {renderCard(c, "lucky-card", !c)}
                  </div>
                );
              }

              // 5. 32 Cards
              if (slug.includes("card32") || slug.includes("32")) {
                const cards = roundData?.cards || [];
                return (
                  <div className="grid grid-cols-4 gap-1.5">
                    {[8, 9, 10, 11].map((p, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-sky-300 drop-shadow">
                          P{p}
                        </span>
                        {renderCard(cards[idx], `c32-${idx}`, !cards[idx])}
                      </div>
                    ))}
                  </div>
                );
              }

              // 6. Sic Bo (3D Dice)
              if (roundData?.dealType === "dice" || slug.includes("sicbo")) {
                const pips = { 1: "⚀", 2: "⚁", 3: "⚂", 4: "⚃", 5: "⚄", 6: "⚅" };
                const dice = roundData?.cards || [
                  { val: "?" },
                  { val: "?" },
                  { val: "?" },
                ];
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

              // 7. Roulette
              if (
                roundData?.dealType === "roulette" ||
                slug.includes("roulette")
              ) {
                const r = roundData?.cards?.[0] || {};
                const num = r.number || "0";
                const isGreen = num === "0" || num === "00";
                const isRed = r.color === "red";
                return (
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-yellow-400 flex items-center justify-center font-mono font-black text-lg sm:text-xl shadow-2xl text-white ${
                        isGreen
                          ? "bg-emerald-600"
                          : isRed
                            ? "bg-red-600"
                            : "bg-slate-950"
                      }`}
                    >
                      {num}
                    </div>
                  </div>
                );
              }

              // Generic fallback cards
              if (roundData?.cards && roundData.cards.length > 0) {
                return (
                  <div className="flex gap-1">
                    {roundData.cards
                      .slice(0, 4)
                      .map((c, i) => renderCard(c, `gen-${i}`))}
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
          {isWorli ? (
            /* Worli Matka Custom Betting Board (Exact Match to Diamond Online Image 6 & 7) */
            <div className="flex flex-col gap-3">
              {/* Coin Amount & 1-Click Bet Palette */}
              <div className="bg-[#112435] p-2.5 rounded-lg border border-slate-700 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] font-black text-slate-300 uppercase tracking-wide">
                  SET YOUR COIN AMOUNT AND START 1-CLICK BET!
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button className="px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded shadow">
                    Reset
                  </button>
                  <div className="px-2.5 py-1 bg-purple-700 text-white font-bold text-xs rounded-full border border-purple-400">
                    0 =
                  </div>
                  {[25, 50, 100, 200, 500, "1K"].map((coin, cIdx) => (
                    <div
                      key={cIdx}
                      className="w-8 h-8 rounded-full bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-[11px] flex items-center justify-center cursor-pointer shadow border border-cyan-400 active:scale-95 transition"
                    >
                      +{coin}
                    </div>
                  ))}
                </div>
              </div>

              {/* Matka Tabs & Interactive Grid */}
              <div className="grid grid-cols-12 gap-2 relative">
                {/* Suspended Lock Overlay */}
                {isSuspended && (
                  <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-[2px] rounded-lg flex flex-col items-center justify-center text-red-400 font-black text-sm tracking-wider gap-1 border border-red-500/50">
                    <Lock size={24} className="text-red-500 animate-pulse" />
                    <span>LOCKED / SUSPENDED</span>
                  </div>
                )}

                {/* Left Vertical Tabs (Exact to Image 6 & 7) */}
                <div className="col-span-3 sm:col-span-2 flex flex-col gap-1 bg-[#0f1d2c] p-1 rounded-lg border border-slate-700/80">
                  {[
                    "Jodi",
                    "Single",
                    "Pana",
                    "SP",
                    "DP",
                    "Trio",
                    "Cycle",
                    "Motor SP",
                    "56 Charts",
                    "64 Charts",
                    "ABR",
                    "Common SP",
                    "Common DP",
                    "Color DP",
                  ].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedWorliTab(tab)}
                      className={`py-1.5 px-2 text-center text-xs font-black rounded transition truncate ${
                        selectedWorliTab === tab
                          ? "bg-[#1e3a5f] text-white border-l-4 border-sky-400 font-extrabold shadow"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Right Interactive Single Grid (Exact to Image 6 & 7) */}
                <div className="col-span-9 sm:col-span-10 flex flex-col gap-1.5">
                  {/* Row 1: 1, 2, 3, 4, 5, LINE 1, ODD */}
                  <div className="grid grid-cols-7 gap-1 text-slate-900 font-black">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div
                        key={num}
                        className="py-3 bg-[#72bbef] hover:bg-[#5caae6] rounded flex items-center justify-center text-lg sm:text-xl font-serif font-black cursor-pointer shadow active:scale-95 transition"
                      >
                        {num}
                      </div>
                    ))}
                    <div className="py-2 px-1 bg-[#72bbef] hover:bg-[#5caae6] rounded flex flex-col items-center justify-center text-center cursor-pointer shadow active:scale-95 transition">
                      <span className="text-[11px] font-black uppercase leading-tight">
                        LINE 1
                      </span>
                      <span className="text-[8px] font-mono text-slate-800">
                        1|2|3|4|5
                      </span>
                    </div>
                    <div className="py-2 px-1 bg-[#72bbef] hover:bg-[#5caae6] rounded flex flex-col items-center justify-center text-center cursor-pointer shadow active:scale-95 transition">
                      <span className="text-[11px] font-black uppercase leading-tight">
                        ODD
                      </span>
                      <span className="text-[8px] font-mono text-slate-800">
                        1|3|5|7|9
                      </span>
                    </div>
                  </div>

                  {/* Row 2: 6, 7, 8, 9, 0, LINE 2, EVEN */}
                  <div className="grid grid-cols-7 gap-1 text-slate-900 font-black">
                    {[6, 7, 8, 9, 0].map((num) => (
                      <div
                        key={num}
                        className="py-3 bg-[#72bbef] hover:bg-[#5caae6] rounded flex items-center justify-center text-lg sm:text-xl font-serif font-black cursor-pointer shadow active:scale-95 transition"
                      >
                        {num}
                      </div>
                    ))}
                    <div className="py-2 px-1 bg-[#72bbef] hover:bg-[#5caae6] rounded flex flex-col items-center justify-center text-center cursor-pointer shadow active:scale-95 transition">
                      <span className="text-[11px] font-black uppercase leading-tight">
                        LINE 2
                      </span>
                      <span className="text-[8px] font-mono text-slate-800">
                        6|7|8|9|0
                      </span>
                    </div>
                    <div className="py-2 px-1 bg-[#72bbef] hover:bg-[#5caae6] rounded flex flex-col items-center justify-center text-center cursor-pointer shadow active:scale-95 transition">
                      <span className="text-[11px] font-black uppercase leading-tight">
                        EVEN
                      </span>
                      <span className="text-[8px] font-mono text-slate-800">
                        2|4|6|8|0
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Matka Markets Ribbon */}
              <div className="bg-[#112435] px-3 py-2 rounded-lg border border-slate-700 flex items-center justify-between text-xs overflow-x-auto scrollbar-none">
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-slate-400 font-bold text-[11px] mr-1">
                    Last Result
                  </span>
                  {[
                    "Diamond",
                    "World",
                    "Taj",
                    "Lords",
                    "Riga",
                    "Asia",
                    "Gulf",
                  ].map((m) => (
                    <div
                      key={m}
                      className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded text-[10px] font-bold"
                    >
                      {m}
                    </div>
                  ))}
                </div>
                <button className="text-[10px] font-bold text-sky-400 hover:underline shrink-0 ml-2">
                  View All
                </button>
              </div>
            </div>
          ) : isPoison ? (
            /* Poison Teenpatti Custom Betting Board (Exact Match to Diamond Online Image 1 & 3) */
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Left: Player A & Player B Back/Lay */}
                <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden">
                  <div className="grid grid-cols-3 bg-[#0c1b29] text-[11px] font-bold text-slate-300 border-b border-slate-700 py-2 px-3 text-center">
                    <div className="text-left font-black text-slate-400">
                      Runner
                    </div>
                    <div className="bg-[#72bbef]/20 text-[#72bbef] rounded font-black py-0.5">
                      Back
                    </div>
                    <div className="bg-[#faa9ba]/20 text-[#faa9ba] rounded font-black py-0.5 ml-1">
                      Lay
                    </div>
                  </div>
                  {["Player A", "Player B"].map((pName, pIdx) => {
                    const runner = roundData?.runners?.find(
                      (r) =>
                        (r.name || "").toLowerCase() === pName.toLowerCase(),
                    );
                    return (
                      <div
                        key={pIdx}
                        className="grid grid-cols-3 items-center border-b border-slate-800 p-2.5 text-center"
                      >
                        <div className="text-left font-black text-xs text-white">
                          {pName}
                        </div>
                        {isSuspended ? (
                          <div className="py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                            <Lock size={14} className="text-slate-300" />
                          </div>
                        ) : (
                          <button className="py-1.5 bg-[#72bbef] hover:bg-[#5caae6] text-slate-950 font-black text-xs rounded transition shadow">
                            {runner?.back || "1.95"}
                          </button>
                        )}
                        {isSuspended ? (
                          <div className="py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center ml-1">
                            <Lock size={14} className="text-slate-300" />
                          </div>
                        ) : (
                          <button className="py-1.5 bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-xs rounded transition shadow ml-1">
                            {runner?.lay || "2.05"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Right: Poison Side Bets (Even, Odd, Red, Black, Suits) */}
                <div className="bg-[#112435] rounded-lg border border-slate-700 overflow-hidden">
                  {/* Row 1: Header Even | Odd | Red | Black */}
                  <div className="grid grid-cols-5 bg-[#0c1b29] text-[10px] font-bold text-slate-300 border-b border-slate-700 py-1.5 px-2 text-center">
                    <div className="text-left font-bold text-amber-400">
                      Poison
                    </div>
                    <div>Even</div>
                    <div>Odd</div>
                    <div className="text-red-400">Red ♥♦</div>
                    <div className="text-slate-200">Black ♠♣</div>
                  </div>
                  <div className="grid grid-cols-5 items-center p-2 border-b border-slate-800 text-center gap-1">
                    <div className="text-left text-[11px] font-bold text-slate-400">
                      Rate
                    </div>
                    {["Even", "Odd", "Red", "Black"].map((opt, i) => (
                      <div
                        key={i}
                        className="py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center"
                      >
                        {isSuspended ? (
                          <Lock size={12} className="text-slate-300" />
                        ) : (
                          <span className="text-xs font-black text-sky-300">
                            2.0
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Row 2: Suits Header ♠ | ♥ | ♦ | ♣ */}
                  <div className="grid grid-cols-5 bg-[#0c1b29] text-[11px] font-bold text-slate-300 border-b border-slate-700 py-1.5 px-2 text-center">
                    <div className="text-left font-bold text-amber-400">
                      Suits
                    </div>
                    <div>♠</div>
                    <div className="text-red-400">♥</div>
                    <div className="text-red-400">♦</div>
                    <div>♣</div>
                  </div>
                  <div className="grid grid-cols-5 items-center p-2 text-center gap-1">
                    <div className="text-left text-[11px] font-bold text-slate-400">
                      Rate
                    </div>
                    {["♠", "♥", "♦", "♣"].map((s, i) => (
                      <div
                        key={i}
                        className="py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center"
                      >
                        {isSuspended ? (
                          <Lock size={12} className="text-slate-300" />
                        ) : (
                          <span className="text-xs font-black text-amber-300">
                            4.0
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : isUniqueTeen ? (
            /* Unique Teen Patti Custom Betting Board (Exact Match to Diamond Online Image 2) */
            <div className="flex flex-col gap-3">
              <div className="bg-[#112435] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-t-lg flex items-center justify-between border-b border-slate-700">
                <span className="flex items-center gap-2">
                  <span className="text-yellow-400 font-black">👆</span>
                  Select any 3 cards of your choice and experience TeenPatti in
                  a unique way.
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  Round ID: #{roundData?.roundId || "Connecting..."}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2 sm:gap-4 py-4 bg-[#0c1b29] rounded-b-lg border border-slate-700/80 overflow-x-auto scrollbar-none px-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const c = roundData?.cards?.[idx];
                  const isRed =
                    c?.color === "red" || c?.suit === "♥" || c?.suit === "♦";
                  return (
                    <div
                      key={idx}
                      className="flex flex-col items-center gap-1.5 shrink-0"
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center shadow">
                        {idx + 1}
                      </div>
                      {c && !c.isHidden ? (
                        <div className="w-12 h-18 sm:w-16 sm:h-24 bg-white border-2 border-yellow-400 rounded-lg shadow-xl flex flex-col justify-between p-1 select-none font-bold">
                          <div
                            className={`text-sm sm:text-base font-black leading-none ${isRed ? "text-red-600" : "text-slate-900"}`}
                          >
                            {c.rank}
                          </div>
                          <div
                            className={`text-xl sm:text-3xl leading-none self-center ${isRed ? "text-red-600" : "text-slate-900"}`}
                          >
                            {c.suit}
                          </div>
                          <div
                            className={`text-[10px] sm:text-xs font-black leading-none self-end rotate-180 ${isRed ? "text-red-600" : "text-slate-900"}`}
                          >
                            {c.rank}
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-18 sm:w-16 sm:h-24 rounded-lg bg-[#0b2742] border-2 border-yellow-400/80 shadow-md flex items-center justify-center">
                          <div className="text-yellow-300 font-serif text-xl">
                            ✦
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : isJoker ? (
            /* Unlimited Joker 20-20 Custom Betting Board (Exact Match to Diamond Online Image 4) */
            <div className="flex flex-col gap-3">
              {/* Select your Joker strip */}
              <div className="bg-[#112435] rounded-lg border border-slate-700 p-2.5 flex flex-col sm:flex-row items-center gap-2.5">
                <div className="px-3 py-1.5 bg-sky-600 text-white font-black text-xs rounded shrink-0 shadow">
                  Select your Joker
                </div>
                <div className="grid grid-cols-13 gap-1 w-full overflow-x-auto scrollbar-none">
                  {[
                    "A",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    "10",
                    "J",
                    "Q",
                    "K",
                  ].map((r) => (
                    <div
                      key={r}
                      className="py-1 px-1 bg-white hover:bg-slate-100 rounded border border-slate-300 text-slate-900 flex flex-col items-center justify-center cursor-pointer shadow-sm min-w-[24px] hover:scale-105 transition"
                    >
                      <span className="text-[11px] font-black">{r}</span>
                      <div className="flex gap-0.5 text-[6px] text-slate-600 leading-none">
                        <span className="text-black">♠</span>
                        <span className="text-red-600">♥</span>
                        <span className="text-red-600">♦</span>
                        <span className="text-black">♣</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Player A & Player B Back/Lay */}
              <div className="bg-[#112435] rounded-lg border border-slate-700 p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["Player A", "Player B"].map((pName, pIdx) => (
                  <div
                    key={pIdx}
                    className="flex items-center justify-between bg-[#0c1b29] p-2.5 rounded-lg border border-slate-700/80"
                  >
                    <span className="font-black text-sm text-white">
                      {pName}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                        <Lock size={14} className="text-slate-300" />
                      </div>
                      <div className="w-16 py-2 bg-[#2b3543] rounded border border-slate-700 text-slate-400 flex items-center justify-center">
                        <Lock size={14} className="text-slate-300" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : isLucky6 ? (
            /* Lucky 6 Custom Betting Board (Exact Match to Diamond Online Image 5) */
            <div className="flex flex-col gap-3 relative">
              {/* Suspended Lock Overlay */}
              {isSuspended && (
                <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-[2px] rounded-lg flex flex-col items-center justify-center text-red-400 font-black text-sm tracking-wider gap-1 border border-red-500/50">
                  <Lock size={24} className="text-red-500 animate-pulse" />
                  <span>LOCKED / SUSPENDED</span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs border-b border-slate-700/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sky-400 text-sm">
                    LUCKY 6
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Round ID: #{roundData?.roundId || "Connecting..."}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 bg-sky-600 text-white font-black text-xs rounded shadow">
                    GAME
                  </span>
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-300 font-bold text-xs rounded border border-slate-700">
                    PLACED BET (0)
                  </span>
                </div>
              </div>

              {/* Row 1: Low Card | 6 | High Card */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-lg flex flex-col items-center justify-center cursor-pointer shadow-md transition active:scale-95">
                  <span className="text-xs text-blue-200 font-bold">2</span>
                  <span className="text-sm sm:text-base font-black">
                    Low Card
                  </span>
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
                  <span className="text-sm sm:text-base font-black">
                    High Card
                  </span>
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
                  {["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J"].map(
                    (rank) => (
                      <div
                        key={rank}
                        className={`py-2 px-0.5 rounded-lg border flex flex-col items-center justify-between cursor-pointer transition hover:scale-105 ${
                          rank === "6"
                            ? "bg-yellow-500/20 border-yellow-400 text-yellow-300"
                            : "bg-white hover:bg-slate-100 border-slate-300 text-slate-900"
                        } shadow-sm`}
                      >
                        <span className="text-[9px] font-bold text-slate-500 leading-none">
                          10
                        </span>
                        <span className="text-xs sm:text-sm font-black my-0.5">
                          {rank}
                        </span>
                        <div className="flex gap-0.5 text-[7px] leading-none text-slate-600">
                          <span className="text-black">♠</span>
                          <span className="text-red-600">♥</span>
                          <span className="text-red-600">♦</span>
                          <span className="text-black">♣</span>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          ) : isRoulette ? (
            /* Roulette / VIP Roulette Custom Betting Board (Exact Match to Diamond Online Image 8 & 9) */
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs border-b border-slate-700/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-amber-400 text-sm">
                    ROULETTE
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Range: 25 to 100,000
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="px-3 py-1 bg-[#72bbef] text-slate-950 font-black text-xs rounded shadow">
                    Back
                  </button>
                  <button className="px-3 py-1 bg-[#faa9ba] text-slate-950 font-black text-xs rounded shadow">
                    Lay
                  </button>
                </div>
              </div>

              {/* Roulette Layout & Chips palette */}
              <div className="flex flex-col lg:flex-row gap-3">
                {/* Roulette Felt Mat */}
                <div className="flex-1 overflow-x-auto bg-[#475569] p-2 rounded-xl shadow-2xl border border-slate-600 relative">
                  {/* Suspended Lock Overlay */}
                  {isSuspended && (
                    <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center text-red-400 font-black text-sm tracking-wider gap-1 border border-red-500/50">
                      <Lock size={24} className="text-red-500 animate-pulse" />
                      <span>LOCKED / SUSPENDED</span>
                    </div>
                  )}

                  <div className="min-w-[420px]">
                    {/* Top Zero Row */}
                    <div className="w-full bg-[#15803d] text-white font-mono font-black text-center py-1.5 rounded-t border border-emerald-500 cursor-pointer hover:bg-emerald-600 transition shadow">
                      0
                    </div>

                    {/* Main Numbers & Outer Bets Grid */}
                    <div className="grid grid-cols-12 gap-1 my-1">
                      {/* Left: 1-18, Even, Red, Black, Odd, 19-36 */}
                      <div className="col-span-2 grid grid-rows-6 gap-1 font-bold text-[10px] text-slate-900 text-center">
                        <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer p-1">
                          1 - 18
                        </div>
                        <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer p-1">
                          Even
                        </div>
                        <div className="bg-red-600 text-white hover:bg-red-500 flex items-center justify-center rounded cursor-pointer p-1">
                          Red
                        </div>
                        <div className="bg-slate-950 text-white hover:bg-slate-800 flex items-center justify-center rounded cursor-pointer p-1">
                          Black
                        </div>
                        <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer p-1">
                          Odd
                        </div>
                        <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer p-1">
                          19 - 36
                        </div>
                      </div>

                      {/* Middle-Left: 1st12, 2nd12, 3rd12 */}
                      <div className="col-span-2 grid grid-rows-3 gap-1 font-bold text-[11px] text-slate-900 text-center">
                        <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer">
                          1st 12
                        </div>
                        <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer">
                          2nd 12
                        </div>
                        <div className="bg-[#fef3c7] hover:bg-[#fde68a] flex items-center justify-center rounded cursor-pointer">
                          3rd 12
                        </div>
                      </div>

                      {/* Middle: 3 columns x 12 rows matrix */}
                      <div className="col-span-8 grid grid-cols-3 gap-1">
                        {[
                          [1, 2, 3],
                          [4, 5, 6],
                          [7, 8, 9],
                          [10, 11, 12],
                          [13, 14, 15],
                          [16, 17, 18],
                          [19, 20, 21],
                          [22, 23, 24],
                          [25, 26, 27],
                          [28, 29, 30],
                          [31, 32, 33],
                          [34, 35, 36],
                        ].flatMap((row, rIdx) =>
                          row.map((num) => {
                            const RED_NUMS = [
                              1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27,
                              30, 32, 34, 36,
                            ];
                            const isRed = RED_NUMS.includes(num);
                            return (
                              <div
                                key={num}
                                className={`py-1 text-center font-mono font-black text-xs rounded text-white cursor-pointer transition shadow-sm hover:scale-105 ${
                                  isRed
                                    ? "bg-red-600 hover:bg-red-500"
                                    : "bg-slate-950 hover:bg-slate-800"
                                }`}
                              >
                                {num}
                              </div>
                            );
                          }),
                        )}
                      </div>
                    </div>

                    {/* Bottom 2to1 Row */}
                    <div className="grid grid-cols-12 gap-1">
                      <div className="col-span-4"></div>
                      <div className="col-span-8 grid grid-cols-3 gap-1">
                        <div className="bg-[#fef3c7] hover:bg-[#fde68a] text-slate-900 font-bold text-center text-xs py-1 rounded cursor-pointer">
                          2to1
                        </div>
                        <div className="bg-[#fef3c7] hover:bg-[#fde68a] text-slate-900 font-bold text-center text-xs py-1 rounded cursor-pointer">
                          2to1
                        </div>
                        <div className="bg-[#fef3c7] hover:bg-[#fde68a] text-slate-900 font-bold text-center text-xs py-1 rounded cursor-pointer">
                          2to1
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chips Palette on Right (Image 2 right side) */}
                <div className="flex lg:flex-col items-center justify-center gap-2 shrink-0">
                  {[25, 50, 100, 200, 500, "1K"].map((chip, cIdx) => {
                    const colors = [
                      "bg-sky-500 border-sky-300",
                      "bg-blue-600 border-blue-400",
                      "bg-teal-500 border-teal-300",
                      "bg-emerald-600 border-emerald-400",
                      "bg-amber-600 border-amber-300",
                      "bg-purple-600 border-purple-300",
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
                  <button className="px-2 py-1 text-[10px] font-bold bg-red-600 text-white rounded hover:bg-red-500 shadow">
                    Undo
                  </button>
                  <button className="px-2 py-1 text-[10px] font-bold bg-sky-600 text-white rounded hover:bg-sky-500 shadow">
                    Repeat
                  </button>
                  <button className="px-2 py-1 text-[10px] font-bold bg-amber-500 text-slate-950 rounded hover:bg-amber-400 shadow">
                    Clear
                  </button>
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
                      const isSuspended =
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
                                  {r.back > 0 ? r.back : "-"}
                                </div>
                                <div className="text-[9px] font-bold text-slate-800 leading-none">
                                  {r.backSize > 0
                                    ? Number(r.backSize).toLocaleString()
                                    : "100,000"}
                                </div>
                              </div>

                              {/* Lay Box */}
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
