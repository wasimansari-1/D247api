/**
 * D247 Commercial API Documentation Service
 * Endpoints:
 * - GET /api/docs: Complete OpenAPI-style API Specification & Schema
 * - GET /api/docs/postman: Instant 1-Click Importable Postman Collection v2.1
 */

const express = require('express');

module.exports = function(syncEngine) {
  const router = express.Router();

  const API_DOCS_SPEC = {
    info: {
      title: "D247 Official Zero-Latency Betting & Casino Exchange API",
      version: "2.0.0",
      description: "High-performance, enterprise-grade sports betting and live casino data feed. Powered by Redis in-memory caching (0.001s latency), automated upstream demo session auto-renewal, and Socket.IO real-time WebSocket rate broadcasting.",
      contact: {
        vendor: "D247 Exchange Technologies",
        support: "24x7 Enterprise Technical Support",
        architecture: "Node.js 20+ / Express / Socket.IO / Redis"
      }
    },
    servers: [
      {
        url: "http://72.61.172.110:5005",
        description: "Production Hostinger VPS Endpoint"
      },
      {
        url: "http://localhost:5005",
        description: "Local Development Server"
      }
    ],
    features: [
      {
        name: "Zero-Latency Caching",
        detail: "In-memory RAM and Redis pipeline updates odds with < 1ms retrieval delay."
      },
      {
        name: "Zero-Intervention Session Auto-Renewal",
        detail: "Proactive automated handshake renews upstream tokens every 30 minutes with zero downtime."
      },
      {
        name: "Multi-Sport Breadth",
        detail: "Complete coverage of 37 sports, international Horse Racing (etid 10), and Greyhound Racing (etid 65)."
      },
      {
        name: "Full Casino Suite",
        detail: "Real-time cards, dice, roulette ball, flip clock timer, and odds across 77 official casino tables with exact Diamond indexing."
      },
      {
        name: "Zero-CORS Live TV Streams",
        detail: "Unrestricted, embeddable video player and media relay routes (/api/casino/mediaplayer/:slug) for all live sports and casino tables."
      }
    ],
    endpoints: [
      {
        category: "Sports Navigation & Match Feeds",
        method: "GET",
        path: "/api/sports/tree",
        summary: "Complete Sports Tree",
        description: "Retrieves complete multi-level navigation tree of all 37 sports, leagues, and competitions.",
        parameters: [],
        responseSample: {
          success: true,
          data: {
            t1: [
              { cid: 4, cname: "Cricket", children: [{ ename: "IPL 2026", children: [{ gmid: "33182910", name: "IND vs ENG" }] }] }
            ]
          }
        }
      },
      {
        category: "Sports Navigation & Match Feeds",
        method: "GET",
        path: "/api/sports/in-play",
        summary: "All In-Play Sports Events",
        description: "Returns every currently live match across all sports with real-time scoreboards and 1-X-2 rates.",
        parameters: [],
        responseSample: {
          success: true,
          total: 82,
          data: [
            {
              gmid: "33182910",
              eventName: "Hobart Hurricanes XI v Sydney Sixers XI",
              sport: "Cricket",
              etid: 4,
              status: "IN_PLAY",
              inPlay: true,
              iplay: true,
              back1: 1.26,
              lay1: 1.27,
              backX: 6.4,
              layX: 6.6,
              back2: 17.5,
              lay2: 18.0,
              scoreboard: { runs: 125, wickets: 5, overs: "10.0" }
            }
          ]
        }
      },
      {
        category: "Sports Navigation & Match Feeds",
        method: "GET",
        path: "/api/sports/match/:gmid",
        summary: "Live Match Odds & Market Depth",
        description: "Fetches full 3-tier Back/Lay market ladder, Bookmaker odds, Fancy markets, and limits for a match.",
        parameters: [
          { name: "gmid", in: "path", required: true, type: "string/number", example: "33182910" },
          { name: "etid", in: "query", required: false, type: "number", example: 4 }
        ],
        responseSample: {
          success: true,
          data: {
            gmid: "33182910",
            eventName: "India v England",
            status: "IN_PLAY",
            markets: [
              {
                marketId: "match_odds_33182910",
                marketName: "Match Odds",
                runners: [
                  {
                    sid: 1,
                    runnerName: "India",
                    backPrice: 1.26,
                    backSize: 100000,
                    layPrice: 1.27,
                    laySize: 100000,
                    backs: [{ price: 1.26, size: 100000 }, { price: 1.25, size: 50000 }],
                    lays: [{ price: 1.27, size: 100000 }, { price: 1.28, size: 75000 }]
                  }
                ]
              }
            ]
          }
        }
      },
      {
        category: "Sports Navigation & Match Feeds",
        method: "GET",
        path: "/api/sports/racing/:etid",
        summary: "Horse & Greyhound Racing Meeting Grid",
        description: "Returns country-based track and race meeting grid (10 = Horse Racing, 65 = Greyhound Racing).",
        parameters: [
          { name: "etid", in: "path", required: true, type: "number", example: 10 }
        ],
        responseSample: {
          success: true,
          etid: 10,
          data: [
            {
              cname: "AU",
              children: [
                {
                  ename: "Flemington",
                  children: [
                    { gmid: "4001", name: "13:30 Race 1", status: "OPEN" },
                    { gmid: "4002", name: "14:05 Race 2", status: "UPCOMING" }
                  ]
                }
              ]
            }
          ]
        }
      },
      {
        category: "Sports Navigation & Match Feeds",
        method: "GET",
        path: "/api/sports/scorecard/:gmid",
        summary: "Realtime Sports Scorecard",
        description: "Returns live ball-by-ball commentary, runs, wickets, overs, and target for live matches.",
        parameters: [
          { name: "gmid", in: "path", required: true, type: "string", example: "33182910" }
        ],
        responseSample: {
          success: true,
          gmid: "33182910",
          scoreboard: {
            battingTeam: "India",
            bowlingTeam: "England",
            runs: 168,
            wickets: 3,
            overs: "18.2",
            currentOver: ["1", "4", "0", "6", "W", "2"],
            target: "192"
          }
        }
      },
      {
        category: "Sports Navigation & Match Feeds",
        method: "GET",
        path: "/api/sports/:gmid/stream",
        summary: "Sports Live TV Stream Endpoint",
        description: "Returns playable video stream URLs and multi-source endpoints for live sports broadcasts.",
        parameters: [
          { name: "gmid", in: "path", required: true, type: "string", example: "33182910" }
        ],
        responseSample: {
          success: true,
          gmid: "33182910",
          streamUrl: "https://diamondonline7.com/newmediaplayer/...",
          sources: [
            { name: "Diamond Live TV", url: "https://...", type: "iframe" },
            { name: "D247 Direct Player", url: "/api/casino/player/33182910", type: "iframe" }
          ]
        }
      },
      {
        category: "Live Casino Feeds (77 Tables)",
        method: "GET",
        path: "/api/casino/tables",
        summary: "All 77 Official Casino Tables",
        description: "Returns complete directory of 77 official casino tables with categories, canonical slugs, and betting limits.",
        parameters: [],
        responseSample: {
          success: true,
          total: 77,
          data: [
            { id: "1", slug: "goal2", name: "GOAL 2", category: "Football", min: 100, max: 300000 },
            { id: "4", slug: "mogambo", name: "MOGAMBO", category: "Others", min: 100, max: 300000 },
            { id: "5", slug: "lucky6", name: "LUCKY 6", category: "Lucky 7", min: 100, max: 100000 },
            { id: "8", slug: "viproulette", name: "VIP ROULETTE", category: "Roulette", min: 25, max: 100000 }
          ]
        }
      },
      {
        category: "Live Casino Feeds (79+ Tables)",
        method: "GET",
        path: "/api/casino/round/:slug",
        summary: "Live Casino Round Data (Real Cards & Rates)",
        description: "High-frequency endpoint returning real cards dealt, 3D dice, roulette pocket, flip clock timer, and live odds.",
        parameters: [
          { name: "slug", in: "path", required: true, type: "string", example: "mogambo" }
        ],
        responseSample: {
          success: true,
          data: {
            gameType: "mogambo",
            roundId: "192261124132426",
            dealType: "cards",
            timer: 8,
            totalTimer: 20,
            card: "5SS,8HH,JCC",
            cards: [
              { code: "5SS", rank: "5", suit: "♠", color: "black", isHidden: false },
              { code: "8HH", rank: "8", suit: "♥", color: "red", isHidden: false },
              { code: "JCC", rank: "J", suit: "♣", color: "black", isHidden: false }
            ],
            runners: [
              { sid: 1, name: "Mogambo", back: 1.20, backSize: 300000, lay: 0, status: "ACTIVE" },
              { sid: 2, name: "Daga / Teja", back: 5.45, backSize: 300000, lay: 0, status: "ACTIVE" },
              { sid: 3, name: "3 Card Total", back: 13, backSize: 300000, lay: 13, status: "ACTIVE" }
            ],
            streamUrl: "/api/casino/stream/mogambo"
          }
        }
      },
      {
        category: "Live Casino Feeds (79+ Tables)",
        method: "GET",
        path: "/api/casino/results/:slug",
        summary: "Casino Recent Results History",
        description: "Returns official winner history matrix (last 15-20 rounds) for scoreboards and trend ribbons.",
        parameters: [
          { name: "slug", in: "path", required: true, type: "string", example: "teen20" }
        ],
        responseSample: {
          success: true,
          gameType: "teen20",
          total: 15,
          data: [
            { mid: "192261124132400", winner: "Player A", nat: "Player A" },
            { mid: "192261124132399", winner: "Player B", nat: "Player B" }
          ]
        }
      },
      {
        category: "Live Casino Feeds (79+ Tables)",
        method: "GET",
        path: "/api/casino/player/:slug",
        summary: "Zero-Latency Casino TV Iframe Player (Anti-Theft Guarded)",
        description: "Official embeddable Casino Live TV player. To embed on external platforms, your consumer Domain or Server IP MUST be whitelisted in /master dashboard. Direct unauthorized hits or scraper tools receive HTTP 403 Forbidden with emergency admin routing.\n\nEmbed Code Example:\n<iframe src=\"https://72.61.172.110:5005/api/casino/player/teen20\" width=\"100%\" height=\"100%\" frameborder=\"0\" allow=\"autoplay; encrypted-media; fullscreen\" allowfullscreen></iframe>",
        parameters: [
          { name: "slug", in: "path", required: true, type: "string", example: "teen20" }
        ],
        responseSample: "HTML5 Live Video Player Document"
      },
      {
        category: "Live Casino Feeds (79+ Tables)",
        method: "GET",
        path: "/api/casino/stream/:slug",
        summary: "Zero-CORS Live Casino Video Stream",
        description: "Direct stream alias for /api/casino/player/:slug without X-Frame-Options or Permissions-Policy blocks. Requires Whitelist approval from Master Admin (/master).",
        parameters: [
          { name: "slug", in: "path", required: true, type: "string", example: "mogambo" }
        ],
        responseSample: "HTML5 video player stream document"
      },
      {
        category: "Live Casino Feeds (79+ Tables)",
        method: "GET",
        path: "/api/casino/image/:slug",
        summary: "Casino Artwork CDN Proxy",
        description: "Streams authentic high-resolution table banners and dealer artwork with 24-hour edge caching.",
        parameters: [
          { name: "slug", in: "path", required: true, type: "string", example: "dolidana" }
        ],
        responseSample: "image/jpeg binary stream"
      }
    ],
    websocket: {
      protocol: "Socket.IO v4",
      url: "ws://72.61.172.110:5005",
      events: [
        {
          event: "join_match",
          direction: "Client -> Server",
          payload: "gmid (string)",
          example: 'socket.emit("join_match", "superover2");',
          description: "Subscribes client to real-time tick-by-tick rate updates for a specific match or casino table."
        },
        {
          event: "odds_update",
          direction: "Server -> Client",
          payload: "MatchOddsSnapshot (JSON)",
          example: 'socket.on("odds_update", (data) => console.log(data));',
          description: "Instant push of updated 3-tier Back/Lay prices, sizes, status, timer, and cards."
        },
        {
          event: "leave_match",
          direction: "Client -> Server",
          payload: "gmid (string)",
          example: 'socket.emit("leave_match", "superover2");',
          description: "Unsubscribes client socket from real-time events."
        }
      ]
    },
    codeExamples: {
      curl: `curl -X GET "http://72.61.172.110:5005/api/casino/round/mogambo" -H "Accept: application/json"`,
      nodejs: `const axios = require('axios');

async function getCasinoRound(slug) {
  const { data } = await axios.get(\`http://72.61.172.110:5005/api/casino/round/\${slug}\`);
  console.log('Active Cards:', data.data.cards);
  console.log('Odds:', data.data.runners);
}
getCasinoRound('mogambo');`,
      python: `import requests

def get_live_round(slug):
    resp = requests.get(f"http://72.61.172.110:5005/api/casino/round/{slug}")
    if resp.status_code == 200:
        data = resp.json()["data"]
        print("Round ID:", data["roundId"])
        print("Timer:", data["timer"])
get_live_round("mogambo")`,
      php: `<?php
$slug = "mogambo";
$ch = curl_init("http://72.61.172.110:5005/api/casino/round/" . $slug);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
$data = json_decode($response, true);
print_r($data["data"]["runners"]);
?>`
    }
  };

  // 1. JSON API Specification
  router.get(['/', '/json'], (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json(API_DOCS_SPEC);
  });

  // 2. Postman Collection v2.1 1-Click Export
  router.get('/postman', (req, res) => {
    const postman = {
      info: {
        _postman_id: "d247-exchange-api-collection",
        name: "D247 Zero-Latency Exchange & Casino API",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      item: API_DOCS_SPEC.endpoints.map(ep => ({
        name: ep.summary,
        request: {
          method: ep.method,
          header: [{ key: "Accept", value: "application/json" }],
          url: {
            raw: `http://72.61.172.110:5005${ep.path.replace(':gmid', '33182910').replace(':slug', 'mogambo').replace(':etid', '10')}`,
            host: ["72", "61", "172", "110"],
            port: "5005",
            path: ep.path.split('/').filter(Boolean).map(p => p.startsWith(':') ? 'sample' : p)
          },
          description: ep.description
        }
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="D247-Exchange-API.postman_collection.json"');
    res.json(postman);
  });

  return router;
};
