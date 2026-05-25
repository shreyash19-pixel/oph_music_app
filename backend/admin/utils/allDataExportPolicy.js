/**
 * Excel export scope for admin "All Data" downloads.
 * Super admin: full dataset. Other roles: only artists visible like public KPI / search
 * (application approved/completed or special-artist OPH id).
 */
const db = require("../../DB/connect");

function isFullExportRole(role) {
  return String(role ?? "").trim().toLowerCase() === "super admin";
}

async function fetchAllowedArtistOphIdsSet() {
  const [rows] = await db.execute(
    `
    SELECT DISTINCT ud.oph_id AS oph_id
    FROM user_details ud
    LEFT JOIN application_status app ON app.oph_id = ud.oph_id
    WHERE IFNULL(ud.is_active, 1) = 1
      AND (
        LOWER(TRIM(COALESCE(app.overall_status, ''))) IN ('approved', 'completed')
        OR UPPER(COALESCE(ud.oph_id, '')) LIKE '%-SA-%'
      )
    `,
  );
  const set = new Set();
  for (const r of rows || []) {
    const id = String(r.oph_id ?? "").trim();
    if (id) set.add(id);
  }
  return set;
}

function normalizeOph(row, keys = ["oph_id", "OPH_ID", "ophid", "ophID"]) {
  for (const k of keys) {
    const v = row[k];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return "";
}

function scopeApplicationStatusRows(rows, req) {
  if (req.exportFullAccess) return rows || [];
  return (rows || []).filter((r) => {
    const s = String(r.overall_status ?? "").toLowerCase().trim();
    return s === "approved" || s === "completed";
  });
}

function scopeByOphColumns(rows, req, keys) {
  if (req.exportFullAccess) return rows || [];
  const allowed = req.exportAllowedOphIds;
  if (!allowed || allowed.size === 0) return [];
  const ks = keys?.length ? keys : ["oph_id", "OPH_ID", "ophid"];
  return (rows || []).filter((r) => {
    const oph = normalizeOph(r, ks);
    return oph && allowed.has(oph);
  });
}

async function fetchSongIdsMatchingOphs(songIds, allowedSet) {
  if (!songIds.length || !allowedSet?.size) return new Set();
  const allowedArr = [...allowedSet];
  const out = new Set();
  const chunkSize = 400;
  for (let i = 0; i < songIds.length; i += chunkSize) {
    const chunk = songIds.slice(i, i + chunkSize);
    const ph = chunk.map(() => "?").join(",");
    const ophPh = allowedArr.map(() => "?").join(",");
    const [sr] = await db.execute(
      `SELECT song_id FROM songs_register WHERE song_id IN (${ph}) AND oph_id IN (${ophPh})`,
      [...chunk, ...allowedArr],
    );
    for (const row of sr || []) out.add(row.song_id);
  }
  return out;
}

async function scopeBySongId(rows, req, songIdKey = "song_id") {
  if (req.exportFullAccess) return rows || [];
  const allowed = req.exportAllowedOphIds;
  if (!allowed || allowed.size === 0) return [];
  const songIds = [
    ...new Set(
      (rows || [])
        .map((r) => r[songIdKey])
        .filter((id) => id != null && String(id).trim() !== ""),
    ),
  ];
  if (songIds.length === 0) return [];
  const allowedSongIds = await fetchSongIdsMatchingOphs(songIds, allowed);
  return (rows || []).filter((r) => allowedSongIds.has(r[songIdKey]));
}

module.exports = {
  isFullExportRole,
  fetchAllowedArtistOphIdsSet,
  normalizeOph,
  scopeApplicationStatusRows,
  scopeByOphColumns,
  scopeBySongId,
};
