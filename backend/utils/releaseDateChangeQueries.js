const db = require("../DB/connect");
const {
  RELEASE_DATE_CHANGE_FROM_SQL,
  normalizeCalendarDateOnly,
} = require("./calendarDateUtils");

const PENDING_RDC_STATUSES = ["under review", "pending", "Under review", "Pending"];

/**
 * True if another artist holds the date on calender, or any pending release-date-change payment targets it.
 */
async function isNewDateBlockedForReleaseDateChange(
  connection,
  ophId,
  newDate,
  { excludeOphPending = false, excludeTransactionId } = {},
) {
  const dateStr = normalizeCalendarDateOnly(newDate);
  if (!dateStr) return true;
  const ophNorm = String(ophId).trim();

  const [calRows] = await connection.query(
    `SELECT 1 FROM calender
     WHERE (DATE(current_booking_date) = DATE(?) OR current_booking_date = ?)
       AND (oph_id IS NULL OR oph_id != ?)
     LIMIT 1`,
    [dateStr, dateStr, ophNorm],
  );
  if (calRows.length > 0) return true;

  const payParams = [dateStr, dateStr];
  let paySql = `SELECT 1 FROM payments
     WHERE (release_date = ? OR DATE(release_date) = DATE(?))
       AND ${RELEASE_DATE_CHANGE_FROM_SQL}
       AND LOWER(TRIM(COALESCE(status, ''))) IN ('under review', 'pending')`;
  if (excludeOphPending && ophNorm) {
    paySql += " AND (oph_id IS NULL OR oph_id != ?)";
    payParams.push(ophNorm);
  }
  if (excludeTransactionId) {
    paySql += " AND transaction_id != ?";
    payParams.push(String(excludeTransactionId).trim());
  }
  paySql += " LIMIT 1";
  const [payRows] = await connection.query(paySql, payParams);
  return payRows.length > 0;
}

async function getPendingReleaseDateChangeForOph(connection, ophId) {
  const ophNorm = String(ophId).trim();
  const [rows] = await connection.query(
    `SELECT id, transaction_id, release_date, old_release_date, status, created_at
     FROM payments
     WHERE oph_id = ?
       AND ${RELEASE_DATE_CHANGE_FROM_SQL}
       AND LOWER(TRIM(COALESCE(status, ''))) IN ('under review', 'pending')
     ORDER BY created_at DESC
     LIMIT 1`,
    [ophNorm],
  );
  return rows[0] || null;
}

async function hasPendingReleaseDateChangeForOph(
  connection,
  ophId,
  { excludeTransactionId } = {},
) {
  const ophNorm = String(ophId).trim();
  const params = [ophNorm];
  let sql = `SELECT id FROM payments
     WHERE oph_id = ?
       AND ${RELEASE_DATE_CHANGE_FROM_SQL}
       AND LOWER(TRIM(COALESCE(status, ''))) IN ('under review', 'pending')`;
  if (excludeTransactionId) {
    sql += " AND transaction_id != ?";
    params.push(String(excludeTransactionId).trim());
  }
  sql += " LIMIT 1";
  const [rows] = await connection.query(sql, params);
  return rows.length > 0;
}

/** Pending RDC target dates shown as anonymous blocks on the public artist calendar */
async function getPendingReleaseDateChangeBlocks() {
  const [rows] = await db.query(
    `SELECT DISTINCT DATE(release_date) AS block_date
     FROM payments
     WHERE ${RELEASE_DATE_CHANGE_FROM_SQL}
       AND release_date IS NOT NULL
       AND release_date != '0000-00-00'
       AND LOWER(TRIM(COALESCE(status, ''))) IN ('under review', 'pending')`,
  );
  return rows
    .map((r) => normalizeCalendarDateOnly(r.block_date))
    .filter(Boolean);
}

/** Active pending release-date-change payments with old/new dates for calendar merge */
async function getActivePendingReleaseDateChanges(connection = db) {
  const [rows] = await connection.query(
    `SELECT p.oph_id, p.release_date, p.old_release_date, p.song_id, p.status AS payment_status,
            p.from_source, COALESCE(ud.full_name, '') AS full_name
     FROM payments p
     LEFT JOIN user_details ud ON (p.oph_id = ud.oph_id OR p.oph_id = ud.OPH_ID)
     WHERE ${RELEASE_DATE_CHANGE_FROM_SQL}
       AND p.release_date IS NOT NULL
       AND p.release_date != '0000-00-00'
       AND LOWER(TRIM(COALESCE(p.status, ''))) IN ('under review', 'pending')
     ORDER BY p.created_at DESC`,
  );
  return rows.map((r) => ({
    oph_id: r.oph_id,
    target_date: normalizeCalendarDateOnly(r.release_date),
    old_date: normalizeCalendarDateOnly(r.old_release_date),
    song_id: r.song_id,
    payment_status: r.payment_status,
    from_source: r.from_source || "Release date change",
    full_name: r.full_name || "",
  })).filter((r) => r.target_date);
}

function mergePaymentStatus(existing, pending) {
  const parts = String(existing || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const pendingNorm = String(pending || "").trim();
  if (pendingNorm && !parts.some((p) => p.toLowerCase() === pendingNorm.toLowerCase())) {
    parts.push(pendingNorm);
  }
  return parts.join(", ") || pendingNorm || "under review";
}

function mergeFromSource(existing, next) {
  const parts = String(existing || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const nextNorm = String(next || "").trim();
  if (nextNorm && !parts.some((p) => p.toLowerCase() === nextNorm.toLowerCase())) {
    parts.push(nextNorm);
  }
  return parts.join(", ") || nextNorm;
}

module.exports = {
  isNewDateBlockedForReleaseDateChange,
  getPendingReleaseDateChangeForOph,
  hasPendingReleaseDateChangeForOph,
  getPendingReleaseDateChangeBlocks,
  getActivePendingReleaseDateChanges,
  mergePaymentStatus,
  mergeFromSource,
  PENDING_RDC_STATUSES,
};
