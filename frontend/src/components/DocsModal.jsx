import React, { useState } from 'react';
import { 
  X, Copy, Check, Terminal, ExternalLink, Download, 
  Activity, Play, ShieldCheck, Database, Zap, BookOpen, 
  Layers, Radio, Code2, Server, CheckCircle2
} from 'lucide-react';

export default function DocsModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('sports'); // 'intro' | 'sports' | 'casino' | 'websocket' | 'code'
  const [copiedId, setCopiedId] = useState(null);
  const [liveTestResults, setLiveTestResults] = useState({});
  const [testingEndpoint, setTestingEndpoint] = useState(null);

  const baseUrl = window.location.origin;

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const runLiveTest = async (path, id) => {
    setTestingEndpoint(id);
    try {
      const res = await fetch(path);
      const data = await res.json();
      setLiveTestResults(prev => ({ ...prev, [id]: data }));
    } catch (err) {
      setLiveTestResults(prev => ({ ...prev, [id]: { error: err.message } }));
    } finally {
      setTestingEndpoint(null);
    }
  };

  const sportsEndpoints = [
    {
      id: 'sp-tree',
      method: 'GET',
      path: '/api/sports/tree',
      title: 'Complete 37 Sports Navigation Tree',
      desc: 'Retrieves complete hierarchy of all 37 sports, international leagues, and in-play competitions.',
      sampleParams: 'None required',
      exampleUrl: '/api/sports/tree'
    },
    {
      id: 'sp-inplay',
      method: 'GET',
      path: '/api/sports/in-play',
      title: 'All In-Play Sports Events',
      desc: 'Real-time feed of all currently active matches with live 1-X-2 rates, current score, and status.',
      sampleParams: 'None required',
      exampleUrl: '/api/sports/in-play'
    },
    {
      id: 'sp-match',
      method: 'GET',
      path: '/api/sports/match/:gmid?etid=4',
      title: 'Live Match Odds & Full Market Depth',
      desc: '3-tier Back/Lay market ladder, Bookmaker odds, Fancy markets, runner status, and min/max limits.',
      sampleParams: 'gmid: Event ID (path), etid: Sport Event Type ID (query, default 4)',
      exampleUrl: '/api/sports/match/superover2?etid=4'
    },
    {
      id: 'sp-racing',
      method: 'GET',
      path: '/api/sports/racing/:etid',
      title: 'Horse Racing & Greyhound Meeting Grid',
      desc: 'Complete Country -> Track -> Race Meeting hierarchy for Horse Racing (10) and Greyhound (65).',
      sampleParams: 'etid: 10 (Horse Racing) or 65 (Greyhound Racing)',
      exampleUrl: '/api/sports/racing/10'
    },
    {
      id: 'sp-scorecard',
      method: 'GET',
      path: '/api/sports/scorecard/:gmid',
      title: 'Real-Time Sports Scorecard',
      desc: 'Live ball commentary, runs, overs, wickets, run rates, and chase target for cricket matches.',
      sampleParams: 'gmid: Match Event ID',
      exampleUrl: '/api/sports/scorecard/superover2'
    },
    {
      id: 'sp-stream',
      method: 'GET',
      path: '/api/sports/:gmid/stream',
      title: 'Live Sports TV Broadcast Stream',
      desc: 'Playable video stream URLs and multi-CDN streaming sources for active matches.',
      sampleParams: 'gmid: Match Event ID',
      exampleUrl: '/api/sports/superover2/stream'
    }
  ];

  const casinoEndpoints = [
    {
      id: 'cs-tables',
      method: 'GET',
      path: '/api/casino/tables',
      title: '79+ Official Casino Tables Directory',
      desc: 'Complete directory of 79 official casino tables with categories, slugs, dserver, and betting limits.',
      sampleParams: 'None required',
      exampleUrl: '/api/casino/tables'
    },
    {
      id: 'cs-round',
      method: 'GET',
      path: '/api/casino/round/:slug',
      title: 'Live Casino Round (Cards, Dice, Flip Clock Timer, Odds)',
      desc: 'High-frequency live round state: real cards dealt, 3D dice, roulette ball, countdown timer, and runners.',
      sampleParams: 'slug: Table identifier (e.g. mogambo, teen, dt20, lucky7, card32, etc.)',
      exampleUrl: '/api/casino/round/mogambo'
    },
    {
      id: 'cs-results',
      method: 'GET',
      path: '/api/casino/results/:slug',
      title: 'Casino Recent Results History Matrix',
      desc: 'Official winner history matrix of past rounds for trends, breadcrumbs, and stats.',
      sampleParams: 'slug: Table identifier',
      exampleUrl: '/api/casino/results/teen20'
    },
    {
      id: 'cs-player',
      method: 'GET',
      path: '/api/casino/player/:slug',
      title: 'Embeddable Live Video Player (Zero CORS/X-Frame-Options)',
      desc: 'Clean standalone HTML5 video player. Can be embedded in any external iframe or mobile webview.',
      sampleParams: 'slug: Table identifier',
      exampleUrl: '/api/casino/player/mogambo'
    },
    {
      id: 'cs-image',
      method: 'GET',
      path: '/api/casino/image/:slug',
      title: 'Casino Table Artwork CDN Proxy',
      desc: 'High-definition authentic dealer graphics and game banner artwork with 24h edge cache.',
      sampleParams: 'slug: Table identifier (e.g. dolidana, mogambo, teen20)',
      exampleUrl: '/api/casino/image/mogambo'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fade-in text-white">
      <div className="bg-[#0b1726] border border-slate-700 w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col h-[92vh] overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-[#112435] px-5 py-3.5 flex flex-wrap justify-between items-center border-b border-slate-700 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg text-white">D247 Exchange API Documentation</h2>
                <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full">
                  v2.0.0 ENTERPRISE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Commercial API Reference • Zero-Latency Feeds • Redis Pipeline • Socket.IO WebSockets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/docs/postman"
              download
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1e3a5f] hover:bg-[#284d7d] text-sky-200 border border-sky-400/30 rounded-lg text-xs font-bold transition shadow-sm"
              title="Download Postman Collection"
            >
              <Download size={14} />
              <span>Download Postman</span>
            </a>

            <button
              onClick={() => copyToClipboard(baseUrl, 'baseurl')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-lg text-xs font-mono font-bold transition"
            >
              {copiedId === 'baseurl' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{baseUrl}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition ml-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Body with Left Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Navigation Sidebar */}
          <div className="w-56 bg-[#07101a] border-r border-slate-800 p-3 flex flex-col gap-1 shrink-0 overflow-y-auto">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 px-3 py-1.5">
              API CATEGORIES
            </div>

            <button
              onClick={() => setActiveTab('intro')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition text-left ${
                activeTab === 'intro' ? 'bg-sky-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Zap size={15} />
              <span>Architecture & Speed</span>
            </button>

            <button
              onClick={() => setActiveTab('sports')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition text-left ${
                activeTab === 'sports' ? 'bg-sky-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Activity size={15} />
              <span>37 Sports & Racing</span>
            </button>

            <button
              onClick={() => setActiveTab('casino')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition text-left ${
                activeTab === 'casino' ? 'bg-sky-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Layers size={15} />
              <span>Casino (79 Tables)</span>
            </button>

            <button
              onClick={() => setActiveTab('websocket')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition text-left ${
                activeTab === 'websocket' ? 'bg-sky-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Radio size={15} />
              <span>Socket.IO Live Push</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition text-left ${
                activeTab === 'code' ? 'bg-sky-600 text-white shadow' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Code2 size={15} />
              <span>Code Snippets</span>
            </button>

            <div className="mt-auto pt-3 border-t border-slate-800">
              <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800 text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                  <ShieldCheck size={14} />
                  <span>COMMERCIAL READY</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  High-capacity concurrent streaming. Unrestricted partner integration.
                </p>
              </div>
            </div>
          </div>

          {/* Right Main Detail Pane */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            
            {/* TAB 1: INTRO & ARCHITECTURE */}
            {activeTab === 'intro' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Zap className="text-yellow-400" size={20} />
                    High-Frequency Zero-Latency Architecture
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    D247 provides direct, low-latency market data mirroring official Diamond Exchange pricing. All endpoints are protected by an automated upstream token renewal cycle and a dual-tier in-memory Redis caching pipeline.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-[#112435] border border-slate-700/80 rounded-xl p-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                      <Database size={18} />
                    </div>
                    <h4 className="font-bold text-xs text-white">0.001s In-Memory RAM</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      In-memory LRU storage delivers instant sub-millisecond responses without hitting upstream origin servers.
                    </p>
                  </div>

                  <div className="bg-[#112435] border border-slate-700/80 rounded-xl p-4">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center mb-2">
                      <Server size={18} />
                    </div>
                    <h4 className="font-bold text-xs text-white">Auto Session Renewal</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Background scheduler rotates and renews demo access tokens every 30 minutes with zero downtime.
                    </p>
                  </div>

                  <div className="bg-[#112435] border border-slate-700/80 rounded-xl p-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
                      <Radio size={18} />
                    </div>
                    <h4 className="font-bold text-xs text-white">WebSocket Push Feeds</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Socket.IO pushes rate updates instantly whenever back/lay prices fluctuate on upstream exchange.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                  <h4 className="text-xs font-black uppercase text-yellow-400 tracking-wider mb-2">
                    Commercial Authentication & Headers
                  </h4>
                  <p className="text-xs text-slate-300 mb-3">
                    Requests can be made directly using standard HTTP GET requests. No API key required for public partner integration.
                  </p>
                  <div className="bg-black/60 rounded-lg p-3 font-mono text-xs text-slate-300">
                    <div>Host: {baseUrl.replace(/^https?:\/\//, '')}</div>
                    <div>Accept: application/json</div>
                    <div>Connection: keep-alive</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2 & 3: SPORTS & CASINO ENDPOINTS */}
            {(activeTab === 'sports' || activeTab === 'casino') && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-black text-white">
                    {activeTab === 'sports' ? 'Sports & Racing Endpoints' : 'Live Casino (79 Tables) Endpoints'}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Base URL: <code className="text-sky-300 font-mono">{baseUrl}</code>
                  </span>
                </div>

                <div className="space-y-3">
                  {(activeTab === 'sports' ? sportsEndpoints : casinoEndpoints).map(ep => (
                    <div key={ep.id} className="bg-[#112435] border border-slate-700 rounded-xl p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
                            {ep.method}
                          </span>
                          <span className="font-mono text-xs sm:text-sm font-bold text-white bg-slate-900 px-2.5 py-1 rounded border border-slate-700">
                            {ep.path}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => runLiveTest(ep.exampleUrl, ep.id)}
                            disabled={testingEndpoint === ep.id}
                            className="flex items-center gap-1 px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold transition shadow-sm disabled:opacity-50"
                          >
                            <Play size={12} />
                            <span>{testingEndpoint === ep.id ? 'Testing...' : 'Test Live'}</span>
                          </button>

                          <button
                            onClick={() => copyToClipboard(`${baseUrl}${ep.exampleUrl}`, ep.id)}
                            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded transition"
                            title="Copy Endpoint URL"
                          >
                            {copiedId === ep.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-white">{ep.title}</div>
                        <div className="text-[11px] text-slate-300 mt-0.5">{ep.desc}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-1">
                          Parameters: {ep.sampleParams}
                        </div>
                      </div>

                      {/* Live Test Result Output Box */}
                      {liveTestResults[ep.id] && (
                        <div className="bg-black/80 border border-slate-700 rounded-lg p-3 mt-2">
                          <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-slate-400">
                            <span className="text-emerald-400">● LIVE RESPONSE (STATUS: 200 OK)</span>
                            <button 
                              onClick={() => copyToClipboard(JSON.stringify(liveTestResults[ep.id], null, 2), `${ep.id}-res`)}
                              className="hover:text-white"
                            >
                              {copiedId === `${ep.id}-res` ? 'Copied!' : 'Copy JSON'}
                            </button>
                          </div>
                          <pre className="text-[11px] font-mono text-sky-200 max-h-48 overflow-y-auto overflow-x-auto scrollbar-thin">
                            {JSON.stringify(liveTestResults[ep.id], null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: WEBSOCKET PROTOCOL */}
            {activeTab === 'websocket' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Radio className="text-emerald-400" size={20} />
                    Socket.IO Realtime WebSocket Protocol
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Connect directly to the WebSocket server for continuous, zero-latency rate streaming without polling.
                  </p>
                </div>

                <div className="bg-[#112435] border border-slate-700 rounded-xl p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase bg-purple-500/20 text-purple-400 border border-purple-500/40 font-mono">
                      WS
                    </span>
                    <span className="font-mono text-xs font-bold text-white bg-slate-900 px-2 py-1 rounded border border-slate-700">
                      {baseUrl}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800">
                      <div className="text-xs font-bold text-sky-400">1. Subscribe to Match (`join_match`)</div>
                      <div className="text-[11px] text-slate-300 mt-1">
                        Send the match or casino table ID to begin receiving real-time ticks.
                      </div>
                      <pre className="mt-2 text-xs font-mono text-emerald-300 bg-black/60 p-2.5 rounded">
{`const socket = io('${baseUrl}');
socket.emit('join_match', 'superover2');`}
                      </pre>
                    </div>

                    <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800">
                      <div className="text-xs font-bold text-sky-400">2. Receive Live Rates (`odds_update`)</div>
                      <div className="text-[11px] text-slate-300 mt-1">
                        Triggered whenever prices, timer, or dealt cards update on the table.
                      </div>
                      <pre className="mt-2 text-xs font-mono text-emerald-300 bg-black/60 p-2.5 rounded">
{`socket.on('odds_update', (data) => {
  console.log('Match ID:', data.gmid);
  console.log('Markets:', data.markets);
  console.log('Scoreboard / Cards:', data.scoreboard);
});`}
                      </pre>
                    </div>

                    <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800">
                      <div className="text-xs font-bold text-sky-400">3. Unsubscribe (`leave_match`)</div>
                      <pre className="mt-2 text-xs font-mono text-emerald-300 bg-black/60 p-2.5 rounded">
{`socket.emit('leave_match', 'superover2');`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: CODE SNIPPETS */}
            {activeTab === 'code' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Code2 className="text-sky-400" size={20} />
                    Ready-to-Use Code Snippets
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Copy and paste into your project to start consuming D247 exchange feeds immediately.
                  </p>
                </div>

                {/* cURL */}
                <div className="bg-[#112435] border border-slate-700 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-yellow-400 font-mono">cURL Command</span>
                    <button 
                      onClick={() => copyToClipboard(`curl -X GET "${baseUrl}/api/casino/round/mogambo" -H "Accept: application/json"`, 'curl')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedId === 'curl' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="bg-black/60 p-3 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto">
{`curl -X GET "${baseUrl}/api/casino/round/mogambo" \\
  -H "Accept: application/json"`}
                  </pre>
                </div>

                {/* Node.js */}
                <div className="bg-[#112435] border border-slate-700 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-emerald-400 font-mono">Node.js / Express</span>
                    <button 
                      onClick={() => copyToClipboard(`const axios = require('axios');
async function fetchRound() {
  const { data } = await axios.get('${baseUrl}/api/casino/round/mogambo');
  console.log(data);
}
fetchRound();`, 'node')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedId === 'node' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="bg-black/60 p-3 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto">
{`const axios = require('axios');

async function getLiveCasinoRound(slug) {
  try {
    const { data } = await axios.get(\`${baseUrl}/api/casino/round/\${slug}\`);
    console.log('Dealt Cards:', data.data.cards);
    console.log('Odds:', data.data.runners);
  } catch (err) {
    console.error('API Error:', err.message);
  }
}

getLiveCasinoRound('mogambo');`}
                  </pre>
                </div>

                {/* Python */}
                <div className="bg-[#112435] border border-slate-700 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-sky-400 font-mono">Python 3 (requests)</span>
                    <button 
                      onClick={() => copyToClipboard(`import requests
res = requests.get("${baseUrl}/api/casino/round/mogambo")
print(res.json())`, 'python')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedId === 'python' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="bg-black/60 p-3 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto">
{`import requests

def get_live_round(slug):
    url = f"${baseUrl}/api/casino/round/{slug}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json().get("data", {})
        print("Round ID:", data.get("roundId"))
        print("Timer:", data.get("timer"))
        print("Cards:", data.get("cards"))

get_live_round("mogambo")`}
                  </pre>
                </div>

                {/* PHP */}
                <div className="bg-[#112435] border border-slate-700 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-indigo-400 font-mono">PHP (cURL)</span>
                    <button 
                      onClick={() => copyToClipboard(`<?php
$ch = curl_init("${baseUrl}/api/casino/round/mogambo");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = curl_exec($ch);
curl_close($ch);
print_r(json_decode($res, true));
?>`, 'php')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedId === 'php' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="bg-black/60 p-3 rounded-lg text-xs font-mono text-slate-200 overflow-x-auto">
{`<?php
$slug = "mogambo";
$ch = curl_init("${baseUrl}/api/casino/round/" . $slug);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
print_r($data["data"]);
?>`}
                  </pre>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#07101a] px-5 py-2.5 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span>Ready for commercial sale & partner integration</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs transition"
          >
            Close Documentation
          </button>
        </div>

      </div>
    </div>
  );
}
