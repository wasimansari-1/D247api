# D247 Full Platform Scraper & API Engine

Scrapes all sports (Cricket, Soccer, Tennis), 78+ Casino tables, real-time round cards, live scoreboards, match odds, and video streams from D247.

## Discovered API Schema

All APIs are served under base URL: `https://d247.com/api/front`

### 1. Sports & Scoreboards
* **Sports Navigation Tree**: `POST /api/front/treedata`
  * Returns sports categories, tournament IDs, and match hierarchies.
* **In-Play & Upcoming Events**: `POST /api/front/get_latest_events`
  * Returns active live matches across Cricket, Soccer, and Tennis.
* **Sport Highlights**: `POST /api/front/highlighthomePrivate?etid={etid}`
  * `etid = 4`: Cricket
  * `etid = 1`: Soccer
  * `etid = 2`: Tennis
* **Live Match Odds & Real-Time Scoreboard**: `POST /api/front/gamedataPrivate?etid={etid}&gmid={gmid}`
  * Returns bookmaker markets, fancy odds, runners, and live scorecards (runs, overs, wickets, ball-by-ball updates).

### 2. Casino (78+ Tables & Streams)
* **Table List**: `POST /api/front/tablelist`
  * Full listing of all 78+ casino tables (Teen Patti 20-20, Dragon Tiger, Lucky 7, Andar Bahar, Worli Matka, Roulette, Baccarat, etc.).
* **Real-Time Round Data**: `POST /api/front/data2?gtype={gameType}`
  * Real-time round cards, countdown timer, active round ID, and betting markets.
* **Last Results History**: `POST /api/front/lastresults2`
  * Historical winners and results matrix.
* **Live Video Feeds & Streams**: `POST /api/front/launchother`
  * Upstream video stream / player iframe URLs.
* **Matka / Worli Section**: `POST /api/front/worlisectiondata`

---

## How to Run

### Method 1: Export HAR from Chrome (Easiest)
1. In Chrome DevTools (where you have D247 Demo open), click the **Export HAR (⬇)** button in the Network tab.
2. Save the `.har` file inside this folder (`Desktop/D247/`).
3. Run:
   ```bash
   node har_extractor.js
   ```
4. It will automatically extract your active cookies, update `config.json`, and parse all 78+ tables, sports, and scoreboards into the `output/` folder!

### Method 2: Copy cURL from Network Tab
1. In Chrome DevTools Network tab, right-click on any request (e.g. `tablelist` or `gamedataPrivate`) -> **Copy** -> **Copy as cURL (bash)**.
2. Run:
   ```bash
   node import_curl.js "<paste cURL command here>"
   ```
3. Run the live scraper:
   ```bash
   node d247_scraper.js
   ```

