const { readFromS3 } = require("../utils");
const leaderboardModel = require("../admin/model/leaderboard");

/** True if payload matches `{ [year]: { [monthName]: Artist[] } }` with at least one non-empty array. */
function leaderboardPayloadHasRows(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return false;
  for (const yearKey of Object.keys(payload)) {
    if (!/^\d{4}$/.test(String(yearKey))) continue;
    const months = payload[yearKey];
    if (!months || typeof months !== "object") continue;
    for (const monthKey of Object.keys(months)) {
      const arr = months[monthKey];
      if (Array.isArray(arr) && arr.length > 0) return true;
    }
  }
  return false;
}

function normalizeLeaderboardArtistRow(r) {
  const oph_id = r.oph_id ?? r.OPH_ID ?? r.ophid;
  const ranks = Number(r.ranks ?? r.rank ?? 0);
  return {
    ...r,
    oph_id,
    ranks,
    rank: ranks,
    stage_name: r.stage_name ?? "",
    personal_photo: r.personal_photo ?? "",
    location: r.location ?? "",
    song_count: r.song_count ?? 0,
    total_views: r.total_views ?? 0,
  };
}

const LEADERBOARD_TOP_PER_MONTH = 10;
const LEADERBOARD_MAX_MONTHS = 3;

const MONTH_INDEX = {
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

function monthNameFromDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return {
    year: d.getFullYear(),
    month: d.toLocaleString("en-US", { month: "long" }),
  };
}

/** Bucket artists by created_at / updated_at months; top N per month by score (for history when S3 is sparse). */
async function buildLeaderboardHistoryFromDatabase() {
  const rows = await leaderboardModel.getAllScores();
  if (!Array.isArray(rows) || rows.length === 0) return {};

  const buckets = {};

  for (const row of rows) {
    const normalized = normalizeLeaderboardArtistRow(row);
    const ophId = normalized.oph_id;
    if (!ophId) continue;

    const stampDates = [row.created_at, row.updated_at].filter(Boolean);
    const seen = new Set();

    for (const stamp of stampDates) {
      const parts = monthNameFromDate(stamp);
      if (!parts) continue;
      const key = `${parts.year}-${parts.month}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const { year, month } = parts;
      if (!buckets[year]) buckets[year] = {};
      if (!buckets[year][month]) buckets[year][month] = new Map();

      const existing = buckets[year][month].get(ophId);
      const rowUpdated = row.updated_at ? new Date(row.updated_at).getTime() : 0;
      const existingUpdated = existing?.updated_at
        ? new Date(existing.updated_at).getTime()
        : 0;
      if (!existing || rowUpdated >= existingUpdated) {
        buckets[year][month].set(ophId, { ...normalized, updated_at: row.updated_at });
      }
    }
  }

  const result = {};
  for (const [year, months] of Object.entries(buckets)) {
    result[year] = {};
    for (const [month, byOph] of Object.entries(months)) {
      result[year][month] = [...byOph.values()]
        .sort((a, b) => Number(b.score ?? 0) - Number(a.score ?? 0))
        .slice(0, LEADERBOARD_TOP_PER_MONTH)
        .map((r, idx) => {
          const rank = idx + 1;
          return { ...r, ranks: rank, rank };
        });
    }
  }
  return result;
}

/** Fill empty/missing S3 months from DB buckets; keep non-empty S3 months as-is. */
function mergeLeaderboardHistory(s3Data, dbData) {
  const merged =
    s3Data && typeof s3Data === "object" && !Array.isArray(s3Data)
      ? JSON.parse(JSON.stringify(s3Data))
      : {};

  if (!dbData || typeof dbData !== "object") return merged;

  for (const year of Object.keys(dbData)) {
    if (!/^\d{4}$/.test(String(year))) continue;
    const dbMonths = dbData[year];
    if (!dbMonths || typeof dbMonths !== "object") continue;
    if (!merged[year]) merged[year] = {};

    for (const month of Object.keys(dbMonths)) {
      const s3Rows = merged[year][month];
      const dbRows = dbMonths[month];
      if (!Array.isArray(dbRows) || dbRows.length === 0) continue;
      if (!Array.isArray(s3Rows) || s3Rows.length === 0) {
        merged[year][month] = dbRows;
      }
    }
  }
  return merged;
}

/** Keep only the latest N calendar months that have at least one artist row. */
function trimLeaderboardToLatestMonths(payload, maxMonths = LEADERBOARD_MAX_MONTHS) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  const slots = [];
  for (const yearKey of Object.keys(payload)) {
    if (!/^\d{4}$/.test(String(yearKey))) continue;
    const year = Number(yearKey);
    const months = payload[yearKey];
    if (!months || typeof months !== "object") continue;

    for (const month of Object.keys(months)) {
      const rows = months[month];
      if (!Array.isArray(rows) || rows.length === 0) continue;
      slots.push({
        year,
        month,
        sortIndex: MONTH_INDEX[month] ?? -1,
      });
    }
  }

  slots.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.sortIndex - a.sortIndex;
  });

  const trimmed = {};
  for (const { year, month } of slots.slice(0, maxMonths)) {
    const yk = String(year);
    if (!trimmed[yk]) trimmed[yk] = {};
    trimmed[yk][month] = payload[yk]?.[month] ?? payload[year]?.[month];
  }
  return trimmed;
}

const getLeaderBoardData = async (req, res) => {
  try {
    const response = await readFromS3("monthly_kpi/leaderboard.json");
    let data =
      response && typeof response === "object" && !Array.isArray(response)
        ? response
        : {};

    try {
      const fromDb = await buildLeaderboardHistoryFromDatabase();
      if (leaderboardPayloadHasRows(fromDb)) {
        if (!leaderboardPayloadHasRows(data)) {
          console.warn(
            "[leaderboard/history] S3 empty; using leaderBoard_scores month buckets",
          );
          data = fromDb;
        } else {
          data = mergeLeaderboardHistory(data, fromDb);
        }
      }
    } catch (dbErr) {
      console.error("[leaderboard/history] DB month buckets failed:", dbErr.message);
    }

    data = trimLeaderboardToLatestMonths(data);

    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = { getLeaderBoardData };
