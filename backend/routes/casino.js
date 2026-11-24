const express = require('express');
const path = require('path');
const fs = require('fs');

module.exports = function(syncEngine) {
  const router = express.Router();
  const imageCache = new Map();

  // Get strictly the Official Diamond Casino Tables
  router.get('/tables', async (req, res) => {
    let tables = syncEngine.casinoTables;
    if (tables.length === 0) {
      await syncEngine.fetchLiveCasinoTables();
      tables = syncEngine.casinoTables;
    }
    res.json({
      success: true,
      total: tables.length,
      data: tables
    });
  });

  // Image Proxy Route: streams authentic CDN artwork with local cache & fallback
  router.get('/image/:slug', async (req, res) => {
    let slug = req.params.slug;
    if (slug === 'roulette') slug = 'roulette11';

    // 1. Check local assets folder (e.g. dolidana.jpg)
    const localFile = path.join(__dirname, '..', 'assets', 'casino', `${slug}.jpg`);
    if (fs.existsSync(localFile)) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(localFile);
    }

    // 2. Check memory cache
    if (imageCache.has(slug)) {
      const cached = imageCache.get(slug);
      res.setHeader('Content-Type', cached.contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(cached.buffer);
    }

    const primaryUrl = `https://cdn.926assets.com/g1-casino-icons/lc/${slug}.jpg`;
    const defaultUrl = `https://cdn.926assets.com/g1-casino-icons/default.jpg`;

    try {
      let imgRes = await fetch(primaryUrl);
      if (!imgRes.ok) {
        imgRes = await fetch(defaultUrl);
      }
      if (imgRes.ok) {
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
        imageCache.set(slug, { buffer, contentType });
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.send(buffer);
      }
    } catch (err) {
      // Fallback
    }

    res.status(404).send('Image not found');
  });

  // Get Live Round Data (Real Cards, Real Countdown Timer, Real Odds) from Diamond Online
  router.get('/round/:gameType', async (req, res) => {
    const gameType = req.params.gameType;
    try {
      const liveRound = await syncEngine.fetchLiveCasinoRound(gameType);
      if (liveRound) {
        return res.json({ success: true, data: liveRound });
      }
    } catch (err) {
      console.error(`Error fetching live casino round for ${gameType}:`, err.message);
    }
    res.status(500).json({ success: false, msg: "Failed to fetch live casino data from Diamond" });
  });

  // Get Real Recent Results from Diamond Online
  router.get('/results/:gameType', async (req, res) => {
    const gameType = req.params.gameType;
    try {
      const results = await syncEngine.fetchCasinoRecentResults(gameType);
      return res.json({
        success: true,
        gameType,
        total: results.length,
        data: results
      });
    } catch (err) {
      console.error(`Error fetching recent results for ${gameType}:`, err.message);
    }
    res.status(500).json({ success: false, msg: "Failed to fetch recent results" });
  });

  // Dedicated Standalone Live Video Player (No X-Frame-Options block, 100% embeddable)
  router.get(['/player/:slug', '/stream/:slug'], async (req, res) => {
    const slug = req.params.slug;
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '103.21.244.2';
    
    // Set headers to permit embedding anywhere
    res.removeHeader('X-Frame-Options');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Permissions-Policy', 'unload=*');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    let streamData = null;
    try {
      streamData = await syncEngine.getCasinoStreamUrl(slug, clientIp);
    } catch (e) {}

    const upstreamUrl = streamData?.upstreamUrl || '';
    const tableName = slug.replace(/_/g, ' ').toUpperCase();

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>D247 Live Stream - ${tableName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .stream-container { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at center, #0e1e2d 0%, #03080d 100%); }
    .video-frame { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; z-index: 1; }
    .ambient-bg { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 0; background: radial-gradient(circle at center, #0a2538 0%, #02070c 80%); }
    .felt-pattern { position: absolute; inset: 0; opacity: 0.15; background-image: radial-gradient(#1e40af 1px, transparent 1px); background-size: 16px 16px; }
    .live-badge { position: absolute; top: 12px; right: 12px; z-index: 10; display: flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.75); border: 1px solid rgba(255,255,255,0.15); padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 800; color: #fff; letter-spacing: 0.05em; backdrop-filter: blur(4px); }
    .live-dot { width: 7px; height: 7px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 8px #ef4444; animation: pulse 1.5s infinite; }
    .logo-watermark { position: absolute; bottom: 12px; left: 12px; z-index: 10; opacity: 0.4; font-size: 11px; font-weight: 900; letter-spacing: 0.1em; color: #38bdf8; text-transform: uppercase; }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
    .spinner { width: 40px; height: 40px; border: 3px solid rgba(56, 189, 248, 0.2); border-top-color: #38bdf8; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 12px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .status-text { color: #94a3b8; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; }
  </style>
</head>
<body>
  <div class="stream-container">
    <div class="live-badge">
      <span class="live-dot"></span>
      <span>LIVE BROADCAST</span>
    </div>
    <div class="logo-watermark">D247 EXCHANGE</div>

    ${upstreamUrl ? `
    <iframe 
      id="upstreamFrame"
      class="video-frame" 
      src="${upstreamUrl}"
      allow="autoplay; encrypted-media; fullscreen"
      referrerpolicy="no-referrer"
    ></iframe>
    ` : ''}

    <div class="ambient-bg" id="ambientBg" style="${upstreamUrl ? 'z-index: 0;' : 'z-index: 2;'}">
      <div class="felt-pattern"></div>
      <div class="spinner"></div>
      <div class="status-text">${tableName} • LIVE DEALER FEED ACTIVE</div>
    </div>
  </div>

  <script>
    // Suppress unload warnings in embedded context
    window.addEventListener('error', function(e) { /* ignore cross-origin errors */ });
  </script>
</body>
</html>`;

    return res.send(html);
  });

  // Get Live Video Stream URL metadata for Casino Table (JSON)
  router.get(['/:gameType/livetv', '/:gameType/video', '/:gameType/tv', '/:gameType/stream'], async (req, res) => {
    const slug = req.params.gameType;

    // If browser requested HTML directly in address bar or iframe, render player
    if (req.headers.accept && req.headers.accept.includes('text/html') && req.query.json !== 'true') {
      return res.redirect(`/api/casino/player/${slug}`);
    }

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '103.21.244.2';

    try {
      const streamData = await syncEngine.getCasinoStreamUrl(slug, clientIp);
      return res.json({
        success: true,
        gameType: slug,
        streamUrl: streamData.streamUrl,
        playerUrl: `/api/casino/player/${slug}`,
        sources: streamData.sources
      });
    } catch (err) {
      return res.json({
        success: true,
        gameType: slug,
        streamUrl: `/api/casino/player/${slug}`,
        playerUrl: `/api/casino/player/${slug}`,
        sources: [
          { name: 'D247 Live Stream', url: `/api/casino/player/${slug}`, type: 'iframe' }
        ]
      });
    }
  });

  return router;
};
