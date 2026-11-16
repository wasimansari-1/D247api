/**
 * cURL Importer for D247
 * Takes a raw cURL command or cookies string and updates config.json automatically.
 * 
 * Usage:
 *   node import_curl.js "curl 'https://d247.com/...' -H 'cookie: ...'"
 *   OR
 *   node import_curl.js --cookie "your_cookie_string_here"
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'config.json');
const rawInput = process.argv.slice(2).join(' ');

if (!rawInput) {
  console.log('Usage: node import_curl.js "<paste cURL or cookie here>"');
  process.exit(1);
}

let config = {
  baseUrl: "https://d247.com/api/front",
  headers: {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Content-Type": "application/json",
    "Referer": "https://d247.com/",
    "Origin": "https://d247.com",
    "Cookie": ""
  }
};

if (fs.existsSync(CONFIG_PATH)) {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

// 1. Check if direct cookie flag
if (rawInput.startsWith('--cookie ')) {
  const cookieVal = rawInput.replace('--cookie ', '').trim().replace(/^['"]|['"]$/g, '');
  config.headers.Cookie = cookieVal;
  console.log('✅ Updated Cookie in config.json!');
} else {
  // 2. Parse cURL string
  // Extract Cookie
  const cookieMatch = rawInput.match(/-H\s+['"](?:cookie|Cookie):\s*([^'"]+)['"]/i) ||
                      rawInput.match(/--header\s+['"](?:cookie|Cookie):\s*([^'"]+)['"]/i);
  if (cookieMatch) {
    config.headers.Cookie = cookieMatch[1].trim();
    console.log('✅ Extracted Cookie from cURL command!');
  }

  // Extract User-Agent
  const uaMatch = rawInput.match(/-H\s+['"](?:user-agent|User-Agent):\s*([^'"]+)['"]/i) ||
                  rawInput.match(/--header\s+['"](?:user-agent|User-Agent):\s*([^'"]+)['"]/i);
  if (uaMatch) {
    config.headers['User-Agent'] = uaMatch[1].trim();
    console.log('✅ Extracted User-Agent from cURL command!');
  }

  // Extract Authorization / Token if present
  const authMatch = rawInput.match(/-H\s+['"](?:authorization|auth|token):\s*([^'"]+)['"]/i);
  if (authMatch) {
    config.headers['Authorization'] = authMatch[1].trim();
    console.log('✅ Extracted Auth Token from cURL command!');
  }
}

fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
console.log('💾 config.json saved successfully!');
console.log('🚀 You can now run: node d247_scraper.js');

