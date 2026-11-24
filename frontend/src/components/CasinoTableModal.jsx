import React, { useEffect, useState, useMemo, useRef } from "react";
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
import WorliMatkaBoard from "./casino/WorliMatkaBoard";
import PoisonTeenPattiBoard from "./casino/PoisonTeenPattiBoard";
import TeenPattiJoker20Board from "./casino/TeenPattiJoker20Board";
import UnlimitedJokerBoard from "./casino/UnlimitedJokerBoard";
import BollywoodCasinoBoard from "./casino/BollywoodCasinoBoard";
import MiniSuperOverBoard from "./casino/MiniSuperOverBoard";
import SuperOverBoard from "./casino/SuperOverBoard";
import UniqueTeenPattiBoard from "./casino/UniqueTeenPattiBoard";
import UniqueRouletteBoard from "./casino/UniqueRouletteBoard";
import RouletteBoard from "./casino/RouletteBoard";
import Lucky6Board from "./casino/Lucky6Board";
import GoalBoard from "./casino/GoalBoard";
import AndarBaharBoard from "./casino/AndarBaharBoard";
import QueenJackTopBoard from "./casino/QueenJackTopBoard";
import SicBoBoard from "./casino/SicBoBoard";
import BallByBallBoard from "./casino/BallByBallBoard";
import TeenPatti1DayBoard from "./casino/TeenPatti1DayBoard";
import TeenPatti20Board from "./casino/TeenPatti20Board";
import TeenPattiTestBoard from "./casino/TeenPattiTestBoard";
import TeenPattiOpenBoard from "./casino/TeenPattiOpenBoard";
import Poker1DayBoard from "./casino/Poker1DayBoard";
import Poker20Board from "./casino/Poker20Board";
import Poker6Board from "./casino/Poker6Board";
import BaccaratBoard from "./casino/BaccaratBoard";
import Lucky15Board from "./casino/Lucky15Board";
import DragonTigerBoard from "./casino/DragonTigerBoard";
import Lucky7Board from "./casino/Lucky7Board";
import CricketMatch20Board from "./casino/CricketMatch20Board";
import AmarAkbarAnthonyBoard from "./casino/AmarAkbarAnthonyBoard";
import Race20Board from "./casino/Race20Board";
import Race2Board from "./casino/Race2Board";
import DusKaDumBoard from "./casino/DusKaDumBoard";
import OneCard20Board from "./casino/OneCard20Board";
import Race20ResultModal from "./casino/Race20ResultModal";
import ResultDetailModal from "./casino/ResultDetailModal";
import LotteryBoard from "./casino/LotteryBoard";
import QueenBoard from "./casino/QueenBoard";
import { getCardImgSrc } from "../utils/cardUtils";

// Authentic Lucky 15 Runner Index to Outcome Mapper
function mapLucky15Outcome(val) {
  const str = String(val || "")
    .trim()
    .toLowerCase();
  if (str === "w" || str.includes("wicket")) {
    return { badge: "W", popup: "WICKET", title: "Wicket" };
  }
  if (str === "6" || str.includes("6 run")) {
    return { badge: "6", popup: "6 RUNS", title: "6 Runs" };
  }
  if (str === "4" || str.includes("4 run")) {
    return { badge: "4", popup: "4 RUNS", title: "4 Runs" };
  }
  if (str === "2" || str.includes("2 run")) {
    return { badge: "2", popup: "2 RUNS", title: "2 Runs" };
  }
  if (str === "1" || str.includes("1 run")) {
    return { badge: "1", popup: "1 RUN", title: "1 Run" };
  }
  if (str === "0" || str.includes("0 run")) {
    return { badge: "0", popup: "0 RUN", title: "0 Runs" };
  }
  return { badge: "0", popup: "0 RUN", title: "0 Runs" };
}

