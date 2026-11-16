/**
 * D247 Real-Time Frontend Application
 * Connects to Socket.IO for instant rate/odds syncing and live scoreboards
 */

const socket = io();

// State
let currentSport = 4; // Cricket default
let currentGmid = null;
let currentMatchData = null;
let allMatches = [];
let allCasinoTables = [];

// DOM Elements
const connectionBadge = document.getElementById('connectionBadge');
const matchSelector = document.getElementById('matchSelector');
const eventTitle = document.getElementById('eventTitle');
const competitionName = document.getElementById('competitionName');
const scoreboardContainer = document.getElementById('scoreboardContainer');
const battingTeam = document.getElementById('battingTeam');
const battingScore = document.getElementById('battingScore');
const matchOvers = document.getElementById('matchOvers');
const bowlingTeam = document.getElementById('bowlingTeam');
const bowlingScore = document.getElementById('bowlingScore');
const ballsList = document.getElementById('ballsList');
const marketsContainer = document.getElementById('marketsContainer');
const rateTickerContent = document.getElementById('rateTickerContent');
const sportsSection = document.getElementById('sportsSection');
const casinoSection = document.getElementById('casinoSection');
const casinoGrid = document.getElementById('casinoGrid');

// Modal Elements
const settingsModal = document.getElementById('settingsModal');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const saveSessionBtn = document.getElementById('saveSessionBtn');
const sessionCookieInput = document.getElementById('sessionCookieInput');
const sessionStatusMsg = document.getElementById('sessionStatusMsg');

// --- Socket.IO Handlers ---

socket.on('connect', () => {
  console.log('⚡ Connected to D247 Real-Time Socket Server!');
  connectionBadge.innerHTML = '<span class="pulse-dot"></span> LIVE SYNC';
  connectionBadge.style.color = '#4ade80';

  if (currentGmid) {
    socket.emit('join_match', currentGmid);
  }
});

socket.on('disconnect', () => {
  connectionBadge.innerHTML = '⚠️ DISCONNECTED';
  connectionBadge.style.color = '#ef4444';
});

// Real-Time Odds Update from Diamond
socket.on('odds_update', (payload) => {
  if (String(payload.gmid) !== String(currentGmid)) return;

  if (payload.markets) {
    updateMarketsWithFlash(payload.markets);
  }
  if (payload.scoreboard) {
    updateScoreboard(payload.scoreboard);
  }
});

// Real-Time Cricket Scoreboard Update
socket.on('scoreboard_update', (payload) => {
  if (String(payload.gmid) !== String(currentGmid)) return;
  updateScoreboard(payload.scoreboard);
});

// Top Marquee Ticker
socket.on('quick_rate_ticker', (data) => {
  rateTickerContent.innerText = `[${data.eventName}] ${data.runner}: Back ${data.back} / Lay ${data.lay} | Rate changed at ${new Date().toLocaleTimeString()}`;
});

// --- Tab Navigation ---

document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const tabType = tab.dataset.tab;
    if (tabType === 'sports') {
      sportsSection.classList.remove('hidden-section');
      casinoSection.classList.add('hidden-section');
      currentSport = parseInt(tab.dataset.sport) || 4;
      loadMatchesForSport(currentSport);
    } else if (tabType === 'casino') {
      sportsSection.classList.add('hidden-section');
      casinoSection.classList.remove('hidden-section');
      loadCasinoTables();
    }
  });
});

// --- Sports Logic ---

async function fetchInPlayMatches() {
  try {
    const res = await fetch('/api/sports/in-play');
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      allMatches = json.data;
      loadMatchesForSport(currentSport);
    }
  } catch (err) {
    console.error('Failed to fetch in-play matches:', err);
  }
}

function loadMatchesForSport(sportId) {
  const filtered = allMatches.filter(m => m.etid === sportId);
  matchSelector.innerHTML = '';

  if (filtered.length === 0) {
    matchSelector.innerHTML = '<option value="">No In-Play Matches</option>';
    eventTitle.innerText = 'No Live Events';
    marketsContainer.innerHTML = '<p style="padding:20px; text-align:center;">No live odds at this moment.</p>';
    return;
  }

  filtered.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.gmid;
    opt.textContent = `${m.eventName} (${m.competition})`;
    matchSelector.appendChild(opt);
  });

  selectMatch(filtered[0].gmid);
}

