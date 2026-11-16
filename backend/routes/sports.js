const express = require('express');

module.exports = function(syncEngine) {
  const router = express.Router();

  // Get In-Play & Upcoming Events
  router.get('/in-play', (req, res) => {
    res.json({
      success: true,
      total: syncEngine.inPlayEvents.length,
      data: syncEngine.inPlayEvents
    });
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

    // Fallback to cache if upstream error
    const cached = syncEngine.matchCache.get(gmid);
    if (cached) {
      return res.json({ success: true, data: cached });
    }

    res.status(404).json({ success: false, message: "Match not found" });
  });

  return router;
};
