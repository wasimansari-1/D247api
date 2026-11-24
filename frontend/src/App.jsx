import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { 
  Trophy, 
  Settings, 
  Activity, 
  Search, 
  Tv, 
  Coins, 
  Lock, 
  ChevronRight, 
  ChevronDown,
  X,
  Play,
  RotateCcw,
  Flame,
  ShieldCheck,
  Download,
  HelpCircle,
  Menu,
  CheckCircle2,
  PlusSquare,
  MinusSquare,
  Gamepad2,
  BookOpen
} from 'lucide-react';
import RateBox from './components/RateBox';
import Scorecard, { FlipClockCounter, PlayingCardItem } from './components/Scorecard';
import RacingMeetingGrid from './components/RacingMeetingGrid';
import CasinoTableModal from './components/CasinoTableModal';
import LiveStreamModal from './components/LiveStreamModal';
import DocsModal from './components/DocsModal';

const socket = io();

// All 37 Sports in EXACT sequence from Diamond Online & User Screenshots
const ALL_37_SPORTS = [
  { id: 40, name: 'Politics', icon: '🏛️' },
  { id: 4, name: 'Cricket', icon: '🏏' },
  { id: 1, name: 'Football', icon: '⚽' },
  { id: 2, name: 'Tennis', icon: '🎾' },
  { id: 8, name: 'Table Tennis', icon: '🏓' },
  { id: 22, name: 'Badminton', icon: '🏸' },
  { id: 68, name: 'Esoccer', icon: '🎮' },
  { id: 15, name: 'Basketball', icon: '🏀' },
  { id: 18, name: 'Volleyball', icon: '🏐' },
  { id: 59, name: 'Snooker', icon: '🎱' },
  { id: 19, name: 'Ice Hockey', icon: '🏒' },
  { id: 11, name: 'E Games', icon: '🎮' },
  { id: 9, name: 'Futsal', icon: '⚽' },
  { id: 39, name: 'Handball', icon: '🤾' },
  { id: 66, name: 'Kabaddi', icon: '🤼' },
  { id: 5, name: 'Golf', icon: '⛳' },
  { id: 55, name: 'Rugby League', icon: '🏉' },
  { id: 6, name: 'Boxing', icon: '🥊' },
  { id: 7, name: 'Beach Volleyball', icon: '🏐' },
  { id: 3, name: 'Mixed Martial Arts', icon: '🥋' },
  { id: 16, name: 'MotoGP', icon: '🏍️' },
  { id: 17, name: 'Chess', icon: '♟️' },
  { id: 29, name: 'Cycling', icon: '🚴' },
  { id: 32, name: 'Motorbikes', icon: '🏍️' },
  { id: 33, name: 'Athletics', icon: '🏃' },
  { id: 35, name: 'Basketball 3X3', icon: '🏀' },
  { id: 37, name: 'Sumo', icon: '🥋' },
  { id: 38, name: 'Virtual sports', icon: '🎮' },
  { id: 52, name: 'Motor Sports', icon: '🏎️' },
  { id: 53, name: 'Baseball', icon: '⚾' },
  { id: 54, name: 'Rugby Union', icon: '🏉' },
  { id: 57, name: 'Darts', icon: '🎯' },
  { id: 58, name: 'American Football', icon: '🏈' },
  { id: 62, name: 'Soccer', icon: '⚽' },
  { id: 64, name: 'Esports', icon: '🎮' },
  { id: 67, name: 'Boat Racing', icon: '🚤' },
  { id: 69, name: 'Wrestling', icon: '🤼' }
];

// Top Horizontal Sport Tabs matching Diamond Online Exchange UI
const HORIZONTAL_SPORT_TABS = [
  { id: 4, name: 'Cricket' },
  { id: 1, name: 'Football' },
  { id: 2, name: 'Tennis' },
  { id: 8, name: 'Table Tennis' },
  { id: 10, name: 'Horse Racing' },
  { id: 65, name: 'Greyhound Racing' },
  { id: 15, name: 'Basketball' },
  { id: 69, name: 'Wrestling' },
  { id: 18, name: 'Volleyball' },
  { id: 22, name: 'Badminton' },
  { id: 11, name: 'E Games' },
  { id: 59, name: 'Snooker' },
  { id: 58, name: 'American Football' },
  { id: 6, name: 'Boxing' },
  { id: 3, name: 'Mixed Martial Arts' },
  { id: 52, name: 'Motor Sports' }
];

// Top Navigation Bar
const TOP_MENU_ITEMS = [
  { label: 'HOME', type: 'sports', sportId: 4 },
  { label: 'LOTTERY', type: 'casino', filter: 'Others' },
  { label: 'CRICKET', type: 'sports', sportId: 4 },
  { label: 'TENNIS', type: 'sports', sportId: 2 },
  { label: 'FOOTBALL', type: 'sports', sportId: 1 },
  { label: 'TABLE TENNIS', type: 'sports', sportId: 8 },
  { label: 'BACCARAT', type: 'casino', filter: 'Baccarat' },
  { label: '32 CARDS', type: 'casino', filter: '32 Cards' },
  { label: 'TEENPATTI', type: 'casino', filter: 'Teen Patti' },
  { label: 'POKER', type: 'casino', filter: 'Poker' },
  { label: 'LUCKY 7', type: 'casino', filter: 'Lucky 7' },
  { label: 'CRASH', type: 'casino', filter: 'Others' }
];

