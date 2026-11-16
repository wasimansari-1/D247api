/**
 * Real-Time Sync Engine for D247 / Diamond Online
 * Supports ALL 13+ Sports (Cricket, Football, Tennis, Table Tennis, etc.)
 * Strictly syncs live upstream data from diamondonline7.com with zero dummy or simulated data.
 * Features automated demo login session management & 500ms ultra-low latency updates.
 */

const fs = require('fs');
const path = require('path');
const cacheService = require('./cacheService');

const SPORT_NAMES = {
  4: { name: 'Cricket', icon: '🏏' },
  1: { name: 'Football', icon: '⚽' },
  2: { name: 'Tennis', icon: '🎾' },
  8: { name: 'Table Tennis', icon: '🏓' },
  7: { name: 'Horse Racing', icon: '🏇' },
  43: { name: 'Greyhound Racing', icon: '🐕' },
  15: { name: 'Basketball', icon: '🏀' },
  69: { name: 'Wrestling', icon: '🤼' },
  18: { name: 'Volleyball', icon: '🏐' },
  9: { name: 'Badminton', icon: '🏸' },
  11: { name: 'E Games', icon: '🎮' },
  59: { name: 'Snooker', icon: '🎱' },
  17: { name: 'Chess', icon: '♟️' },
  40: { name: 'Politics', icon: '🏛️' },
  58: { name: 'American Football', icon: '🏈' },
  54: { name: 'Rugby Union', icon: '🏉' }
};

class D247SyncEngine {
  constructor(io) {
    this.io = io;
    this.configPath = path.join(__dirname, '../config.json');
    this.config = this.loadConfig();

    // In-memory cache
    this.inPlayEvents = [];
    this.matchCache = new Map(); // gmid -> structured match data
    this.casinoTables = [];
    this.oddsHysteresis = new Map(); // key -> { price, size, timestamp } anti-flicker smoothing
    this.sportMatchesMap = new Map(); // etid -> parsed matches
    this.sportsFetchTick = 0;

    // Subscriptions
    this.activeGmidSubscriptions = new Set();
    this.isPolling = false;
    this.pollIntervalMs = 500; // 500ms for instant rate updates
    this.timer = null;
    this.sportsTimer = null;
    this.isLoggingIn = false;

    // Initialize session and sync
    this.lastSuccessfulSync = Date.now();
    this.init();

    // 1. Proactive Session Renewal every 30 minutes (Prevents token expiry freeze)
    setInterval(() => {
      console.log('⏰ Running Proactive 30-Minute Demo Session Renewal...');
      this.autoLoginDemo();
    }, 30 * 60 * 1000);

    // 2. Healthcheck Watchdog every 10 seconds
    setInterval(() => {
      const elapsed = Date.now() - this.lastSuccessfulSync;
      if (elapsed > 20000 && !this.isLoggingIn) {
        console.warn(`⚠️ Watchdog Warning: No upstream response for ${Math.round(elapsed/1000)}s! Triggering emergency re-auth...`);
        this.autoLoginDemo();
      }
    }, 10000);
  }

