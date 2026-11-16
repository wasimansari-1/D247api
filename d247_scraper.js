/**
 * D247 Full Platform Scraper & API Engine
 * Scrapes Sports (Cricket, Football, Tennis), 78+ Casino Tables, Scoreboards & Live Streams.
 * Uses native fetch (Node 18+) with zero external dependencies.
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'config.json');
const OUTPUT_DIR = path.join(__dirname, 'output');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error('config.json not found! Run har_extractor.js or configure config.json first.');
  }
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

async function requestD247(endpoint, method = 'POST', body = null) {
  const config = loadConfig();
  const url = endpoint.startsWith('http') ? endpoint : `${config.baseUrl}${endpoint}`;

  const options = {
    method,
    headers: config.headers
  };

  if (body && method === 'POST') {
    options.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      console.warn(`[HTTP ${response.status}] Failed request to ${url}`);
      const text = await response.text();
      return { error: true, status: response.status, body: text.substring(0, 300) };
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(`Error requesting ${url}:`, err.message);
    return { error: true, message: err.message };
  }
}

// ---------------- CASINO APIS ----------------

/**
 * Fetch all 78+ Casino Tables & Game Slugs
 */
async function getCasinoTables() {
  console.log('🎰 Fetching Casino 78+ Tables list...');
  const data = await requestD247('/tablelist', 'POST', {});
  if (data && !data.error) {
    fs.writeFileSync(path.join(OUTPUT_DIR, 'casino_tables.json'), JSON.stringify(data, null, 2));
    console.log('✅ Casino tables saved to output/casino_tables.json');
  }
  return data;
}

/**
 * Fetch Real-time Game Round data (Cards, Round ID, Bets, Odds)
 * @param {string} gameType - e.g. "worli3", "teen20", "dt20", "dolidana"
 */
async function getCasinoRoundData(gameType) {
  console.log(`🎲 Fetching live round data for game: ${gameType}...`);
  const data = await requestD247(`/data2?gtype=${encodeURIComponent(gameType)}`, 'POST', {});
  if (data && !data.error) {
    fs.writeFileSync(path.join(OUTPUT_DIR, `round_${gameType}.json`), JSON.stringify(data, null, 2));
    console.log(`✅ Saved live round for ${gameType}`);
  }
  return data;
}

/**
 * Fetch Last Round Results for Casino Tables
 */
async function getCasinoLastResults() {
  console.log('📜 Fetching last results history...');
  const data = await requestD247('/lastresults2', 'POST', {});
  if (data && !data.error) {
    fs.writeFileSync(path.join(OUTPUT_DIR, 'last_results.json'), JSON.stringify(data, null, 2));
    console.log('✅ Last results saved to output/last_results.json');
  }
  return data;
}

/**
 * Launch Game Stream / Provider Feed
 */
async function launchCasinoStream(payload = {}) {
  console.log('🎥 Requesting casino stream feed...');
  const data = await requestD247('/launchother', 'POST', payload);
  return data;
}

// ---------------- SPORTS APIS ----------------

/**
 * Fetch Full Sports Tree (Cricket, Soccer, Tennis, Leagues, Tournaments)
 */
async function getSportsTree() {
  console.log('⚽ Fetching Sports Tree data...');
  const data = await requestD247('/treedata', 'POST', {});
  if (data && !data.error) {
    fs.writeFileSync(path.join(OUTPUT_DIR, 'sports_tree.json'), JSON.stringify(data, null, 2));
    console.log('✅ Sports tree saved to output/sports_tree.json');
  }
  return data;
}

/**
 * Fetch In-Play and Upcoming Events
 */
async function getLatestEvents() {
  console.log('⚡ Fetching latest / in-play sports events...');
  const data = await requestD247('/get_latest_events', 'POST', {});
  if (data && !data.error) {
    fs.writeFileSync(path.join(OUTPUT_DIR, 'latest_events.json'), JSON.stringify(data, null, 2));
    console.log('✅ Latest events saved to output/latest_events.json');
  }
  return data;
}

/**
 * Fetch Highlights for a sport (4 = Cricket, 1 = Soccer, 2 = Tennis)
 */
async function getSportHighlights(etid = 4) {
  console.log(`🏏 Fetching highlights for Sport ID: ${etid}...`);
  const data = await requestD247(`/highlighthomePrivate?etid=${etid}`, 'POST', {});
  if (data && !data.error) {
    fs.writeFileSync(path.join(OUTPUT_DIR, `highlights_sport_${etid}.json`), JSON.stringify(data, null, 2));
    console.log(`✅ Saved sport ${etid} highlights`);
  }
  return data;
}

/**
 * Fetch Match Odds, Bookmaker Markets & Real-time Scoreboard
 * @param {number|string} etid - Sport ID (e.g. 4 for Cricket)
 * @param {number|string} gmid - Game / Match ID (e.g. 893402104)
 */
async function getGameDataAndScoreboard(etid, gmid) {
  console.log(`📊 Fetching odds and scoreboard for Match ID ${gmid} (Sport ${etid})...`);
  const data = await requestD247(`/gamedataPrivate?etid=${etid}&gmid=${gmid}`, 'POST', {});
  if (data && !data.error) {
    fs.writeFileSync(path.join(OUTPUT_DIR, `match_${gmid}_scoreboard.json`), JSON.stringify(data, null, 2));
    console.log(`✅ Saved match odds & scoreboard for ${gmid}`);
  }
  return data;
}

// ---------------- MASTER RUNNER ----------------

async function runFullScraper() {
  console.log('==================================================');
  console.log('🚀 Starting D247 Full Platform Scraper Run');
  console.log('==================================================\n');

  // 1. Casino
  await getCasinoTables();
  await getCasinoLastResults();

  // 2. Sports
  await getSportsTree();
  await getLatestEvents();
  await getSportHighlights(4); // Cricket
  await getSportHighlights(1); // Soccer
  await getSportHighlights(2); // Tennis

  console.log('\n==================================================');
  console.log('🏁 Scraper run completed! Check output/ directory.');
  console.log('==================================================');
}

if (require.main === module) {
  runFullScraper();
}

module.exports = {
  requestD247,
  getCasinoTables,
  getCasinoRoundData,
  getCasinoLastResults,
  launchCasinoStream,
  getSportsTree,
  getLatestEvents,
  getSportHighlights,
  getGameDataAndScoreboard,
  runFullScraper
};

