/**
 * D247 Full Platform Real-Time Server
 * Express REST APIs + Socket.IO Zero-Latency Streaming Server
 */

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const D247SyncEngine = require("./backend/syncEngine");
const sportsRoutes = require("./backend/routes/sports");
const casinoRoutes = require("./backend/routes/casino");
const configRoutes = require("./backend/routes/config");
const docsRoutes = require("./backend/routes/docs");
const masterGuard = require("./backend/masterGuard");
const masterRoutes = require("./backend/routes/master");

const app = express();
const server = http.createServer(app);

// Enable CORS & JSON parsing
app.use(cors());
app.use(express.json());

// Mount D247 Master Guard Management Dashboard & Auth API
app.use(masterRoutes());

// Serve React frontend (frontend/dist) or fallback to public/
const distPath = path.join(__dirname, "frontend", "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
} else {
  app.use(express.static(path.join(__dirname, "public")));
}

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Initialize & Start D247 Real-Time Sync Engine
const syncEngine = new D247SyncEngine(io);
syncEngine.start();

// Socket.IO Connection Handler
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: [${socket.id}]`);

  // Client subscribes to a specific live match
  socket.on("join_match", (gmid) => {
    socket.join(`match:${gmid}`);
    syncEngine.activeGmidSubscriptions.add(gmid);
    console.log(`🎯 Client [${socket.id}] joined match: ${gmid}`);

    // Send immediate snapshot if available
    const snapshot = syncEngine.matchCache.get(gmid);
    if (snapshot) {
      socket.emit("odds_update", {
        gmid,
        roundId: snapshot.roundId || "",
        markets: snapshot.markets,
        scoreboard: snapshot.scoreboard,
        streamUrl: snapshot.streamUrl,
        timer: snapshot.timer,
        totalTimer: snapshot.totalTimer,
        card: snapshot.card,
        cards: snapshot.cards,
        recentResults: snapshot.recentResults,
        status: snapshot.status,
        updatedAt: snapshot.updatedAt,
      });
    }
  });

  // Client leaves match
  socket.on("leave_match", (gmid) => {
    socket.leave(`match:${gmid}`);
    console.log(`👋 Client [${socket.id}] left match: ${gmid}`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: [${socket.id}]`);
  });
});

// Mount API Routes
app.use("/api/sports", sportsRoutes(syncEngine));
app.use("/api/casino", casinoRoutes(syncEngine));
app.use("/api/config", configRoutes(syncEngine));
app.use("/api/docs", docsRoutes(syncEngine));

// Relay route lookup for trubets video player (fixes WebSocket resolution)
app.get(
  [
    "/api/relay/route/:wsid",
    "/relay/route/:wsid",
    "/stream-assets/api/relay/route/:wsid",
    "/stream-assets/relay/route/:wsid",
  ],
  masterGuard.guardMiddleware("tvStream"),
  async (req, res) => {
    let rawWsid = req.params.wsid;

    // Check if query or referer has the intended gameType (prevents player.bundle.js lucky7 fallback)
    if (req.query.gameType) {
      rawWsid = req.query.gameType;
    } else if (req.query.id) {
      rawWsid = req.query.id;
    } else {
      const ref = req.headers.referer || "";
      const match =
        ref.match(/[?&](?:gameType|id)=([a-zA-Z0-9_]+)/i) ||
        ref.match(/\/player\/([a-zA-Z0-9_]+)/i) ||
        ref.match(/\/mediaplayer\/([a-zA-Z0-9_]+)/i);
      if (match && match[1] && match[1].toLowerCase() !== "lucky7") {
        rawWsid = match[1];
      }
    }

    const wsid =
      syncEngine?.constructor?.CASINO_SLUG_MAP?.[rawWsid?.toLowerCase()] ||
      rawWsid;
    try {
      const upRes = await fetch(
        `https://stream.trubets365.com/api/relay/route/${encodeURIComponent(wsid)}`,
        {
          headers: { Accept: "application/json" },
        },
      );
      if (upRes.ok) {
        const data = await upRes.json();
        data.wsid = req.params.wsid;
        data.targetWsid = wsid;
        if (!data.url && data.path) {
          data.url = `wss://stream1.trubets365.com${data.path}`;
        }
        res.setHeader("access-control-allow-origin", "*");
        res.setHeader("content-type", "application/json");
        return res.json(data);
      }
    } catch (e) {}

    // Safe direct upstream WebSocket route fallback
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("content-type", "application/json");
    return res.json({
      ok: true,
      status: "live",
      targetWsid: wsid,
      wsid: req.params.wsid,
      nodeId: "stream-c",
      path: `/stream/c/${encodeURIComponent(wsid)}`,
      url: `wss://stream1.trubets365.com/stream/c/${encodeURIComponent(wsid)}`,
    });
  },
);

