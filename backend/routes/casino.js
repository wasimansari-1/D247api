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

  return router;
};
