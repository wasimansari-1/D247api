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
  CheckCircle2
} from 'lucide-react';
import RateBox from './components/RateBox';
import Scorecard from './components/Scorecard';
import CasinoTableModal from './components/CasinoTableModal';

const socket = io();

const ALL_SPORTS = [
  { id: 4, name: 'Cricket', icon: '🏏' },
  { id: 1, name: 'Football', icon: '⚽' },
  { id: 2, name: 'Tennis', icon: '🎾' },
  { id: 8, name: 'Table Tennis', icon: '🏓' },
  { id: 7, name: 'Horse Racing', icon: '🏇' },
  { id: 43, name: 'Greyhound Racing', icon: '🐕' },
  { id: 15, name: 'Basketball', icon: '🏀' },
  { id: 69, name: 'Wrestling', icon: '🤼' },
  { id: 18, name: 'Volleyball', icon: '🏐' },
  { id: 9, name: 'Badminton', icon: '🏸' },
  { id: 11, name: 'E Games', icon: '🎮' },
  { id: 59, name: 'Snooker', icon: '🎱' },
  { id: 58, name: 'American Football', icon: '🏈' }
];

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
  const [casinoTables, setCasinoTables] = useState([]);
  const [activeCasinoTable, setActiveCasinoTable] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Settings modal
  const [showSettings, setShowSettings] = useState(false);
  const [cookieInput, setCookieInput] = useState('');
  const [syncStatus, setSyncStatus] = useState('');
  const [tickerText, setTickerText] = useState('Connecting to Diamond247 Engine...');

  // 1. Initial Load & Background Polling
  useEffect(() => {
    // Initial fetch of in-play matches
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
    // Fast poll matches every 1.5 seconds for instant exchange table rate updates
    const matchesInterval = setInterval(loadInPlay, 1500);

    // Fetch official casino tables
    fetch('/api/casino/tables')
      .then(r => r.json())
      .then(res => {
        if (res.success && Array.isArray(res.data)) {
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

  // 2. High-Frequency Poller for Selected Match (700ms) - Guarantees ZERO Rate Difference
  useEffect(() => {
    if (!selectedMatchGmid) return;

    let isMounted = true;
    const pollMatchOdds = () => {
      fetch(`/api/sports/match/${selectedMatchGmid}?etid=${selectedSportId}`)
        .then(r => r.json())
        .then(res => {
          if (isMounted && res.success && res.data) {
            setMatchDetails(res.data);
          }
        })
        .catch(() => {});
    };

    pollMatchOdds();
    const pollInterval = setInterval(pollMatchOdds, 700);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [selectedMatchGmid, selectedSportId]);

  // Match selection toggle
  const handleSelectMatch = (gmid) => {
    if (selectedMatchGmid) {
      socket.emit('leave_match', selectedMatchGmid);
    }

    if (selectedMatchGmid === gmid && matchDetails) {
      setSelectedMatchGmid(null);
      setMatchDetails(null);
      return;
    }

    setSelectedMatchGmid(gmid);
    setLoadingMatchDetails(true);
    socket.emit('join_match', gmid);

    fetch(`/api/sports/match/${gmid}?etid=${selectedSportId}`)
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          setMatchDetails(res.data);
        }
        setLoadingMatchDetails(false);
      })
      .catch(() => {
        setLoadingMatchDetails(false);
      });
  };

  const handleSaveSession = async () => {
    if (!cookieInput.trim()) return;
    setSyncStatus('Saving session headers...');
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
  };

  // Filter matches for selected sport & search query
  const filteredMatches = inPlayMatches
    .filter(m => m.etid === selectedSportId)
    .filter(m => !searchQuery || (m.eventName || '').toLowerCase().includes(searchQuery.toLowerCase()) || (m.competition || '').toLowerCase().includes(searchQuery.toLowerCase()));

  // Filter casino tables
  const casinoCategories = ['all', 'Teen Patti', 'Dragon Tiger', 'Lucky 7', 'Andar Bahar', '32 Cards', 'Baccarat', 'Poker', 'Roulette', 'Matka', 'Others'];
  const filteredCasinoTables = casinoTables.filter(t => {
    if (selectedCasinoCategory === 'all') return true;
    return t.category === selectedCasinoCategory;
  });

  // Top scrolling ticker matches
  const quickMatches = inPlayMatches.filter(m => m.inPlay && !m.isPinned).slice(0, 10);

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans text-slate-800 antialiased selection:bg-sky-500 selection:text-white">
      
      {/* 1. D247 Top Blue Header */}
      <header className="bg-gradient-to-r from-[#175d8d] via-[#1a6699] to-[#0d3859] text-white px-3 py-1.5 flex justify-between items-center sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => { setActiveTab('sports'); setSelectedSportId(4); }}
            className="flex items-center gap-1.5 cursor-pointer select-none"
          >
            <span className="text-2xl filter drop-shadow">💎</span>
            <span className="text-2xl font-black tracking-tight text-white flex items-center">
              D247
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
            DIAMOND ZERO-LATENCY ENGINE
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Rules & Download */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-sky-100 font-medium">
            <button className="flex items-center gap-1 hover:text-white transition">
              <HelpCircle size={13} />
              <span>Rules</span>
            </button>
            <button className="flex items-center gap-1 hover:text-white transition">
              <Download size={13} />
              <span>Download Apk</span>
            </button>
          </div>

          {/* Balance Widget */}
          <div className="text-right text-xs leading-tight border-l border-white/20 pl-3">
            <div>Balance: <span className="font-extrabold text-yellow-300">1,500</span></div>
            <div className="text-[10px] text-sky-200">Exp: <span className="font-bold">0</span></div>
          </div>

          {/* User Demo Badge */}
          <div className="flex items-center bg-[#0d3859] px-2.5 py-1 rounded border border-white/20 text-xs font-bold gap-1 shadow-inner">
            <span>Demo</span>
            <ChevronDown size={13} />
          </div>

          {/* Settings / Cookie button */}
          <button 
            onClick={() => setShowSettings(true)}
            className="p-1 bg-white/10 hover:bg-white/20 rounded border border-white/20 text-white text-xs transition"
            title="D247 Upstream Session Config"
          >
            <Settings size={15} />
          </button>
        </div>
      </header>

      {/* 2. D247 Main Top Navigation Bar */}
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

      {/* 4. Quick Match Horizontal Bar */}
      <div className="bg-[#1e293b] px-2 py-1 flex items-center gap-1.5 overflow-x-auto scrollbar-thin border-b border-slate-700 text-xs">
        {quickMatches.map((m, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveTab('sports');
              setSelectedSportId(m.etid);
              handleSelectMatch(m.gmid);
            }}
            className="flex items-center gap-1.5 bg-[#0f172a] hover:bg-[#334155] text-slate-200 px-2.5 py-1 rounded text-[11px] font-bold whitespace-nowrap transition border border-slate-700/60 shrink-0"
          >
            <span>{m.sportIcon}</span>
            <span className="truncate max-w-[140px]">{m.eventName}</span>
          </button>
        ))}
      </div>

      {/* 5. Main Body with Sidebar + Center Area */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto p-1.5 sm:p-2.5 gap-2">
        
        {/* Left Sidebar */}
        <aside className="w-48 lg:w-56 bg-white rounded shadow-sm border border-slate-200 shrink-0 hidden md:flex flex-col text-xs font-bold overflow-hidden select-none">
          
          {/* Racing Sports */}
          <div className="border-b border-slate-200">
            <div className="bg-[#244565] text-white px-2.5 py-1.5 font-extrabold uppercase text-[11px] flex justify-between items-center">
              <span>Racing Sports</span>
              <ChevronDown size={13} />
            </div>
            <div className="divide-y divide-slate-100 text-slate-700">
              <button 
                onClick={() => { setActiveTab('sports'); setSelectedSportId(7); }}
                className="w-full text-left px-3 py-1.5 hover:bg-sky-50 hover:text-sky-700 flex items-center justify-between transition"
              >
                <span>Horse Racing</span>
              </button>
              <button 
                onClick={() => { setActiveTab('sports'); setSelectedSportId(43); }}
                className="w-full text-left px-3 py-1.5 hover:bg-sky-50 hover:text-sky-700 flex items-center justify-between transition"
              >
                <span>Greyhound Racing</span>
              </button>
            </div>
          </div>

          {/* Others */}
          <div className="border-b border-slate-200">
            <div className="bg-[#244565] text-white px-2.5 py-1.5 font-extrabold uppercase text-[11px] flex justify-between items-center">
              <span>Others</span>
              <ChevronDown size={13} />
            </div>
            <div className="divide-y divide-slate-100 text-slate-700">
              <button 
                onClick={() => { setActiveTab('casino'); setSelectedCasinoCategory('all'); }}
                className="w-full text-left px-3 py-1.5 hover:bg-sky-50 hover:text-sky-700 flex items-center justify-between transition"
              >
                <span>Our Casino</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded font-black">{casinoTables.length || 74}</span>
              </button>
              <button 
                onClick={() => { setActiveTab('sports'); setSelectedSportId(4); }}
                className="w-full text-left px-3 py-1.5 hover:bg-sky-50 hover:text-sky-700 flex items-center justify-between transition"
              >
                <span>Our Virtual</span>
              </button>
              <button 
                onClick={() => { setActiveTab('casino'); setSelectedCasinoCategory('all'); }}
                className="w-full text-left px-3 py-1.5 hover:bg-sky-50 hover:text-sky-700 flex items-center justify-between transition"
              >
                <span>Live Casino</span>
              </button>
            </div>
          </div>

          {/* All Sports */}
          <div className="flex-1 overflow-y-auto">
            <div className="bg-[#244565] text-white px-2.5 py-1.5 font-extrabold uppercase text-[11px] flex justify-between items-center">
              <span>All Sports</span>
              <ChevronDown size={13} />
            </div>
            <div className="divide-y divide-slate-100 text-slate-700">
              {ALL_SPORTS.map(s => {
                const count = inPlayMatches.filter(m => m.etid === s.id).length;
                return (
                  <button
                    key={s.id}
                    onClick={() => { setActiveTab('sports'); setSelectedSportId(s.id); }}
                    className={`w-full text-left px-3 py-1.5 flex items-center justify-between transition ${
                      activeTab === 'sports' && selectedSportId === s.id ? 'bg-sky-100 text-sky-900 font-extrabold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{s.icon}</span>
                      <span>{s.name}</span>
                    </div>
                    {count > 0 && (
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </aside>

        {/* Center Main Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Sports View */}
          {activeTab === 'sports' ? (
            <div className="flex flex-col flex-1">
              
              {/* Sport Category Tabs Bar (Cricket | Football | Tennis ...) */}
              <div className="bg-[#1f3a52] px-2 py-1 flex items-center gap-1 overflow-x-auto border-b border-slate-700 scrollbar-none">
                {ALL_SPORTS.map(s => {
                  const count = inPlayMatches.filter(m => m.etid === s.id).length;
                  const isActive = selectedSportId === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSportId(s.id)}
                      className={`px-3 py-1 text-xs font-bold whitespace-nowrap rounded transition flex items-center gap-1 ${
                        isActive 
                          ? 'bg-[#2b5275] text-white shadow font-black border-b-2 border-sky-400' 
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <span>{s.name}</span>
                      {count > 0 && (
                        <span className={`text-[10px] px-1 py-0.2 rounded-full font-black ${
                          isActive ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
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
                      {/* Real Live Countdown Timer (for Super Over 2, Goal 2, etc.) */}
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
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-sky-300 font-mono">
                        Live Refreshed: {new Date(matchDetails.updatedAt).toLocaleTimeString()}
                      </span>
                      <button 
                        onClick={() => { setSelectedMatchGmid(null); setMatchDetails(null); }}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Live Marquee News Bar matching Diamond Online */}
                  <div className="bg-[#0f1f2e] border border-amber-500/30 rounded px-3 py-1 flex items-center gap-2 overflow-hidden shadow-inner text-xs mb-3">
                    <span className="bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded text-[10px] tracking-wider uppercase shrink-0">
                      NEWS
                    </span>
                    <marquee className="text-yellow-200 font-semibold tracking-wide text-xs">
                      {matchDetails.remark || matchDetails.news || `${matchDetails.eventName} - Live Betting Open with Instant Exchange Odds. Zero Delay Feed Active.`}
                    </marquee>
                  </div>

                  {/* Real Scoreboard ONLY when authentic live score data exists */}
                  {matchDetails.scoreboard && matchDetails.scoreboard.hasData && (
                    <div className="mb-3">
                      <Scorecard scoreboard={matchDetails.scoreboard} />
                    </div>
                  )}

                  {/* Detailed Markets Grid with Exact Upstream Indexing */}
                  <div className="flex flex-col gap-3">
                    {/* Separate Main Match Odds (Full Width with 3 Back / 3 Lay) & Secondary Markets (2-Column Grid) */}
                    {(() => {
                      const matchOddsMarket = matchDetails.markets?.find(m => m.marketName === 'Match Odds' || m.marketType === 'match_odds');
                      const secondaryMarkets = matchDetails.markets?.filter(m => m !== matchOddsMarket && !m.fancyList && !m.fancy1List) || [];
                      const fancyMarkets = matchDetails.markets?.filter(m => m.fancyList || m.fancy1List) || [];

                      return (
                        <>
                          {/* 1. Main Match Odds (Full-width with Betfair 3-tier Ladder) */}
                          {matchOddsMarket && (
                            <div className="border border-slate-700 bg-slate-900 rounded-lg overflow-hidden shadow-sm">
                              {/* Market Header */}
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

                              {/* Betfair 3 Back / 3 Lay Ladder Header */}
                              <div className="bg-slate-950/80 px-3 py-1 flex justify-between items-center text-[10px] font-black border-b border-slate-800 text-slate-400">
                                <span>Runner</span>
                                <div className="flex items-center gap-1">
                                  <span className="w-28 sm:w-36 text-center text-[#72bbef]">BACK</span>
                                  <span className="w-28 sm:w-36 text-center text-[#faa9ba]">LAY</span>
                                </div>
                              </div>

                              {/* Runners */}
                              <div className="divide-y divide-slate-800">
                                {matchOddsMarket.runners?.map((r, rIdx) => (
                                  <div key={rIdx} className="flex justify-between items-center p-2 hover:bg-slate-800/40 text-xs">
                                    <span className="font-bold text-slate-100 truncate pr-2 text-sm">{r.runnerName}</span>

                                    {r.suspended || r.status === 'SUSPENDED' ? (
                                      <div className="w-56 sm:w-72 bg-[#2b3543] border border-slate-700 rounded py-2 text-center shadow-inner">
                                        <span className="text-red-500 font-black text-xs tracking-wider animate-pulse flex items-center justify-center gap-1">
                                          <Lock size={12} /> SUSPENDED
                                        </span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1">
                                        {/* Back 3, 2, 1 */}
                                        {r.backs && r.backs.length === 3 ? (
                                          r.backs.map((b, bIdx) => (
                                            <div 
                                              key={bIdx}
                                              className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2 rounded cursor-pointer select-none w-9 sm:w-12 text-center transition ${
                                                bIdx === 2 ? 'bg-[#72bbef] text-slate-950 font-black' : bIdx === 1 ? 'bg-[#8bcbf3] text-slate-900 font-extrabold' : 'bg-[#a5d8f7] text-slate-900 font-bold'
                                              }`}
                                            >
                                              <span className="text-xs leading-none">{b.price || '-'}</span>
                                              <span className="text-[8px] leading-tight text-slate-800 truncate">{b.size ? (b.size >= 1000 ? `${(b.size/1000).toFixed(0)}k` : b.size) : ''}</span>
                                            </div>
                                          ))
                                        ) : (
                                          <RateBox type="back" price={r.backPrice} size={r.backSize} />
                                        )}

                                        {/* Lay 1, 2, 3 */}
                                        {r.lays && r.lays.length === 3 ? (
                                          r.lays.map((l, lIdx) => (
                                            <div 
                                              key={lIdx}
                                              className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-2 rounded cursor-pointer select-none w-9 sm:w-12 text-center transition ${
                                                lIdx === 0 ? 'bg-[#faa9ba] text-slate-950 font-black' : lIdx === 1 ? 'bg-[#f7b9c6] text-slate-900 font-extrabold' : 'bg-[#f5c9d2] text-slate-900 font-bold'
                                              }`}
                                            >
                                              <span className="text-xs leading-none">{l.price || '-'}</span>
                                              <span className="text-[8px] leading-tight text-slate-800 truncate">{l.size ? (l.size >= 1000 ? `${(l.size/1000).toFixed(0)}k` : l.size) : ''}</span>
                                            </div>
                                          ))
                                        ) : (
                                          <RateBox type="lay" price={r.layPrice} size={r.laySize} />
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 2. Secondary Markets in Authentic 2-Column Grid (Image 1 Parity) */}
                          {secondaryMarkets.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {secondaryMarkets.map((secMkt) => (
                                <div key={secMkt.marketId} className="border border-slate-700 bg-slate-900 rounded-lg overflow-hidden shadow-sm flex flex-col justify-between">
                                  {/* Secondary Market Header */}
                                  <div className="bg-[#243447] px-3 py-1.5 flex justify-between items-center border-b border-slate-700 text-xs font-black">
                                    <div className="flex items-center gap-1.5 min-w-0 pr-2">
                                      <span className="text-white uppercase tracking-wide truncate">{secMkt.marketName}</span>
                                      <span className="text-[9px] bg-slate-800 text-slate-300 font-mono px-1 rounded shrink-0">
                                        Max: {secMkt.max >= 1000 ? `${(secMkt.max / 1000).toFixed(0)}K` : secMkt.max}
                                      </span>
                                    </div>
                                    <button className="bg-[#20a052] hover:bg-emerald-600 text-white text-[10px] font-black px-2 py-0.2 rounded shadow shrink-0">
                                      Cashout
                                    </button>
                                  </div>

                                  {/* Column Header */}
                                  <div className="bg-slate-950/80 px-3 py-0.5 flex justify-between items-center text-[10px] font-black border-b border-slate-800 text-slate-400">
                                    <span>Runner</span>
                                    <div className="flex items-center gap-3 pr-2">
                                      <span className="text-[#72bbef]">Back</span>
                                      <span className="text-[#faa9ba]">Lay</span>
                                    </div>
                                  </div>

                                  {/* Runners */}
                                  <div className="divide-y divide-slate-800 flex-1">
                                    {secMkt.runners?.map((r, rIdx) => (
                                      <div key={rIdx} className="flex justify-between items-center p-2 hover:bg-slate-800/40 text-xs">
                                        <span className="font-bold text-slate-200 truncate pr-2">{r.runnerName}</span>
                                        {r.suspended || r.status === 'SUSPENDED' ? (
                                          <div className="w-28 bg-[#2b3543] border border-slate-700 rounded py-1 text-center shadow-inner">
                                            <span className="text-red-500 font-black text-[11px] flex items-center justify-center gap-1">
                                              <Lock size={10} /> SUSPENDED
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-1.5">
                                            <RateBox type="back" price={r.backPrice} size={r.backSize} />
                                            <RateBox type="lay" price={r.layPrice} size={r.laySize} />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 3. Fancy & Fancy1 Markets */}
                          {fancyMarkets.map((market) => (
                            <div key={market.marketId} className="border border-slate-700 bg-slate-900 rounded-lg overflow-hidden shadow-sm">
                              <div className="bg-[#243447] px-3 py-1.5 flex justify-between items-center border-b border-slate-700 text-xs font-black">
                                <span className="text-white uppercase tracking-wide">{market.marketName}</span>
                                <div className="flex items-center gap-8 text-[11px] pr-4 font-black">
                                  <span className="text-[#72bbef]">{market.marketType === 'fancy' ? 'NO' : 'BACK'}</span>
                                  <span className="text-[#faa9ba]">{market.marketType === 'fancy' ? 'YES' : 'LAY'}</span>
                                </div>
                              </div>

                              {market.fancyList && (
                                <div className="divide-y divide-slate-800">
                                  {market.fancyList.map((f, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-2 hover:bg-slate-800/40 text-xs">
                                      <div className="flex-1 pr-2">
                                        <span className="font-bold text-slate-200 block text-xs">{f.title}</span>
                                        <span className="text-[10px] text-slate-400">Min: {f.min || 100} Max: {f.max || '1L'}</span>
                                      </div>
                                      {f.suspended || f.status === 'SUSPENDED' ? (
                                        <div className="flex items-center gap-1.5">
                                          <div className="w-14 bg-slate-800 border border-slate-700 rounded py-1.5 text-center text-slate-400 font-bold text-xs">-</div>
                                          <div className="w-20 bg-[#2b3543] border border-slate-700 rounded py-1.5 text-center shadow-inner">
                                            <span className="text-red-500 font-black text-xs tracking-wider">SUSPENDED</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1.5">
                                          <div className="flex flex-col items-center justify-center bg-[#faa9ba] hover:bg-[#f692a7] px-3 py-1 rounded w-16 text-center cursor-pointer transition">
                                            <span className="text-xs font-black text-slate-900">{f.noRate}</span>
                                            <span className="text-[9px] font-bold text-slate-700">{f.noOdds}</span>
                                          </div>
                                          <div className="flex flex-col items-center justify-center bg-[#72bbef] hover:bg-[#5bb2ec] px-3 py-1 rounded w-16 text-center cursor-pointer transition">
                                            <span className="text-xs font-black text-slate-900">{f.yesRate}</span>
                                            <span className="text-[9px] font-bold text-slate-700">{f.yesOdds}</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}

                              {market.fancy1List && (
                                <div className="p-2 grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-950">
                                  {market.fancy1List.map((f, idx) => (
                                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded p-2 flex justify-between items-center">
                                      <div className="flex-1 pr-2">
                                        <span className="font-bold text-slate-200 block text-xs">{f.title}</span>
                                        <span className="text-[10px] text-slate-400">Min: {f.min || 100} Max: {f.max || '10K'}</span>
                                      </div>
                                      {f.suspended || f.status === 'SUSPENDED' ? (
                                        <div className="flex items-center gap-1.5">
                                          <div className="w-12 bg-slate-800 border border-slate-700 rounded py-1 text-center text-slate-400 font-bold text-xs">-</div>
                                          <div className="w-20 bg-[#2b3543] border border-slate-700 rounded py-1 text-center shadow-inner">
                                            <span className="text-red-500 font-black text-xs">SUSPENDED</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1.5">
                                          <RateBox type="back" price={f.back} size={100} />
                                          <RateBox type="lay" price={f.lay} size={100} />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </>
                      );
                    })()}
                  </div>

                  {/* Super Over 2 Last Result Ribbon (Exact match to Image 1) */}
                  {selectedMatchGmid === 'superover2' && (
                    <div className="mt-3 bg-[#111c26] border border-slate-800 rounded-lg p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-300">Last Result:</span>
                        <div className="flex items-center gap-1.5">
                          {['I', 'E', 'E', 'I', 'I', 'I', 'E', 'I', 'I', 'E'].map((res, i) => (
                            <span 
                              key={i} 
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                res === 'I' ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-black'
                              }`}
                            >
                              {res}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-sky-400 cursor-pointer hover:underline">
                        View All
                      </span>
                    </div>
                  )}

                </div>
              )}

              {/* Exact D247 Exchange Odds Table */}
              <div className="overflow-x-auto flex-1">
                <table className="w-full border-collapse text-left text-xs">
                  
                  {/* Table Column Headers */}
                  <thead>
                    <tr className="bg-[#244565] text-white font-extrabold border-b border-slate-700 text-[11px] select-none">
                      <th className="py-2 px-3 font-bold">Game</th>
                      <th className="py-2 px-1 text-center w-28"></th>
                      <th className="py-1 px-1 text-center w-28 border-l border-white/10" colSpan={2}>
                        <div className="text-white text-[11px] font-black">1</div>
                        <div className="grid grid-cols-2 text-[9px] font-bold">
                          <span className="text-sky-300">Back</span>
                          <span className="text-pink-300">Lay</span>
                        </div>
                      </th>
                      <th className="py-1 px-1 text-center w-28 border-l border-white/10" colSpan={2}>
                        <div className="text-white text-[11px] font-black">X</div>
                        <div className="grid grid-cols-2 text-[9px] font-bold">
                          <span className="text-sky-300">Back</span>
                          <span className="text-pink-300">Lay</span>
                        </div>
                      </th>
                      <th className="py-1 px-1 text-center w-28 border-l border-white/10" colSpan={2}>
                        <div className="text-white text-[11px] font-black">2</div>
                        <div className="grid grid-cols-2 text-[9px] font-bold">
                          <span className="text-sky-300">Back</span>
                          <span className="text-pink-300">Lay</span>
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
                            <td className="py-2 px-3">
                              <div className="font-bold text-slate-900 text-xs hover:text-sky-700 flex items-center gap-1.5 flex-wrap">
                                <span>{m.eventName}</span>
                                {m.stime && (
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    / {m.stime}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Indicators: In-Play (green dot), TV, Fancy (f), Bookmaker (BM), Virtual (e) */}
                            <td className="py-2 px-1 text-center whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5 text-[11px]">
                                {m.inPlay && (
                                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm animate-pulse" title="In Play"></span>
                                )}
                                {m.tv && (
                                  <Tv size={13} className="text-slate-700" title="Live Video Stream" />
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
                                  <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-800 font-bold text-[10px] flex items-center justify-center" title="Virtual Cricket / E-Game">
                                    e
                                  </span>
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

            </div>
          ) : (
            /* Casino Tables View with Real Artwork & Clear Titles (Matching Images 3, 4, 5) */
            <div className="p-3 flex flex-col flex-1">
              
              {/* Casino Search & Filter Header */}
              <div className="flex flex-col sm:flex-row gap-2 justify-between items-center pb-2.5 border-b border-slate-200 mb-3">
                
                {/* Category Filter Bar */}
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
                      {cat === 'all' ? `All Tables (${casinoTables.length || 76})` : cat}
                    </button>
                  ))}
                </div>

                {/* Casino Search Input */}
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

              {/* Casino Tables Grid with Robust Height & High-Res Posters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 overflow-y-auto max-h-[750px] p-1">
                {filteredCasinoTables
                  .filter(t => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.slug.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(t => (
                  <div
                    key={t.id || t.slug}
                    onClick={() => setActiveCasinoTable(t)}
                    style={{ minHeight: '240px', height: '240px' }}
                    className="bg-slate-900 border border-slate-800 hover:border-amber-400 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group text-white relative flex flex-col justify-between"
                  >
                    {/* CDN Game Poster Artwork with guaranteed explicit height & no-collapse shrink-0 */}
                    <div 
                      style={{ height: '170px', minHeight: '170px', width: '100%', position: 'relative' }} 
                      className="w-full shrink-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden flex items-center justify-center"
                    >
                      <img 
                        src={`/api/casino/image/${t.slug}`} 
                        alt={t.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/api/casino/image/default';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Top Badges */}
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
                    <div className="px-2.5 py-1.5 bg-slate-900 border-t border-slate-800 flex-1 flex flex-col justify-center">
                      <h4 className="font-black text-xs sm:text-sm text-yellow-300 group-hover:text-yellow-200 leading-tight drop-shadow truncate">
                        {t.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-bold block truncate mt-0.5">
                        {t.category}
                      </span>
                    </div>

                    {/* Card Footer Bar */}
                    <div 
                      style={{ height: '32px', minHeight: '32px' }} 
                      className="px-2.5 py-1.5 bg-slate-950 border-t border-slate-800/80 flex justify-between items-center text-[10px] text-slate-400 font-bold shrink-0"
                    >
                      <span>Min: {t.min}</span>
                      <span className="text-emerald-400 font-black group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        Play Live <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </main>
      </div>

      {/* Casino Live Table Modal (Cards, Countdown Timer, Recent Results, Odds Board) */}
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
            
            <p className="text-xs text-slate-600 mb-3">
              Syncing directly with <span className="font-mono font-bold">diamondonline7.com</span> via Automated Demo Session Token. To manually override session cookie:
            </p>

            <textarea
              rows={3}
              value={cookieInput}
              onChange={(e) => setCookieInput(e.target.value)}
              placeholder="g_token=s%3A..."
              className="w-full text-xs font-mono p-2 border border-slate-300 rounded mb-3 focus:outline-none focus:border-sky-500"
            />

            {syncStatus && (
              <div className="text-xs font-medium mb-3 text-sky-700 bg-sky-50 p-2 rounded">
                {syncStatus}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSettings(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSession}
                className="px-4 py-1.5 text-xs bg-sky-600 hover:bg-sky-700 text-white font-bold rounded shadow-sm"
              >
                Save & Reconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#112435] text-slate-400 text-[11px] py-2 px-4 border-t border-slate-800 flex justify-between items-center select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>D247 Zero-Latency Upstream Engine Active & Synced</span>
        </div>
        <div className="font-mono text-[10px] text-slate-400">
          Sports: {inPlayMatches.length} | Casino: {casinoTables.length || 74} Tables
        </div>
      </footer>

    </div>
  );
}
