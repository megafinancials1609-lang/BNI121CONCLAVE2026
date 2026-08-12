/**
 * BNI Regional Conclave 2026 — Coordinator Sheet Backend
 *
 * Data model: ONE ROW PER MEMBER PER CHAPTER (a roster + status sheet),
 * matching how the chapter coordinator pages work — each coordinator
 * ticks members Paid/Pending and syncs the whole chapter list at once.
 *
 * Members only for this event — no family/kids registration.
 *
 * Sheet columns: Chapter | Name | Status | Amount | Tier | Last Synced
 *
 * Standalone script — reads/writes the Sheet by ID, does not need to be
 * launched from the Sheet's Extensions menu.
 */

const SHEET_ID = "1gXqcueDV2FiqFSHHYGqShswoOV_kZxmpQrwLlol-Kj4";
const SHEET_NAME = "Sheet1"; // change if your tab is named differently
const HEADER = ["Chapter", "Name", "Status", "Amount", "Tier", "Last Synced"];

function getSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.getSheets()[0];
  return sheet;
}

function ensureHeader(sheet) {
  const firstRow = sheet.getRange(1, 1, 1, HEADER.length).getValues()[0];
  const matches = HEADER.every(function (h, i) { return String(firstRow[i] || "").trim() === h; });
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADER);
  } else if (!matches) {
    sheet.getRange(1, 1, 1, HEADER.length).setValues([HEADER]);
  }
}

// Reads the whole sheet into memory as {chapter||name -> {rowNumber, ...}}
function readAll(sheet) {
  const lastRow = sheet.getLastRow();
  const map = {};
  if (lastRow > 1) {
    const rows = sheet.getRange(2, 1, lastRow - 1, HEADER.length).getValues();
    rows.forEach(function (r, i) {
      const key = String(r[0]).trim() + "||" + String(r[1]).trim();
      map[key] = { rowNumber: i + 2, chapter: r[0], name: r[1], status: r[2], amount: r[3], tier: r[4], lastSynced: r[5] };
    });
  }
  return map;
}

// POST — chapter coordinator page "Save & Sync": bulk upsert one chapter's roster
function doPost(e) {
  const sheet = getSheet();
  ensureHeader(sheet);

  let data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "bad payload" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (data.action !== "sync" || !data.chapter || !Array.isArray(data.members)) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "expected {action:'sync', chapter, members:[]}" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const existing = readAll(sheet);
  const now = data.timestamp || new Date().toISOString();

  data.members.forEach(function (m) {
    const key = String(data.chapter).trim() + "||" + String(m.name).trim();
    const rowValues = [data.chapter, m.name, m.status || "Pending", m.amount || 0, data.tier || "", now];
    if (existing[key]) {
      sheet.getRange(existing[key].rowNumber, 1, 1, HEADER.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }
  });

  return ContentService.createTextOutput(JSON.stringify({ ok: true, synced: data.members.length }))
    .setMimeType(ContentService.MimeType.JSON);
}

// GET — dashboard summary (action=summary) or a single chapter's saved roster (action=chapter&chapter=Name)
function doGet(e) {
  const action = e.parameter.action || "summary";
  const callback = e.parameter.callback;

  let result;
  if (action === "summary") {
    result = buildSummary();
  } else if (action === "chapter") {
    result = buildChapter(e.parameter.chapter || "");
  } else {
    result = { ok: false, error: "unknown action" };
  }

  const json = JSON.stringify(result);
  const output = callback ? (callback + "(" + json + ")") : json;
  return ContentService.createTextOutput(output)
    .setMimeType(callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

function buildChapter(chapterName) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  const members = [];
  if (lastRow > 1) {
    const rows = sheet.getRange(2, 1, lastRow - 1, HEADER.length).getValues();
    rows.forEach(function (r) {
      if (String(r[0]).trim() === String(chapterName).trim()) {
        members.push({ name: r[1], status: r[2], amount: r[3] });
      }
    });
  }
  return { ok: true, chapter: chapterName, members: members };
}

function buildSummary() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  const chapterTotals = {}; // name -> {count (Paid), amount}
  let totalCount = 0;
  let totalAmount = 0;

  if (lastRow > 1) {
    const rows = sheet.getRange(2, 1, lastRow - 1, HEADER.length).getValues();
    rows.forEach(function (r) {
      const chapter = String(r[0] || "").trim();
      const status = String(r[2] || "");
      const amount = Number(r[3]) || 0;
      if (!chapter) return;
      if (!chapterTotals[chapter]) chapterTotals[chapter] = { count: 0, amount: 0 };
      if (status === "Paid") {
        chapterTotals[chapter].count += 1;
        chapterTotals[chapter].amount += amount;
        totalCount += 1;
        totalAmount += amount;
      }
    });
  }

  const CHAPTERS = ["Alpha","Amigos","Barons","Billionaires","Champions","Crystals","Diamond","Dynamic",
    "Experts","Futurz","Gladiators","Hallmark","Icons","Jupiter","Karma","Legends","Mantra","Phoenix","Tycoons","Victory"];

  const chapters = CHAPTERS.map(function (name) {
    const t = chapterTotals[name] || { count: 0, amount: 0 };
    return { name: name, slug: name.toLowerCase(), count: t.count, amount: t.amount };
  });

  return {
    ok: true,
    totalCount: totalCount,
    totalAmount: totalAmount,
    chapters: chapters,
    updatedAt: new Date().toISOString()
  };
}
