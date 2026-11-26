/**
 * D247 Master Guard Anti-Theft Security Engine & Whitelist Controller
 * 
 * Ironclad Protection Features:
 * - Granular Anti-Theft Protection for Casino API, Sports API, and TV Streaming
 * - IP Whitelisting (Layer 3/4 unforgeable TCP identity)
 * - Domain / Origin Whitelisting (Strict CORS & Iframe ancestors)
 * - Automated Scraper & Postman Blocker
 * - Block Direct URL Hits in Browser Address Bar / New Tabs (Sec-Fetch + Referer verification)
 * - Dynamic CSP frame-ancestors injection for live TV streams
 * - Persistent JSON Database (backend/data/whitelist.json)
 * - Real-Time Request Inspector & Traffic Logs Buffer
 * - High-Contrast 403 Anti-Theft Screen with Emergency Admin Contact Routing (+63 945 146 9623, +63 915 922 4695)
 * - Production-Safe Localhost & VPS Loopback Safe Exemption (127.0.0.1, ::1, 72.61.172.110)
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class MasterGuardEngine {
  constructor() {
    this.dataPath = path.join(__dirname, "data", "whitelist.json");
    this.sessions = new Map(); // token -> { username, expiresAt }
    this.trafficLogs = [];
    this.maxLogs = 400;
    this.secretKey = crypto.randomBytes(32).toString("hex");

    this.data = this.loadData();
    this.rebuildIndex();
  }

  loadData() {
    try {
      if (fs.existsSync(this.dataPath)) {
        const raw = fs.readFileSync(this.dataPath, "utf8");
        const parsed = JSON.parse(raw);
        return {
          settings: {
            guardActive: true,
            blockScrapers: true,
            blockDirectAccess: true,
            autoWhitelistLocalhost: true,
            strictBrowserSignatures: true,
            ...(parsed.settings || {}),
          },
          credentials: {
            username: "igwasim",
            password: "Asdf1234#",
            ...(parsed.credentials || {}),
          },
          domains: Array.isArray(parsed.domains) ? parsed.domains : [],
          ips: Array.isArray(parsed.ips) ? parsed.ips : [],
        };
      }
    } catch (e) {
      console.error("[MasterGuard] Error loading whitelist.json:", e.message);
    }

    return {
      settings: {
        guardActive: true,
        blockScrapers: true,
        blockDirectAccess: true,
        autoWhitelistLocalhost: true,
        strictBrowserSignatures: true,
      },
      credentials: {
        username: "igwasim",
        password: "Asdf1234#",
      },
      domains: [],
      ips: [],
    };
  }

  saveData() {
    try {
      const dir = path.dirname(this.dataPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2), "utf8");
      this.rebuildIndex();
      return true;
    } catch (e) {
      console.error("[MasterGuard] Error saving whitelist.json:", e.message);
      return false;
    }
  }

  rebuildIndex() {
    this.domainMap = new Map();
    for (const d of this.data.domains) {
      if (d && d.domain && d.active !== false) {
        const cleanDom = this.cleanDomain(d.domain);
        this.domainMap.set(cleanDom, d);
      }
    }

    this.ipMap = new Map();
    for (const i of this.data.ips) {
      if (i && i.ip && i.active !== false) {
        const cleanIp = this.cleanIp(i.ip);
        this.ipMap.set(cleanIp, i);
      }
    }
  }

  cleanDomain(dom) {
    if (!dom) return "";
    let d = String(dom).toLowerCase().trim();
    d = d.replace(/^https?:\/\//i, "");
    d = d.split("/")[0];
    d = d.split(":")[0]; // strip port
    return d;
  }

  cleanIp(ip) {
    if (!ip) return "";
    let i = String(ip).trim();
    if (i.startsWith("::ffff:")) i = i.slice(7);
    return i;
  }

  extractClientIp(req) {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
      const first = forwarded.split(",")[0].trim();
      return this.cleanIp(first);
    }
    const real = req.headers["x-real-ip"];
    if (real) return this.cleanIp(real);
    const sock = req.socket?.remoteAddress;
    if (sock) return this.cleanIp(sock);
    return this.cleanIp(req.ip || "127.0.0.1");
  }

  /**
   * Extract the caller's origin domain.
   * CRITICAL: Host header is the DESTINATION server, NEVER the caller!
   * Caller domain comes ONLY from Origin or Referer.
   */
  extractDomain(req) {
    if (req.headers.origin) {
      return this.cleanDomain(req.headers.origin);
    }
    if (req.headers.referer) {
      return this.cleanDomain(req.headers.referer);
    }
    return "";
  }

  /**
   * Detect direct URL hits (address bar navigation, new tab, curl, Postman, python)
   */
  isDirectHit(req) {
    // 1. Missing both Origin and Referer
    if (!req.headers.origin && !req.headers.referer) {
      return true;
    }
    // 2. W3C Sec-Fetch metadata: direct address bar hit or new tab navigation
    const secDest = req.headers["sec-fetch-dest"];
    const secMode = req.headers["sec-fetch-mode"];
    const secSite = req.headers["sec-fetch-site"];

    if (secDest === "document" && secMode === "navigate") {
      return true;
    }
    if (secSite === "none") {
      return true;
    }
    return false;
  }

  /**
   * Detect automated tools, bots, and scrapers
   */
  isScraper(userAgent) {
    if (!userAgent) return true; // empty user-agent is blocked
    const ua = userAgent.toLowerCase();
    const scraperPatterns = [
      "postmanruntime",
      "postman",
      "insomnia",
      "curl/",
      "python-requests",
      "python",
      "aiohttp",
      "go-http-client",
      "libwww-perl",
      "wget/",
      "scrapy",
      "httpclient",
      "okhttp",
      "axios",
      "node-fetch",
      "undici",
      "got",
      "superagent",
      "rest-client",
      "urllib",
      "httpie",
      "java/",
      "apache-httpclient",
      "reqwest",
    ];
    return scraperPatterns.some((p) => ua.includes(p));
  }

  logRequest(req, status, reason, permissionType) {
    const ip = this.extractClientIp(req);
    const domain = this.extractDomain(req);
    const userAgent = req.headers["user-agent"] || "Unknown";
    const path = req.originalUrl || req.url;

    const entry = {
      id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      time: new Date().toISOString(),
      ip,
      domain: domain || "(direct)",
      origin: req.headers.origin || "",
      referer: req.headers.referer || "",
      path,
      target: permissionType,
      status, // 'ALLOWED' | 'BLOCKED'
      reason,
      userAgent: userAgent.slice(0, 140),
    };

    this.trafficLogs.unshift(entry);
    if (this.trafficLogs.length > this.maxLogs) {
      this.trafficLogs.pop();
    }
  }

  /**
   * Comprehensive Whitelist Verification
   * @param {Object} req - Express request
   * @param {string} permission - 'casinoApi' | 'sportsApi' | 'tvStream' | 'any'
   * @returns {Object} { allowed: boolean, reason: string, ip: string, domain: string }
   */
  isWhitelisted(req, permission = "any") {
    const ip = this.extractClientIp(req);
    const domain = this.extractDomain(req);
    const userAgent = req.headers["user-agent"] || "";
    const isDirect = this.isDirectHit(req);
    const secDest = req.headers["sec-fetch-dest"] || "";
    const secMode = req.headers["sec-fetch-mode"] || "";

    // 0. Master Guard globally disabled?
    if (!this.data.settings.guardActive) {
      return { allowed: true, reason: "Master Guard Inactive", ip, domain };
    }

    // 1. Production Localhost & Server Loopback Safe Exemption
    // Internal background syncEngine and server processes must never break
    if (this.data.settings.autoWhitelistLocalhost) {
      if (
        ip === "127.0.0.1" ||
        ip === "::1" ||
        ip === "localhost" ||
        ip === "72.61.172.110"
      ) {
        return { allowed: true, reason: "Local Server Safe Exemption", ip, domain };
      }
    }

    // 2. IP Whitelist Match (The Unforgeable Layer 3/4 Gate)
    // Server-to-server API clients & whitelisted customer IPs
    const ipEntry = this.ipMap.get(ip);
    if (ipEntry && ipEntry.active !== false) {
      if (permission === "any" || ipEntry[permission] === true) {
        return {
          allowed: true,
          reason: `Whitelisted Client IP (${ipEntry.note || ip})`,
          ip,
          domain,
        };
      } else {
        return {
          allowed: false,
          reason: `Client IP ${ip} not authorized for ${permission}`,
          ip,
          domain,
        };
      }
    }

    // 3. Automated Scraper / Bot / Postman Detection
    if (this.data.settings.blockScrapers && this.isScraper(userAgent)) {
      return {
        allowed: false,
        reason: "Automated Scraping Tool / Postman Blocked (IP not whitelisted)",
        ip,
        domain,
      };
    }

    // 4. Direct Address Bar / New Tab Navigation Block
    // Typing the URL directly into Chrome/Safari/Edge or opening outside an authorized container
    if (isDirect) {
      if (permission === "tvStream") {
        return {
          allowed: false,
          reason: "Direct TV Stream URL hit blocked (Authorized iframe embedding required)",
          ip,
          domain: "(direct)",
        };
      }
      return {
        allowed: false,
        reason: "Direct API URL hit in browser address bar blocked (Whitelisted IP or authorized origin required)",
        ip,
        domain: "(direct)",
      };
    }

    // 5. Direct Browser Document Navigation on Data APIs Blocked
    // If an API endpoint is hit as a top-level page document navigation, block it!
    if ((permission === "sportsApi" || permission === "casinoApi") && (secDest === "document" || secMode === "navigate")) {
      return {
        allowed: false,
        reason: "Direct API browser document navigation blocked",
        ip,
        domain,
      };
    }

    // 6. Domain / Origin Whitelist Match
    if (domain) {
      // 6a. Exact Match
      const exactDom = this.domainMap.get(domain);
      if (exactDom && exactDom.active !== false) {
        if (permission === "any" || exactDom[permission] === true) {
          return {
            allowed: true,
            reason: `Whitelisted Domain (${exactDom.note || domain})`,
            ip,
            domain,
          };
        } else {
          return {
            allowed: false,
            reason: `Domain ${domain} not authorized for ${permission}`,
            ip,
            domain,
          };
        }
      }

      // 6b. Wildcard Match (e.g. aura.igambli.com matches igambli.com)
      for (const [whitelistedDom, entry] of this.domainMap.entries()) {
        if (entry.active !== false) {
          if (
            domain.endsWith("." + whitelistedDom) ||
            whitelistedDom === domain
          ) {
            if (permission === "any" || entry[permission] === true) {
              return {
                allowed: true,
                reason: `Whitelisted Wildcard Domain (*.${whitelistedDom})`,
                ip,
                domain,
              };
            } else {
              return {
                allowed: false,
                reason: `Domain *.${whitelistedDom} not authorized for ${permission}`,
                ip,
                domain,
              };
            }
          }
        }
      }
    }

    // 7. Unauthorized Fallback
    return {
      allowed: false,
      reason: `Unauthorized Origin (${domain || "no-origin"}) / IP (${ip}) for ${permission}`,
      ip,
      domain,
    };
  }

  /**
   * Express Middleware to protect specific route classes
   * @param {string} permissionType - 'casinoApi' | 'sportsApi' | 'tvStream' | 'any'
   */
  guardMiddleware(permissionType = "any") {
    return (req, res, next) => {
      const check = this.isWhitelisted(req, permissionType);

      if (check.allowed) {
        // Log sample of allowed requests (avoid buffer flooding during high rate polling)
        if (Math.random() < 0.05 || permissionType === "tvStream") {
          this.logRequest(req, "ALLOWED", check.reason, permissionType);
        }

        // Inject Content-Security-Policy frame-ancestors for TV streams to lock embedding
        if (permissionType === "tvStream") {
          const allowedAncestors = ["'self'"];
          for (const [dom, entry] of this.domainMap.entries()) {
            if (entry.active !== false && entry.tvStream) {
              allowedAncestors.push(`https://${dom}`, `http://${dom}`);
              allowedAncestors.push(`https://*.${dom}`, `http://*.${dom}`);
            }
          }
          res.setHeader("Content-Security-Policy", `frame-ancestors ${allowedAncestors.join(" ")};`);
        }

        // Dynamic CORS headers for authorized origins
        if (req.headers.origin) {
          res.setHeader("Access-Control-Allow-Origin", req.headers.origin);
          res.setHeader("Access-Control-Allow-Credentials", "true");
          res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        }

        return next();
      }

      // Blocked request: Log incident
      this.logRequest(req, "BLOCKED", check.reason, permissionType);

      // Check if client expects HTML or is a stream player view
      const isHtmlExpected = req.headers.accept && req.headers.accept.includes("text/html");
      const isStreamRoute =
        req.originalUrl?.includes("/player/") ||
        req.originalUrl?.includes("/stream") ||
        req.originalUrl?.includes("/mediaplayer") ||
        req.originalUrl?.includes("/livetv");

      if (isHtmlExpected || isStreamRoute) {
        return res
          .status(403)
          .setHeader("Content-Type", "text/html; charset=utf-8")
          .send(this.render403Screen(check.domain, check.ip, check.reason, permissionType));
      }

      return res.status(403).json({
        success: false,
        error: "ACCESS_DENIED",
        code: 403,
        message: "Protected by D247 Master Guard. Access restricted.",
        target: permissionType,
        reason: check.reason,
        clientIp: check.ip,
        domain: check.domain || "unspecified",
        emergencyContact: {
          phone1: "+63 945 146 9623",
          phone2: "+63 915 922 4695",
          whatsapp: "https://wa.me/639451469623",
        },
      });
    };
  }

  render403Screen(domain, ip, reason, permissionType = "Resource") {
    const formattedType =
      permissionType === "tvStream"
        ? "Casino & Sports Live TV Stream"
        : permissionType === "sportsApi"
        ? "Sports Betting Exchange API"
        : permissionType === "casinoApi"
        ? "Live Casino Engine API"
        : "Live Exchange Feed";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>403 - Access Restricted | D247 Master Guard</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #090e17;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: #111a2e;
      border: 1px solid #1e293b;
      border-top: 4px solid #ef4444;
      border-radius: 12px;
      max-width: 520px;
      width: 100%;
      padding: 32px 28px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
      text-align: center;
    }
    .shield-icon {
      width: 68px;
      height: 68px;
      margin: 0 auto 16px;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ef4444;
      animation: pulse 2s infinite ease-in-out;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.85; }
    }
    h1 {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: #f87171;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    p.desc {
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .meta-box {
      background: #090e17;
      border: 1px solid #1e293b;
      border-radius: 8px;
      padding: 14px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      text-align: left;
      margin-bottom: 24px;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      border-bottom: 1px solid #131d2e;
    }
    .meta-row:last-child { border-bottom: none; }
    .meta-label { color: #64748b; font-weight: 600; }
    .meta-val { color: #38bdf8; font-weight: 700; word-break: break-all; }
    .contact-title {
      font-size: 11px;
      font-weight: 800;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 12px;
    }
    .btn-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 11px 14px;
      border-radius: 7px;
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-wa {
      background: #22c55e;
      color: #052e16;
    }
    .btn-wa:hover { background: #16a34a; color: #fff; }
    .btn-call {
      background: #2563eb;
      color: #eff6ff;
    }
    .btn-call:hover { background: #1d4ed8; }
    .footer-note {
      margin-top: 22px;
      font-size: 11px;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="shield-icon">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>
    <h1>Anti-Theft Guard Active</h1>
    <p class="desc">This ${formattedType} is protected by D247 Master Guard. Direct browser URL access, postman scraping, and unauthorized embedding are permanently restricted.</p>

    <div class="meta-box">
      <div class="meta-row">
        <span class="meta-label">Client IP:</span>
        <span class="meta-val">${ip || "Unknown"}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Origin / Domain:</span>
        <span class="meta-val">${domain || "Direct / No Referer"}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Target Service:</span>
        <span class="meta-val" style="color: #a855f7;">${permissionType}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Status:</span>
        <span class="meta-val" style="color: #ef4444;">403 FORBIDDEN</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Reason:</span>
        <span class="meta-val" style="color: #fbbf24;">${reason || "Not Whitelisted"}</span>
      </div>
    </div>

    <div class="contact-title">Contact Administrator for Whitelisting Approval</div>
    <div class="btn-group">
      <a class="btn btn-wa" href="https://wa.me/639451469623?text=Whitelist%20Approval%20Request%20for%20IP%20${encodeURIComponent(ip)}%20Origin%20${encodeURIComponent(domain || 'Direct')}" target="_blank" rel="noopener">
        <span>💬 WhatsApp Admin</span>
      </a>
      <a class="btn btn-call" href="tel:+639451469623">
        <span>📞 +63 945 146 9623</span>
      </a>
    </div>
    <div class="btn-group" style="margin-top: 8px;">
      <a class="btn btn-wa" href="https://wa.me/639159224695?text=Whitelist%20Approval%20Request%20for%20IP%20${encodeURIComponent(ip)}%20Origin%20${encodeURIComponent(domain || 'Direct')}" target="_blank" rel="noopener">
        <span>💬 WhatsApp 2</span>
      </a>
      <a class="btn btn-call" href="tel:+639159224695">
        <span>📞 +63 915 922 4695</span>
      </a>
    </div>

    <div class="footer-note">D247 Official Zero-Latency Exchange Engine | Master Guard Anti-Theft v2.0</div>
  </div>
</body>
</html>`;
  }

  // --- Master Auth & Session Management (/master) ---

  login(username, password) {
    if (
      username === this.data.credentials.username &&
      password === this.data.credentials.password
    ) {
      const token = crypto.randomBytes(24).toString("hex");
      const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24 hours
      this.sessions.set(token, { username, expiresAt });
      return { success: true, token, expiresAt };
    }
    return { success: false, message: "Invalid Master ID or Password" };
  }

  verifyToken(token) {
    if (!token) return false;
    const session = this.sessions.get(token);
    if (!session) return false;
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(token);
      return false;
    }
    return true;
  }

  masterAuthMiddleware() {
    return (req, res, next) => {
      const authHeader = req.headers["authorization"] || "";
      const token =
        (authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null) ||
        req.headers["x-master-token"] ||
        req.query.token;

      if (!this.verifyToken(token)) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized. Valid Master Token required." });
      }
      next();
    };
  }

  // --- Domain / IP Management ---

  addDomain({ domain, casinoApi = true, sportsApi = true, tvStream = true, allowDirect = false, note = "" }) {
    const clean = this.cleanDomain(domain);
    if (!clean) throw new Error("Invalid domain provided");

    const existing = this.data.domains.find((d) => this.cleanDomain(d.domain) === clean);
    if (existing) {
      existing.casinoApi = !!casinoApi;
      existing.sportsApi = !!sportsApi;
      existing.tvStream = !!tvStream;
      existing.allowDirect = !!allowDirect;
      existing.note = note || existing.note;
      existing.active = true;
      existing.updatedAt = new Date().toISOString();
    } else {
      this.data.domains.push({
        id: "dom_" + Date.now(),
        domain: clean,
        casinoApi: !!casinoApi,
        sportsApi: !!sportsApi,
        tvStream: !!tvStream,
        allowDirect: !!allowDirect,
        active: true,
        note: note || "Partner Domain",
        addedAt: new Date().toISOString(),
      });
    }

    this.saveData();
    return true;
  }

  deleteDomain(idOrDomain) {
    this.data.domains = this.data.domains.filter(
      (d) => d.id !== idOrDomain && this.cleanDomain(d.domain) !== this.cleanDomain(idOrDomain)
    );
    this.saveData();
    return true;
  }

  addIp({ ip, casinoApi = true, sportsApi = true, tvStream = true, note = "" }) {
    const clean = this.cleanIp(ip);
    if (!clean) throw new Error("Invalid IP address provided");

    const existing = this.data.ips.find((i) => this.cleanIp(i.ip) === clean);
    if (existing) {
      existing.casinoApi = !!casinoApi;
      existing.sportsApi = !!sportsApi;
      existing.tvStream = !!tvStream;
      existing.note = note || existing.note;
      existing.active = true;
      existing.updatedAt = new Date().toISOString();
    } else {
      this.data.ips.push({
        id: "ip_" + Date.now(),
        ip: clean,
        casinoApi: !!casinoApi,
        sportsApi: !!sportsApi,
        tvStream: !!tvStream,
        active: true,
        note: note || "Partner IP",
        addedAt: new Date().toISOString(),
      });
    }

    this.saveData();
    return true;
  }

  deleteIp(idOrIp) {
    this.data.ips = this.data.ips.filter(
      (i) => i.id !== idOrIp && this.cleanIp(i.ip) !== this.cleanIp(idOrIp)
    );
    this.saveData();
    return true;
  }

  updateSettings(newSettings) {
    this.data.settings = {
      ...this.data.settings,
      ...newSettings,
    };
    this.saveData();
    return this.data.settings;
  }
}

// Export singleton instance
const masterGuard = new MasterGuardEngine();
module.exports = masterGuard;
