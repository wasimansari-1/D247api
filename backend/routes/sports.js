const express = require('express');

module.exports = function(syncEngine) {
  const router = express.Router();

  // Get In-Play & Upcoming Events across ALL 37 Sports + Racing
  router.get('/in-play', (req, res) => {
    res.json({
      success: true,
      total: syncEngine.inPlayEvents.length,
      data: syncEngine.inPlayEvents
    });
  });

  // Get Complete Sports Navigation Tree (37 Sports + Racing)
  router.get('/tree', (req, res) => {
    res.json({
      success: true,
      data: syncEngine.sportsTree || { t1: [], t2: [] }
    });
  });

  // Get Horse Racing (10) or Greyhound Racing (65) Country/Track/Race Meeting Tree
  router.get('/racing/:etid', async (req, res) => {
    try {
      const tree = await syncEngine.getRacingTree(req.params.etid);
      res.json({
        success: true,
        etid: parseInt(req.params.etid),
        data: tree
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Get specific match odds & live markets (ALWAYS FRESH UPSTREAM DATA)
  router.get('/match/:gmid', async (req, res) => {
    const gmid = req.params.gmid;
    const etid = req.query.etid || 4;

    try {
      const matchData = await syncEngine.fetchLiveMatchData(gmid, etid);
      if (matchData) {
        return res.json({ success: true, data: matchData });
      }
    } catch (err) {
      console.error(`Error fetching match ${gmid}:`, err.message);
    }

    const cached = syncEngine.matchCache.get(gmid);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    res.status(404).json({ success: false, message: "Match not found" });
  });

  // Get Live TV Stream Details & Multi-Source Endpoints for Match
  router.get(['/:etid/:gmid/livetv', '/stream/:gmid', '/:gmid/livetv', '/:gmid/stream'], async (req, res) => {
    const gmid = req.params.gmid;
    const etid = req.params.etid || req.query.etid || 4;
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '103.21.244.2';

    try {
      const streamData = await syncEngine.getSportsTvUrl(gmid, etid, clientIp);
      return res.json({
        success: true,
        gmid,
        etid,
        streamUrl: streamData.streamUrl,
        sources: streamData.sources
      });
    } catch (err) {
      return res.json({
        success: true,
        gmid,
        etid,
        streamUrl: `https://playg3.external247services.com/live/${gmid}`,
        sources: [
          { name: 'External 247 Live Hub', url: `https://playg3.external247services.com/live/${gmid}`, type: 'iframe' }
        ]
      });
    }
  });

  // Get Live Match Scorecard
  router.get(['/:etid/:gmid/scorecard', '/scorecard/:gmid'], async (req, res) => {
    const gmid = req.params.gmid;
    const match = syncEngine.inPlayEvents.find(e => String(e.gmid) === String(gmid));
    const cached = syncEngine.matchCache.get(gmid);

    const scorecard = (cached && cached.scoreboard) || {
      battingTeam: match?.eventName?.split(' v ')[0] || 'Batting Team',
      bowlingTeam: match?.eventName?.split(' v ')[1] || 'Bowling Team',
      runs: 0,
      wickets: 0,
      overs: '0.0',
      currentOver: [],
      target: 'N/A'
    };

    res.json({
      success: true,
      gmid,
      data: scorecard
    });
  });

  return router;
};
