/**
 * D247 Master Guard Management Router & Dashboard (/master)
 * Credentials: ID: igwasim | Pass: Asdf1234#
 */

const express = require("express");
const masterGuard = require("../masterGuard");

module.exports = function () {
  const router = express.Router();

  // 1. Login API
  router.post("/api/master/login", (req, res) => {
    const { username, password } = req.body || {};
    const result = masterGuard.login(username, password);
    if (result.success) {
      return res.json(result);
    }
    return res.status(401).json(result);
  });

  // 2. Fetch Master Guard Data (Requires Master Auth Token)
  router.get("/api/master/data", masterGuard.masterAuthMiddleware(), (req, res) => {
    const totalRequests = masterGuard.trafficLogs.length;
    const blockedCount = masterGuard.trafficLogs.filter((l) => l.status === "BLOCKED").length;

    res.json({
      success: true,
      settings: masterGuard.data.settings,
      domains: masterGuard.data.domains,
      ips: masterGuard.data.ips,
      stats: {
        totalRequests,
        whitelistedDomains: masterGuard.data.domains.filter((d) => d.active !== false).length,
        whitelistedIps: masterGuard.data.ips.filter((i) => i.active !== false).length,
        blockedThreats: blockedCount,
        serverTime: new Date().toISOString(),
      },
      trafficLogs: masterGuard.trafficLogs,
    });
  });

  // 3. Add or Update Whitelisted Domain
  router.post("/api/master/domain", masterGuard.masterAuthMiddleware(), (req, res) => {
    try {
      const { domain, casinoApi, sportsApi, tvStream, allowDirect, note } = req.body || {};
      masterGuard.addDomain({ domain, casinoApi, sportsApi, tvStream, allowDirect, note });
      res.json({ success: true, message: "Domain whitelisted successfully", domains: masterGuard.data.domains });
    } catch (e) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  // 4. Delete Whitelisted Domain
  router.delete("/api/master/domain/:id", masterGuard.masterAuthMiddleware(), (req, res) => {
    try {
      masterGuard.deleteDomain(req.params.id);
      res.json({ success: true, message: "Domain deleted successfully", domains: masterGuard.data.domains });
    } catch (e) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  // 5. Add or Update Whitelisted IP
  router.post("/api/master/ip", masterGuard.masterAuthMiddleware(), (req, res) => {
    try {
      const { ip, casinoApi, sportsApi, tvStream, note } = req.body || {};
      masterGuard.addIp({ ip, casinoApi, sportsApi, tvStream, note });
      res.json({ success: true, message: "IP whitelisted successfully", ips: masterGuard.data.ips });
    } catch (e) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  // 6. Delete Whitelisted IP
  router.delete("/api/master/ip/:id", masterGuard.masterAuthMiddleware(), (req, res) => {
    try {
      masterGuard.deleteIp(req.params.id);
      res.json({ success: true, message: "IP deleted successfully", ips: masterGuard.data.ips });
    } catch (e) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  // 7. Update Master Guard Settings
  router.post("/api/master/settings", masterGuard.masterAuthMiddleware(), (req, res) => {
    try {
      const settings = masterGuard.updateSettings(req.body);
      res.json({ success: true, message: "Settings updated successfully", settings });
    } catch (e) {
      res.status(400).json({ success: false, message: e.message });
    }
  });

  // 8. Clear Traffic Logs
  router.post("/api/master/clear-logs", masterGuard.masterAuthMiddleware(), (req, res) => {
    masterGuard.trafficLogs = [];
    res.json({ success: true, message: "Traffic logs cleared" });
  });

  // 9. Serve Master Guard Dashboard HTML
  router.get(["/master", "/master/"], (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(renderMasterDashboardHtml());
  });

  return router;
};

function renderMasterDashboardHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>D247 Master Guard | Enterprise Anti-Theft Whitelist Controller</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0b1120; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .glass-panel { background: rgba(17, 24, 39, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(51, 65, 85, 0.6); }
    .status-badge { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.15rem 0.55rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
    .custom-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scroll::-webkit-scrollbar-track { background: #0b1120; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
  </style>
</head>
<body class="min-h-screen flex flex-col antialiased select-none">

  <!-- LOGIN MODAL (Visible if no valid token) -->
  <div id="loginModal" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
    <div class="glass-panel w-full max-w-md rounded-2xl p-8 border-t-4 border-t-amber-500 shadow-2xl">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-black text-white tracking-wide">MASTER GUARD</h2>
          <p class="text-xs text-slate-400 font-medium">Enterprise Security & Whitelist Gate</p>
        </div>
      </div>

      <form id="loginForm" onsubmit="handleLogin(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Master ID</label>
          <input type="text" id="loginUsername" required class="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono" placeholder="Enter Master ID" autocomplete="off">
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Master Password</label>
          <input type="password" id="loginPassword" required class="w-full bg-slate-900/90 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono" placeholder="••••••••••••" autocomplete="off">
        </div>
        <div id="loginError" class="text-xs font-bold text-rose-400 hidden"></div>
        <button type="submit" class="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-lg transition shadow-lg flex items-center justify-center gap-2 text-sm tracking-wide mt-2">
          <span>AUTHENTICATE & UNLOCK</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </form>
    </div>
  </div>

  <!-- MAIN DASHBOARD -->
  <header class="glass-panel border-b border-slate-800 sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
    <div class="flex items-center gap-4">
      <div class="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <div>
        <div class="flex items-center gap-2">
          <span class="font-black text-white text-base tracking-wide">D247 MASTER GUARD</span>
          <span class="status-badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ACTIVE SHIELD
          </span>
        </div>
        <p class="text-[11px] text-slate-400 font-medium">Domain & IP Anti-Theft Whitelist Controller</p>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button onclick="refreshData()" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold" title="Refresh Live Stats">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        <span>Refresh</span>
      </button>
      <button onclick="handleLogout()" class="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-bold transition flex items-center gap-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        <span>Logout</span>
      </button>
    </div>
  </header>

  <!-- CONTENT -->
  <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

    <!-- 4 TOP STAT CARDS -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="glass-panel p-4 rounded-xl border border-slate-800">
        <div class="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          <span>Total Requests</span>
          <svg class="text-sky-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <div id="statTotalRequests" class="text-2xl font-black text-white font-mono">0</div>
        <div class="text-[10px] text-slate-400 mt-1">Inspected by Master Guard</div>
      </div>

      <div class="glass-panel p-4 rounded-xl border border-slate-800">
        <div class="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          <span>Whitelisted Domains</span>
          <svg class="text-emerald-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        </div>
        <div id="statDomains" class="text-2xl font-black text-emerald-400 font-mono">0</div>
        <div class="text-[10px] text-slate-400 mt-1">Authorized Origin Clients</div>
      </div>

      <div class="glass-panel p-4 rounded-xl border border-slate-800">
        <div class="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          <span>Whitelisted IPs</span>
          <svg class="text-blue-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
        </div>
        <div id="statIps" class="text-2xl font-black text-blue-400 font-mono">0</div>
        <div class="text-[10px] text-slate-400 mt-1">Dedicated Server IPs</div>
      </div>

      <div class="glass-panel p-4 rounded-xl border border-slate-800">
        <div class="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          <span>Blocked Threats</span>
          <svg class="text-rose-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
        </div>
        <div id="statBlocked" class="text-2xl font-black text-rose-500 font-mono">0</div>
        <div class="text-[10px] text-slate-400 mt-1">Postman, bots & 403 blocks</div>
      </div>
    </div>

    <!-- NAVIGATION TABS -->
    <div class="flex border-b border-slate-800 space-x-6 text-sm font-bold">
      <button onclick="switchTab('domains')" id="tabBtn-domains" class="pb-3 border-b-2 border-amber-500 text-amber-400 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
        <span>Domain Whitelist</span>
      </button>
      <button onclick="switchTab('ips')" id="tabBtn-ips" class="pb-3 border-b-2 border-transparent text-slate-400 hover:text-white flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/></svg>
        <span>IP Whitelist</span>
      </button>
      <button onclick="switchTab('logs')" id="tabBtn-logs" class="pb-3 border-b-2 border-transparent text-slate-400 hover:text-white flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        <span>Live Traffic Monitor</span>
        <span id="logsBadge" class="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">0</span>
      </button>
      <button onclick="switchTab('settings')" id="tabBtn-settings" class="pb-3 border-b-2 border-transparent text-slate-400 hover:text-white flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        <span>Security Settings</span>
      </button>
    </div>

    <!-- TAB 1: DOMAIN WHITELIST -->
    <div id="tab-domains" class="space-y-6">
      <!-- Add Domain Box -->
      <div class="glass-panel p-5 rounded-xl border border-slate-800">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>+ Whitelist New Domain / Origin</span>
        </h3>
        <form onsubmit="handleAddDomain(event)" class="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <div class="md:col-span-2">
            <label class="block text-xs font-semibold text-slate-400 mb-1">Domain or Origin Host</label>
            <input type="text" id="newDomName" required placeholder="e.g. aura.igambli.com or partner.com" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono">
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs font-semibold text-slate-400 mb-1">Partner Note / Label</label>
            <input type="text" id="newDomNote" placeholder="e.g. Aura Gaming Main Portal" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500">
          </div>
          <div class="md:col-span-2 flex items-center gap-4 py-2">
            <label class="flex items-center gap-1.5 text-xs font-bold text-sky-400 cursor-pointer">
              <input type="checkbox" id="newDomCasino" checked class="rounded border-slate-700 text-amber-500"> Casino
            </label>
            <label class="flex items-center gap-1.5 text-xs font-bold text-emerald-400 cursor-pointer">
              <input type="checkbox" id="newDomSports" checked class="rounded border-slate-700 text-amber-500"> Sports
            </label>
            <label class="flex items-center gap-1.5 text-xs font-bold text-amber-400 cursor-pointer">
              <input type="checkbox" id="newDomTv" checked class="rounded border-slate-700 text-amber-500"> TV Stream
            </label>
          </div>
          <div class="md:col-span-6 flex justify-end">
            <button type="submit" class="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition shadow flex items-center gap-1.5">
              <span>Save & Whitelist Domain</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Domain List Table -->
      <div class="glass-panel rounded-xl border border-slate-800 overflow-hidden shadow">
        <div class="px-5 py-3 border-b border-slate-800 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Active Whitelisted Domains</span>
          <span id="domainCountBadge" class="text-slate-300 font-mono">0 Domains</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-900/60 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th class="py-3 px-4">Domain / Origin</th>
                <th class="py-3 px-4">Permissions</th>
                <th class="py-3 px-4">Note</th>
                <th class="py-3 px-4">Added</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="domainTableBody" class="divide-y divide-slate-800/60 font-mono">
              <!-- Rendered via JS -->
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: IP WHITELIST -->
    <div id="tab-ips" class="space-y-6 hidden">
      <!-- Add IP Box -->
      <div class="glass-panel p-5 rounded-xl border border-slate-800">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <span>+ Whitelist New Dedicated IP</span>
        </h3>
        <form onsubmit="handleAddIp(event)" class="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <div class="md:col-span-2">
            <label class="block text-xs font-semibold text-slate-400 mb-1">IP Address (IPv4 / IPv6)</label>
            <input type="text" id="newIpAddress" required placeholder="e.g. 103.21.244.2 or 72.61.172.110" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono">
          </div>
          <div class="md:col-span-2">
            <label class="block text-xs font-semibold text-slate-400 mb-1">Partner Note / Label</label>
            <input type="text" id="newIpNote" placeholder="e.g. Partner API Server Frankfurt" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500">
          </div>
          <div class="md:col-span-2 flex items-center gap-4 py-2">
            <label class="flex items-center gap-1.5 text-xs font-bold text-sky-400 cursor-pointer">
              <input type="checkbox" id="newIpCasino" checked class="rounded border-slate-700 text-amber-500"> Casino
            </label>
            <label class="flex items-center gap-1.5 text-xs font-bold text-emerald-400 cursor-pointer">
              <input type="checkbox" id="newIpSports" checked class="rounded border-slate-700 text-amber-500"> Sports
            </label>
            <label class="flex items-center gap-1.5 text-xs font-bold text-amber-400 cursor-pointer">
              <input type="checkbox" id="newIpTv" checked class="rounded border-slate-700 text-amber-500"> TV Stream
            </label>
          </div>
          <div class="md:col-span-6 flex justify-end">
            <button type="submit" class="px-5 py-2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs rounded-lg transition shadow flex items-center gap-1.5">
              <span>Save & Whitelist IP</span>
            </button>
          </div>
        </form>
      </div>

      <!-- IP List Table -->
      <div class="glass-panel rounded-xl border border-slate-800 overflow-hidden shadow">
        <div class="px-5 py-3 border-b border-slate-800 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Active Whitelisted IP Addresses</span>
          <span id="ipCountBadge" class="text-slate-300 font-mono">0 IPs</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-900/60 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th class="py-3 px-4">IP Address</th>
                <th class="py-3 px-4">Permissions</th>
                <th class="py-3 px-4">Note</th>
                <th class="py-3 px-4">Added</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="ipTableBody" class="divide-y divide-slate-800/60 font-mono">
              <!-- Rendered via JS -->
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 3: LIVE TRAFFIC LOGS -->
    <div id="tab-logs" class="space-y-4 hidden">
      <div class="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap justify-between items-center gap-3">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span class="text-xs font-bold text-white uppercase tracking-wider">Live Incoming Traffic Stream</span>
        </div>
        <div class="flex items-center gap-3">
          <select id="logFilter" onchange="renderLogs()" class="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-slate-300">
            <option value="ALL">Show All Requests</option>
            <option value="BLOCKED">Show BLOCKED Only (Threats)</option>
            <option value="ALLOWED">Show ALLOWED Only</option>
          </select>
          <button onclick="handleClearLogs()" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition">
            Clear Logs
          </button>
        </div>
      </div>

      <div class="glass-panel rounded-xl border border-slate-800 overflow-hidden shadow">
        <div class="overflow-x-auto max-h-[600px] custom-scroll">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-900/80 sticky top-0 text-slate-400 font-bold border-b border-slate-800">
              <tr>
                <th class="py-2.5 px-3">Time</th>
                <th class="py-2.5 px-3">Status</th>
                <th class="py-2.5 px-3">Client IP</th>
                <th class="py-2.5 px-3">Domain / Origin</th>
                <th class="py-2.5 px-3">Target Endpoint</th>
                <th class="py-2.5 px-3">Reason / Details</th>
                <th class="py-2.5 px-3 text-right">Quick Whitelist</th>
              </tr>
            </thead>
            <tbody id="logsTableBody" class="divide-y divide-slate-800/60 font-mono text-[11px]">
              <!-- Rendered via JS -->
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 4: SECURITY SETTINGS -->
    <div id="tab-settings" class="space-y-6 hidden">
      <div class="glass-panel p-6 rounded-xl border border-slate-800 max-w-2xl space-y-5">
        <h3 class="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
          Global Security Enforcement
        </h3>

        <div class="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg border border-slate-800">
          <div>
            <div class="text-xs font-bold text-white">Master Guard Engine Active</div>
            <div class="text-[11px] text-slate-400">Strictly enforce Whitelist verification on all Casino, Sports, and TV streams.</div>
          </div>
          <input type="checkbox" id="settingGuardActive" onchange="handleSaveSettings()" class="w-5 h-5 rounded text-amber-500">
        </div>

        <div class="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg border border-slate-800">
          <div>
            <div class="text-xs font-bold text-white">Block Postman & Automated Scraping Tools</div>
            <div class="text-[11px] text-slate-400">Automatically reject cURL, Postman, Python, and headless browser scrapers.</div>
          </div>
          <input type="checkbox" id="settingBlockScrapers" onchange="handleSaveSettings()" class="w-5 h-5 rounded text-amber-500">
        </div>

        <div class="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg border border-slate-800">
          <div>
            <div class="text-xs font-bold text-white">Block Direct URL Hits in New Tab (Iframe Only)</div>
            <div class="text-[11px] text-slate-400">Prevents users from inspecting element, copying the stream URL, and pasting into a new tab.</div>
          </div>
          <input type="checkbox" id="settingBlockDirect" onchange="handleSaveSettings()" class="w-5 h-5 rounded text-amber-500">
        </div>

        <div class="flex items-center justify-between p-3 bg-slate-900/60 rounded-lg border border-slate-800">
          <div>
            <div class="text-xs font-bold text-white">Localhost & Server Loopback Safe Exemption</div>
            <div class="text-[11px] text-slate-400">Ensures internal server processes and local web clients never get blocked.</div>
          </div>
          <input type="checkbox" id="settingLocalhost" onchange="handleSaveSettings()" class="w-5 h-5 rounded text-amber-500">
        </div>
      </div>
    </div>

  </main>

  <script>
    let masterToken = localStorage.getItem("d247_master_token") || "";
    let cachedData = null;

    // Check token on load
    window.addEventListener("DOMContentLoaded", () => {
      if (masterToken) {
        document.getElementById("loginModal").classList.add("hidden");
        refreshData();
      } else {
        document.getElementById("loginModal").classList.remove("hidden");
      }
      setInterval(refreshData, 5000); // Poll traffic logs every 5s
    });

    async function handleLogin(e) {
      e.preventDefault();
      const u = document.getElementById("loginUsername").value;
      const p = document.getElementById("loginPassword").value;
      const errBox = document.getElementById("loginError");
      errBox.classList.add("hidden");

      try {
        const res = await fetch("/api/master/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: u, password: p })
        });
        const d = await res.json();
        if (d.success && d.token) {
          masterToken = d.token;
          localStorage.setItem("d247_master_token", masterToken);
          document.getElementById("loginModal").classList.add("hidden");
          refreshData();
        } else {
          errBox.textContent = d.message || "Invalid credentials";
          errBox.classList.remove("hidden");
        }
      } catch(err) {
        errBox.textContent = "Server connection error";
        errBox.classList.remove("hidden");
      }
    }

    function handleLogout() {
      localStorage.removeItem("d247_master_token");
      masterToken = "";
      document.getElementById("loginModal").classList.remove("hidden");
    }

    async function refreshData() {
      if (!masterToken) return;
      try {
        const res = await fetch("/api/master/data", {
          headers: { "Authorization": "Bearer " + masterToken }
        });
        if (res.status === 401) {
          handleLogout();
          return;
        }
        const json = await res.json();
        if (json.success) {
          cachedData = json;
          renderDashboard(json);
        }
      } catch(e) {}
    }

    function renderDashboard(data) {
      // 1. Stats
      document.getElementById("statTotalRequests").textContent = data.stats.totalRequests || 0;
      document.getElementById("statDomains").textContent = data.stats.whitelistedDomains || 0;
      document.getElementById("statIps").textContent = data.stats.whitelistedIps || 0;
      document.getElementById("statBlocked").textContent = data.stats.blockedThreats || 0;
      document.getElementById("logsBadge").textContent = (data.trafficLogs || []).length;
      document.getElementById("domainCountBadge").textContent = (data.domains || []).length + " Domains";
      document.getElementById("ipCountBadge").textContent = (data.ips || []).length + " IPs";

      // 2. Settings checkboxes
      document.getElementById("settingGuardActive").checked = !!data.settings.guardActive;
      document.getElementById("settingBlockScrapers").checked = !!data.settings.blockScrapers;
      document.getElementById("settingBlockDirect").checked = !!data.settings.blockDirectAccess;
      document.getElementById("settingLocalhost").checked = !!data.settings.autoWhitelistLocalhost;

      // 3. Render Domain Table
      const domBody = document.getElementById("domainTableBody");
      domBody.innerHTML = (data.domains || []).map(d => \`
        <tr class="hover:bg-slate-900/40 transition">
          <td class="py-2.5 px-4 font-bold text-sky-400">\${d.domain}</td>
          <td class="py-2.5 px-4">
            <div class="flex gap-1.5 text-[10px] font-bold">
              \${d.casinoApi ? '<span class="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">CASINO</span>' : ''}
              \${d.sportsApi ? '<span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">SPORTS</span>' : ''}
              \${d.tvStream ? '<span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">TV STREAM</span>' : ''}
            </div>
          </td>
          <td class="py-2.5 px-4 text-slate-300 font-sans">\${d.note || '-'}</td>
          <td class="py-2.5 px-4 text-slate-500 text-[10px]">\${(d.addedAt || '').slice(0, 10)}</td>
          <td class="py-2.5 px-4 text-right">
            <button onclick="handleDeleteDomain('\${d.id || d.domain}')" class="text-rose-400 hover:text-rose-300 transition text-[11px] font-bold">Delete</button>
          </td>
        </tr>
      \`).join("") || '<tr><td colspan="5" class="p-4 text-center text-slate-500">No whitelisted domains yet</td></tr>';

      // 4. Render IP Table
      const ipBody = document.getElementById("ipTableBody");
      ipBody.innerHTML = (data.ips || []).map(i => \`
        <tr class="hover:bg-slate-900/40 transition">
          <td class="py-2.5 px-4 font-bold text-blue-400">\${i.ip}</td>
          <td class="py-2.5 px-4">
            <div class="flex gap-1.5 text-[10px] font-bold">
              \${i.casinoApi ? '<span class="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 border border-sky-500/30">CASINO</span>' : ''}
              \${i.sportsApi ? '<span class="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">SPORTS</span>' : ''}
              \${i.tvStream ? '<span class="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">TV STREAM</span>' : ''}
            </div>
          </td>
          <td class="py-2.5 px-4 text-slate-300 font-sans">\${i.note || '-'}</td>
          <td class="py-2.5 px-4 text-slate-500 text-[10px]">\${(i.addedAt || '').slice(0, 10)}</td>
          <td class="py-2.5 px-4 text-right">
            <button onclick="handleDeleteIp('\${i.id || i.ip}')" class="text-rose-400 hover:text-rose-300 transition text-[11px] font-bold">Delete</button>
          </td>
        </tr>
      \`).join("") || '<tr><td colspan="5" class="p-4 text-center text-slate-500">No whitelisted IPs yet</td></tr>';

      // 5. Render Logs
      renderLogs();
    }

    function renderLogs() {
      if (!cachedData) return;
      const filter = document.getElementById("logFilter").value;
      const logs = (cachedData.trafficLogs || []).filter(l => {
        if (filter === "ALL") return true;
        return l.status === filter;
      });

      const tbody = document.getElementById("logsTableBody");
      tbody.innerHTML = logs.map(l => {
        const isAllowed = l.status === "ALLOWED";
        return \`
          <tr class="hover:bg-slate-900/40 transition">
            <td class="py-2 px-3 text-slate-500">\${l.time.slice(11, 19)}</td>
            <td class="py-2 px-3">
              <span class="status-badge \${isAllowed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}">
                \${l.status}
              </span>
            </td>
            <td class="py-2 px-3 text-slate-300 font-mono">\${l.ip}</td>
            <td class="py-2 px-3">
              <div class="text-sky-400 font-bold">\${l.domain}</div>
              \${l.referer ? \`<div class="text-[10px] text-slate-500 truncate max-w-[200px]" title="\${l.referer}">Ref: \${l.referer}</div>\` : ''}
            </td>
            <td class="py-2 px-3">
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold \${l.target === 'tvStream' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : l.target === 'sportsApi' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'}">\${l.target}</span>
              <div class="text-[10px] text-slate-400 mt-0.5 font-mono truncate max-w-[180px]">\${l.path}</div>
            </td>
            <td class="py-2 px-3 text-slate-400 text-[10px]">\${l.reason}</td>
            <td class="py-2 px-3 text-right">
              \${l.domain && l.domain !== '(direct)' ? \`<button onclick="quickWhitelistDomain('\${l.domain}')" class="px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold transition mr-1">+ Domain</button>\` : ''}
              \${l.ip ? \`<button onclick="quickWhitelistIp('\${l.ip}')" class="px-2 py-0.5 rounded bg-blue-500/15 hover:bg-blue-500/30 text-blue-300 text-[10px] font-bold transition">+ IP</button>\` : ''}
            </td>
          </tr>
        \`;
      }).join("") || '<tr><td colspan="7" class="p-6 text-center text-slate-500">No traffic logs recorded yet</td></tr>';
    }

    async function handleAddDomain(e) {
      e.preventDefault();
      const dom = document.getElementById("newDomName").value;
      const note = document.getElementById("newDomNote").value;
      const casinoApi = document.getElementById("newDomCasino").checked;
      const sportsApi = document.getElementById("newDomSports").checked;
      const tvStream = document.getElementById("newDomTv").checked;

      await fetch("/api/master/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + masterToken },
        body: JSON.stringify({ domain: dom, note, casinoApi, sportsApi, tvStream, allowDirect: false })
      });
      document.getElementById("newDomName").value = "";
      document.getElementById("newDomNote").value = "";
      refreshData();
    }

    async function handleDeleteDomain(id) {
      if (!confirm("Are you sure you want to remove this domain from whitelist?")) return;
      await fetch("/api/master/domain/" + encodeURIComponent(id), {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + masterToken }
      });
      refreshData();
    }

    async function handleAddIp(e) {
      e.preventDefault();
      const ip = document.getElementById("newIpAddress").value;
      const note = document.getElementById("newIpNote").value;
      const casinoApi = document.getElementById("newIpCasino").checked;
      const sportsApi = document.getElementById("newIpSports").checked;
      const tvStream = document.getElementById("newIpTv").checked;

      await fetch("/api/master/ip", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + masterToken },
        body: JSON.stringify({ ip, note, casinoApi, sportsApi, tvStream })
      });
      document.getElementById("newIpAddress").value = "";
      document.getElementById("newIpNote").value = "";
      refreshData();
    }

    async function handleDeleteIp(id) {
      if (!confirm("Are you sure you want to remove this IP from whitelist?")) return;
      await fetch("/api/master/ip/" + encodeURIComponent(id), {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + masterToken }
      });
      refreshData();
    }

    async function quickWhitelistDomain(domain) {
      await fetch("/api/master/domain", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + masterToken },
        body: JSON.stringify({ domain, casinoApi: true, sportsApi: true, tvStream: true, allowDirect: false, note: "Quick Whitelist from Log" })
      });
      refreshData();
    }

    async function quickWhitelistIp(ip) {
      await fetch("/api/master/ip", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + masterToken },
        body: JSON.stringify({ ip, casinoApi: true, sportsApi: true, tvStream: true, note: "Quick Whitelist from Log" })
      });
      refreshData();
    }

    async function handleSaveSettings() {
      const guardActive = document.getElementById("settingGuardActive").checked;
      const blockScrapers = document.getElementById("settingBlockScrapers").checked;
      const blockDirectAccess = document.getElementById("settingBlockDirect").checked;
      const autoWhitelistLocalhost = document.getElementById("settingLocalhost").checked;

      await fetch("/api/master/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + masterToken },
        body: JSON.stringify({ guardActive, blockScrapers, blockDirectAccess, autoWhitelistLocalhost })
      });
      refreshData();
    }

    async function handleClearLogs() {
      await fetch("/api/master/clear-logs", {
        method: "POST",
        headers: { "Authorization": "Bearer " + masterToken }
      });
      refreshData();
    }

    function switchTab(tab) {
      ['domains', 'ips', 'logs', 'settings'].forEach(t => {
        document.getElementById('tab-' + t).classList.add('hidden');
        document.getElementById('tabBtn-' + t).className = 'pb-3 border-b-2 border-transparent text-slate-400 hover:text-white flex items-center gap-2';
      });
      document.getElementById('tab-' + tab).classList.remove('hidden');
      document.getElementById('tabBtn-' + tab).className = 'pb-3 border-b-2 border-amber-500 text-amber-400 flex items-center gap-2';
    }
  </script>
</body>
</html>`;
}