export default function CasinoTableModal({ table, onClose }) {
  const [roundData, setRoundData] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState("");
  const [streamKey, setStreamKey] = useState(0);
  const [lucky15Popup, setLucky15Popup] = useState(null);
  const [ballByBallPopup, setBallByBallPopup] = useState(null);
  const [cmatch20Popup, setCmatch20Popup] = useState(null);
  const [selectedResultModal, setSelectedResultModal] = useState(null);
  const [selectedRace20Result, setSelectedRace20Result] = useState(null);
  const [dumCardIndex, setDumCardIndex] = useState(0);

  const slug = (table?.slug || table?.id || "").toLowerCase();
  const nameLow = (table?.name || "").toLowerCase();

  const isCMatch20 =
    slug === "cmatch20" ||
    nameLow.includes("cricket match 20") ||
    nameLow.includes("cmatch");
  const isAAA =
    slug === "aaa" ||
    slug === "aaa2" ||
    slug === "vaaa" ||
    nameLow.includes("amar akbar anthony") ||
    nameLow.includes("amar");
  const isWorli =
    slug === "worli" ||
    slug === "worli2" ||
    slug === "worli3" ||
    nameLow.includes("worli") ||
    nameLow.includes("matka");
  const isPoison = slug.includes("poison") || nameLow.includes("poison");
  const isUniqueTeen =
    slug.includes("unique") &&
    (slug.includes("teen") ||
      slug.includes("patti") ||
      nameLow.includes("unique teen"));
  const isTeenPattiJoker =
    slug === "joker20" ||
    slug === "teen20b" ||
    slug.includes("joker") ||
    nameLow.includes("teenpatti joker") ||
    nameLow.includes("joker 20");
  const isOneCard20 =
    slug === "kbc" ||
    slug === "1card20" ||
    slug === "card20" ||
    slug === "teen120" ||
    nameLow.includes("1 card 20") ||
    nameLow.includes("1 card 20-20");
  const isOneCard1Day =
    slug === "card1oneday" ||
    slug === "teen1" ||
    slug === "1card1" ||
    nameLow.includes("one card one day") ||
    nameLow.includes("1 card master");
  const isOneCardMeter =
    slug === "cmeter" || slug === "cmeter1" || nameLow.includes("1 card meter");
  const isUnlimitedJoker =
    (slug === "joker120" ||
      slug === "joker1" ||
      nameLow.includes("unlimited joker")) &&
    !isOneCard20 &&
    !isOneCard1Day;
  const isBollywood =
    slug.includes("btable") ||
    slug.includes("bollywood") ||
    nameLow.includes("bollywood");
  const isMiniSuperOver =
    slug === "superover3" ||
    slug === "minisuperover" ||
    nameLow.includes("mini super");
  const isBallByBall =
    slug === "ballbyball" || nameLow.includes("ball by ball");
  const isSuperOver =
    (slug.includes("superover") || nameLow.includes("super over")) &&
    !isBallByBall &&
    !isMiniSuperOver;
  const isUniqueRoulette =
    slug === "ourroullete" ||
    slug === "uroulette" ||
    nameLow.includes("unique roulette");
  const isLucky6 =
    slug === "lucky6" || slug === "lucky5" || nameLow.includes("lucky 6");
  const isRoulette = slug.includes("roulette") || nameLow.includes("roulette");
  const isGoal =
    slug === "goal" || slug === "goal2" || nameLow.includes("goal");
  const isAndarBahar =
    slug.includes("ab") ||
    nameLow.includes("andar bahar") ||
    slug.includes("andar");
  const isQueen =
    slug === "queen" || nameLow === "queen" || nameLow === "live queen";
  const isQueenTop =
    (slug === "queentop" ||
      slug === "teen41" ||
      nameLow.includes("queen top")) &&
    !isQueen;
  const isJackTop =
    slug === "jacktop" || slug === "teen42" || nameLow.includes("jack");
  const isLottery =
    slug === "lottcard" || slug.includes("lott") || nameLow.includes("lottery");
  const isSicBo = slug.includes("sicbo") || nameLow.includes("sic bo");
  const isLucky15 = slug === "lucky15" || nameLow.includes("lucky 15");
  const isTeen1Day =
    slug === "teen" ||
    slug === "teen1day" ||
    nameLow.includes("teenpatti 1day") ||
    nameLow.includes("teenpatti 1-day");
  const isTeen20 =
    (slug === "teen20" ||
      nameLow.includes("20-20 teen") ||
      nameLow.includes("teenpatti 20-20") ||
      nameLow.includes("teen 20")) &&
    !slug.includes("joker") &&
    !slug.includes("poison") &&
    slug !== "teen20b";
  const isTeenTest =
    slug === "teentest" ||
    slug === "teen9" ||
    nameLow.includes("teenpatti test") ||
    nameLow.includes("teen test");
  const isTeenOpen =
    slug === "teensin" ||
    slug === "teen8" ||
    nameLow.includes("open teen") ||
    nameLow.includes("teenpatti open");
  const isPoker1Day =
    slug === "poker" ||
    slug === "poker1day" ||
    nameLow.includes("poker 1 day") ||
    nameLow.includes("poker 1day");
  const isPoker20 =
    slug === "poker20" ||
    nameLow.includes("20-20 poker") ||
    nameLow.includes("poker 20");
  const isPoker6 = slug === "poker6" || nameLow.includes("poker 6");
  const isBaccarat = slug.includes("baccarat") || nameLow.includes("baccarat");
  const isDragonTiger =
    slug.includes("dt") ||
    slug.includes("dragon") ||
    nameLow.includes("dragon tiger");
  const isLucky7 =
    slug.includes("lucky7") ||
    nameLow.includes("lucky 7") ||
    nameLow.includes("lucky-7");
  const isRace20 =
    slug === "race20" ||
    nameLow.includes("race 20") ||
    nameLow.includes("race-20");
  const isRace2 =
    slug === "race2" ||
    nameLow.includes("race to 2nd") ||
    nameLow.includes("race 2");
  const isDusKaDum =
    slug === "dum10" ||
    nameLow.includes("dus ka dum") ||
    nameLow.includes("duskadum") ||
    slug.includes("dum");
  const isSuspended = timer <= 0 || roundData?.status === "SUSPENDED";

  // Fetch live stream URL directly for this table
  useEffect(() => {
    if (!slug) return;
    const directUrl = `/api/casino/player/${slug}?gameType=${slug}&id=${slug}`;
    setStreamUrl(directUrl);
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

  const lastHandledResultMidRef = useRef(null);
  const isFirstFetchRef = useRef(true);

  // 2. Fetch real recent results for this table
  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    isFirstFetchRef.current = true;
    lastHandledResultMidRef.current = null;
    setRecentResults([]);

    const fetchResults = () => {
      fetch(`/api/casino/results/${slug}`)
        .then((r) => r.json())
        .then((res) => {
          if (isMounted && res.success && Array.isArray(res.data)) {
            setRecentResults(res.data.slice(0, 16));
            if (res.data.length > 0) {
              const latestItem = res.data[0];
              const latestMid = latestItem?.mid;
              const outcome = latestItem?.nat || latestItem?.win;

              // Only trigger animated result zoom popup ONCE when an authentic new round result arrives!
              if (latestMid && outcome) {
                if (isFirstFetchRef.current) {
                  lastHandledResultMidRef.current = latestMid;
                  isFirstFetchRef.current = false;
                } else if (lastHandledResultMidRef.current !== latestMid) {
                  lastHandledResultMidRef.current = latestMid;

                  if (isLucky15) {
                    const lk = mapLucky15Outcome(outcome);
                    setLucky15Popup(lk.popup);
                    setTimeout(() => setLucky15Popup(null), 2000);
                  }
                  if (isBallByBall) {
                    const txt = outcome.toUpperCase().includes("W")
                      ? "WICKET"
                      : `${outcome} RUN`;
                    setBallByBallPopup(txt);
                    setTimeout(() => setBallByBallPopup(null), 2000);
                  }
                  if (isCMatch20) {
                    const txt = outcome.toUpperCase().includes("W")
                      ? "WICKET"
                      : `${outcome} RUNS`;
                    setCmatch20Popup(txt);
                    setTimeout(() => setCmatch20Popup(null), 2000);
                  }
                }
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
  }, [slug, isLucky15, isBallByBall, isCMatch20]);

  // Calculate Total strictly for games like Mogambo, Sic Bo (Never for Teenpatti Joker)
  const calculatedTotal = useMemo(() => {
    if (!roundData) return null;

    if (
      isSicBo &&
      roundData.dealType === "dice" &&
      Array.isArray(roundData.cards)
    ) {
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

    if (slug === "mogambo") {
      return 13;
    }

    return null;
  }, [roundData, slug, isSicBo]);

  if (!table) return null;

  // Helper to get styled badge for winner (100% matching Diamond Online)
  const getWinnerBadge = (winnerName) => {
    const w = (winnerName || "").trim();
    const lower = w.toLowerCase();

    // 1. Goal, Andar Bahar, Worli & Ball By Ball: Green badge with letter 'R' (Image 1, 2, 3 Exact Match)
    if (isGoal || isAndarBahar || isBallByBall || isWorli) {
      return {
        letter: "R",
        bg: "bg-emerald-600 text-white font-bold",
        title: w || "Result",
      };
    }

    // 1.001 Lottery 3-Digit Badge (Image 2 Exact Match)
    if (isLottery) {
      const numStr = String(w || "").replace(/\s+/g, "");
      return {
        letter: numStr || "000",
        bg: "bg-[#253241] text-white font-mono font-black px-1.5 py-0.5 rounded text-[10px] w-auto min-w-[28px]",
        title: `Result: ${numStr}`,
      };
    }

    // 1.002 Queen Total 0..3 Badge (Image 3 Exact Match)
    if (isQueen) {
      return {
        letter: String(w || "0"),
        bg: "bg-emerald-600 text-white font-black",
        title: `Total ${w}`,
      };
    }

    // 1.01 Race 20: Suit Badges (Spade ♠ Black, Heart ♥ Red, Club ♣ Black, Diamond ♦ Red) (Image 9 & 10 Exact Match)
    if (isRace20) {
      if (w === "1" || w === "♠" || lower.includes("spade")) {
        return {
          letter: "♠",
          bg: "bg-slate-950 text-white font-black text-sm",
          title: "Spade",
        };
      }
      if (w === "2" || w === "♥" || lower.includes("heart")) {
        return {
          letter: "♥",
          bg: "bg-red-600 text-white font-black text-sm",
          title: "Heart",
        };
      }
      if (w === "3" || w === "♣" || lower.includes("club")) {
        return {
          letter: "♣",
          bg: "bg-slate-950 text-white font-black text-sm",
          title: "Club",
        };
      }
      if (w === "4" || w === "♦" || lower.includes("diamond")) {
        return {
          letter: "♦",
          bg: "bg-red-600 text-white font-black text-sm",
          title: "Diamond",
        };
      }
      return {
        letter: w || "♥",
        bg: "bg-red-600 text-white font-black",
        title: w,
      };
    }

    // 1.02 Race to 2nd: Green circular badges A, B, C, D (Image 3 Exact Match)
    if (isRace2) {
      let char = "A";
      if (w === "1" || lower === "a") char = "A";
      else if (w === "2" || lower === "b") char = "B";
      else if (w === "3" || lower === "c") char = "C";
      else if (w === "4" || lower === "d") char = "D";
      else char = (w.slice(0, 1) || "A").toUpperCase();
      return {
        letter: char,
        bg: "bg-emerald-700 text-white font-black",
        title: `Player ${char}`,
      };
    }

    // 1.03 Dus Ka Dum: Green circular badges Y (Yes) and N (No) (Image 4 & 5 Exact Match)
    if (isDusKaDum) {
      const isY = w === "1" || lower === "y" || lower === "yes";
      return {
        letter: isY ? "Y" : "N",
        bg: "bg-emerald-700 text-white font-black",
        title: isY ? "Yes" : "No",
      };
    }

    // 1.04 1 Card 20-20 & One Card One Day: P (Player), D (Dealer), T (Tie) (Image 5 Exact Match)
    if (isOneCard20 || isOneCard1Day) {
      let char = "P";
      if (w === "1" || lower.startsWith("p")) char = "P";
      else if (w === "2" || lower.startsWith("d")) char = "D";
      else if (w === "3" || lower.startsWith("t")) char = "T";
      else char = (w.slice(0, 1) || "P").toUpperCase();
      return {
        letter: char,
        bg: "bg-emerald-700 text-white font-black",
        title: char === "P" ? "Player" : char === "D" ? "Dealer" : "Tie",
      };
    }

    // 1.05 1 Card Meter: L (Low), H (High)
    if (isOneCardMeter) {
      const isL = w === "1" || lower.startsWith("l");
      return {
        letter: isL ? "L" : "H",
        bg: isL
          ? "bg-blue-600 text-white font-black"
          : "bg-amber-600 text-white font-black",
        title: isL ? "Low" : "High",
      };
    }

    // 1.1 Baccarat: P (Blue), B (Red), T (Green) (Image 1 Exact Match)
    if (isBaccarat) {
      if (lower.startsWith("p") || w === "1") {
        return {
          letter: "P",
          bg: "bg-blue-600 text-white font-black",
          title: "Player",
        };
      }
      if (lower.startsWith("b") || w === "2") {
        return {
          letter: "B",
          bg: "bg-red-600 text-white font-black",
          title: "Banker",
        };
      }
      return {
        letter: "T",
        bg: "bg-emerald-600 text-white font-black",
        title: "Tie",
      };
    }

    // 1.2 Dragon Tiger: D (Red), T (Yellow), Tie (Green)
    if (isDragonTiger) {
      if (lower.startsWith("d") || w === "1") {
        return {
          letter: "D",
          bg: "bg-red-600 text-white font-black",
          title: "Dragon",
        };
      }
      if (lower.startsWith("t") || w === "2") {
        return {
          letter: "T",
          bg: "bg-amber-600 text-white font-black",
          title: "Tiger",
        };
      }
      return {
        letter: "Tie",
        bg: "bg-emerald-600 text-white font-black",
        title: "Tie",
      };
    }

    // 1.3 Lucky 7: L (Green), H (Amber), 7 (Red)
    if (isLucky7) {
      if (lower.includes("low") || lower.startsWith("l") || w === "1") {
        return {
          letter: "L",
          bg: "bg-emerald-600 text-white font-black",
          title: "Low",
        };
      }
      if (lower.includes("high") || lower.startsWith("h") || w === "2") {
        return {
          letter: "H",
          bg: "bg-amber-600 text-white font-black",
          title: "High",
        };
      }
      return {
        letter: "7",
        bg: "bg-red-600 text-white font-black",
        title: "7",
      };
    }

    // 2. Lucky 6: L, O, H, E, B, R badges (Image 2 Exact Match)
    if (isLucky6) {
      const char = (w.slice(0, 1) || "L").toUpperCase();
      let bg = "bg-emerald-600 text-white font-black";
      if (["R", "H"].includes(char)) bg = "bg-amber-600 text-white font-black";
      if (char === "B")
        bg = "bg-slate-900 text-white font-black border border-slate-700";
      return { letter: char, bg, title: w || "Result" };
    }

    // 3. Super Over & Mini Super Over: Team letters in Green Badges (Exact Diamond Match)
    if (isSuperOver || isMiniSuperOver) {
      if (slug === "superover") {
        if (w === "1" || lower.includes("eng")) {
          return {
            letter: "E",
            bg: "bg-emerald-700 text-white font-black",
            title: "ENG",
          };
        }
        if (w === "2" || lower.includes("rsa")) {
          return {
            letter: "R",
            bg: "bg-emerald-700 text-white font-black",
            title: "RSA",
          };
        }
        return {
          letter: "T",
          bg: "bg-emerald-700 text-white font-black",
          title: "Tie",
        };
      }
      if (slug === "superover2") {
        if (w === "1" || lower.includes("ind")) {
          return {
            letter: "I",
            bg: "bg-emerald-700 text-white font-black",
            title: "IND",
          };
        }
        if (w === "2" || lower.includes("eng")) {
          return {
            letter: "E",
            bg: "bg-emerald-700 text-white font-black",
            title: "ENG",
          };
        }
        return {
          letter: "T",
          bg: "bg-emerald-700 text-white font-black",
          title: "Tie",
        };
      }
      // Mini Super Over (IND vs AUS)
      if (w === "1" || lower.includes("ind")) {
        return {
          letter: "I",
          bg: "bg-emerald-700 text-white font-black",
          title: "IND",
        };
      }
      if (w === "2" || lower.includes("aus")) {
        return {
          letter: "A",
          bg: "bg-emerald-700 text-white font-black",
          title: "AUS",
        };
      }
      return {
        letter: "T",
        bg: "bg-emerald-700 text-white font-black",
        title: "Tie",
      };
    }

    // 4. Teen Patti Test: T (Tiger), L (Lion), D (Dragon) in Dark Green Badges (Image 1 Exact Match)
    if (isTeenTest) {
      if (
        lower.includes("tiger") ||
        w === "1" ||
        w === "01" ||
        lower === "t"
      ) {
        return {
          letter: "T",
          bg: "bg-emerald-700 text-white font-black",
          title: "Tiger",
        };
      }
      if (
        lower.includes("lion") ||
        w === "2" ||
        w === "02" ||
        lower === "l"
      ) {
        return {
          letter: "L",
          bg: "bg-emerald-700 text-white font-black",
          title: "Lion",
        };
      }
      return {
        letter: "D",
        bg: "bg-emerald-700 text-white font-black",
        title: "Dragon",
      };
    }

    // 4.1 Cricket Match 20-20: Runs 2..10 in Green Badges (Image 3 Exact Match)
    if (isCMatch20) {
      const d = w.match(/\d+/);
      const rNum = d ? d[0] : w || "0";
      return {
        letter: rNum,
        bg: "bg-emerald-700 text-white font-black font-mono",
        title: `${rNum} Runs`,
      };
    }

    // 4.2 Amar Akbar Anthony: A, B, C in Dark Green Circular Badges (Image 4 Exact Match)
    if (isAAA) {
      let char = "A";
      if (w === "1" || lower === "a" || lower.includes("amar")) char = "A";
      else if (w === "2" || lower === "b" || lower.includes("akbar"))
        char = "B";
      else if (w === "3" || lower === "c" || lower.includes("anthony"))
        char = "C";
      return {
        letter: char,
        bg: "bg-emerald-700 text-white font-black",
        title: char === "A" ? "Amar" : char === "B" ? "Akbar" : "Anthony",
      };
    }

    // 5. Open Teenpatti & Poker 6: Winning Player Number Badges (Image 2 & 5 Exact Match)
    if (isTeenOpen || isPoker6) {
      let num = "1";
      const p = parseInt(w);
      if (p >= 11 && p <= 16) {
        num = String(p - 10);
      } else if (p >= 1 && p <= 6) {
        num = String(p);
      } else {
        const m = (w || "").match(/[1-6]/);
        if (m) num = m[0];
      }
      return {
        letter: num,
        bg: "bg-emerald-700 text-white font-black",
        title: `Player ${num}`,
      };
    }

    // 6. Poker 1-Day & 20-20 Poker: A & B in Dark Green Badges (Image 1 Exact Match)
    if (isPoker1Day || isPoker20) {
      const isA = w === "1" || lower === "a" || lower.includes("player a");
      return {
        letter: isA ? "A" : "B",
        bg: "bg-emerald-700 text-white font-black",
        title: isA ? "Player A" : "Player B",
      };
    }

    // 7. Teen Patti 1-Day, 20-20, Queen Top, Jack Top, Poison, Joker in Dark Green Badges (Image 3 & 4 Exact Match)
    if (
      isTeen1Day ||
      isTeen20 ||
      isQueenTop ||
      isJackTop ||
      isTeenPattiJoker ||
      isUnlimitedJoker ||
      isPoison ||
      slug.includes("teen") ||
      slug.includes("patti")
    ) {
      let char = "A";
      if (w === "1" || lower === "a" || lower.includes("player a")) {
        char = "A";
      } else if (w === "2" || lower === "b" || lower.includes("player b")) {
        char = "B";
      } else if (
        lower.includes("tie") ||
        lower === "t" ||
        w === "0" ||
        w === "3"
      ) {
        char = "T";
      } else {
        char = w.slice(0, 1).toUpperCase() || "A";
      }
      return {
        letter: char,
        bg: "bg-emerald-700 text-white font-black",
        title: char === "A" ? "Player A" : char === "B" ? "Player B" : "Tie",
      };
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

    // 5. Lucky 15: Cricket outcomes 0, 1, 2, 4, 6, W (All in Green Badges matching Image 2)
    if (isLucky15 || lower.includes("run") || lower.includes("wicket")) {
      const res = mapLucky15Outcome(w);
      return {
        letter: res.badge,
        bg: "bg-emerald-700 text-white font-black font-mono",
        title: res.title,
      };
    }

    // 6. Roulette: Numbers 0..36 with Green, Red, Black
    if (isRoulette || isUniqueRoulette) {
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

    return {
      letter: w.slice(0, 1).toUpperCase() || "R",
      bg: "bg-emerald-700 text-white font-bold",
      title: w,
    };
  };

  // Dual digit formatting: Timer for standard games; Scores for Baccarat (Player/Banker); Dealt card count for Andar/Bahar
  let d1 = "0";
  let d2 = "0";

  if (isBaccarat) {
    const rawCards = roundData?.card ? roundData.card.split(',').map(s => s.trim()) : (roundData?.cards || []);
    const getBaccVal = (c) => {
      if (!c) return 0;
      const str = typeof c === 'string' ? c : (c.rank || c.val || '');
      const r = str.replace(/(HH|DD|CC|SS|[HDCS])$/i, '').toUpperCase();
      if (r === 'A' || r === '1') return 1;
      if (['10', 'J', 'Q', 'K', '0'].includes(r)) return 0;
      const n = parseInt(r, 10);
      return isNaN(n) ? 0 : n;
    };
    const pScore = ((getBaccVal(rawCards[0]) + getBaccVal(rawCards[2]) + getBaccVal(rawCards[4])) % 10);
    const bScore = ((getBaccVal(rawCards[1]) + getBaccVal(rawCards[3]) + getBaccVal(rawCards[5])) % 10);
    d1 = String(pScore);
    d2 = String(bScore);
  } else if (isAndarBahar) {
    const rawCards = roundData?.card ? roundData.card.split(',').map(s => s.trim()).filter(x => x && x !== '1' && x !== '0') : (roundData?.cards || []);
    const jokerCard = rawCards[0];
    const jSuit = String(typeof jokerCard === 'string' ? jokerCard : (jokerCard?.suit || '')).toUpperCase();
    const isJokerBlack = jSuit.includes('S') || jSuit.includes('C') || jSuit.includes('♠') || jSuit.includes('♣');
    const dealt = rawCards.slice(1);
    let aCount = 0;
    let bCount = 0;
    dealt.forEach((_, i) => {
      if (isJokerBlack ? (i % 2 === 0) : (i % 2 === 1)) aCount++;
      else bCount++;
    });
    d1 = String(aCount % 10);
    d2 = String(bCount % 10);
  } else {
    const timerStr = String(Math.max(0, timer)).padStart(2, "0");
    d1 = timerStr.charAt(0);
    d2 = timerStr.charAt(1);
  }

  // Authentic Playing Card Component using authentic Diamond Online format (/cards/${rank}${suit}.jpg)
  const renderCard = (c, key, isFaceDown = false) => {
    const imgSrc = getCardImgSrc(c, isFaceDown);
    return (
      <div
        key={key}
        className="w-8 h-12 sm:w-10 sm:h-14 rounded overflow-hidden shadow-md shrink-0 border border-slate-900 bg-white flex items-center justify-center select-none"
      >
        <img
          src={imgSrc}
          alt="Card"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/cards/1.jpg";
          }}
        />
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

          {/* Lucky 15 Animated 3D Cricket Ball Result Zoom Popup (Image 2 Exact Match) */}
          {lucky15Popup && (
            <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none animate-in zoom-in-75 fade-in duration-300">
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-red-600 via-rose-700 to-red-950 border-4 border-white/60 flex items-center justify-center text-white text-xl font-black font-mono shadow-2xl drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)] tracking-wider">
                <div className="absolute inset-y-0 w-1 border-r border-dashed border-white/40 left-1/2 -translate-x-1/2 pointer-events-none"></div>
                <span className="relative z-10 text-center uppercase drop-shadow">
                  {lucky15Popup}
                </span>
              </div>
            </div>
          )}

          {/* Ball By Ball 3D Cricket Ball Zoom Popup (Image 2 Exact Match) */}
          {ballByBallPopup && (
            <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none animate-in zoom-in-50 fade-in duration-300">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-600 via-rose-700 to-red-950 border-4 border-white/60 flex items-center justify-center text-white text-xl font-black font-mono shadow-2xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] tracking-wider">
                {ballByBallPopup}
              </div>
            </div>
          )}

          {/* Cricket Match 20-20 3D Cricket Ball Zoom Popup (Image 3 Center Screen Exact Match) */}
          {cmatch20Popup && (
            <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none animate-in zoom-in-50 fade-in duration-300">
              <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-red-600 via-rose-700 to-red-950 border-4 border-white/60 flex flex-col items-center justify-center text-white font-mono shadow-2xl drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)] tracking-wider ring-2 ring-red-900">
                <div className="absolute inset-y-0 w-1 border-r border-dashed border-white/40 left-1/2 -translate-x-1/2 pointer-events-none"></div>
                <span className="relative z-10 text-2xl font-black drop-shadow text-center uppercase">
                  {cmatch20Popup}
                </span>
              </div>
            </div>
          )}

          {/* Top-Left Floating HUD: Cards, Balls, Daga/Teja, Mogambo, Total */}
          <div className="absolute top-2 left-2 z-20 flex flex-col items-start gap-1 pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            {/* Yellow TOTAL Badge */}
            {calculatedTotal !== null && (
              <div className="bg-yellow-400 text-black font-black text-xs sm:text-sm px-2 py-0.5 rounded shadow-lg uppercase tracking-wider mb-0.5">
                TOTAL: {calculatedTotal}
              </div>
            )}

            {/* Game Specific Overlay Components */}
            {(() => {
              // Mini Super Over: Cricket Pitch Header Banner + Red Ball Badges on Left (Image 1 Exact Match)
              if (isMiniSuperOver) {
                const rawBalls = (roundData?.card || "")
                  .split(/[|,]/)
                  .filter(Boolean);
                const parsedBalls = rawBalls
                  .map((code) => {
                    if (code === "1" || code === "?") return null;
                    const rank = code.slice(0, -2) || code;
                    if (rank === "10") return "0";
                    if (["J", "Q", "K"].includes(rank)) return "W";
                    if (rank === "A") return "1";
                    return rank;
                  })
                  .filter(Boolean);

                let runs = 0;
                for (const b of parsedBalls) {
                  const n = parseInt(b);
                  if (!isNaN(n)) runs += n;
                }
                const overs = `0.${parsedBalls.length}`;

                return (
                  <div className="flex flex-col items-start gap-1 w-full max-w-sm pointer-events-none">
                    {/* Pitch Scoreboard Banner */}
                    <div className="bg-[#1e3a1f]/95 border border-emerald-500/60 rounded px-3 py-1.5 text-white shadow-xl w-full select-none">
                      <div className="flex justify-between items-center text-[11px] font-mono">
                        <span className="font-bold text-slate-100">
                          IND 8-0 (1.0)
                        </span>
                        <span className="text-yellow-300 font-bold">
                          AUS Needed 6 runs from 2 balls
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-mono mt-0.5">
                        <span className="font-black text-white">
                          AUS {runs}-0 ({overs}) CRR 6.00 RR 12.00
                        </span>
                        <div className="flex gap-1">
                          {parsedBalls.map((b, i) => (
                            <span
                              key={i}
                              className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Left Dealt Balls (Red Circles matching Image 4 right) */}
                    <div className="flex flex-col gap-1.5 mt-2">
                      {parsedBalls.map((b, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-600 border-2 border-white text-white font-mono font-black text-xs sm:text-sm flex items-center justify-center shadow-lg"
                        >
                          {b}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              // Super Over 1 / 2: Pitch Scoreboard Banner (Image 1 & 3 Exact Match)
              if (isSuperOver && !isMiniSuperOver && !isBallByBall) {
                const isSuperOver1 = slug === "superover";
                let team1 = isSuperOver1 ? "ENG" : "IND";
                let team2 = isSuperOver1 ? "RSA" : "ENG";
                if (roundData?.cricketScore?.team1) {
                  team1 = roundData.cricketScore.team1;
                  team2 = roundData.cricketScore.team2;
                }
                return (
                  <div className="flex flex-col items-start gap-1 w-full max-w-sm pointer-events-none">
                    <div className="bg-[#1e3a1f]/95 border border-emerald-500/60 rounded px-3 py-1.5 text-white shadow-xl w-full select-none">
                      <div className="flex justify-between items-center text-[11px] font-mono">
                        <span className="font-bold text-slate-100">
                          {team1}{" "}
                          {roundData?.cricketScore?.team1Score || "0-0 (0.0)"}{" "}
                          {roundData?.cricketScore?.team1CRR || "CRR 0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-mono mt-0.5">
                        <span className="font-black text-white">
                          {team2}{" "}
                          {roundData?.cricketScore?.team2Score || "0-0 (0.0)"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }

              // Ball By Ball: Clean video
              if (isBallByBall) {
                return null;
              }

              // Unique Teen Patti: Rendered below video
              if (isUniqueTeen) {
                return null;
              }

              // Andar Bahar Carousel HUD (Image 2 Exact Match)
              if (isAndarBahar) {
                const cards = roundData?.cards || [];
                const jokerCard = cards[0];
                const jSuit = String(jokerCard?.suit || jokerCard?.raw || '').toUpperCase();
                const isJokerBlack =
                  jSuit.includes('S') ||
                  jSuit.includes('C') ||
                  jSuit.includes('♠') ||
                  jSuit.includes('♣');
                const dealtCards = cards.slice(1);
                const andarCards = dealtCards.filter((_, i) => isJokerBlack ? (i % 2 === 0) : (i % 2 === 1));
                const baharCards = dealtCards.filter((_, i) => isJokerBlack ? (i % 2 === 1) : (i % 2 === 0));
                return (
                  <div className="flex flex-col items-start gap-1 bg-black/70 p-2 rounded-lg backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-yellow-300 uppercase">
                        JOKER
                      </span>
                      {renderCard(
                        jokerCard,
                        "ab-joker",
                        !jokerCard || jokerCard.isHidden,
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black text-amber-200 w-12 uppercase">
                          ANDAR
                        </span>
                        <ChevronLeft
                          size={14}
                          className="text-slate-400 shrink-0"
                        />
                        <div className="flex gap-1 overflow-x-auto max-w-[220px] scrollbar-none">
                          {andarCards.length > 0
                            ? andarCards.map((c, i) =>
                                renderCard(c, `ab-a-${i}`, !c || c.isHidden),
                              )
                            : [0, 1].map((i) =>
                                renderCard(null, `ab-a-d-${i}`, true),
                              )}
                        </div>
                        <ChevronRight
                          size={14}
                          className="text-slate-400 shrink-0"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black text-yellow-400 w-12 uppercase">
                          BAHAR
                        </span>
                        <ChevronLeft
                          size={14}
                          className="text-slate-400 shrink-0"
                        />
                        <div className="flex gap-1 overflow-x-auto max-w-[220px] scrollbar-none">
                          {baharCards.length > 0
                            ? baharCards.map((c, i) =>
                                renderCard(c, `ab-b-${i}`, !c || c.isHidden),
                              )
                            : [0, 1].map((i) =>
                                renderCard(null, `ab-b-d-${i}`, true),
                              )}
                        </div>
                        <ChevronRight
                          size={14}
                          className="text-slate-400 shrink-0"
                        />
                      </div>
                    </div>
                  </div>
                );
              }

              // 1 Card 20-20 & One Card One Day (Player 1 card, Dealer 1 card) (Image 5 Exact Match)
              if (isOneCard20 || isOneCard1Day) {
                const cards = roundData?.cards || [];
                const playerCard = cards[0];
                const dealerCard = cards[1];
                return (
                  <div className="flex flex-col items-start gap-1">
                    <div>
                      <div className="text-[10px] font-black text-amber-300 uppercase tracking-wider mb-0.5">
                        PLAYER
                      </div>
                      <div className="flex gap-1">
                        {renderCard(
                          playerCard,
                          "1c-p",
                          !playerCard || playerCard.isHidden,
                        )}
                      </div>
                    </div>
                    <div className="mt-0.5">
                      <div className="text-[10px] font-black text-sky-300 uppercase tracking-wider mb-0.5">
                        DEALER
                      </div>
                      <div className="flex gap-1">
                        {renderCard(
                          dealerCard,
                          "1c-d",
                          !dealerCard || dealerCard.isHidden,
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Teen Patti Test: TIGER (3 cards), LION (3 cards), DRAGON (3 cards) (Image 1 Exact Match)
              if (isTeenTest) {
                const cards = roundData?.cards || [];
                const tigerCards = cards.slice(0, 3);
                const lionCards = cards.slice(3, 6);
                const dragonCards = cards.slice(6, 9);
                return (
                  <div className="flex flex-col items-start gap-1">
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider drop-shadow-md mb-0.5">
                        TIGER
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((idx) =>
                          renderCard(
                            tigerCards[idx],
                            `tt-t-${idx}`,
                            !tigerCards[idx] || tigerCards[idx].isHidden,
                          ),
                        )}
                      </div>
                    </div>
                    <div className="mt-0.5">
                      <div className="text-[10px] sm:text-[11px] font-black text-sky-300 uppercase tracking-wider drop-shadow-md mb-0.5">
                        LION
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((idx) =>
                          renderCard(
                            lionCards[idx],
                            `tt-l-${idx}`,
                            !lionCards[idx] || lionCards[idx].isHidden,
                          ),
                        )}
                      </div>
                    </div>
                    <div className="mt-0.5">
                      <div className="text-[10px] sm:text-[11px] font-black text-rose-400 uppercase tracking-wider drop-shadow-md mb-0.5">
                        DRAGON
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2].map((idx) =>
                          renderCard(
                            dragonCards[idx],
                            `tt-d-${idx}`,
                            !dragonCards[idx] || dragonCards[idx].isHidden,
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Teen Patti Open: DEALER (3 cards) (Image 2 Exact Match)
              if (isTeenOpen) {
                const cards = roundData?.cards || [];
                return (
                  <div className="flex flex-col items-start gap-1">
                    <div className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider drop-shadow-md mb-0.5">
                      DEALER
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((idx) =>
                        renderCard(
                          cards[idx],
                          `to-d-${idx}`,
                          !cards[idx] || cards[idx].isHidden,
                        ),
                      )}
                    </div>
                  </div>
                );
              }

              // Poker 1-Day & 20-20 Poker: PLAYER A (2) + PLAYER B (2) + BOARD (5) (Image 3 & 4 Exact Match)
              if (isPoker1Day || isPoker20) {
                const cards = roundData?.cards || [];
                const pA = cards.slice(0, 2);
                const pB = cards.slice(2, 4);
                const board = cards.slice(4, 9);
                return (
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider drop-shadow-md mb-0.5">
                          PLAYER A
                        </div>
                        <div className="flex gap-1">
                          {[0, 1].map((idx) =>
                            renderCard(
                              pA[idx],
                              `pk-a-${idx}`,
                              !pA[idx] || pA[idx].isHidden,
                            ),
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] sm:text-[11px] font-black text-sky-300 uppercase tracking-wider drop-shadow-md mb-0.5">
                          PLAYER B
                        </div>
                        <div className="flex gap-1">
                          {[0, 1].map((idx) =>
                            renderCard(
                              pB[idx],
                              `pk-b-${idx}`,
                              !pB[idx] || pB[idx].isHidden,
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-1">
                      <div className="text-[10px] sm:text-[11px] font-black text-emerald-400 uppercase tracking-wider drop-shadow-md mb-0.5">
                        BOARD
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((idx) =>
                          renderCard(
                            board[idx],
                            `pk-bd-${idx}`,
                            !board[idx] || board[idx].isHidden,
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Poker 6 Players: 5 Community Cards (Image 5 Exact Match)
              if (isPoker6) {
                const cards = roundData?.cards || [];
                const community = cards.slice(12, 17);
                return (
                  <div className="flex flex-col items-start gap-1">
                    <div className="text-[10px] sm:text-[11px] font-black text-emerald-400 uppercase tracking-wider drop-shadow-md mb-0.5">
                      COMMUNITY
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((idx) =>
                        renderCard(
                          community[idx],
                          `p6-c-${idx}`,
                          !community[idx] || community[idx].isHidden,
                        ),
                      )}
                    </div>
                  </div>
                );
              }

              // Teen Patti 1-Day (Image 3: Player A 3 cards + Player B 3 cards)
              if (isTeen1Day) {
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
                        {[0, 1, 2].map((idx) =>
                          renderCard(
                            playerA[idx],
                            `t1-a-${idx}`,
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
                            `t1-b-${idx}`,
                            !playerB[idx] || playerB[idx].isHidden,
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // 20-20 Teen Patti (Image 5: Player A 3 cards + Player B 3 cards)
              if (isTeen20) {
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
                        {[0, 1, 2].map((idx) =>
                          renderCard(
                            playerA[idx],
                            `t20-a-${idx}`,
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
                            `t20-b-${idx}`,
                            !playerB[idx] || playerB[idx].isHidden,
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Queen Top Open Teenpatti (Image 3)
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
                        {[0, 1, 2].map((idx) =>
                          renderCard(
                            playerA[idx],
                            `qa-${idx}`,
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
                            `qb-${idx}`,
                            !playerB[idx] || playerB[idx].isHidden,
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Jack Top Open Teenpatti (Image 4)
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
                        {[0, 1, 2].map((idx) =>
                          renderCard(
                            playerA[idx],
                            `ja-${idx}`,
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
                            `jb-${idx}`,
                            !playerB[idx] || playerB[idx].isHidden,
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Bollywood Casino: ONLY 1 single card
              if (isBollywood) {
                const c = roundData?.cards?.[0];
                return (
                  <div className="flex flex-col items-start gap-1">
                    {renderCard(c, "bollywood-card", !c || c.isHidden)}
                  </div>
                );
              }

              // Poison Teenpatti (Image 4 Exact Match - Alternating cards)
              if (isPoison) {
                const cards = roundData?.cards || [];
                const poisonCard = cards[0];
                const playerA = [cards[1], cards[3], cards[5]];
                const playerB = [cards[2], cards[4], cards[6]];
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

              // Queen Table (Image 3 Exact Match - 4 Totals)
              if (isQueen) {
                const cards = roundData?.cards || [];
                const groups = [[], [], [], []];
                cards.forEach((c, idx) => {
                  if (c && !c.isHidden && idx < 20) {
                    groups[idx % 4].push(c);
                  }
                });
                return (
                  <div className="flex flex-col items-start gap-1">
                    {groups.map((grpCards, gIdx) => {
                      const totalPoints = grpCards.reduce((acc, c) => {
                        const r = (c.rank || "").toUpperCase();
                        if (r === "Q") return acc + 10;
                        const n = parseInt(r);
                        return acc + (isNaN(n) ? 0 : n);
                      }, 0);
                      return (
                        <div key={gIdx} className="flex flex-col items-start">
                          <span className="text-[10px] font-black text-amber-300 drop-shadow-md leading-none mb-0.5">
                            TOTAL {gIdx}:{" "}
                            <span className="text-white font-mono">
                              {totalPoints}
                            </span>
                          </span>
                          <div className="flex gap-1">
                            {grpCards.length > 0 ? (
                              grpCards.map((c, cIdx) =>
                                renderCard(c, `queen-${gIdx}-${cIdx}`, false),
                              )
                            ) : (
                              <div className="w-5 h-7 border border-dashed border-white/20 rounded-[2px]" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }

              // Lottery Table (Image 2 Exact Match - 3 Cards)
              if (isLottery) {
                const cards = roundData?.cards || [];
                return (
                  <div className="flex flex-col items-start gap-1">
                    {[0, 1, 2].map((cIdx) => {
                      const c = cards[cIdx];
                      return (
                        <div key={cIdx} className="flex flex-col items-start">
                          {renderCard(c, `lott-${cIdx}`, !c || c.isHidden)}
                        </div>
                      );
                    })}
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

              // Worli Matka: 3 cards dealt
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

              // Lucky 6 Table: 1 card
              if (isLucky6) {
                const c = roundData?.cards?.[0];
                return (
                  <div className="flex flex-col items-start gap-1">
                    {renderCard(c, "lucky6-card", !c || c.isHidden)}
                  </div>
                );
              }

              // Mogambo Table (Daga / Teja + Mogambo) (Image 1 Exact Match)
              if (slug === "mogambo") {
                const c1 = roundData?.cards?.[0] || {
                  rank: "5",
                  suit: "♠",
                  color: "black",
                  isHidden: false,
                };
                const c2 = roundData?.cards?.[1] || {
                  rank: "8",
                  suit: "♥",
                  color: "red",
                  isHidden: false,
                };
                const c3 = roundData?.cards?.[2] || { isHidden: true };
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

              // Dragon Tiger Table (Dragon 1 card + Tiger 1 card)
              if (isDragonTiger) {
                const cards = roundData?.cards || [];
                return (
                  <div className="flex flex-col items-start gap-1">
                    <div>
                      <div className="text-[10px] sm:text-[11px] font-black text-rose-400 uppercase tracking-wider drop-shadow-md mb-0.5">
                        DRAGON
                      </div>
                      <div className="flex gap-1">
                        {renderCard(
                          cards[0],
                          "dt-d-0",
                          !cards[0] || cards[0].isHidden,
                        )}
                      </div>
                    </div>
                    <div className="mt-0.5">
                      <div className="text-[10px] sm:text-[11px] font-black text-amber-300 uppercase tracking-wider drop-shadow-md mb-0.5">
                        TIGER
                      </div>
                      <div className="flex gap-1">
                        {renderCard(
                          cards[1],
                          "dt-t-1",
                          !cards[1] || cards[1].isHidden,
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Lucky 7 Table (1 card)
              if (isLucky7) {
                const c = roundData?.cards?.[0];
                return (
                  <div className="flex flex-col items-start gap-1">
                    {renderCard(c, "l7-card", !c || c.isHidden)}
                  </div>
                );
              }

              // Race 20 Table (Cards & Points Header + 4 Suit Rows) (Image 9 & 10 Exact Match)
              if (isRace20) {
                const cards = roundData?.cards || [];
                const totalCardsCount = cards.filter((c) => !c.isHidden).length;
                const totalPointsCount = cards.reduce((acc, c) => {
                  if (!c || c.isHidden) return acc;
                  const r = (c.rank || "").toUpperCase();
                  if (["K"].includes(r)) return acc + 13;
                  if (["Q"].includes(r)) return acc + 12;
                  if (["J"].includes(r)) return acc + 11;
                  if (["A"].includes(r)) return acc + 1;
                  const num = parseInt(r);
                  return acc + (isNaN(num) ? 0 : num);
                }, 0);

                return (
                  <div className="flex flex-col items-start gap-1">
                    {/* Top Cards & Points Box (Image 9 & 10) */}
                    <div className="flex items-center gap-1.5 border border-yellow-400 bg-black/75 rounded px-2 py-0.5 mb-0.5 shadow">
                      <div className="flex flex-col items-center leading-none pr-1.5 border-r border-yellow-400/50">
                        <span className="text-[8px] font-bold text-yellow-300">
                          Cards
                        </span>
                        <span className="text-[11px] font-black text-white font-mono">
                          {totalCardsCount || 5}
                        </span>
                      </div>
                      <div className="flex flex-col items-center leading-none">
                        <span className="text-[8px] font-bold text-yellow-300">
                          Points
                        </span>
                        <span className="text-[11px] font-black text-white font-mono">
                          {totalPointsCount || 31}
                        </span>
                      </div>
                    </div>

                    {/* 4 Suit Rows */}
                    {["♠", "♥", "♣", "♦"].map((sIcon) => {
                      const sCards = cards.filter(
                        (c) => !c.isHidden && c.suit === sIcon,
                      );
                      const color = ["♥", "♦"].includes(sIcon)
                        ? "text-red-500"
                        : "text-slate-100";
                      return (
                        <div key={sIcon} className="flex items-center gap-1">
                          <span
                            className={`text-xs font-black w-3 text-center ${color}`}
                          >
                            {sIcon}
                          </span>
                          <div className="flex gap-1">
                            {sCards.length > 0 ? (
                              sCards.map((c, cIdx) =>
                                renderCard(c, `r20-${sIcon}-${cIdx}`, false),
                              )
                            ) : (
                              <div className="w-5 h-7 border border-dashed border-white/20 rounded-[2px]" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              }

              // Dus Ka Dum (Yellow Stats Box + Horizontal Scrollable Cards Carousel) (Image 4 & 5 Exact Match)
              if (isDusKaDum) {
                const cards = roundData?.cards || [];
                const dumTotal = cards.reduce((acc, c) => {
                  if (!c || c.isHidden) return acc;
                  const r = (c.rank || "").toUpperCase();
                  if (["K", "Q", "J"].includes(r)) return acc + 10;
                  if (["A"].includes(r)) return acc + 1;
                  const num = parseInt(r);
                  return acc + (isNaN(num) ? 0 : num);
                }, 0);

                return (
                  <div className="flex flex-col items-start gap-1">
                    {/* Yellow Status Bar */}
                    <div className="flex items-center gap-2 border border-yellow-400 bg-black/75 rounded px-2 py-0.5 mb-1 shadow text-[10px] font-bold text-yellow-300">
                      <div>
                        Curr. Total:{" "}
                        <span className="font-black text-white font-mono">
                          {dumTotal || 10}
                        </span>
                      </div>
                      <span className="text-yellow-400/50">|</span>
                      <div>
                        Card #:{" "}
                        <span className="font-black text-white font-mono">
                          {cards.length || 1}
                        </span>
                      </div>
                      <span className="text-yellow-400/50">|</span>
                      <div className="truncate max-w-[130px] font-extrabold">
                        {roundData?.activeMarket || "Next Total 20 or More"}
                      </div>
                    </div>

                    {/* Dealt Cards Carousel (Image 5 Exact Match) */}
                    <div className="flex items-center gap-1">
                      {cards.length > 3 && (
                        <button
                          type="button"
                          onClick={() =>
                            setDumCardIndex((prev) => Math.max(0, prev - 1))
                          }
                          className="p-1 bg-black/80 hover:bg-black text-white rounded border border-white/20 shadow z-10 transition active:scale-95"
                        >
                          <ChevronLeft size={14} />
                        </button>
                      )}
                      <div className="flex gap-1 overflow-hidden">
                        {(cards.length > 0
                          ? cards.slice(dumCardIndex, dumCardIndex + 4)
                          : [0, 1, 2]
                        ).map((c, i) =>
                          renderCard(
                            c,
                            `dum-${dumCardIndex + i}`,
                            !c || c.isHidden,
                          ),
                        )}
                      </div>
                      {cards.length > 3 && (
                        <button
                          type="button"
                          onClick={() =>
                            setDumCardIndex((prev) =>
                              Math.min(Math.max(0, cards.length - 3), prev + 1),
                            )
                          }
                          className="p-1 bg-black/80 hover:bg-black text-white rounded border border-white/20 shadow z-10 transition active:scale-95"
                        >
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              }

              // Race to 2nd (Player A Dealt Card)
              if (isRace2) {
                const cards = roundData?.cards || [];
                return (
                  <div className="flex flex-col items-start gap-1">
                    <div className="text-[10px] font-black text-amber-300 uppercase tracking-wider mb-0.5">
                      PLAYER A
                    </div>
                    <div className="flex gap-1">
                      {renderCard(
                        cards[0],
                        "r2-a",
                        !cards[0] || cards[0].isHidden,
                      )}
                    </div>
                  </div>
                );
              }

              // Poker 1 Day (Player A, Player B, Board Cards) (Image 8 Exact Match)
              if (isPoker1Day) {
                const cards = roundData?.cards || [];
                const playerA = cards.slice(0, 2);
                const playerB = cards.slice(2, 4);
                const board = cards.slice(4, 9);
                return (
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-[10px] font-black text-amber-300 uppercase tracking-wider mb-0.5">
                          PLAYER A
                        </div>
                        <div className="flex gap-1">
                          {[0, 1].map((idx) =>
                            renderCard(
                              playerA[idx],
                              `p1-a-${idx}`,
                              !playerA[idx] || playerA[idx].isHidden,
                            ),
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-sky-300 uppercase tracking-wider mb-0.5">
                          PLAYER B
                        </div>
                        <div className="flex gap-1">
                          {[0, 1].map((idx) =>
                            renderCard(
                              playerB[idx],
                              `p1-b-${idx}`,
                              !playerB[idx] || playerB[idx].isHidden,
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-0.5">
                      <div className="text-[10px] font-black text-white uppercase tracking-wider mb-0.5">
                        BOARD
                      </div>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((idx) =>
                          renderCard(
                            board[idx],
                            `p1-bd-${idx}`,
                            !board[idx] || board[idx].isHidden,
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Clean Video without card overlay for Baccarat, Lucky 15, Roulette, Sic Bo, Goal, Cricket
              if (
                isBaccarat ||
                isLucky15 ||
                isRoulette ||
                isUniqueRoulette ||
                isSicBo ||
                isBallByBall ||
                isGoal ||
                isSuperOver ||
                isMiniSuperOver ||
                isCMatch20
              ) {
                return null;
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
                      onClick={() => {
                        if (isRace20) {
                          setSelectedRace20Result(r);
                        } else {
                          setSelectedResultModal(r);
                        }
                      }}
                      title={`Round: #${r.mid} | Winner: ${r.nat} (Click for details)`}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm shrink-0 cursor-pointer hover:scale-125 transition-transform ${b.bg}`}
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
          <button
            onClick={() => {
              if (recentResults[0]) {
                if (isRace20) setSelectedRace20Result(recentResults[0]);
                else setSelectedResultModal(recentResults[0]);
              }
            }}
            className="text-[10px] font-bold text-slate-400 hover:text-yellow-400 hover:underline shrink-0 ml-3"
          >
            View All
          </button>
        </div>

        {/* 5. Real Live Betting Odds Board */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#0b1726]">
          {isWorli ? (
            <WorliMatkaBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isPoison ? (
            <PoisonTeenPattiBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isUniqueTeen ? (
            <UniqueTeenPattiBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isTeenPattiJoker ? (
            <TeenPattiJoker20Board
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isUnlimitedJoker ? (
            <UnlimitedJokerBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isBollywood ? (
            <BollywoodCasinoBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isMiniSuperOver ? (
            <MiniSuperOverBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isSuperOver ? (
            <SuperOverBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
              slug={slug}
            />
          ) : isBallByBall ? (
            <BallByBallBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isCMatch20 ? (
            <CricketMatch20Board
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isAAA ? (
            <AmarAkbarAnthonyBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isBaccarat ? (
            <BaccaratBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
              slug={slug}
            />
          ) : isLucky15 ? (
            <Lucky15Board
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isDragonTiger ? (
            <DragonTigerBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isLucky7 ? (
            <Lucky7Board
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isTeenTest ? (
            <TeenPattiTestBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isTeenOpen ? (
            <TeenPattiOpenBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isPoker1Day ? (
            <Poker1DayBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isPoker20 ? (
            <Poker20Board
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isPoker6 ? (
            <Poker6Board
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isTeen1Day ? (
            <TeenPatti1DayBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isTeen20 ? (
            <TeenPatti20Board
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isUniqueRoulette ? (
            <UniqueRouletteBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
              recentResults={recentResults}
            />
          ) : isLucky6 ? (
            <Lucky6Board
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isRoulette ? (
            <RouletteBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isGoal ? (
            <GoalBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isAndarBahar ? (
            <AndarBaharBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isQueenTop || isJackTop ? (
            <QueenJackTopBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
              title={table.name}
            />
          ) : isSicBo ? (
            <SicBoBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isRace20 ? (
            <Race20Board
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isRace2 ? (
            <Race2Board
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isDusKaDum ? (
            <DusKaDumBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isOneCard20 || isOneCard1Day ? (
            <OneCard20Board
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isQueen ? (
            <QueenBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
          ) : isLottery ? (
            <LotteryBoard
              roundData={roundData}
              timer={timer}
              isSuspended={isSuspended}
            />
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

        {/* 7. Clickable Result Detail Modal (Image 1, 3, 4 Exact Match) */}
        {selectedResultModal && (
          <ResultDetailModal
            result={selectedResultModal}
            gameName={table.name}
            slug={slug}
            onClose={() => setSelectedResultModal(null)}
          />
        )}

        {/* 8. Race 20 Result Modal (Image 10 Exact Match) */}
        {selectedRace20Result && (
          <Race20ResultModal
            result={selectedRace20Result}
            onClose={() => setSelectedRace20Result(null)}
          />
        )}
      </div>
    </div>
  );
}