matchSelector.addEventListener('change', (e) => {
  selectMatch(e.target.value);
});

async function selectMatch(gmid) {
  if (!gmid) return;

  if (currentGmid) {
    socket.emit('leave_match', currentGmid);
  }

  currentGmid = gmid;
  socket.emit('join_match', gmid);

  try {
    const res = await fetch(`/api/sports/match/${gmid}?etid=${currentSport}`);
    const json = await res.json();
    if (json.success && json.data) {
      currentMatchData = json.data;
      renderMatchView(json.data);
    }
  } catch (err) {
    console.error('Failed to load match details:', err);
  }
}

function renderMatchView(match) {
  eventTitle.innerText = match.eventName;
  competitionName.innerText = match.competition || '';

  // Render Scoreboard
  if (match.scoreboard) {
    updateScoreboard(match.scoreboard);
    scoreboardContainer.style.display = 'block';
  } else {
    scoreboardContainer.style.display = 'none';
  }

  // Render Markets
  renderMarkets(match.markets || []);
}

function updateScoreboard(sc) {
  if (!sc) return;
  if (sc.battingTeam) battingTeam.innerText = sc.battingTeam;
  if (sc.bowlingTeam) bowlingTeam.innerText = sc.bowlingTeam;
  if (sc.runs !== undefined && sc.wickets !== undefined) {
    battingScore.innerText = `${sc.runs}/${sc.wickets}`;
  }
  if (sc.overs) matchOvers.innerText = `(${sc.overs} ov)`;

  if (Array.isArray(sc.currentOver)) {
    ballsList.innerHTML = '';
    sc.currentOver.forEach(b => {
      const dot = document.createElement('span');
      dot.className = 'ball-dot';
      if (b === 'W') dot.classList.add('wicket');
      else if (b === '4') dot.classList.add('four');
      else if (b === '6') dot.classList.add('six');
      dot.innerText = b;
      ballsList.appendChild(dot);
    });
  }
}

function renderMarkets(markets) {
  marketsContainer.innerHTML = '';

  markets.forEach(m => {
    const card = document.createElement('div');
    card.className = 'market-card';

    let tableHtml = '';
    if (m.runners && m.runners.length > 0) {
      tableHtml = `
        <table class="market-runners-table">
          ${m.runners.map((r, idx) => `
            <tr data-runner="${idx}">
              <td class="runner-cell">${r.runnerName}</td>
              <td class="odds-cell back" id="back_${m.marketId}_${idx}">
                <span class="price">${r.backPrice || '-'}</span>
                <span class="size">${r.backSize ? formatSize(r.backSize) : '-'}</span>
              </td>
              <td class="odds-cell lay" id="lay_${m.marketId}_${idx}">
                <span class="price">${r.layPrice || '-'}</span>
                <span class="size">${r.laySize ? formatSize(r.laySize) : '-'}</span>
              </td>
            </tr>
          `).join('')}
        </table>
      `;
    } else if (m.fancyList) {
      tableHtml = `
        <table class="market-runners-table">
          ${m.fancyList.map((f, idx) => `
            <tr>
              <td class="runner-cell">${f.title}</td>
              <td class="odds-cell lay">
                <span class="price">${f.noRate}</span>
                <span class="size">${f.noOdds}</span>
              </td>
              <td class="odds-cell back">
                <span class="price">${f.yesRate}</span>
                <span class="size">${f.yesOdds}</span>
              </td>
            </tr>
          `).join('')}
        </table>
      `;
    }

    card.innerHTML = `
      <div class="market-header">
        <span>${m.marketName}</span>
        <span style="font-size:11px; color:#64748b;">Max: 25K</span>
      </div>
      ${tableHtml}
    `;

    marketsContainer.appendChild(card);
  });
}

