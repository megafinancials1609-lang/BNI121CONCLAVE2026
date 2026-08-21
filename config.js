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
  venue: "Babylon International",

  // Google Sheet backend (Apps Script Web App).
  // PASTE the deployed /exec URL here once you've published the script.
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbyd3ekIhn7l3HyEqgPPnAJn2kx_W_qOHWEhFr6UqFSEy74vAZ6mpMk7KMtD-b1Od5rn/exec",

  // Google Sheet this data is stored in (for reference / manual checks)
  googleSheetId: "1gXqcueDV2FiqFSHHYGqShswoOV_kZxmpQrwLlol-Kj4",
  googleSheetUrl: "https://docs.google.com/spreadsheets/d/1gXqcueDV2FiqFSHHYGqShswoOV_kZxmpQrwLlol-Kj4/edit",

  // Manual pricing override. Leave as null and pricing switches
  // automatically by date (Early Bird -> Late Bird -> Spot) using the
  // `until` dates below. To force the ₹900 Late Bird rate ON right now,
  // regardless of date, set this to "late" (matches a `key` below) —
  // every chapter page and the dashboard will pick it up immediately.
  // Set back to null to resume automatic date-based switching.
  forceTierKey: null,

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

// Returns the currently active pricing tier object. Honors a manual
// forceTierKey override first; otherwise picks by IST time-now.
function getCurrentTier() {
  if (CONCLAVE_CONFIG.forceTierKey) {
    const forced = CONCLAVE_CONFIG.pricing.find(function (t) { return t.key === CONCLAVE_CONFIG.forceTierKey; });
    if (forced) return forced;
  }
  const now = new Date();
  for (const tier of CONCLAVE_CONFIG.pricing) {
    if (!tier.until || now <= new Date(tier.until)) return tier;
  }
  return CONCLAVE_CONFIG.pricing[CONCLAVE_CONFIG.pricing.length - 1];
}

/* ============================================================
   REGISTRATION LOCK — 21 Aug 2026
   The ₹900 Late Bird registration is CLOSED. Every chapter
   coordinator page is now read-only: the Paid/Pending buttons
   no longer toggle and Save & Sync is disabled, so the figures
   already in the live sheet are final. Export still works.
   To reopen, set registrationClosed back to false.
   ============================================================ */
CONCLAVE_CONFIG.registrationClosed = true;
CONCLAVE_CONFIG.closedNotice = "🔒 REGISTRATION CLOSED — ₹900 Late Bird rate has ended. These totals are final.";

(function () {
  if (!CONCLAVE_CONFIG.registrationClosed) return;
  function lock() {
    var list = document.getElementById('memberList'), sync = document.getElementById('syncBtn');
    if (!list || !sync) return;
    var notice = CONCLAVE_CONFIG.closedNotice, al = document.getElementById('alertBanner');
    function setBanner() { if (al && al.textContent !== notice) { al.className = 'alert spot'; al.textContent = notice; } }
    setBanner();
    if (al && window.MutationObserver) new MutationObserver(setBanner).observe(al, { childList: true, characterData: true, subtree: true });
    sync.disabled = true; sync.textContent = 'Registration Closed'; sync.style.opacity = '0.55'; sync.style.cursor = 'not-allowed';
    document.addEventListener('click', function (e) {
      var b = e.target && e.target.closest && e.target.closest('[data-action="status"]');
      if (b) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    function paint() {
      var b = list.querySelectorAll('[data-action="status"]');
      for (var i = 0; i < b.length; i++) { b[i].style.cursor = 'default'; b[i].title = 'Registration closed — totals are final'; }
    }
    paint();
    if (window.MutationObserver) new MutationObserver(paint).observe(list, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', lock); else lock();
})();
