/**
 * HAR Extractor for D247 Platform
 * Automatically scans and parses exported .har files from Chrome DevTools:
 * - Extracts valid session cookies & headers into config.json
 * - Extracts 78+ Casino Tables into output/casino_tables.json
 * - Extracts Sports Tree & In-Play Events into output/sports_tree.json
 * - Extracts Live Match Odds & Scoreboards into output/
 * - Extracts Casino Streams & Round Data
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_DIR = __dirname;
const OUTPUT_DIR = path.join(WORKSPACE_DIR, 'output');
const CONFIG_FILE = path.join(WORKSPACE_DIR, 'config.json');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Find any .har file in current directory
const files = fs.readdirSync(WORKSPACE_DIR);
const harFiles = files.filter(f => f.endsWith('.har'));

if (harFiles.length === 0) {
  console.log('⚠️  No .har file found in', WORKSPACE_DIR);
  console.log('👉 Please export your Network HAR file from Chrome DevTools:');
  console.log('   1. In Chrome DevTools Network Tab, click Export HAR (⬇)');
  console.log('   2. Save it inside /Users/iglobaltech/Desktop/D247/');
  console.log('   3. Run: node har_extractor.js');
  process.exit(1);
}

const targetHar = path.join(WORKSPACE_DIR, harFiles[0]);
console.log(`🔍 Processing HAR file: ${harFiles[0]}...`);

try {
  const harContent = JSON.parse(fs.readFileSync(targetHar, 'utf8'));
  const entries = harContent.log && harContent.log.entries ? harContent.log.entries : [];
  console.log(`📊 Total network entries in HAR: ${entries.length}`);

  let latestCookie = '';
  let latestUserAgent = '';
  const extracted = {
    tables: null,
    tree: null,
    latestEvents: null,
    highlights: [],
    gameData: [],
    roundData: [],
    streams: [],
    lastResults: null
  };

  for (const entry of entries) {
    const req = entry.request;
    const res = entry.response;
    const url = req.url;

    // Grab headers & cookies if on d247.com
    if (url.includes('d247.com')) {
      const cookieHeader = req.headers.find(h => h.name.toLowerCase() === 'cookie');
      if (cookieHeader && cookieHeader.value) {
        latestCookie = cookieHeader.value;
      }
      const uaHeader = req.headers.find(h => h.name.toLowerCase() === 'user-agent');
      if (uaHeader && uaHeader.value) {
        latestUserAgent = uaHeader.value;
      }
    }

    // Try parsing response content if JSON
    let body = null;
    if (res && res.content && res.content.text) {
      try {
        body = JSON.parse(res.content.text);
      } catch (_) {
        // Not JSON
      }
    }

    if (!body) continue;

    // Map endpoints
    if (url.includes('/api/front/tablelist')) {
      extracted.tables = body;
    } else if (url.includes('/api/front/treedata')) {
      extracted.tree = body;
    } else if (url.includes('/api/front/get_latest_events')) {
      extracted.latestEvents = body;
    } else if (url.includes('/api/front/highlighthomePrivate')) {
      extracted.highlights.push({ url, data: body });
    } else if (url.includes('/api/front/gamedataPrivate')) {
      extracted.gameData.push({ url, data: body });
    } else if (url.includes('/api/front/data2')) {
      extracted.roundData.push({ url, data: body });
    } else if (url.includes('/api/front/launchother')) {
      extracted.streams.push({ url, data: body });
    } else if (url.includes('/api/front/lastresults2')) {
      extracted.lastResults = body;
    }
  }

  // Update config.json with latest session cookie
  if (latestCookie && fs.existsSync(CONFIG_FILE)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      cfg.headers.Cookie = latestCookie;
      if (latestUserAgent) cfg.headers['User-Agent'] = latestUserAgent;
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf8');
      console.log('✅ Updated config.json with active session Cookie & User-Agent!');
    } catch (e) {
      console.error('Failed to update config.json:', e.message);
    }
  }

  // Save extracted JSONs
  if (extracted.tables) {
    fs.writeFileSync(path.join(OUTPUT_DIR, 'casino_tables.json'), JSON.stringify(extracted.tables, null, 2));
    console.log('✅ Saved Casino 78+ Tables -> output/casino_tables.json');
  }

  if (extracted.tree) {
    fs.writeFileSync(path.join(OUTPUT_DIR, 'sports_tree.json'), JSON.stringify(extracted.tree, null, 2));
    console.log('✅ Saved Sports Tree -> output/sports_tree.json');
  }

  if (extracted.latestEvents) {
    fs.writeFileSync(path.join(OUTPUT_DIR, 'latest_events.json'), JSON.stringify(extracted.latestEvents, null, 2));
    console.log('✅ Saved Latest Events -> output/latest_events.json');
  }

  if (extracted.highlights.length > 0) {
    fs.writeFileSync(path.join(OUTPUT_DIR, 'sports_highlights.json'), JSON.stringify(extracted.highlights, null, 2));
    console.log(`✅ Saved ${extracted.highlights.length} Sports Highlights -> output/sports_highlights.json`);
  }

  if (extracted.gameData.length > 0) {
    fs.writeFileSync(path.join(OUTPUT_DIR, 'game_data_odds_scoreboards.json'), JSON.stringify(extracted.gameData, null, 2));
    console.log(`✅ Saved ${extracted.gameData.length} Live Game Odds & Scorecards -> output/game_data_odds_scoreboards.json`);
  }

  if (extracted.roundData.length > 0) {
    fs.writeFileSync(path.join(OUTPUT_DIR, 'casino_round_data.json'), JSON.stringify(extracted.roundData, null, 2));
    console.log(`✅ Saved ${extracted.roundData.length} Live Casino Rounds -> output/casino_round_data.json`);
  }

  if (extracted.streams.length > 0) {
    fs.writeFileSync(path.join(OUTPUT_DIR, 'casino_streams.json'), JSON.stringify(extracted.streams, null, 2));
    console.log(`✅ Saved ${extracted.streams.length} Stream Launchers -> output/casino_streams.json`);
  }

  if (extracted.lastResults) {
    fs.writeFileSync(path.join(OUTPUT_DIR, 'last_results.json'), JSON.stringify(extracted.lastResults, null, 2));
    console.log('✅ Saved Last Results History -> output/last_results.json');
  }

  console.log('\n🎉 Extraction completed! All files saved in output/ directory.');

} catch (err) {
  console.error('❌ Error parsing HAR file:', err.message);
}