function updateMarketsWithFlash(newMarkets) {
  newMarkets.forEach(m => {
    if (!m.runners) return;
    m.runners.forEach((r, idx) => {
      const backEl = document.getElementById(`back_${m.marketId}_${idx}`);
      const layEl = document.getElementById(`lay_${m.marketId}_${idx}`);

      if (backEl) {
        const priceEl = backEl.querySelector('.price');
        const sizeEl = backEl.querySelector('.size');
        const oldPrice = parseFloat(priceEl.innerText) || 0;
        const newPrice = r.backPrice;

        if (newPrice !== oldPrice) {
          priceEl.innerText = newPrice;
          backEl.classList.remove('flash-up', 'flash-down');
          void backEl.offsetWidth; // Trigger reflow
          backEl.classList.add(newPrice > oldPrice ? 'flash-up' : 'flash-down');
        }
        if (sizeEl && r.backSize) sizeEl.innerText = formatSize(r.backSize);
      }

      if (layEl) {
        const priceEl = layEl.querySelector('.price');
        const sizeEl = layEl.querySelector('.size');
        const oldPrice = parseFloat(priceEl.innerText) || 0;
        const newPrice = r.layPrice;

        if (newPrice !== oldPrice) {
          priceEl.innerText = newPrice;
          layEl.classList.remove('flash-up', 'flash-down');
          void layEl.offsetWidth;
          layEl.classList.add(newPrice > oldPrice ? 'flash-up' : 'flash-down');
        }
        if (sizeEl && r.laySize) sizeEl.innerText = formatSize(r.laySize);
      }
    });
  });
}

function formatSize(val) {
  if (val >= 100000) return (val / 100000).toFixed(1) + 'L';
  if (val >= 1000) return (val / 1000).toFixed(0) + 'K';
  return val;
}

// --- Casino Logic (78+ Tables) ---

async function loadCasinoTables() {
  try {
    const res = await fetch('/api/casino/tables');
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      allCasinoTables = json.data;
      renderCasinoGrid('all');
    }
  } catch (err) {
    console.error('Failed to load casino tables:', err);
  }
}

function renderCasinoGrid(category) {
  casinoGrid.innerHTML = '';
  const filtered = category === 'all' 
    ? allCasinoTables 
    : allCasinoTables.filter(t => t.category === category);

  filtered.forEach(t => {
    const card = document.createElement('div');
    card.className = 'casino-card';
    card.innerHTML = `
      <div class="casino-card-img">
        <span>${getCasinoEmoji(t.category)}</span>
        <span class="live-tag">LIVE</span>
      </div>
      <div class="casino-card-info">
        <div class="casino-card-title">${t.name}</div>
        <div class="casino-card-meta">
          <span>Min: ${t.min || 100}</span>
          <span>Max: ${formatSize(t.max || 200000)}</span>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      alert(`Launching Table: ${t.name} (Slug: ${t.slug})\nConnecting zero-latency stream...`);
    });

    casinoGrid.appendChild(card);
  });
}

function getCasinoEmoji(cat) {
  switch (cat) {
    case 'Teen Patti': return '🃏';
    case 'Dragon Tiger': return '🐉';
    case 'Lucky 7': return '7️⃣';
    case 'Andar Bahar': return '🅰️';
    case 'Roulette': return '🎡';
    case 'Matka': return '🎲';
    case 'Baccarat': return '♠️';
    default: return '🎰';
  }
}

document.querySelectorAll('.cat-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    renderCasinoGrid(pill.dataset.cat);
  });
});

// --- Modal & Cookie Settings ---

openSettingsBtn.addEventListener('click', () => {
  settingsModal.style.display = 'flex';
});

closeSettingsBtn.addEventListener('click', () => {
  settingsModal.style.display = 'none';
});

saveSessionBtn.addEventListener('click', async () => {
  const val = sessionCookieInput.value.trim();
  if (!val) return;

  sessionStatusMsg.innerText = 'Saving session...';
  sessionStatusMsg.style.color = '#0284c7';

  try {
    const res = await fetch('/api/config/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cookie: val })
    });
    const json = await res.json();
    if (json.success) {
      sessionStatusMsg.innerText = '✅ Session updated! Live sync active.';
      sessionStatusMsg.style.color = '#16a34a';
      setTimeout(() => {
        settingsModal.style.display = 'none';
        fetchInPlayMatches();
      }, 1000);
    }
  } catch (err) {
    sessionStatusMsg.innerText = '❌ Failed to update session';
    sessionStatusMsg.style.color = '#ef4444';
  }
});

// Initialize on start
fetchInPlayMatches();

