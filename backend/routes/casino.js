const express = require("express");
const path = require("path");
const fs = require("fs");

module.exports = function (syncEngine) {
  const router = express.Router();
  const imageCache = new Map();

  // Get strictly the Official Diamond Casino Tables
  router.get("/tables", async (req, res) => {
    let tables = syncEngine.casinoTables;
    if (tables.length === 0) {
      await syncEngine.fetchLiveCasinoTables();
      tables = syncEngine.casinoTables;
    }
    res.json({
      success: true,
      total: tables.length,
      data: tables,
    });
  });

  // Image Proxy Route: streams authentic CDN artwork with local cache & fallback
  router.get("/image/:slug", async (req, res) => {
    const rawSlug = (req.params.slug || "").toLowerCase();
    const slugMap = syncEngine.constructor?.CASINO_SLUG_MAP || {};
    const slug = slugMap[rawSlug] || rawSlug;

    // 1. Check local assets folder (e.g. dolidana.jpg)
    const localCandidates = [
      path.join(__dirname, "..", "assets", "casino", `${slug}.jpg`),
      path.join(__dirname, "..", "assets", "casino", `${rawSlug}.jpg`),
    ];
    for (const f of localCandidates) {
      if (fs.existsSync(f)) {
        res.setHeader("Content-Type", "image/jpeg");
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.sendFile(f);
      }
    }

    // 2. Check memory cache
    if (imageCache.has(slug)) {
      const cached = imageCache.get(slug);
      res.setHeader("Content-Type", cached.contentType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.send(cached.buffer);
    }

    const primaryUrl = `https://cdn.926assets.com/g1-casino-icons/lc/${slug}.jpg`;
    const altUrl = `https://cdn.926assets.com/g1-casino-icons/lc/${rawSlug}.jpg`;
    const defaultUrl = `https://cdn.926assets.com/g1-casino-icons/lc/teen20.jpg`;

    try {
      let imgRes = await fetch(primaryUrl);
      if (!imgRes.ok && slug !== rawSlug) {
        imgRes = await fetch(altUrl);
      }
      if (!imgRes.ok) {
        imgRes = await fetch(defaultUrl);
      }
      if (imgRes.ok) {
        const buffer = Buffer.from(await imgRes.arrayBuffer());
        const contentType = imgRes.headers.get("content-type") || "image/jpeg";
        imageCache.set(slug, { buffer, contentType });
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=86400");
        return res.send(buffer);
      }
    } catch (err) {
      // Fallback
    }

    res.status(404).send("Image not found");
  });

  // Get Live Round Data (Real Cards, Real Countdown Timer, Real Odds) from Diamond Online
  router.get("/round/:gameType", async (req, res) => {
    const gameType = req.params.gameType;
    try {
      const liveRound = await syncEngine.fetchLiveCasinoRound(gameType);
      if (liveRound) {
        return res.json({ success: true, data: liveRound });
      }
    } catch (err) {
      console.error(
        `Error fetching live casino round for ${gameType}:`,
        err.message,
      );
    }
    res.status(500).json({
      success: false,
      msg: "Failed to fetch live casino data from Diamond",
    });
  });

  // Get Real Recent Results from Diamond Online
  router.get("/results/:gameType", async (req, res) => {
    const gameType = req.params.gameType;
    try {
      const results = await syncEngine.fetchCasinoRecentResults(gameType);
      return res.json({
        success: true,
        gameType,
        total: results.length,
        data: results,
      });
    } catch (err) {
      console.error(
        `Error fetching recent results for ${gameType}:`,
        err.message,
      );
    }
    res
      .status(500)
      .json({ success: false, msg: "Failed to fetch recent results" });
  });

  // Dedicated Standalone Live Video Player (No X-Frame-Options block, 100% embeddable)
  router.get(["/player/:slug", "/stream/:slug"], async (req, res) => {
    const slug = req.params.slug;
    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "103.21.244.2";

    // Set headers to permit embedding anywhere
    res.removeHeader("X-Frame-Options");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Permissions-Policy", "unload=*");
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    let streamData = null;
    try {
      streamData = await syncEngine.getCasinoStreamUrl(slug, clientIp);
    } catch (e) {}

    const upstreamUrl = streamData?.upstreamUrl || "";
    const tableName = slug.replace(/_/g, " ").toUpperCase();

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>D247 Live Stream - ${tableName}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; height: 100%; background: #000; overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .stream-container { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #000; }
    .video-frame { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; z-index: 1; }
    .ambient-bg { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 0; background: #000; }
    .felt-pattern { position: absolute; inset: 0; opacity: 0.12; background-image: radial-gradient(#1e3a5f 1px, transparent 1px); background-size: 16px 16px; }
    .live-badge { position: absolute; top: 10px; right: 10px; z-index: 10; display: flex; align-items: center; gap: 6px; background: rgba(0,0,0,0.65); border: 1px solid rgba(255,255,255,0.12); padding: 3px 8px; border-radius: 16px; font-size: 9px; font-weight: 800; color: #fff; letter-spacing: 0.05em; backdrop-filter: blur(4px); }
    .live-dot { width: 6px; height: 6px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 6px #ef4444; animation: pulse 1.5s infinite; }
    .logo-watermark { position: absolute; bottom: 10px; left: 10px; z-index: 10; opacity: 0.35; font-size: 10px; font-weight: 900; letter-spacing: 0.1em; color: #38bdf8; text-transform: uppercase; }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } }
  </style>
</head>
<body>
  <div class="stream-container">
    <div class="live-badge">
      <span class="live-dot"></span>
      <span>LIVE</span>
    </div>
    <div class="logo-watermark">D247</div>

    ${
      upstreamUrl
        ? `
    <iframe 
      id="upstreamFrame"
      class="video-frame" 
      src="${upstreamUrl}"
      allow="autoplay; encrypted-media; fullscreen"
      referrerpolicy="no-referrer"
    ></iframe>
    `
        : ""
    }

    <div class="ambient-bg" id="ambientBg" style="${upstreamUrl ? "z-index: 0;" : "z-index: 2;"}">
      <div class="felt-pattern"></div>
    </div>
  </div>

  <script>
    // Suppress cross-origin frame noise
    window.addEventListener('error', function(e) {});
  </script>
</body>
</html>`;

    return res.send(html);
  });

  // Dedicated Reverse-Proxied Media Player for Diamond Online (Bypasses X-Frame-Options)
  router.get("/mediaplayer/:slug", async (req, res) => {
    const slug = req.params.slug;
    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "103.21.244.2";

    res.removeHeader("X-Frame-Options");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Permissions-Policy", "unload=*");
    res.setHeader("Content-Type", "text/html; charset=utf-8");

    try {
      const streamData = await syncEngine.getCasinoStreamUrl(slug, clientIp);
      if (streamData?.upstreamUrl) {
        const upRes = await fetch(streamData.upstreamUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Referer: "https://diamondonline7.com/home",
            Origin: "https://diamondonline7.com",
            Cookie: syncEngine.config?.headers?.Cookie || "",
          },
        });
        if (upRes.ok) {
          let text = await upRes.text();
          // Inject base href so relative bundles and scripts load cleanly
          if (!text.includes("<base")) {
            text = text.replace(
              "<head>",
              '<head><base href="https://diamondonline7.com/">',
            );
          }
          return res.send(text);
        }
      }
    } catch (err) {}

    // Fallback to local clean player
    return res.redirect(`/api/casino/player/${slug}`);
  });

  // Get Live Video Stream URL metadata for Casino Table (JSON)
  router.get(
    [
      "/:gameType/livetv",
      "/:gameType/video",
      "/:gameType/tv",
      "/:gameType/stream",
    ],
    async (req, res) => {
      const slug = req.params.gameType;

      // If browser requested HTML directly in address bar or iframe, render player
      if (
        req.headers.accept &&
        req.headers.accept.includes("text/html") &&
        req.query.json !== "true"
      ) {
        return res.redirect(`/api/casino/player/${slug}`);
      }

      const clientIp =
        req.headers["x-forwarded-for"]?.split(",")[0] ||
        req.socket.remoteAddress ||
        "103.21.244.2";

      try {
        const streamData = await syncEngine.getCasinoStreamUrl(slug, clientIp);
        return res.json({
          success: true,
          gameType: slug,
          streamUrl: `/api/casino/mediaplayer/${slug}`,
          playerUrl: `/api/casino/player/${slug}`,
          upstreamUrl: streamData.upstreamUrl,
          sources: [
            {
              name: "D247 Studio Stream",
              url: `/api/casino/mediaplayer/${slug}`,
              type: "iframe",
            },
            {
              name: "D247 Direct Player",
              url: `/api/casino/player/${slug}`,
              type: "iframe",
            },
            ...(streamData.upstreamUrl
              ? [
                  {
                    name: "Diamond Video (Direct)",
                    url: streamData.upstreamUrl,
                    type: "iframe",
                  },
                ]
              : []),
          ],
        });
      } catch (err) {
        return res.json({
          success: true,
          gameType: slug,
          streamUrl: `/api/casino/player/${slug}`,
          playerUrl: `/api/casino/player/${slug}`,
          sources: [
            {
              name: "D247 Live Stream",
              url: `/api/casino/player/${slug}`,
              type: "iframe",
            },
          ],
        });
      }
    },
  );

  return router;
};