// Direct Proxy for Live Stream Assets to prevent Unexpected Token '<'
app.use("/stream-assets", masterGuard.guardMiddleware("tvStream"), async (req, res) => {
  try {
    const assetPath = req.path.replace(/^\/stream-assets/, "");
    const upstreamUrl = `https://stream.trubets365.com/stream-assets${assetPath}${req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""}`;
    const proxyRes = await fetch(upstreamUrl, {
      headers: {
        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
        Referer: "https://diamondonline7.com/",
      },
    });
    if (!proxyRes.ok) return res.status(proxyRes.status).end();
    
    // Dynamic Patch for player.bundle.js: Guarantee it NEVER defaults to lucky7!
    if (assetPath.includes("player.bundle.js")) {
      let code = await proxyRes.text();
      code = code.replace(/gameType:\s*["']lucky7["']/gi, 'gameType:(window.__STREAM_PLAYER_OVERRIDE_GAMETYPE__||"lucky7")');
      code = code.replace(/return\s+s\|\|a\.searchParams\.get\("gameType"\)\|\|m\|\|t\.gameType\|\|""/g, 'return (window.__STREAM_PLAYER_OVERRIDE_GAMETYPE__||s||a.searchParams.get("gameType")||m||t.gameType||"")');
      res.setHeader("content-type", "application/javascript; charset=utf-8");
      res.setHeader("access-control-allow-origin", "*");
      return res.send(code);
    }

    const contentType = proxyRes.headers.get("content-type");
    if (contentType) res.setHeader("content-type", contentType);
    res.setHeader("access-control-allow-origin", "*");
    const buf = await proxyRes.arrayBuffer();
    return res.send(Buffer.from(buf));
  } catch (e) {
    return res.status(502).end();
  }
});

app.get(["/newplayer.min.js", "/player.bundle.js"], masterGuard.guardMiddleware("tvStream"), async (req, res) => {
  try {
    const filename = req.path.slice(1);
    const upstreamUrl = `https://stream.trubets365.com/stream-assets/${filename}${req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""}`;
    const proxyRes = await fetch(upstreamUrl);
    if (!proxyRes.ok) return res.status(proxyRes.status).end();

    if (filename.includes("player.bundle.js")) {
      let code = await proxyRes.text();
      code = code.replace(/gameType:\s*["']lucky7["']/gi, 'gameType:(window.__STREAM_PLAYER_OVERRIDE_GAMETYPE__||"lucky7")');
      code = code.replace(/return\s+s\|\|a\.searchParams\.get\("gameType"\)\|\|m\|\|t\.gameType\|\|""/g, 'return (window.__STREAM_PLAYER_OVERRIDE_GAMETYPE__||s||a.searchParams.get("gameType")||m||t.gameType||"")');
      res.setHeader("content-type", "application/javascript; charset=utf-8");
      res.setHeader("access-control-allow-origin", "*");
      return res.send(code);
    }

    res.setHeader("content-type", "application/javascript; charset=utf-8");
    res.setHeader("access-control-allow-origin", "*");
    const buf = await proxyRes.arrayBuffer();
    return res.send(Buffer.from(buf));
  } catch (e) {
    return res.status(502).end();
  }
});

// Dedicated handler for /stream/:wsid to prevent HTML SPA fallback
app.get(["/stream/:wsid", "/stream/c/:wsid"], masterGuard.guardMiddleware("tvStream"), (req, res) => {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("content-type", "application/json");
  return res.json({ ok: true, wsid: req.params.wsid });
});

// Fallback index
app.use((req, res) => {
  const distIndex = path.join(__dirname, "frontend", "dist", "index.html");
  if (fs.existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5005;

server.listen(PORT, () => {
  console.log("====================================================");
  console.log(
    `🚀 D247 Real-Time MERN Server running on http://localhost:${PORT}`,
  );
  console.log(`📊 Sports API: http://localhost:${PORT}/api/sports/in-play`);
  console.log(`🎰 Casino API: http://localhost:${PORT}/api/casino/tables`);
  console.log(`⚡ WebSocket / Socket.IO live and syncing with Diamond rates!`);
  console.log("====================================================");
});
