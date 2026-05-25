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

/** Same shape as monthly_kpi/leaderboard.json: current year → full month name → rows (join user_details + leaderBoard_scores). */
async function buildLeaderboardFromDatabase() {
  const rows = await leaderboardModel.getAllScores();
  if (!Array.isArray(rows) || rows.length === 0) return {};
  const now = new Date();
  const year = String(now.getFullYear());
  const monthName = now.toLocaleString("en-US", { month: "long" });
  const artists = rows.map(normalizeLeaderboardArtistRow);
  return {
    [year]: {
      [monthName]: artists,
    },
  };
}

const getLeaderBoardData = async (req, res) => {
  try {
    const response = await readFromS3("monthly_kpi/leaderboard.json");
    let data =
      response && typeof response === "object" && !Array.isArray(response)
        ? response
        : {};

    if (!leaderboardPayloadHasRows(data)) {
      try {
        const fromDb = await buildLeaderboardFromDatabase();
        if (leaderboardPayloadHasRows(fromDb)) {
          console.warn(
            "[leaderboard/history] S3 monthly KPI empty or missing; using leaderBoard_scores snapshot",
          );
          data = fromDb;
        }
      } catch (dbErr) {
        console.error("[leaderboard/history] DB fallback failed:", dbErr.message);
      }
    }

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
