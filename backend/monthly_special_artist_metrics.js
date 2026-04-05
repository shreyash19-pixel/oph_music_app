// monthly_special_artist_metrics.js
const fs = require("fs");
const axios = require("axios");
require("dotenv").config();
const { saveToS3, readFromS3 } = require("./utils.js");

const Backendaxios = axios.create({
  baseURL: process.env.API_URL || "http://localhost:5000",
  withCredentials: true,
});

const S3_KEY = "monthly_kpi/special_artist_metrics.json";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function ophKey(record) {
  const id = record?.oph_id ?? record?.OPH_ID;
  return id == null ? "" : String(id).trim();
}

function toIso(v) {
  if (v == null) return null;
  if (v instanceof Date) return v.toISOString();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toISOString();
}

function normalizeSpecialArtistRecord(row) {
  const id = ophKey(row);
  if (!id) return null;
  return {
    oph_id: id,
    traffic: Number(row.traffic) || 0,
    accepted_event_count: Number(row.accepted_event_count) || 0,
    stage_name: row.stage_name ?? null,
    created_at: toIso(row.created_at),
    updated_at: toIso(row.updated_at),
  };
}

function getPreviousMonthBucket(updatedData, yearStr, monthName) {
  const yi = parseInt(yearStr, 10);
  const mi = MONTH_NAMES.indexOf(monthName);
  if (Number.isNaN(yi) || mi < 0) return null;
  if (mi === 0) {
    const py = String(yi - 1);
    const arr = updatedData[py]?.December;
    return Array.isArray(arr) && arr.length ? { y: py, m: "December" } : null;
  }
  const pm = MONTH_NAMES[mi - 1];
  const arr = updatedData[yearStr]?.[pm];
  return Array.isArray(arr) && arr.length ? { y: yearStr, m: pm } : null;
}

/**
 * Current month = prior month carry-forward + overlay of latest approved SA snapshot.
 */
function applyCurrentMonthFullSnapshot(
  updatedData,
  snapshotRows,
  currentYear,
  currentMonthName,
) {
  const y = String(currentYear);
  if (!updatedData[y]) updatedData[y] = {};

  const prev = getPreviousMonthBucket(updatedData, y, currentMonthName);
  const byOph = new Map();

  if (prev) {
    const prevRows = updatedData[prev.y][prev.m];
    for (const r of prevRows) {
      const rec = normalizeSpecialArtistRecord(r);
      if (rec) byOph.set(rec.oph_id, rec);
    }
    console.log(
      `📋 Seeded ${currentMonthName} ${y} from ${prev.m} ${prev.y} (${byOph.size} SA rows)`,
    );
  }

  for (const row of snapshotRows) {
    const rec = normalizeSpecialArtistRecord(row);
    if (rec) byOph.set(rec.oph_id, rec);
  }

  updatedData[y][currentMonthName] = Array.from(byOph.values());
  console.log(
    `✅ Full snapshot for ${currentMonthName} ${y}: ${updatedData[y][currentMonthName].length} approved special (-SA-) artists`,
  );
}

/*
  Run from backend/: node monthly_special_artist_metrics.js
  Or: node scripts/cron-runner.js monthly-special-artist-metrics

  Fetches GET /special_artist_monthly_metrics and writes S3 key monthly_kpi/special_artist_metrics.json
  Structure: { [year]: { [MonthName]: [ { oph_id, traffic, accepted_event_count, stage_name, created_at, updated_at } ] } }
*/

async function saveMonthlySpecialArtistMetrics() {
  try {
    console.log("Fetching /special_artist_monthly_metrics ...");
    const response = await Backendaxios.get("/special_artist_monthly_metrics");
    const raw = response.data ?? response;
    const rows = Array.isArray(raw) ? raw : raw.data ?? [];
    if (!Array.isArray(rows)) {
      throw new Error(
        "Expected API data array, got: " + JSON.stringify(raw).slice(0, 200),
      );
    }
    console.log(`Processing ${rows.length} approved special-artist rows`);

    let existingData = {};
    try {
      console.log("📥 Downloading existing S3 object...");
      existingData = (await readFromS3(S3_KEY)) || {};
      console.log(
        `Loaded years: ${Object.keys(existingData).join(", ") || "(none)"}`,
      );
    } catch (e) {
      console.log("No existing S3 data, starting fresh:", e.message);
      existingData = {};
    }

    const updatedData = JSON.parse(JSON.stringify(existingData));
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonthName = currentDate.toLocaleString("en-US", {
      month: "long",
    });

    console.log(`Current month: ${currentMonthName} ${currentYear}`);

    applyCurrentMonthFullSnapshot(
      updatedData,
      rows,
      currentYear,
      currentMonthName,
    );

    const localBackupPath = `./monthly_special_artist_metrics_backup_${new Date().toISOString().split("T")[0]}.json`;
    fs.writeFileSync(localBackupPath, JSON.stringify(updatedData, null, 2));
    console.log(`Local backup: ${localBackupPath}`);

    await saveToS3(S3_KEY, updatedData);
    console.log(`Uploaded to S3: ${S3_KEY}`);
  } catch (err) {
    console.error("Error updating special artist monthly metrics:", err.message);
    console.error(err);
  }
}

saveMonthlySpecialArtistMetrics();
