/**
 * D247 Full Platform Real-Time Server
 * Express REST APIs + Socket.IO Zero-Latency Streaming Server
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const D247SyncEngine = require('./backend/syncEngine');
const sportsRoutes = require('./backend/routes/sports');
const casinoRoutes = require('./backend/routes/casino');
const configRoutes = require('./backend/routes/config');
const docsRoutes = require('./backend/routes/docs');

const app = express();
const server = http.createServer(app);

// Enable CORS & JSON parsing
app.use(cors());
app.use(express.json());

// Serve React frontend (frontend/dist) or fallback to public/
const distPath = path.join(__dirname, 'frontend', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
} else {
  app.use(express.static(path.join(__dirname, 'public')));
}

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Initialize & Start D247 Real-Time Sync Engine
const syncEngine = new D247SyncEngine(io);
syncEngine.start();

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: [${socket.id}]`);

  // Client subscribes to a specific live match
  socket.on('join_match', (gmid) => {
    socket.join(`match:${gmid}`);
    syncEngine.activeGmidSubscriptions.add(gmid);
    console.log(`🎯 Client [${socket.id}] joined match: ${gmid}`);

    // Send immediate snapshot if available
    const snapshot = syncEngine.matchCache.get(gmid);
    if (snapshot) {
      socket.emit('odds_update', {
        gmid,
        roundId: snapshot.roundId || '',
        markets: snapshot.markets,
        scoreboard: snapshot.scoreboard,
        streamUrl: snapshot.streamUrl,
        timer: snapshot.timer,
        totalTimer: snapshot.totalTimer,
        card: snapshot.card,
        cards: snapshot.cards,
        recentResults: snapshot.recentResults,
        status: snapshot.status,
        updatedAt: snapshot.updatedAt
      });
    }
  });

  // Client leaves match
  socket.on('leave_match', (gmid) => {
    socket.leave(`match:${gmid}`);
    console.log(`👋 Client [${socket.id}] left match: ${gmid}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: [${socket.id}]`);
  });
});

// Mount API Routes
app.use('/api/sports', sportsRoutes(syncEngine));
app.use('/api/casino', casinoRoutes(syncEngine));
app.use('/api/config', configRoutes(syncEngine));
app.use('/api/docs', docsRoutes(syncEngine));

// Dedicated Frontend Route for Commercial API Documentation (/docs)
app.get(['/docs', '/api-docs', '/docs/*'], (req, res) => {
  const distIndex = path.join(__dirname, 'frontend', 'dist', 'index.html');
  if (fs.existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fallback index
app.use((req, res) => {
  const distIndex = path.join(__dirname, 'frontend', 'dist', 'index.html');
  if (fs.existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5005;

server.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 D247 Real-Time MERN Server running on http://localhost:${PORT}`);
  console.log(`📊 Sports API: http://localhost:${PORT}/api/sports/in-play`);
  console.log(`🎰 Casino API: http://localhost:${PORT}/api/casino/tables`);
  console.log(`⚡ WebSocket / Socket.IO live and syncing with Diamond rates!`);
  console.log('====================================================');
});
