/* ============================================================
   BNI RAIPUR & REST OF CHHATTISGARH — REGIONAL CONCLAVE 2026
   Shared configuration — used by dashboard.html and every
   chapter registration page.

   IMPORTANT: after you deploy the Apps Script backend (see
   SETUP_INSTRUCTIONS.md), paste the Web App URL below.
   ============================================================ */

const CONCLAVE_CONFIG = {
  eventName: "BNI Raipur & Rest of Chhattisgarh Regional Conclave",
  tagline: "Empowering Your Business Expansion",
  eventDateISO: "2026-08-22T07:00:00+05:30",   // 22 Aug 2026, 7:00 AM IST
  eventEndISO:  "2026-08-22T13:00:00+05:30",   // 1:00 PM IST
  venue: "Venue To Be Announced",

  // Google Sheet backend (Apps Script Web App).
  // PASTE the deployed /exec URL here once you've published the script.
  appsScriptUrl: "PASTE_APPS_SCRIPT_WEB_APP_URL_HERE",

  // Google Sheet this data is stored in (for reference / manual checks)
  googleSheetId: "1gXqcueDV2FiqFSHHYGqShswoOV_kZxmpQrwLlol-Kj4",
  googleSheetUrl: "https://docs.google.com/spreadsheets/d/1gXqcueDV2FiqFSHHYGqShswoOV_kZxmpQrwLlol-Kj4/edit",

  // Pricing tiers, in order. `until` is inclusive end-of-day IST.
  pricing: [
    { key: "early",  label: "Early Bird",       amount: 800,  until: "2026-08-14T23:59:59+05:30" },
    { key: "late",   label: "Late Bird",        amount: 900,  until: "2026-08-21T23:59:59+05:30" },
    { key: "spot",   label: "Spot Registration", amount: 1000, until: null } // no cap — event day onward
  ],

  // Same 20 chapters used for BNI JOSH 2026 — one coordinator / registration
  // link per chapter. Edit this list if the Regional Conclave uses a
  // different chapter roster.
  chapters: [
    { name: "Alpha",        slug: "alpha" },
    { name: "Amigos",       slug: "amigos" },
    { name: "Barons",       slug: "barons" },
    { name: "Billionaires", slug: "billionaires" },
    { name: "Champions",    slug: "champions" },
    { name: "Crystals",     slug: "crystals" },
    { name: "Diamond",      slug: "diamond" },
    { name: "Dynamic",      slug: "dynamic" },
    { name: "Experts",      slug: "experts" },
    { name: "Futurz",       slug: "futurz" },
    { name: "Gladiators",   slug: "gladiators" },
    { name: "Hallmark",     slug: "hallmark" },
    { name: "Icons",        slug: "icons" },
    { name: "Jupiter",      slug: "jupiter" },
    { name: "Karma",        slug: "karma" },
    { name: "Legends",      slug: "legends" },
    { name: "Mantra",       slug: "mantra" },
    { name: "Phoenix",      slug: "phoenix" },
    { name: "Tycoons",      slug: "tycoons" },
    { name: "Victory",      slug: "victory" }
  ]
};

// Returns the currently active pricing tier object based on IST time-now.
function getCurrentTier() {
  const now = new Date();
  for (const tier of CONCLAVE_CONFIG.pricing) {
    if (!tier.until || now <= new Date(tier.until)) return tier;
  }
  return CONCLAVE_CONFIG.pricing[CONCLAVE_CONFIG.pricing.length - 1];
}
