const express = require('express');

module.exports = function(syncEngine) {
  const router = express.Router();

  // Get current status & config
  router.get('/status', (req, res) => {
    res.json({
      success: true,
      hasSessionCookie: Boolean(syncEngine.config.headers.Cookie && syncEngine.config.headers.Cookie.length > 10),
      baseUrl: syncEngine.config.baseUrl,
      activeMatchesSubscribed: Array.from(syncEngine.activeGmidSubscriptions),
      pollIntervalMs: syncEngine.pollIntervalMs
    });
  });

  // Update session cookies live without restart
  router.post('/session', (req, res) => {
    const { cookie, userAgent } = req.body;
    if (!cookie) {
      return res.status(400).json({ success: false, message: "Cookie is required" });
    }

    syncEngine.updateSession(cookie, userAgent);
    res.json({
      success: true,
      message: "Session cookie updated successfully! Live sync enabled."
    });
  });

  return router;
};