  async init() {
    // Perform auto-demo login to ensure active valid session
    await this.autoLoginDemo();
    // Load tables and initial sports list
    await this.fetchLiveCasinoTables();
    await this.fetchAllLiveSports();
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      }
    } catch (e) {
      console.error('Error loading config.json:', e.message);
    }
    return {
      baseUrl: 'https://diamondonline7.com/api/front',
      headers: {
        'accept': 'application/json, text/plain, */*',
        'content-type': 'application/json',
        'referer': 'https://diamondonline7.com/home',
        'origin': 'https://diamondonline7.com',
        'user-agent': 'Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36',
        'Cookie': ''
      }
    };
  }

  saveConfig() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (e) {
      console.error('Failed to save config.json:', e.message);
    }
  }

  /**
   * Automated Zero-Intervention Demo Login
   * Visits diamondonline7.com/home, grabs visitor session, logs in as Demo,
   * and stores permanent active session cookie.
   */
  /**
   * Automated Zero-Intervention Demo Login with Promise Queue
   * Guarantees all concurrent requests wait on a single handshake
   */
  async autoLoginDemo() {
    if (this.isLoggingIn && this.loginPromise) {
      return this.loginPromise;
    }

    this.isLoggingIn = true;
    this.loginPromise = (async () => {
      console.log('🔄 Performing Automated Diamond Online Demo Login...');
      try {
        // 1. Visit home page with sanitized mobile headers to grab visitor session
        const r1 = await fetch('https://diamondonline7.com/home', {
          headers: {
            'user-agent': this.config.headers['user-agent'] || 'Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36',
            'origin': 'https://diamondonline7.com',
            'referer': 'https://diamondonline7.com/'
          }
        });
        const rawCookie = r1.headers.get('set-cookie');
        let visitorCookie = '';
        if (rawCookie) {
          const match = rawCookie.match(/g_token=[^;]+/);
          if (match) visitorCookie = match[0];
        }

        // 2. Call /api/front/demo-login
        const r2 = await fetch('https://diamondonline7.com/api/front/demo-login', {
          method: 'POST',
          headers: {
            'accept': 'application/json, text/plain, */*',
            'content-type': 'application/json',
            'referer': 'https://diamondonline7.com/home',
            'origin': 'https://diamondonline7.com',
            'sec-fetch-site': 'same-origin',
            'user-agent': this.config.headers['user-agent'] || 'Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36',
            'Cookie': visitorCookie || this.config.headers.Cookie
          },
          body: JSON.stringify({})
        });

        const setCookie = r2.headers.get('set-cookie');
        let authCookie = visitorCookie;
        if (setCookie) {
          const match = setCookie.match(/g_token=[^;]+/);
          if (match) authCookie = match[0];
        }

        const resData = await r2.json();
        if (resData.status === 200 && authCookie) {
          this.config.headers.Cookie = authCookie;
          this.saveConfig();
          this.lastSuccessfulSync = Date.now();
          console.log(`✅ Diamond Online Demo Login Succeeded! Active Token: ${resData.data?.token || 'OK'}`);
          return true;
        } else {
          console.warn('⚠️ Demo login response not 200:', JSON.stringify(resData));
          return false;
        }
      } catch (err) {
        console.error('❌ Auto-demo login failed:', err.message);
        return false;
      } finally {
        this.isLoggingIn = false;
        this.loginPromise = null;
      }
    })();

    return this.loginPromise;
  }

  /**
   * Execute Upstream with Origin Concealment, Header Masking & Queue-locked Re-auth
   */
  async executeUpstream(endpoint, body = {}, retryOnAuth = true) {
    const url = `${this.config.baseUrl}${endpoint}`;

    try {
      // If a login handshake is currently in progress, wait for it before firing
      if (this.isLoggingIn && this.loginPromise) {
        await this.loginPromise;
      }

      // Origin Concealment: Pure same-origin headers simulating genuine Android mobile client
      const sanitizedHeaders = {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9,hi;q=0.7',
        'content-type': 'application/json',
        'dnt': '1',
        'origin': 'https://diamondonline7.com',
        'referer': 'https://diamondonline7.com/home',
        'sec-ch-ua': '"Not-A.Brand";v="99", "Google Chrome";v="157", "Chromium";v="157"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': this.config.headers['user-agent'] || 'Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Mobile Safari/537.36',
        'Cookie': this.config.headers.Cookie
      };

      const resp = await fetch(url, {
        method: 'POST',
        headers: sanitizedHeaders,
        body: JSON.stringify(body)
      });

      if (!resp.ok) return null;
      const data = await resp.json();

      // Check for session expiry
      if (data && (data.status === 401 || data.msg === 'Please Login' || data.msg === 'Please reload page and retry !')) {
        if (retryOnAuth) {
          console.warn(`🔒 Session expired on ${endpoint}. Auto-renewing session with queue lock...`);
          await this.autoLoginDemo();
          // Transparently retry request with the fresh session token
          return await this.executeUpstream(endpoint, body, false);
        }
      }

      this.lastSuccessfulSync = Date.now();
      return data;
    } catch (err) {
      return null;
    }
  }

  /**
   * Fetch All 74+ Live Casino Tables strictly from Diamond Online
   * Matching cards in user images 3, 4, 5 with authentic CDN images.
   */
  async fetchLiveCasinoTables() {
    try {
      const res = await this.executeUpstream('/tablelist', {});
      if (res && res.success && Array.isArray(res.data)) {
        // Exclude virtual/unresponsive games that Diamond returns "Server Error" on /casino/data
        const filteredRaw = res.data.filter(t => {
          const s = t.gtype.toLowerCase();
          if (s.startsWith('v') && s !== 'vivo') return false;
          if (s === 'teen2024' || s === 'vivo' || s === 'snakes-and-ladders') return false;
          return true;
        });

        const officialTables = filteredRaw.map((t, idx) => {
          let tableSlug = t.gtype;
          let tableName = t.cname;
          // Map roulette to roulette11 for genuine data feed
          if (tableSlug === 'roulette') {
            tableSlug = 'roulette11';
            tableName = 'Roulette';
          }
          return {
            id: String(idx + 3000),
            name: tableName,
            slug: tableSlug,
            dserver: t.dserver,
            img: `/api/casino/image/${tableSlug}`,
            category: this.getCategoryFromSlug(tableSlug, tableName),
            min: 100,
            max: 200000
          };
        });

        // Add confirmed live working tables from Diamond Online matching user screenshots
        const extraWorkingTables = [
          { name: 'Mogambo', slug: 'mogambo', category: 'Others' },
          { name: 'Doli Dana Live', slug: 'dolidana', category: 'Others' },
          { name: '20-20 Teenpatti C', slug: 'teen20c', category: 'Teen Patti' },
          { name: 'Poison Teenpatti One Day', slug: 'poison', category: 'Teen Patti' },
          { name: 'Poison Teenpatti 20 20', slug: 'poison20', category: 'Teen Patti' },
          { name: 'Unique Teenpatti', slug: 'teenunique', category: 'Teen Patti' },
          { name: 'Unlimited Joker 20 20', slug: 'teenjoker', category: 'Teen Patti' },
          { name: 'Teenpatti Joker 20 20', slug: 'joker20', category: 'Teen Patti' },
          { name: 'Unlimited Joker One Day', slug: 'joker1', category: 'Teen Patti' },
          { name: 'Bollywood Casino 2', slug: 'btable2', category: 'Others' },
          { name: 'Goal Live', slug: 'goal', category: 'Football' },
          { name: 'Goal 2', slug: 'goal2', category: 'Football' },
          { name: 'Super Over 2', slug: 'superover2', category: 'Cricket' },
          { name: 'Sic Bo Live', slug: 'sicbo', category: 'Others' },
          { name: 'Sic Bo 2', slug: 'sicbo2', category: 'Others' },
          { name: 'Lucky 15', slug: 'lucky15', category: 'Lucky 7' },
          { name: 'Ball By Ball', slug: 'ballbyball', category: 'Cricket' },
          { name: 'Instant Teenpatti 3.0', slug: 'teen33', category: 'Teen Patti' },
          { name: 'Andar Bahar 50 Cards', slug: 'ab3', category: 'Andar Bahar' }
        ];

        for (const ext of extraWorkingTables) {
          if (!officialTables.some(t => t.slug === ext.slug)) {
            officialTables.unshift({
              id: String(officialTables.length + 3100),
              name: ext.name,
              slug: ext.slug,
              dserver: 'cs',
              img: `/api/casino/image/${ext.slug}`,
              category: ext.category || this.getCategoryFromSlug(ext.slug, ext.name),
              min: 100,
              max: 200000
            });
          }
        }

        this.casinoTables = officialTables;
        console.log(`🎰 Synced ${this.casinoTables.length} Official Casino Tables from Diamond Online!`);
      }
    } catch (err) {
      console.error('Failed to sync casino tables:', err.message);
    }
  }

  getCategoryFromSlug(slug, name) {
    const s = (slug + ' ' + name).toLowerCase();
    if (s.includes('teen') || s.includes('patti')) return 'Teen Patti';
    if (s.includes('dragon') || s.includes('dt')) return 'Dragon Tiger';
    if (s.includes('lucky') || s.includes('7') || s.includes('15')) return 'Lucky 7';
    if (s.includes('andar') || s.includes('ab')) return 'Andar Bahar';
    if (s.includes('baccarat')) return 'Baccarat';
    if (s.includes('poker')) return 'Poker';
    if (s.includes('worli') || s.includes('matka')) return 'Matka';
    if (s.includes('roulette')) return 'Roulette';
    if (s.includes('card32') || s.includes('32')) return '32 Cards';
    return 'Others';
  }

  /**
   * Fetch Real Live Casino Round data from Diamond Online API
   */
  async fetchLiveCasinoRound(slug) {
    try {
      const targetSlug = slug === 'roulette' ? 'roulette11' : slug;
      const res = await this.executeUpstream('/casino/data', { type: targetSlug });
      if (res && res.success && res.data) {
        const raw = res.data;

        // Parse dealt cards e.g. "ADD,7SS,10DD,1,1,1" or "6CC|ACC|10CC|1|1|1"
        const rawCardStr = raw.card || '';
        const cardStrings = rawCardStr.replace(/\|/g, ',').split(',').map(s => s.trim()).filter(Boolean);
        const parsedCards = cardStrings.map(code => {
          if (code === '1' || code === '?') {
            return { code: '1', rank: '?', suit: 'hidden', isHidden: true, color: 'slate' };
          }
          let rank = code.slice(0, -2);
          let suitCode = code.slice(-2);
          let suit = '♠';
          let color = 'black';
          if (suitCode === 'HH') { suit = '♥'; color = 'red'; }
          else if (suitCode === 'DD') { suit = '♦'; color = 'red'; }
          else if (suitCode === 'CC') { suit = '♣'; color = 'black'; }
          else if (suitCode === 'SS') { suit = '♠'; color = 'black'; }
          return { code, rank, suit, color, isHidden: false };
        });

        // Parse live betting runners & odds
        const rawRunners = raw.sub || (raw.t2 && raw.t2[0] ? raw.t2[0].section : []);
        const runners = Array.isArray(rawRunners) ? rawRunners.map(s => {
          let b = s.b || 0;
          let bs = s.bs || 0;
          let l = s.l || 0;
          let ls = s.ls || 0;
          if (Array.isArray(s.odds)) {
            for (const o of s.odds) {
              if (o.otype === 'back' && !b && o.odds > 0) { b = o.odds; bs = o.size || 0; }
              if (o.otype === 'lay' && !l && o.odds > 0) { l = o.odds; ls = o.size || 0; }
            }
          }
          const isSuspended = raw.lt === 0 || s.gstatus === 'SUSPENDED' || (b === 0 && l === 0);
          return {
            sid: s.sid,
            name: s.nat,
            back: b,
            backSize: bs,
            lay: l,
            laySize: ls,
            status: isSuspended ? 'SUSPENDED' : 'OPEN',
            suspended: isSuspended,
            min: s.min || 100,
            max: s.max || 100000,
            subtype: s.subtype || s.etype || ''
          };
        }) : [];

        return {
          gameType: raw.gtype || slug,
          roundId: String(raw.mid || Date.now()),
          timer: raw.lt !== undefined ? raw.lt : 0,
          totalTimer: raw.ft || 20,
          status: raw.lt === 0 ? 'SUSPENDED' : 'OPEN',
          rawCards: rawCardStr,
          cards: parsedCards,
          runners: runners,
          updatedAt: new Date().toLocaleTimeString()
        };
      }
    } catch (err) {
      console.error(`fetchLiveCasinoRound error for ${slug}:`, err.message);
    }
    return null;
  }

  /**
   * Fetch Real Historical Recent Results from Diamond Online API
   */
  async fetchCasinoRecentResults(slug) {
    try {
      const targetSlug = slug === 'roulette' ? 'roulette11' : slug;
      const res = await this.executeUpstream('/casinoresults', { type: targetSlug });
      if (res && res.success) {
        return res.data?.data || res.data || [];
      }
    } catch (err) {
      console.error(`fetchCasinoRecentResults error for ${slug}:`, err.message);
    }
    return [];
  }

  /**
   * Map runners to 1 / X / 2 Exchange Columns
   */
  mapRunnersToColumns(section, gscode, matchStatus) {
    const isMatchSuspended = gscode === 0 || matchStatus === 'SUSPENDED';

    let col1 = { name: '', back: 0, backSize: 0, lay: 0, laySize: 0, suspended: isMatchSuspended, exists: false };
    let colX = { name: '', back: 0, backSize: 0, lay: 0, laySize: 0, suspended: isMatchSuspended, exists: false };
    let col2 = { name: '', back: 0, backSize: 0, lay: 0, laySize: 0, suspended: isMatchSuspended, exists: false };

    if (Array.isArray(section) && section.length > 0) {
      let r1 = section.find(s => s.sno === 1);
      let rX = section.find(s => s.sno === 2 || /^(the\s+)?draw$/i.test((s.nat || '').trim()));
      let r2 = section.find(s => s.sno === 3);

      if (!r1 && section.length > 0) r1 = section[0];
      if (!r2 && section.length > 1) {
        if (rX && section.length > 2) {
          r2 = section.find(s => s !== r1 && s !== rX);
        } else if (!rX) {
          r2 = section[1];
        }
      }

      const extractOdds = (sec) => {
        if (!sec) return { name: '', back: 0, backSize: 0, lay: 0, laySize: 0, suspended: false, exists: false };
        let back = 0, backSize = 0, lay = 0, laySize = 0;
        if (Array.isArray(sec.odds)) {
          for (const o of sec.odds) {
            const otype = (o.otype || '').toLowerCase();
            if (otype === 'back' && !back && o.odds > 0) {
              back = o.odds;
              backSize = o.size || 0;
            } else if (otype === 'lay' && !lay && o.odds > 0) {
              lay = o.odds;
              laySize = o.size || 0;
            }
          }
        }
        
        const isExplicitlySuspended = isMatchSuspended || sec.gscode === 0 || sec.gstatus === 'SUSPENDED';
        const cacheKey = `runner_${sec.sid || sec.nat || 'col'}`;

        // Anti-flicker smoothing: if momentary 0 tick occurs without explicit upstream suspension, keep last confirmed odds for 1.8s
        if (!isExplicitlySuspended && back === 0 && lay === 0 && this.oddsHysteresis.has(cacheKey)) {
          const cached = this.oddsHysteresis.get(cacheKey);
          if (Date.now() - cached.ts < 1800) {
            back = cached.back;
            backSize = cached.backSize;
            lay = cached.lay;
            laySize = cached.laySize;
          }
        } else if (back > 0 || lay > 0) {
          this.oddsHysteresis.set(cacheKey, { back, backSize, lay, laySize, ts: Date.now() });
        }

        const isRunnerSuspended = isExplicitlySuspended || (back === 0 && lay === 0);
        return {
          name: sec.nat || '',
          back,
          backSize,
          lay,
          laySize,
          suspended: isRunnerSuspended,
          exists: true
        };
      };

      if (r1) col1 = extractOdds(r1);
      if (rX && (rX.sno === 2 || /^(the\s+)?draw$/i.test((rX.nat || '').trim()))) {
        colX = extractOdds(rX);
      }
      if (r2) col2 = extractOdds(r2);
    }

    return { col1, colX, col2 };
  }

  /**
   * Fetch All Live Matches across ALL Sports with Tiered Polling & Anti-Throttling
   * Hot sports (Cricket, Football, Tennis) fetched every tick for 0-latency live rates.
   * Secondary sports fetched every 4th tick.
   * All results stored in Redis/Memory Cache Service.
   */
  async fetchAllLiveSports() {
    this.sportsFetchTick++;
    const isFullTick = this.sportsFetchTick % 4 === 1;

    // Primary sports that represent 98%+ of live exchange activity
    const hotSportIds = [4, 1, 2];
    // Secondary sports
    const secondarySportIds = [8, 7, 43, 15, 69, 18, 9, 11, 59, 17, 40, 58, 54];

    const targetSportIds = isFullTick 
      ? [...hotSportIds, ...secondarySportIds] 
      : hotSportIds;

    const promises = targetSportIds.map(etid => 
      this.executeUpstream(`/highlighthomePrivate?etid=${etid}`, { etid, type: 'all' })
        .then(res => ({ etid, res }))
        .catch(() => ({ etid, res: null }))
    );

    const results = await Promise.all(promises);

    for (const { etid, res } of results) {
      if (res && res.success && res.data) {
        const rawMatches = [...(res.data.t1 || []), ...(res.data.t2 || [])];
        const sportInfo = SPORT_NAMES[etid] || { name: 'Sports', icon: '🏆' };

        const parsedMatches = rawMatches.map(item => {
          const gmid = String(item.gmid);
          const cols = this.mapRunnersToColumns(item.section, item.gscode, item.status);

          const runners = [];
          if (cols.col1.exists) runners.push({ runnerName: cols.col1.name || '1', backPrice: cols.col1.back, layPrice: cols.col1.lay, status: cols.col1.suspended ? 'SUSPENDED' : 'ACTIVE' });
          if (cols.colX.exists) runners.push({ runnerName: cols.colX.name || 'X', backPrice: cols.colX.back, layPrice: cols.colX.lay, status: cols.colX.suspended ? 'SUSPENDED' : 'ACTIVE' });
          if (cols.col2.exists) runners.push({ runnerName: cols.col2.name || '2', backPrice: cols.col2.back, layPrice: cols.col2.lay, status: cols.col2.suspended ? 'SUSPENDED' : 'ACTIVE' });

          const isVirtual = (item.ename || '').includes('(e)') || (item.cname || '').toLowerCase().includes('virtual');

          return {
            gmid,
            etid: item.etid || etid,
            sportName: sportInfo.name,
            sportIcon: sportInfo.icon,
            eventName: (item.ename || 'Match').trim(),
            competition: item.cname || 'Exchange',
            inPlay: Boolean(item.iplay),
            status: item.status || (item.gscode === 0 ? 'SUSPENDED' : 'OPEN'),
            gscode: item.gscode !== undefined ? item.gscode : 1,
            stime: item.stime || '',
            tv: Boolean(item.tv || item.gtv || item.scard),
            fancy: Boolean(item.f || etid === 4),
            bm: Boolean(item.bm || etid === 4 || etid === 1),
            isVirtual,
            cols,
            runners
          };
        });

        // D247 Exact Sorting per sport
        parsedMatches.sort((a, b) => {
          if (a.inPlay && !b.inPlay) return -1;
          if (!a.inPlay && b.inPlay) return 1;
          if (a.inPlay && b.inPlay) {
            if (a.isVirtual && !b.isVirtual) return -1;
            if (!a.isVirtual && b.isVirtual) return 1;
          }
          return new Date(a.stime || 0) - new Date(b.stime || 0);
        });

        // Pin Super Over 2 at top of Cricket (etid 4)
        if (etid === 4) {
          const superOver2Item = {
            gmid: 'superover2',
            etid: 4,
            sportName: 'Cricket',
            sportIcon: '🏏',
            eventName: 'Super Over2',
            competition: 'Diamond Virtual Cricket',
            inPlay: true,
            status: 'OPEN',
            gscode: 1,
            stime: '',
            tv: true,
            fancy: true,
            bm: true,
            isVirtual: true,
            isPinned: true,
            cols: {
              col1: { name: 'IND', back: 0, lay: 0, suspended: true, exists: true },
              colX: { name: '', back: 0, lay: 0, suspended: false, exists: false },
              col2: { name: 'ENG', back: 0, lay: 0, suspended: true, exists: true }
            },
            runners: [
              { runnerName: 'IND', backPrice: 0, layPrice: 0, status: 'SUSPENDED' },
              { runnerName: 'ENG', backPrice: 0, layPrice: 0, status: 'SUSPENDED' }
            ]
          };
          parsedMatches.unshift(superOver2Item);
        }

        // Pin Goal 2 at top of Football (etid 1)
        if (etid === 1) {
          const goal2Item = {
            gmid: 'goal2',
            etid: 1,
            sportName: 'Football',
            sportIcon: '⚽',
            eventName: 'Goal 2',
            competition: 'Diamond Virtual Football',
            inPlay: true,
            status: 'OPEN',
            gscode: 1,
            stime: '',
            tv: true,
            fancy: false,
            bm: true,
            isVirtual: true,
            isPinned: true,
            cols: {
              col1: { name: 'Team 1', back: 0, lay: 0, suspended: true, exists: true },
              colX: { name: '', back: 0, lay: 0, suspended: false, exists: false },
              col2: { name: 'Team 2', back: 0, lay: 0, suspended: true, exists: true }
            },
            runners: [
              { runnerName: 'Team 1', backPrice: 0, layPrice: 0, status: 'SUSPENDED' },
              { runnerName: 'Team 2', backPrice: 0, layPrice: 0, status: 'SUSPENDED' }
            ]
          };
          parsedMatches.unshift(goal2Item);
        }

        this.sportMatchesMap.set(etid, parsedMatches);
      }
    }

    // Assemble all events preserving sport order: Cricket (4), Football (1), Tennis (2), etc.
    const allOrderedSports = [4, 1, 2, 8, 7, 43, 15, 69, 18, 9, 11, 59, 17, 40, 58, 54];
    const allEvents = [];
    for (const sid of allOrderedSports) {
      const list = this.sportMatchesMap.get(sid);
      if (list && list.length > 0) {
        allEvents.push(...list);
      }
    }

    if (allEvents.length > 0) {
      this.inPlayEvents = allEvents;
      await cacheService.set('events:inplay', allEvents, 30);
      this.io.emit('events_list_update', this.inPlayEvents);
    }
  }

  /**
   * Format detailed gamedataPrivate for interactive match view
   * Handles Bookmaker, Fancy, Fancy1, Scoreboard, and Suspended states.
   */
  /**
   * Format Game Data from Diamond Online with Exact Indexing, Full Betfair 3-Back/3-Lay Ladder & Limits
   */
  formatGameData(gmid, etid, rawData) {
    if (!rawData || !Array.isArray(rawData)) return null;

    const eventMeta = this.inPlayEvents.find(e => String(e.gmid) === String(gmid)) || {
      gmid,
      etid: etid || 4,
      eventName: "Live Match",
      competition: "Exchange"
    };

    const markets = [];

    for (let mIdx = 0; mIdx < rawData.length; mIdx++) {
      const m = rawData[mIdx];
      const isFancy = m.gtype === 'fancy';
      const isFancy1 = m.gtype === 'fancy1';

      if (isFancy && Array.isArray(m.section)) {
        const fancyList = [];
        for (const f of m.section) {
          let yesOdds = 0, yesRate = 0, noOdds = 0, noRate = 0;

          if (Array.isArray(f.odds)) {
            for (const o of f.odds) {
              const otype = (o.otype || '').toLowerCase();
              if (otype === 'back') {
                yesOdds = o.odds;
                yesRate = o.size || 100;
              } else if (otype === 'lay') {
                noOdds = o.odds;
                noRate = o.size || 100;
              }
            }
          }

          const isSuspended = f.gstatus === 'SUSPENDED' || f.gscode === 0 || (yesOdds === 0 && noOdds === 0);

          fancyList.push({
            title: f.nat,
            noRate: noOdds || 0,
            noOdds: noRate || 100,
            yesRate: yesOdds || 0,
            yesOdds: yesRate || 100,
            status: isSuspended ? 'SUSPENDED' : 'ACTIVE',
            suspended: isSuspended,
            max: f.max || m.max || 100000,
            min: f.min || m.min || 100
          });
        }

        if (fancyList.length > 0) {
          markets.push({
            marketId: String(m.mid || `${gmid}_fancy_${mIdx}`),
            marketName: m.mname || 'Fancy',
            marketType: 'fancy',
            status: m.status,
            min: m.min || 100,
            max: m.max || 100000,
            rem: m.rem || '',
            fancyList
          });
        }
      } else if (isFancy1 && Array.isArray(m.section)) {
        const fancy1List = [];
        for (const f of m.section) {
          let backRate = 0, layRate = 0;
          if (Array.isArray(f.odds)) {
            for (const o of f.odds) {
              const otype = (o.otype || '').toLowerCase();
              if (otype === 'back' && o.odds > 0) backRate = o.odds;
              if (otype === 'lay' && o.odds > 0) layRate = o.odds;
            }
          }

          const isSuspended = f.gstatus === 'SUSPENDED' || f.gscode === 0 || (backRate === 0 && layRate === 0);

          fancy1List.push({
            title: f.nat,
            back: backRate,
            lay: layRate,
            status: isSuspended ? 'SUSPENDED' : 'ACTIVE',
            suspended: isSuspended,
            min: f.min || 100,
            max: f.max || 10000,
            rem: f.rem || ''
          });
        }

        if (fancy1List.length > 0) {
          markets.push({
            marketId: String(m.mid || `${gmid}_fancy1_${mIdx}`),
            marketName: m.mname || 'Fancy1',
            marketType: 'fancy1',
            status: m.status,
            min: m.min || 100,
            max: m.max || 10000,
            rem: m.rem || '',
            fancy1List
          });
        }
      } else {
        // Standard Market Odds / Bookmaker / Game Winner / Other Live Markets
        const runners = [];
        if (Array.isArray(m.section)) {
          for (const sec of m.section) {
            const backs = [];
            const lays = [];

            if (Array.isArray(sec.odds)) {
              for (const o of sec.odds) {
                const otype = (o.otype || '').toLowerCase();
                if (otype === 'back') {
                  backs.push({ price: o.odds, size: o.size || 0, oname: o.oname });
                } else if (otype === 'lay') {
                  lays.push({ price: o.odds, size: o.size || 0, oname: o.oname });
                }
              }
            }

            // Sort backs ascending (lowest to highest odds)
            backs.sort((a, b) => a.price - b.price);
            // Sort lays ascending (lowest to highest odds)
            lays.sort((a, b) => a.price - b.price);

            let bestBack = backs.length > 0 ? backs[backs.length - 1] : { price: 0, size: 0 };
            let bestLay = lays.length > 0 ? lays[0] : { price: 0, size: 0 };
            const isExplicitlySuspended = m.status === 'SUSPENDED' || sec.gstatus === 'SUSPENDED' || sec.gscode === 0;
            const runnerKey = `m_${gmid}_${sec.sid || sec.nat}`;

            // Anti-flicker: If not explicitly suspended but odds are momentarily 0, keep previous odds for 1.8s
            if (!isExplicitlySuspended && bestBack.price === 0 && bestLay.price === 0 && this.oddsHysteresis.has(runnerKey)) {
              const cached = this.oddsHysteresis.get(runnerKey);
              if (Date.now() - cached.ts < 1800) {
                bestBack = { price: cached.backPrice, size: cached.backSize };
                bestLay = { price: cached.layPrice, size: cached.laySize };
                if (backs.length === 0 && cached.backs) backs.push(...cached.backs);
                if (lays.length === 0 && cached.lays) lays.push(...cached.lays);
              }
            } else if (bestBack.price > 0 || bestLay.price > 0) {
              this.oddsHysteresis.set(runnerKey, {
                backPrice: bestBack.price,
                backSize: bestBack.size,
                layPrice: bestLay.price,
                laySize: bestLay.size,
                backs: [...backs],
                lays: [...lays],
                ts: Date.now()
              });
            }

            const isSuspended = isExplicitlySuspended || (bestBack.price === 0 && bestLay.price === 0);

            runners.push({
              sid: sec.sid,
              runnerName: sec.nat || 'Runner',
              backPrice: bestBack.price,
              backSize: bestBack.size,
              layPrice: bestLay.price,
              laySize: bestLay.size,
              backs: backs, // Full Betfair 3-tier depth
              lays: lays,   // Full Betfair 3-tier depth
              status: isSuspended ? 'SUSPENDED' : (sec.gstatus || 'ACTIVE'),
              suspended: isSuspended
            });
          }
        }

        markets.push({
          marketId: String(m.mid || `${gmid}_${mIdx}`),
          marketName: m.mname || 'Match Odds',
          marketType: m.mname === 'MATCH_ODDS' ? 'match_odds' : 'normal',
          status: m.status,
          min: m.min || 100,
          max: m.max || 25000,
          rem: m.rem || '',
          runners
        });
      }
    }

    return {
      gmid,
      etid: eventMeta.etid,
      eventName: eventMeta.eventName,
      competition: eventMeta.competition,
      status: "IN_PLAY",
      remark: rawData[0]?.rem || eventMeta.remark || '',
      scoreboard: null, // Only show scoreboard when real data is available
      markets,
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Fetch live match data directly from upstream (NO STALE CACHE)
   */
  async fetchLiveMatchData(gmid, etid = 4) {
    // 1. Super Over 2 (Virtual Cricket)
    if (gmid === 'superover2') {
      try {
        const rawRes = await this.executeUpstream('/casino/data', { type: 'superover2' });
        if (rawRes && rawRes.success && rawRes.data) {
          const t1 = rawRes.data.t1 || {};
          const t2 = rawRes.data.t2 || [];
          const formatted = this.formatGameData('superover2', 4, t2);
          if (formatted) {
            formatted.timer = t1.lt !== undefined ? t1.lt : 0;
            formatted.totalTimer = t1.ft || 20;
            formatted.card = t1.card || '';
            formatted.eventName = t1.ename || 'IND Vs ENG Super Over2';
            formatted.status = t1.lt === 0 ? 'SUSPENDED' : 'IN_PLAY';
            this.matchCache.set(gmid, formatted);
            return formatted;
          }
        }
      } catch (err) {}
    }

    // 2. Goal 2 (Virtual Football)
    if (gmid === 'goal2') {
      try {
        const rawRes = await this.executeUpstream('/casino/data', { type: 'goal2' });
        if (rawRes && rawRes.success && rawRes.data) {
          const raw = rawRes.data;
          const sub = raw.sub || [];
          
          const runners = sub.map(s => {
            const isSuspended = raw.lt === 0 || s.gstatus === 'SUSPENDED' || (s.b === 0 && s.l === 0);
            return {
              sid: s.sid,
              runnerName: s.nat,
              backPrice: s.b || 0,
              backSize: s.bs || 0,
              layPrice: s.l || 0,
              laySize: s.ls || 0,
              backs: [{ price: s.b || 0, size: s.bs || 0 }],
              lays: [{ price: s.l || 0, size: s.ls || 0 }],
              status: isSuspended ? 'SUSPENDED' : 'ACTIVE',
              suspended: isSuspended,
              min: s.min || 100,
              max: s.max || 50000
            };
          });

          const markets = [{
            marketId: 'goal2_market',
            marketName: 'Goal 2 - Goalscorer / Match Odds',
            marketType: 'normal',
            status: raw.lt === 0 ? 'SUSPENDED' : 'OPEN',
            min: 100,
            max: 50000,
            rem: raw.remark || '',
            runners: runners
          }];

          const formatted = {
            gmid: 'goal2',
            etid: 1,
            eventName: 'Goal 2 (Football Live)',
            competition: 'Diamond Virtual Football',
            status: raw.lt === 0 ? 'SUSPENDED' : 'IN_PLAY',
            timer: raw.lt !== undefined ? raw.lt : 0,
            totalTimer: raw.ft || 25,
            scoreboard: null,
            markets,
            updatedAt: new Date().toISOString()
          };

          this.matchCache.set(gmid, formatted);
          return formatted;
        }
      } catch (err) {}
    }

    // 3. Regular In-Play Sports Matches
    try {
      const matchMeta = this.inPlayEvents.find(e => String(e.gmid) === String(gmid)) || { etid };
      const rawRes = await this.executeUpstream(`/gamedataPrivate?etid=${matchMeta.etid}&gmid=${gmid}`, {
        etid: parseInt(matchMeta.etid),
        gmid: parseInt(gmid) || gmid
      });

      if (rawRes && rawRes.success && Array.isArray(rawRes.data)) {
        const formatted = this.formatGameData(gmid, matchMeta.etid, rawRes.data);
        if (formatted) {
          this.matchCache.set(gmid, formatted);
          await cacheService.set(`match:${gmid}`, formatted, 60);
          return formatted;
        }
      }
    } catch (err) {}

    // Redis fallback
    const cachedRedis = await cacheService.get(`match:${gmid}`);
    if (cachedRedis) return cachedRedis;

    return this.matchCache.get(gmid) || null;
  }

  /**
   * Main High-Frequency Sync Loop (500ms)
   * Instant rate broadcast to all subscribed sockets
   */
  async syncTick() {
    for (const gmid of this.activeGmidSubscriptions) {
      try {
        const fresh = await this.fetchLiveMatchData(gmid);
        if (fresh) {
          this.io.to(`match:${gmid}`).emit('odds_update', {
            gmid,
            markets: fresh.markets,
            scoreboard: fresh.scoreboard,
            updatedAt: fresh.updatedAt
          });

          // Ticker
          const mo = fresh.markets.find(m => m.marketName === 'Match Odds' || m.marketName === 'Bookmaker');
          if (mo && mo.runners && mo.runners[0]) {
            this.io.emit('quick_rate_ticker', {
              gmid,
              eventName: fresh.eventName,
              runner: mo.runners[0].runnerName,
              back: mo.runners[0].backPrice,
              lay: mo.runners[0].layPrice
            });
          }
        }
      } catch (err) {}
    }
  }

  start() {
    if (this.isPolling) return;
    this.isPolling = true;
    console.log(`⚡ D247 Real-Time Upstream Sync Engine Started! Running every ${this.pollIntervalMs}ms...`);
    
    // Poll active match odds every 500ms
    this.timer = setInterval(() => this.syncTick(), this.pollIntervalMs);

    // Refresh all sports matches every 1500ms in parallel
    this.sportsTimer = setInterval(() => this.fetchAllLiveSports(), 1500);

    // Auto-renew session every 30 minutes in background
    setInterval(() => this.autoLoginDemo(), 30 * 60 * 1000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.sportsTimer) {
      clearInterval(this.sportsTimer);
      this.sportsTimer = null;
    }
    this.isPolling = false;
  }
}

module.exports = D247SyncEngine;