// Exact 79 Casino Tables matching Diamond Online sequence
const DEFAULT_79_CASINO_TABLES = [
  // Row 1
  { id: '1', slug: 'casino', name: 'Casino', category: 'Others' },
  { id: '2', slug: 'goal2', name: 'GOAL 2', category: 'Football' },
  { id: '3', slug: 'worli', name: 'MATKA MARKET', category: 'Matka' },
  { id: '4', slug: 'teen', name: 'VIP TEENPATTI 1DAY', category: 'Teen Patti' },
  { id: '5', slug: 'dolidana', name: 'DOLI DANA', category: 'Others' },
  { id: '6', slug: 'mogambo', name: 'MOGAMBO', category: 'Others' },
  { id: '7', slug: 'lucky6', name: 'LUCKY 6', category: 'Lucky 7' },
  { id: '8', slug: 'broulette', name: 'BEACH ROULETTE', category: 'Roulette' },
  { id: '9', slug: 'roulette11', name: 'ROULETTE', category: 'Roulette' },
  { id: '10', slug: 'viproulette', name: 'VIP ROULETTE', category: 'Roulette' },
  // Row 2
  { id: '11', slug: 'poison', name: 'POISON TEENPATTI ONE DAY', category: 'Teen Patti' },
  { id: '12', slug: 'teenunique', name: 'UNIQUE TEENPATTI', category: 'Teen Patti' },
  { id: '13', slug: 'poison20', name: 'POISON TEENPATTI 20 20', category: 'Teen Patti' },
  { id: '14', slug: 'teenjoker', name: 'UNLIMITED JOKER 20', category: 'Teen Patti' },
  { id: '15', slug: 'joker20', name: 'TEENPATTI JOKER 20 20', category: 'Teen Patti' },
  { id: '16', slug: 'joker1', name: 'UNLIMITED JOKER ONEDAY', category: 'Teen Patti' },
  { id: '17', slug: 'teen20c', name: '20-20 TEENPATTI C', category: 'Teen Patti' },
  { id: '18', slug: 'btable2', name: 'BOLLYWOOD CASINO 2', category: 'Others' },
  { id: '19', slug: 'rouletteunique', name: 'UNIQUE ROULETTE', category: 'Roulette' },
  { id: '20', slug: 'minisuperover', name: 'MINI SUPER OVER', category: 'Cricket' },
  // Row 3
  { id: '21', slug: 'goal', name: 'GOAL', category: 'Football' },
  { id: '22', slug: 'ab150', name: 'ANDAR BAHAR 150 CARDS', category: 'Andar Bahar' },
  { id: '23', slug: 'lucky15', name: 'LUCKY 15', category: 'Lucky 7' },
  { id: '24', slug: 'superover2', name: 'SUPER OVER 2', category: 'Cricket' },
  { id: '25', slug: 'queentop', name: 'QUEEN TOP OPEN TEENPATTI', category: 'Teen Patti' },
  { id: '26', slug: 'jacktop', name: 'JACK TOP OPEN TEENPATTI', category: 'Teen Patti' },
  { id: '27', slug: 'sicbo2', name: 'SIC BO 2', category: 'Others' },
  { id: '28', slug: 'teen33', name: 'INSTANT TEENPATTI 3.0', category: 'Teen Patti' },
  { id: '29', slug: 'sicbo', name: 'SIC BO', category: 'Others' },
  { id: '30', slug: 'ballbyball', name: 'BALL BY BALL', category: 'Cricket' },
  // Row 4
  { id: '31', slug: 'teen202', name: 'INSTANT TEENPATTI 2.0', category: 'Teen Patti' },
  { id: '32', slug: 'teen', name: 'TEENPATTI 1 DAY', category: 'Teen Patti' },
  { id: '33', slug: 'teen20', name: '20-20 TEENPATTI', category: 'Teen Patti' },
  { id: '34', slug: 'teen9', name: 'TEENPATTI TEST', category: 'Teen Patti' },
  { id: '35', slug: 'teen8', name: 'OPEN TEENPATTI', category: 'Teen Patti' },
  { id: '36', slug: 'poker', name: 'POKER 1 DAY', category: 'Poker' },
  { id: '37', slug: 'poker20', name: '20-20 POKER', category: 'Poker' },
  { id: '38', slug: 'poker6', name: 'POKER 6 PLAYERS', category: 'Poker' },
  { id: '39', slug: 'baccarat', name: 'BACCARAT', category: 'Baccarat' },
  { id: '40', slug: 'baccarat2', name: 'BACCARAT 2', category: 'Baccarat' },
  // Row 5
  { id: '41', slug: 'dt20', name: '20-20 DRAGON TIGER', category: 'Dragon Tiger' },
  { id: '42', slug: 'dt6', name: '1 DAY DRAGON TIGER', category: 'Dragon Tiger' },
  { id: '43', slug: 'dtl20', name: 'CASINO 20-20 DTL', category: 'Dragon Tiger' },
  { id: '44', slug: 'dt202', name: '20-20 DRAGON TIGER 2', category: 'Dragon Tiger' },
  { id: '45', slug: 'card32', name: '32 CARDS A', category: '32 Cards' },
  { id: '46', slug: 'card32eu', name: '32 CARDS B', category: '32 Cards' },
  { id: '47', slug: 'ab20', name: 'ANDAR BAHAR', category: 'Andar Bahar' },
  { id: '48', slug: 'abj', name: 'ANDAR BAHAR 2', category: 'Andar Bahar' },
  { id: '49', slug: 'lucky7', name: '7-A LUCKY', category: 'Lucky 7' },
  { id: '50', slug: 'lucky7eu', name: '7-B LUCKY', category: 'Lucky 7' },
  // Row 6
  { id: '51', slug: '3cardj', name: '3 CARDS JUDGEMENT', category: 'Teen Patti' },
  { id: '52', slug: 'worli', name: 'WORLI MATKA', category: 'Matka' },
  { id: '53', slug: 'worli2', name: 'INSTANT WORLI', category: 'Matka' },
  { id: '54', slug: 'aaa', name: 'AMAR AKBAR ANTHONY', category: 'Others' },
  { id: '55', slug: 'btable', name: 'BOLLYWOOD CASINO', category: 'Others' },
  { id: '56', slug: 'lottcard', name: 'LOTTERY', category: 'Others' },
  { id: '57', slug: 'cricketv3', name: '5FIVE CRICKET', category: 'Cricket' },
  { id: '58', slug: 'cmatch20', name: 'CRICKET MATCH 20-20', category: 'Cricket' },
  { id: '59', slug: 'teen2', name: 'TEENPATTI 2.0', category: 'Teen Patti' },
  { id: '60', slug: 'queen', name: 'QUEEN', category: 'Teen Patti' },
  // Row 7
  { id: '61', slug: 'race20', name: 'RACE 20', category: 'Others' },
  { id: '62', slug: 'lucky7c', name: 'LUCKY 7-C CASINO', category: 'Lucky 7' },
  { id: '63', slug: 'superover', name: 'SUPER OVER', category: 'Cricket' },
  { id: '64', slug: 'trap', name: 'THE TRAP', category: 'Others' },
  { id: '65', slug: 'teen2card', name: '2 CARDS TEENPATTI', category: 'Teen Patti' },
  { id: '66', slug: 'baccarat29', name: '29 BACCARAT', category: 'Baccarat' },
  { id: '67', slug: 'muflis', name: 'MUFLIS TEENPATTI', category: 'Teen Patti' },
  { id: '68', slug: 'race17', name: 'RACE TO 17', category: 'Others' },
  { id: '69', slug: 'teen20b', name: '20-20 TEENPATTI B', category: 'Teen Patti' },
  { id: '70', slug: 'trio', name: 'TRIO', category: 'Others' },
  // Row 8
  { id: '71', slug: 'notenumber', name: 'NOTE NUMBER', category: 'Others' },
  { id: '72', slug: 'card120', name: '1 CARD 20-20', category: 'Others' },
  { id: '73', slug: 'card1oneday', name: 'ONE CARD ONE DAY', category: 'Others' },
  { id: '74', slug: 'ab3', name: 'ANDAR BAHAR 50 CARDS', category: 'Andar Bahar' },
  { id: '75', slug: 'aaa2', name: 'AMAR AKBAR ANTHONY 2.0', category: 'Others' },
  { id: '76', slug: 'race2nd', name: 'RACE TO 2ND', category: 'Others' },
  { id: '77', slug: 'instantteen', name: 'INSTANT TEENPATTI', category: 'Teen Patti' },
  { id: '78', slug: 'duskadum', name: 'DUS KA DUM', category: 'Others' },
  { id: '79', slug: 'cmeter', name: '1 CARD METER', category: 'Others' }
];

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('sports'); // 'sports' | 'casino'
  const [selectedSportId, setSelectedSportId] = useState(4);
  const [selectedCasinoCategory, setSelectedCasinoCategory] = useState('all');
  
  // Data states
  const [inPlayMatches, setInPlayMatches] = useState([]);
  const [selectedMatchGmid, setSelectedMatchGmid] = useState(null);
  const [matchDetails, setMatchDetails] = useState(null);
  const [loadingMatchDetails, setLoadingMatchDetails] = useState(false);
  const [casinoTables, setCasinoTables] = useState(DEFAULT_79_CASINO_TABLES);
  const [activeCasinoTable, setActiveCasinoTable] = useState(null);
  const [activeStreamMatch, setActiveStreamMatch] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Horse Racing & Greyhound Racing Meeting Grid state
  const [racingTree, setRacingTree] = useState([]);
  const [selectedRacingCountry, setSelectedRacingCountry] = useState('AU');
  
  // Accordion states for sidebar
  const [isRacingOpen, setIsRacingOpen] = useState(true);
  const [isOthersOpen, setIsOthersOpen] = useState(true);
  const [isSportsOpen, setIsSportsOpen] = useState(true);

  // Settings & Commercial Documentation modals
  const [showSettings, setShowSettings] = useState(false);
  const [showDocs, setShowDocs] = useState(() => 
    typeof window !== 'undefined' && (window.location.pathname === '/docs' || window.location.search.includes('docs'))
  );
  const [cookieInput, setCookieInput] = useState('');
  const [syncStatus, setSyncStatus] = useState('');
  const [tickerText, setTickerText] = useState('Connecting to Diamond247 Engine...');

  // 1. Initial Load & Background Polling
  useEffect(() => {
    const loadInPlay = () => {
      fetch('/api/sports/in-play')
        .then(r => r.json())
        .then(res => {
          if (res.success && Array.isArray(res.data)) {
            setInPlayMatches(res.data);
          }
        })
        .catch(() => {});
    };

    loadInPlay();
    const matchesInterval = setInterval(loadInPlay, 1500);

    // Fetch official casino tables
    fetch('/api/casino/tables')
      .then(r => r.json())
      .then(res => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setCasinoTables(res.data);
        }
      })
      .catch(() => {});

    // Socket.io Real-time listeners
    socket.on('connect', () => {
      setTickerText('🟢 Live Zero-Latency Synced with Diamond247 Engine');
    });

    socket.on('odds_update', (payload) => {
      setMatchDetails(prev => {
        if (!prev || String(prev.gmid) !== String(payload.gmid)) return prev;
        return {
          ...prev,
          markets: payload.markets || prev.markets,
          scoreboard: payload.scoreboard || prev.scoreboard,
          streamUrl: payload.streamUrl || prev.streamUrl,
          timer: payload.timer !== undefined ? payload.timer : prev.timer,
          totalTimer: payload.totalTimer || prev.totalTimer,
          card: payload.card || prev.card,
          cards: payload.cards || prev.cards,
          recentResults: payload.recentResults || prev.recentResults,
          status: payload.status || prev.status,
          updatedAt: payload.updatedAt
        };
      });
    });

    socket.on('events_list_update', (events) => {
      if (Array.isArray(events) && events.length > 0) {
        setInPlayMatches(events);
      }
    });

    socket.on('quick_rate_ticker', (data) => {
      setTickerText(`⚡ [${data.eventName}] ${data.runner}: Back ${data.back} / Lay ${data.lay}`);
    });

    return () => {
      clearInterval(matchesInterval);
      socket.off('odds_update');
      socket.off('events_list_update');
      socket.off('quick_rate_ticker');
    };
  }, []);

  // 1.1 Live 1-Second Timer Countdown Ticker (Zero-Lag Countdown)
  useEffect(() => {
    if (matchDetails?.timer === undefined || matchDetails?.timer === null || matchDetails.timer <= 0) return;
    const interval = setInterval(() => {
      setMatchDetails(prev => {
        if (!prev || prev.timer === undefined || prev.timer <= 0) return prev;
        return { ...prev, timer: Math.max(0, prev.timer - 1) };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [matchDetails?.timer]);

  // 1.2 Fetch dedicated Racing Meeting Grid on Sport Change
  useEffect(() => {
    if (selectedSportId === 10 || selectedSportId === 65) {
      fetch(`/api/sports/racing/${selectedSportId}`)
        .then(r => r.json())
        .then(res => {
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            setRacingTree(res.data);
            setSelectedRacingCountry(prev => {
              const exists = res.data.some(c => (c.cname || c.name) === prev);
              return exists ? prev : (res.data[0].cname || res.data[0].name || 'AU');
            });
          }
        })
        .catch(() => {});
    }
  }, [selectedSportId]);

  // 2. Fetch Selected Match Details on Change
  useEffect(() => {
    if (!selectedMatchGmid) return;

    let isMounted = true;
    fetch(`/api/sports/match/${selectedMatchGmid}?etid=${selectedSportId}`)
      .then(r => r.json())
      .then(res => {
        if (isMounted && res.success) {
          setMatchDetails(res.data);
          setLoadingMatchDetails(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingMatchDetails(false);
      });

    socket.emit('join_match', selectedMatchGmid);

    return () => {
      isMounted = false;
      socket.emit('leave_match', selectedMatchGmid);
    };
  }, [selectedMatchGmid, selectedSportId]);

  const handleSelectMatch = (gmid) => {
    if (selectedMatchGmid === gmid) {
      setSelectedMatchGmid(null);
      setMatchDetails(null);
    } else {
      setSelectedMatchGmid(gmid);
      setLoadingMatchDetails(true);
    }
  };

  // Filter matches for selected sport
  const filteredMatches = inPlayMatches.filter(m => m.etid === selectedSportId);

  // Filter casino tables
  const filteredCasinoTables = selectedCasinoCategory === 'all'
    ? casinoTables
    : casinoTables.filter(t => t.category === selectedCasinoCategory);

  const casinoCategories = ['all', 'Teen Patti', 'Dragon Tiger', 'Lucky 7', 'Andar Bahar', 'Roulette', 'Baccarat', 'Poker', 'Matka', 'Football', 'Cricket', 'Others'];

  // Marquee highlighted live matches for top ribbon
  const marqueeMatches = inPlayMatches.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 flex flex-col font-sans select-none">
      
      {/* 1. Header Bar matching Diamond Online */}
      <header className="bg-[#193048] text-white px-3 py-2 flex justify-between items-center border-b border-[#122336] shadow-md">
        <div className="flex items-center gap-3">
          <button className="md:hidden text-white p-1">
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setActiveTab('sports'); setSelectedSportId(4); }}>
            <span className="font-black text-xl tracking-wider text-yellow-400 font-mono">D247</span>
            <span className="bg-[#2a4d70] text-[10px] text-white font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
              EXCHANGE
            </span>
          </div>
        </div>

        {/* Right Header: Balance & Session */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-[#0f1d2b] px-3 py-1 rounded border border-slate-700/80 flex items-center gap-2">
            <div className="flex flex-col text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Main Balance</span>
              <span className="font-black text-xs text-emerald-400 font-mono">PTS 50,000.00</span>
            </div>
            <div className="flex flex-col text-right pl-2 border-l border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Exposure</span>
              <span className="font-black text-xs text-red-400 font-mono">0.00</span>
            </div>
          </div>

          <button 
            onClick={() => setShowDocs(true)}
            className="px-2.5 py-1 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-extrabold text-xs rounded border border-sky-400/40 transition flex items-center gap-1.5 shadow-sm"
            title="D247 Commercial Exchange API Documentation"
          >
            <BookOpen size={14} className="text-yellow-300" />
            <span className="hidden sm:inline">API Docs</span>
          </button>

          <button 
            onClick={() => setShowSettings(true)}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded border border-white/20 text-white text-xs transition"
            title="D247 Upstream Session Config"
          >
            <Settings size={15} />
          </button>
        </div>
      </header>

      {/* 2. Main Top Navigation Bar */}
      <nav className="bg-[#112435] text-white flex overflow-x-auto text-[11px] font-black uppercase tracking-wider border-b border-[#0d1d2b] scrollbar-none shadow-sm">
        {TOP_MENU_ITEMS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (item.type === 'sports') {
                setActiveTab('sports');
                setSelectedSportId(item.sportId);
              } else {
                setActiveTab('casino');
                setSelectedCasinoCategory(item.filter);
              }
            }}
            className={`py-2 px-3.5 whitespace-nowrap transition border-b-2 flex items-center gap-1 ${
              (activeTab === item.type && (item.type === 'sports' ? selectedSportId === item.sportId : selectedCasinoCategory === item.filter))
                ? 'border-sky-400 bg-[#1a3854] text-white'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* 3. Excitement Ticker Bar */}
      <div className="bg-[#091520] text-sky-200 text-[11px] py-1 px-3 flex items-center border-b border-slate-800 overflow-hidden">
        <span className="text-yellow-400 font-extrabold flex items-center gap-1 mr-2 shrink-0">
          <Activity size={13} /> LIVE FEED:
        </span>
        <div className="overflow-hidden whitespace-nowrap w-full">
          <span className="text-slate-300 font-medium">
            with excitement!! ♠ Teen Patti ♣ Baccarat ♦ Poker 🏆 Play Live. Win Big. Celebrate Bigger! &nbsp;&bull;&nbsp; {tickerText}
          </span>
        </div>
      </div>

      {/* 4. Top Marquee Ribbon with In-Play Match Pills (matching Image 4) */}
      <div className="bg-black text-white px-2 py-1 flex items-center gap-2 overflow-x-auto scrollbar-thin border-b border-neutral-800 text-[11px]">
        {marqueeMatches.map((m, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveTab('sports');
              setSelectedSportId(m.etid);
              handleSelectMatch(m.gmid);
            }}
            className="flex items-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 text-slate-200 px-3 py-1 rounded text-[11px] font-bold whitespace-nowrap transition border border-neutral-700/80 shrink-0"
          >
            <span>{m.sportIcon || '🏆'}</span>
            <span className="truncate max-w-[180px]">{m.eventName}</span>
          </button>
        ))}
      </div>

      {/* 5. Main Body with Sidebar + Center Area */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto p-1.5 sm:p-2.5 gap-2">
        
        {/* Left Sidebar (with Exact Teal Headers #318683 and All 37 Sports matching Image 1 & 4) */}
        <aside className="w-52 lg:w-60 bg-white rounded shadow-sm border border-slate-200 shrink-0 hidden md:flex flex-col text-xs font-bold overflow-hidden select-none">
          
          {/* Section 1: Racing Sports */}
          <div className="border-b border-slate-200">
            <button 
              onClick={() => setIsRacingOpen(!isRacingOpen)}
              className="w-full bg-[#318683] hover:bg-[#2c7774] text-white px-3 py-2 font-extrabold text-[12px] flex justify-between items-center transition"
            >
              <span>Racing Sports</span>
              <ChevronDown size={15} className={`transform transition-transform ${isRacingOpen ? '' : '-rotate-90'}`} />
            </button>
            {isRacingOpen && (
              <div className="divide-y divide-slate-100 text-slate-700 bg-white">
                <button 
                  onClick={() => { setActiveTab('sports'); setSelectedSportId(10); }}
                  className={`w-full text-left px-3 py-2 hover:bg-sky-50 hover:text-sky-800 flex items-center justify-between transition ${
                    activeTab === 'sports' && selectedSportId === 10 ? 'bg-sky-100 text-sky-900 font-black' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">+</span>
                    <span>Horse Racing</span>
                  </div>
                </button>
                <button 
                  onClick={() => { setActiveTab('sports'); setSelectedSportId(65); }}
                  className={`w-full text-left px-3 py-2 hover:bg-sky-50 hover:text-sky-800 flex items-center justify-between transition ${
                    activeTab === 'sports' && (selectedSportId === 65 || selectedSportId === 43) ? 'bg-sky-100 text-sky-900 font-black' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-bold">+</span>
                    <span>Greyhound Racing</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Others */}
          <div className="border-b border-slate-200">
            <button 
              onClick={() => setIsOthersOpen(!isOthersOpen)}
              className="w-full bg-[#318683] hover:bg-[#2c7774] text-white px-3 py-2 font-extrabold text-[12px] flex justify-between items-center transition"
            >
              <span>Others</span>
              <ChevronDown size={15} className={`transform transition-transform ${isOthersOpen ? '' : '-rotate-90'}`} />
            </button>
            {isOthersOpen && (
              <div className="divide-y divide-slate-100 text-slate-700 bg-white">
                <button 
                  onClick={() => { setActiveTab('casino'); setSelectedCasinoCategory('all'); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-sky-50 hover:text-sky-800 flex items-center justify-between transition ${
                    activeTab === 'casino' && selectedCasinoCategory === 'all' ? 'bg-sky-100 text-sky-900 font-black' : ''
                  }`}
                >
                  <span>Our Casino</span>
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-black">{casinoTables.length || 79}</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('sports'); setSelectedSportId(4); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-sky-50 hover:text-sky-800 flex items-center justify-between transition"
                >
                  <span>Our Virtual</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('casino'); setSelectedCasinoCategory('all'); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-sky-50 hover:text-sky-800 flex items-center justify-between transition"
                >
                  <span>Our VIP Casino</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('casino'); setSelectedCasinoCategory('all'); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-sky-50 hover:text-sky-800 flex items-center justify-between transition"
                >
                  <span>Our Premium Casino</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('casino'); setSelectedCasinoCategory('all'); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-sky-50 hover:text-sky-800 flex items-center justify-between transition"
                >
                  <span>Live Casino</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('casino'); setSelectedCasinoCategory('Others'); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-sky-50 hover:text-sky-800 flex items-center justify-between transition"
                >
                  <span>Slot Game</span>
                </button>
                <button 
                  onClick={() => { setActiveTab('sports'); setSelectedSportId(4); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-sky-50 hover:text-sky-800 flex items-center justify-between transition"
                >
                  <span>Fantasy Game</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 3: All Sports (All 37 sports with [+] icons matching Image 1 & 4) */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <button 
              onClick={() => setIsSportsOpen(!isSportsOpen)}
              className="w-full bg-[#318683] hover:bg-[#2c7774] text-white px-3 py-2 font-extrabold text-[12px] flex justify-between items-center transition shrink-0"
            >
              <span>All Sports</span>
              <ChevronDown size={15} className={`transform transition-transform ${isSportsOpen ? '' : '-rotate-90'}`} />
            </button>
            {isSportsOpen && (
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 text-slate-700 bg-white scrollbar-thin">
                {ALL_37_SPORTS.map(s => {
                  const count = inPlayMatches.filter(m => m.etid === s.id).length;
                  const isSelected = activeTab === 'sports' && selectedSportId === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => { setActiveTab('sports'); setSelectedSportId(s.id); }}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between transition ${
                        isSelected ? 'bg-sky-100 text-sky-950 font-black' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <PlusSquare size={13} className="text-slate-600 shrink-0" />
                        <span className="truncate">{s.name}</span>
                      </div>
                      {count > 0 && (
                        <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded font-mono font-bold shrink-0">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </aside>

        {/* Center Main Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Sports View */}
          {activeTab === 'sports' ? (
            <div className="flex flex-col flex-1">
              
              {/* Horizontal Sport Tabs Bar matching Image 4 */}
              <div className="bg-[#f1f3f4] border-b border-slate-300 px-1 py-1 flex items-center gap-1 overflow-x-auto scrollbar-none">
                {HORIZONTAL_SPORT_TABS.map(s => {
                  const count = inPlayMatches.filter(m => m.etid === s.id).length;
                  const isActive = selectedSportId === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSportId(s.id)}
                      className={`px-3 py-1.5 text-xs font-extrabold whitespace-nowrap transition flex items-center gap-1.5 border ${
                        isActive 
                          ? 'bg-black text-white border-black shadow' 
                          : 'bg-[#e2e8f0] text-slate-800 border-slate-300 hover:bg-slate-300'
                      }`}
                    >
                      <span>{s.name}</span>
                      {count > 0 && (
                        <span className={`text-[9px] px-1 rounded font-black ${
                          isActive ? 'bg-white text-black' : 'bg-slate-700 text-white'
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Exact Match Detail View (Matching Image 1 & Image 2) */}
              {selectedMatchGmid && matchDetails && (
                <div className="bg-[#1e293b] border-b-4 border-sky-500 text-white p-3 shadow-2xl animate-fade-in">
                  
                  {/* Match Banner */}
                  <div className="flex justify-between items-center mb-2.5 border-b border-slate-700 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                        LIVE MATCH
                      </span>
                      <h3 className="font-extrabold text-base text-yellow-400">
                        {matchDetails.eventName}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">
                        ({matchDetails.competition})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Live TV Button */}
                      <button
                        onClick={() => setActiveStreamMatch(matchDetails)}
                        className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs px-2.5 py-1 rounded shadow transition"
                        title="Watch Live Video Stream"
                      >
                        <Tv size={14} />
                        <span>Live TV</span>
                      </button>

                      {/* Real Live Countdown Timer */}
                      {matchDetails.timer !== undefined && (
                        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-0.5 rounded">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Timer:</span>
                          <span className={`font-mono font-black text-xs px-1.5 py-0.2 rounded ${
                            matchDetails.timer <= 5 ? 'bg-red-600 text-white animate-bounce' : 'bg-yellow-400 text-slate-950'
                          }`}>
                            {matchDetails.timer}s
                          </span>
                        </div>
                      )}
                      
                      <button 
                        onClick={() => { setSelectedMatchGmid(null); setMatchDetails(null); }}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Live Marquee News Bar */}
                  <div className="bg-[#0f1f2e] border border-amber-500/30 rounded px-3 py-1 flex items-center gap-2 overflow-hidden shadow-inner text-xs mb-3">
                    <span className="bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded text-[10px] tracking-wider uppercase shrink-0">
                      NEWS
                    </span>
                    <marquee className="text-yellow-200 font-semibold tracking-wide text-xs">
                      {matchDetails.remark || matchDetails.news || `${matchDetails.eventName} - Live Betting Open with Instant Exchange Odds. Zero Delay Feed Active.`}
                    </marquee>
                  </div>

                  {/* Super Over 2 Live Screen with Center-Right Flip Timer (Matching Diamond Online exactly) */}
                  {matchDetails.gmid === 'superover2' && (
                    <div className="relative bg-black rounded-lg min-h-[180px] sm:min-h-[220px] mb-3 flex items-center justify-end pr-8 sm:pr-14 shadow-2xl border border-slate-800 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-black via-slate-950 to-black opacity-95"></div>
                      
                      {/* Live Flip Counter matching Diamond Image 9 */}
                      <div className="relative z-10 flex flex-col items-center gap-1">
                        <FlipClockCounter value={matchDetails.timer !== undefined ? matchDetails.timer : 0} />
                      </div>
                    </div>
                  )}

                  {/* Real Scoreboard ONLY when authentic live score data exists in API and NOT superover2 */}
                  {matchDetails.scoreboard && matchDetails.gmid !== 'superover2' && (
                    <div className="mb-3">
                      <Scorecard 
                        scoreboard={matchDetails.scoreboard} 
                        timer={matchDetails.timer} 
                        cards={matchDetails.cards} 
                      />
                    </div>
                  )}

                  {/* Detailed Markets Grid with Exact Upstream Indexing */}
                  <div className="flex flex-col gap-3">
                    {(() => {
                      const matchOddsMarket = matchDetails.markets?.find(m => m.marketName === 'Match Odds' || m.marketType === 'match_odds');
                      const secondaryMarkets = matchDetails.markets?.filter(m => m !== matchOddsMarket && !m.fancyList && !m.fancy1List) || [];
                      const fancyMarkets = matchDetails.markets?.filter(m => m.fancyList || m.fancy1List) || [];

                      return (
                        <>
                          {/* 1. Main Match Odds (Full-width with Betfair 3-tier Ladder) */}
                          {matchOddsMarket && (
                            <div className="border border-slate-700 bg-slate-900 rounded-lg overflow-hidden shadow-sm">
                              <div className="bg-[#243447] px-3 py-1.5 flex justify-between items-center border-b border-slate-700 text-xs font-black">
                                <div className="flex items-center gap-2">
                                  <span className="text-white uppercase tracking-wide">{matchOddsMarket.marketName}</span>
                                  <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded border border-slate-700">
                                    Max: {matchOddsMarket.max >= 1000 ? `${(matchOddsMarket.max / 1000).toFixed(0)}K` : matchOddsMarket.max}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button className="bg-[#20a052] hover:bg-emerald-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded shadow">
                                    Cashout
                                  </button>
                                </div>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                  <thead>
                                    <tr className="bg-[#1b2838] text-slate-400 text-[10px] uppercase font-bold border-b border-slate-700">
                                      <th className="py-1 px-3">Team</th>
                                      <th className="py-1 px-1 text-center" colSpan={3}>Back</th>
                                      <th className="py-1 px-1 text-center" colSpan={3}>Lay</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-800">
                                    {matchOddsMarket.runners?.map((r, rIdx) => (
                                      <tr key={rIdx} className="hover:bg-slate-800/60 transition">
                                        <td className="py-2 px-3 font-bold text-white text-xs">
                                          {r.runnerName}
                                        </td>
                                        {r.suspended ? (
                                          <td colSpan={6} className="py-1 px-1 bg-[#374151] text-center text-slate-300 font-extrabold text-xs shadow-inner">
                                            <div className="flex items-center justify-center gap-1.5">
                                              <Lock size={14} className="text-slate-300" />
                                              <span>SUSPENDED</span>
                                            </div>
                                          </td>
                                        ) : (
                                          <>
                                            <td className="py-1 px-0.5 text-center w-14">
                                              <RateBox price={r.backs?.[0]?.price || 0} size={r.backs?.[0]?.size || 0} type="back" depth="low" />
                                            </td>
                                            <td className="py-1 px-0.5 text-center w-14">
                                              <RateBox price={r.backs?.[1]?.price || 0} size={r.backs?.[1]?.size || 0} type="back" depth="mid" />
                                            </td>
                                            <td className="py-1 px-0.5 text-center w-14">
                                              <RateBox price={r.backPrice || 0} size={r.backSize || 0} type="back" depth="best" />
                                            </td>
                                            <td className="py-1 px-0.5 text-center w-14">
                                              <RateBox price={r.layPrice || 0} size={r.laySize || 0} type="lay" depth="best" />
                                            </td>
                                            <td className="py-1 px-0.5 text-center w-14">
                                              <RateBox price={r.lays?.[1]?.price || 0} size={r.lays?.[1]?.size || 0} type="lay" depth="mid" />
                                            </td>
                                            <td className="py-1 px-0.5 text-center w-14">
                                              <RateBox price={r.lays?.[2]?.price || 0} size={r.lays?.[2]?.size || 0} type="lay" depth="low" />
                                            </td>
                                          </>
                                        )}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* 2. Secondary Markets (Bookmaker, Winner, etc.) */}
                          {secondaryMarkets.length > 0 && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                              {secondaryMarkets.map((secM, sIdx) => (
                                <div key={sIdx} className="border border-slate-700 bg-slate-900 rounded-lg overflow-hidden shadow-sm">
                                  <div className="bg-[#243447] px-3 py-1.5 flex justify-between items-center border-b border-slate-700 text-xs font-black">
                                    <span className="text-white uppercase tracking-wide truncate">{secM.marketName}</span>
                                    <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded border border-slate-700">
                                      Max: {secM.max >= 1000 ? `${(secM.max / 1000).toFixed(0)}K` : secM.max}
                                    </span>
                                  </div>
                                  <table className="w-full text-left text-xs">
                                    <tbody className="divide-y divide-slate-800">
                                      {secM.runners?.map((r, rIdx) => (
                                        <tr key={rIdx} className="hover:bg-slate-800/60 transition">
                                          <td className="py-2 px-3 font-bold text-white text-xs truncate max-w-[140px]">
                                            {r.runnerName}
                                          </td>
                                          {r.suspended ? (
                                            <td colSpan={2} className="py-1 px-1 bg-[#374151] text-center text-slate-300 font-bold text-xs">
                                              <div className="flex items-center justify-center gap-1">
                                                <Lock size={13} />
                                                <span>LOCKED</span>
                                              </div>
                                            </td>
                                          ) : (
                                            <>
                                              <td className="py-1 px-1 text-center w-20">
                                                <RateBox price={r.backPrice || 0} size={r.backSize || 0} type="back" depth="best" />
                                              </td>
                                              <td className="py-1 px-1 text-center w-20">
                                                <RateBox price={r.layPrice || 0} size={r.laySize || 0} type="lay" depth="best" />
                                              </td>
                                            </>
                                          )}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 3. Fancy & Fancy1 Markets */}
                          {fancyMarkets.map((fm, fmIdx) => {
                            const isFancy1Type = fm.marketType === 'fancy1' || fm.fancy1List || (fm.marketName || '').toLowerCase().includes('fancy1');
                            const itemsList = fm.fancy1List || fm.fancyList || [];

                            if (isFancy1Type) {
                              return (
                                <div key={fmIdx} className="border border-slate-700 bg-slate-900 rounded-lg overflow-hidden shadow-sm">
                                  <div className="bg-[#243447] px-3 py-1.5 flex justify-between items-center border-b border-slate-700 text-xs font-black">
                                    <span className="text-white uppercase tracking-wide font-bold">{fm.marketName}</span>
                                    <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded border border-slate-700">
                                      Min: {fm.min || 100} | Max: {fm.max >= 1000 ? `${(fm.max / 1000).toFixed(0)}K` : fm.max || '10K'}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 bg-[#111c2a]">
                                    {/* Left Column */}
                                    <div className="divide-y divide-slate-800">
                                      {itemsList.filter((_, idx) => idx % 2 === 0).map((item, fIdx) => (
                                        <div key={fIdx} className="p-2 flex items-center justify-between hover:bg-slate-800/50 transition">
                                          <div className="flex-1 pr-2">
                                            <span className="text-xs font-bold text-white block">{item.title}</span>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                              Min: {item.min || 100} Max: {item.max >= 1000 ? `${(item.max / 1000).toFixed(0)}K` : item.max || '10K'}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1 shrink-0">
                                            <div className="w-14 text-center">
                                              <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Back</span>
                                              <div className="bg-[#72bbef] text-slate-950 font-black text-xs py-1 rounded shadow-sm">
                                                {item.suspended || !item.back ? '-' : item.back}
                                              </div>
                                            </div>
                                            <div className="w-14 text-center">
                                              <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Lay</span>
                                              <div className="bg-[#faa9ba] text-slate-950 font-black text-xs py-1 rounded shadow-sm">
                                                {item.suspended || !item.lay ? '-' : item.lay}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Right Column */}
                                    <div className="divide-y divide-slate-800">
                                      {itemsList.filter((_, idx) => idx % 2 === 1).map((item, fIdx) => (
                                        <div key={fIdx} className="p-2 flex items-center justify-between hover:bg-slate-800/50 transition">
                                          <div className="flex-1 pr-2">
                                            <span className="text-xs font-bold text-white block">{item.title}</span>
                                            <span className="text-[10px] text-slate-400 font-mono">
                                              Min: {item.min || 100} Max: {item.max >= 1000 ? `${(item.max / 1000).toFixed(0)}K` : item.max || '10K'}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1 shrink-0">
                                            <div className="w-14 text-center">
                                              <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Back</span>
                                              <div className="bg-[#72bbef] text-slate-950 font-black text-xs py-1 rounded shadow-sm">
                                                {item.suspended || !item.back ? '-' : item.back}
                                              </div>
                                            </div>
                                            <div className="w-14 text-center">
                                              <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">Lay</span>
                                              <div className="bg-[#faa9ba] text-slate-950 font-black text-xs py-1 rounded shadow-sm">
                                                {item.suspended || !item.lay ? '-' : item.lay}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div key={fmIdx} className="border border-slate-700 bg-slate-900 rounded-lg overflow-hidden shadow-sm">
                                <div className="bg-[#243447] px-3 py-1.5 flex justify-between items-center border-b border-slate-700 text-xs font-black">
                                  <span className="text-yellow-400 uppercase tracking-wide font-bold">{fm.marketName}</span>
                                  <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.5 rounded border border-slate-700">
                                    Min: {fm.min} | Max: {fm.max >= 1000 ? `${(fm.max / 1000).toFixed(0)}K` : fm.max}
                                  </span>
                                </div>
                                <table className="w-full text-left text-xs">
                                  <tbody className="divide-y divide-slate-800">
                                    {itemsList.map((item, fIdx) => (
                                      <tr key={fIdx} className="hover:bg-slate-800/60 transition">
                                        <td className="py-2 px-3 font-bold text-white text-xs">
                                          {item.title}
                                        </td>
                                        {item.suspended ? (
                                          <td colSpan={2} className="py-1 px-1 bg-[#374151] text-center text-slate-300 font-bold text-xs">
                                            <div className="flex items-center justify-center gap-1">
                                              <Lock size={13} />
                                              <span>SUSPENDED</span>
                                            </div>
                                          </td>
                                        ) : (
                                          <>
                                            <td className="py-1 px-1 text-center w-20">
                                              <div className="bg-[#faa9ba] text-slate-950 font-black text-xs py-1 rounded shadow-sm">
                                                <div>{item.noRate}</div>
                                                <div className="text-[9px] font-medium text-slate-800">{item.noOdds}</div>
                                              </div>
                                            </td>
                                            <td className="py-1 px-1 text-center w-20">
                                              <div className="bg-[#72bbef] text-slate-950 font-black text-xs py-1 rounded shadow-sm">
                                                <div>{item.yesRate}</div>
                                                <div className="text-[9px] font-medium text-slate-800">{item.yesOdds}</div>
                                              </div>
                                            </td>
                                          </>
                                        )}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          })}

                          {/* Super Over 2 Last Result Ribbon matching Image 1 */}
                          {matchDetails.gmid === 'superover2' && (
                            <div className="bg-[#0b1726] border border-slate-700 rounded-lg p-2.5 flex items-center justify-between overflow-x-auto">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider shrink-0">
                                  Last Result
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {(matchDetails.recentResults || [
                                    { winner: '1' }, { winner: '1' }, { winner: '1' }, { winner: '1' },
                                    { winner: '1' }, { winner: '1' }, { winner: '1' }, { winner: '1' }
                                  ]).map((resItem, rIdx) => {
                                    const val = String(resItem.winner || resItem.nat || '1');
                                    const isWicket = val.toLowerCase().includes('w');
                                    const isBoundary = val === '4' || val === '6';
                                    const bg = isWicket ? 'bg-red-600' : isBoundary ? 'bg-sky-600' : 'bg-emerald-600';
                                    return (
                                      <div
                                        key={rIdx}
                                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm shrink-0 font-mono ${bg}`}
                                        title={`Result: ${val}`}
                                      >
                                        {val}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                              <button className="text-[11px] font-bold text-sky-400 hover:text-sky-300 hover:underline shrink-0 ml-3">
                                View All
                              </button>
                            </div>
                          )}

                          {/* 24X7 Support Ribbon matching Image 1 */}
                          {matchDetails.gmid === 'superover2' && (
                            <div className="flex flex-col gap-2 pt-2">
                              <div className="bg-[#3182ce] text-white py-2 px-4 rounded-lg flex items-center justify-between shadow-md">
                                <span className="font-extrabold text-sm tracking-wide">24X7 Support</span>
                                <div className="flex items-center gap-2">
                                  <a href="https://wa.me/639451469623" target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shadow hover:scale-110 transition">
                                    WA
                                  </a>
                                  <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs font-bold shadow hover:scale-110 transition">
                                    TG
                                  </a>
                                </div>
                              </div>
                              <div className="text-center text-[11px] text-slate-400">
                                <p className="font-semibold text-slate-300">100% SAFE Protected connection and encrypted data.</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">&copy; Copyright 2026. All Rights Reserved. Powered by D247.</p>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Dedicated Meeting Grid for Horse & Greyhound Racing matching Image 8 */}
              {(selectedSportId === 10 || selectedSportId === 65) ? (
                <RacingMeetingGrid
                  racingTree={racingTree}
                  selectedCountry={selectedRacingCountry}
                  onSelectCountry={setSelectedRacingCountry}
                  onSelectRace={handleSelectMatch}
                  selectedMatchGmid={selectedMatchGmid}
                />
              ) : (
                /* Main Exchange In-Play Match Table matching Image 4 */
                <div className="overflow-x-auto flex-1">
                  <table className="w-full border-collapse text-left text-xs">
                  
                  {/* Table Column Headers */}
                  <thead>
                    <tr className="bg-[#e2e8f0] text-slate-800 font-extrabold border-b border-slate-300 text-[11px] select-none">
                      <th className="py-2 px-3 font-bold">Game</th>
                      <th className="py-2 px-1 text-center w-28"></th>
                      <th className="py-1 px-1 text-center w-28 border-l border-slate-300" colSpan={2}>
                        <div className="text-slate-900 text-[11px] font-black">1</div>
                        <div className="grid grid-cols-2 text-[9px] font-bold">
                          <span className="text-sky-700">Back</span>
                          <span className="text-pink-700">Lay</span>
                        </div>
                      </th>
                      <th className="py-1 px-1 text-center w-28 border-l border-slate-300" colSpan={2}>
                        <div className="text-slate-900 text-[11px] font-black">X</div>
                        <div className="grid grid-cols-2 text-[9px] font-bold">
                          <span className="text-sky-700">Back</span>
                          <span className="text-pink-700">Lay</span>
                        </div>
                      </th>
                      <th className="py-1 px-1 text-center w-28 border-l border-slate-300" colSpan={2}>
                        <div className="text-slate-900 text-[11px] font-black">2</div>
                        <div className="grid grid-cols-2 text-[9px] font-bold">
                          <span className="text-sky-700">Back</span>
                          <span className="text-pink-700">Lay</span>
                        </div>
                      </th>
                    </tr>
                  </thead>

                  {/* Table Match Rows */}
                  <tbody className="divide-y divide-slate-200">
                    {filteredMatches.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400 text-xs italic">
                          No matches available currently for this category.
                        </td>
                      </tr>
                    ) : (
                      filteredMatches.map((m) => {
                        const isSelected = selectedMatchGmid === m.gmid;
                        const c1 = m.cols?.col1 || {};
                        const cX = m.cols?.colX || {};
                        const c2 = m.cols?.col2 || {};

                        return (
                          <tr 
                            key={m.gmid}
                            onClick={() => handleSelectMatch(m.gmid)}
                            className={`cursor-pointer transition hover:bg-sky-50/70 ${
                              isSelected ? 'bg-sky-100/90 font-bold border-l-4 border-sky-600' : ''
                            } ${m.isPinned ? 'bg-amber-50/60' : ''}`}
                          >
                            {/* Match Game Title & Date */}
                            <td className="py-2.5 px-3">
                              <div className="font-bold text-slate-900 text-xs hover:text-sky-700 flex items-center gap-1.5 flex-wrap">
                                <span>{m.eventName}</span>
                                {m.stime && (
                                  <span className="text-[10px] text-slate-500 font-normal">
                                    / {m.stime}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Indicators: In-Play (green dot), TV, Fancy (f), Bookmaker (BM), Virtual (controller) */}
                            <td className="py-2 px-1 text-center whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5 text-[11px]">
                                {m.inPlay && (
                                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm animate-pulse" title="In Play"></span>
                                )}
                                {m.tv && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveStreamMatch(m);
                                    }}
                                    className="p-0.5 hover:bg-slate-200 rounded transition text-slate-700 hover:text-sky-700"
                                    title="Watch Live Video Stream"
                                  >
                                    <Tv size={13} className="text-slate-700 hover:text-sky-700" />
                                  </button>
                                )}
                                {m.fancy && (
                                  <span className="w-4 h-4 rounded-full bg-slate-200 border border-slate-400 flex items-center justify-center font-bold text-[10px] text-slate-800" title="Fancy Market">
                                    f
                                  </span>
                                )}
                                {m.bm && (
                                  <span className="px-1 py-0.2 rounded bg-slate-200 border border-slate-400 font-bold text-[9px] text-slate-800" title="Bookmaker 0% Comm">
                                    BM
                                  </span>
                                )}
                                {m.isVirtual && (
                                  <Gamepad2 size={13} className="text-slate-600" title="Virtual Sports" />
                                )}
                              </div>
                            </td>

                            {/* Column 1 (Home Team) */}
                            {c1.suspended ? (
                              <td colSpan={2} className="py-1 px-1 bg-[#374151] border-l border-slate-300 text-center text-slate-300 shadow-inner">
                                <div className="flex items-center justify-center gap-1 text-xs py-1">
                                  <Lock size={14} className="text-slate-300" />
                                </div>
                              </td>
                            ) : (
                              <>
                                <td className="py-1 px-1 text-center border-l border-slate-200 w-14">
                                  <div className="bg-[#72bbef] hover:bg-[#5aaae6] text-slate-950 font-black text-xs py-1 rounded shadow-sm">
                                    {c1.back > 0 ? c1.back : '-'}
                                  </div>
                                </td>
                                <td className="py-1 px-1 text-center w-14">
                                  <div className="bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-xs py-1 rounded shadow-sm">
                                    {c1.lay > 0 ? c1.lay : '-'}
                                  </div>
                                </td>
                              </>
                            )}

                            {/* Column X (The Draw) */}
                            {!cX.exists ? (
                              <>
                                <td className="py-1 px-1 text-center border-l border-slate-200 w-14">
                                  <div className="bg-slate-100 text-slate-400 font-bold text-xs py-1 rounded">
                                    -
                                  </div>
                                </td>
                                <td className="py-1 px-1 text-center w-14">
                                  <div className="bg-slate-100 text-slate-400 font-bold text-xs py-1 rounded">
                                    -
                                  </div>
                                </td>
                              </>
                            ) : cX.suspended ? (
                              <td colSpan={2} className="py-1 px-1 bg-[#374151] border-l border-slate-300 text-center text-slate-300 shadow-inner">
                                <div className="flex items-center justify-center gap-1 text-xs py-1">
                                  <Lock size={14} className="text-slate-300" />
                                </div>
                              </td>
                            ) : (
                              <>
                                <td className="py-1 px-1 text-center border-l border-slate-200 w-14">
                                  <div className="bg-[#72bbef] hover:bg-[#5aaae6] text-slate-950 font-black text-xs py-1 rounded shadow-sm">
                                    {cX.back > 0 ? cX.back : '-'}
                                  </div>
                                </td>
                                <td className="py-1 px-1 text-center w-14">
                                  <div className="bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-xs py-1 rounded shadow-sm">
                                    {cX.lay > 0 ? cX.lay : '-'}
                                  </div>
                                </td>
                              </>
                            )}

                            {/* Column 2 (Away Team) */}
                            {c2.suspended ? (
                              <td colSpan={2} className="py-1 px-1 bg-[#374151] border-l border-slate-300 text-center text-slate-300 shadow-inner">
                                <div className="flex items-center justify-center gap-1 text-xs py-1">
                                  <Lock size={14} className="text-slate-300" />
                                </div>
                              </td>
                            ) : (
                              <>
                                <td className="py-1 px-1 text-center border-l border-slate-200 w-14">
                                  <div className="bg-[#72bbef] hover:bg-[#5aaae6] text-slate-950 font-black text-xs py-1 rounded shadow-sm">
                                    {c2.back > 0 ? c2.back : '-'}
                                  </div>
                                </td>
                                <td className="py-1 px-1 text-center w-14">
                                  <div className="bg-[#faa9ba] hover:bg-[#f294a8] text-slate-950 font-black text-xs py-1 rounded shadow-sm">
                                    {c2.lay > 0 ? c2.lay : '-'}
                                  </div>
                                </td>
                              </>
                            )}

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            </div>
          ) : (
            /* Casino Tables Grid with Exact 79 Tables matching Images 2 & 3 */
            <div className="p-3 flex flex-col flex-1">
              
              {/* Category Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-2 justify-between items-center pb-2.5 border-b border-slate-200 mb-3">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-thin">
                  {casinoCategories.map((cat, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedCasinoCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition ${
                        selectedCasinoCategory === cat 
                          ? 'bg-sky-600 text-white shadow font-black' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {cat === 'all' ? `All Tables (${casinoTables.length || 79})` : cat}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search casino tables..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-sky-500 font-medium"
                  />
                </div>
              </div>

              {/* Exact 79 Casino Tables Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 overflow-y-auto max-h-[750px] p-1 scrollbar-thin">
                {filteredCasinoTables
                  .filter(t => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.slug.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(t => (
                  <div
                    key={t.id || t.slug}
                    onClick={() => setActiveCasinoTable(t)}
                    style={{ minHeight: '250px', height: '250px' }}
                    className="bg-[#0f1d2a] border border-slate-700/80 hover:border-yellow-400 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group text-white relative flex flex-col justify-between select-none"
                  >
                    {/* Game Poster Artwork */}
                    <div 
                      style={{ height: '155px', minHeight: '155px' }} 
                      className="w-full shrink-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden flex items-center justify-center relative"
                    >
                      <img 
                        src={`https://cdn.926assets.com/g1-casino-icons/lc/${t.slug}.jpg`} 
                        alt={t.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          if (!e.target.dataset.triedProxy) {
                            e.target.dataset.triedProxy = 'true';
                            e.target.src = `/api/casino/image/${t.slug}`;
                          } else {
                            e.target.style.display = 'none';
                            e.target.parentElement.classList.add('fallback-poster');
                          }
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      <div className="absolute top-2 left-2 z-10">
                        <span className="text-[10px] bg-red-600/95 font-black px-1.5 py-0.5 rounded text-white uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                          LIVE
                        </span>
                      </div>
                      <div className="absolute top-2 right-2 z-10">
                        <span className="text-[9px] font-mono font-bold text-slate-200 bg-black/75 px-1.5 py-0.5 rounded shadow">
                          {t.slug}
                        </span>
                      </div>
                    </div>

                    {/* Dedicated Game Title & Category Bar */}
                    <div className="px-3 py-2 bg-[#0c1824] border-t border-slate-800 flex-1 flex flex-col justify-center">
                      <h4 className="font-extrabold text-xs sm:text-sm text-yellow-300 group-hover:text-yellow-200 leading-tight drop-shadow truncate">
                        {t.name}
                      </h4>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-semibold">
                        <span className="truncate">{t.category}</span>
                        <span className="font-mono text-slate-300">Min: {t.min || 100}</span>
                      </div>
                    </div>

                    {/* Card Footer Bar */}
                    <div 
                      style={{ height: '32px', minHeight: '32px' }} 
                      className="px-3 bg-gradient-to-r from-sky-700 via-sky-600 to-indigo-700 group-hover:from-yellow-500 group-hover:to-amber-600 group-hover:text-slate-950 text-white font-extrabold text-xs flex justify-between items-center transition-all shadow-inner"
                    >
                      <div className="flex items-center gap-1.5">
                        <Coins size={13} />
                        <span className="tracking-wide text-[11px]">BET NOW</span>
                      </div>
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

        </main>
      </div>

      {/* Live Stream Video Modal for Sports Match */}
      {activeStreamMatch && (
        <LiveStreamModal 
          match={activeStreamMatch} 
          onClose={() => setActiveStreamMatch(null)} 
        />
      )}

      {/* Casino Table Modal */}
      {activeCasinoTable && (
        <CasinoTableModal 
          table={activeCasinoTable} 
          onClose={() => setActiveCasinoTable(null)} 
        />
      )}

      {/* Settings / Upstream Session Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 border border-slate-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Settings size={16} className="text-sky-600" />
                <span>Diamond Upstream Live Config</span>
              </h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              D247 sync engine manages visitor handshakes and demo tokens automatically. You can also paste an active session token if needed.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Active g_token / Cookie:
                </label>
                <textarea
                  value={cookieInput}
                  onChange={(e) => setCookieInput(e.target.value)}
                  placeholder="g_token=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  rows={3}
                  className="w-full text-xs p-2 border border-slate-300 rounded focus:border-sky-500 focus:outline-none font-mono"
                />
              </div>

              {syncStatus && (
                <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 p-2 rounded border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle2 size={14} />
                  <span>{syncStatus}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    fetch('/api/config/refresh-demo', { method: 'POST' })
                      .then(r => r.json())
                      .then(d => setSyncStatus(d.message || 'Handshake successful!'));
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded"
                >
                  Auto Handshake
                </button>
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/config/session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ cookie: cookieInput.trim() })
                      });
                      const data = await res.json();
                      if (data.success) {
                        setSyncStatus('✅ Session connected! Upstream sync active.');
                        setTimeout(() => setShowSettings(false), 1200);
                      }
                    } catch {
                      setSyncStatus('❌ Error saving session');
                    }
                  }}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded shadow"
                >
                  Save & Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Commercial API Documentation Modal */}
      {showDocs && (
        <DocsModal onClose={() => setShowDocs(false)} />
      )}

      {/* Footer */}
      <footer className="bg-[#112435] text-slate-400 text-[11px] py-2 px-4 border-t border-slate-800 flex justify-between items-center select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>D247 Zero-Latency Upstream Engine Active & Synced</span>
          <button 
            onClick={() => setShowDocs(true)}
            className="text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 font-bold ml-2 pl-2 border-l border-slate-700"
          >
            <BookOpen size={12} />
            <span>API Docs (/docs)</span>
          </button>
        </div>
        <div className="font-mono text-[10px] text-slate-400">
          Sports: {inPlayMatches.length} | Casino: {casinoTables.length || 79} Tables
        </div>
      </footer>

    </div>
  );
}
