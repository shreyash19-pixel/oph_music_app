const db = require("../../DB/connect");
const AdminSongService = require("../services/AdminSongService");
const SongApplicationStatusService = require("../../services/song/SongApplicationStatusService");

const updateStatus = async (
  connection,
  ophId,
  transactionId,
  newStatus,
  reject_reason,
) => {
  try {
    // Use provided connection if available (for transactions), otherwise use default db
    const dbConnection = connection || db;
    const [result] = await dbConnection.query(
      `UPDATE payments 
       SET status = ?, reject_reason = ?
       WHERE oph_id = ? AND transaction_id = ?`,
      [newStatus, reject_reason, ophId, transactionId],
    );

    return result;
  } catch (error) {
    throw error;
  }
};

const getPaymentDetailsForAllSong = async () => {
  try {
    const [rows] = await db.query(
      `SELECT *
        FROM payments
        WHERE (from_source = 'Song Registration' OR from_source = 'Special artist song registration' OR from_source = 'Song Repayment')
        AND LOWER(TRIM(COALESCE(status, ''))) IN ('under review', 'approved', 'accepted', 'rejected')
        ORDER BY created_at DESC`,
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

/**
 * Event registration payments: under review, approved/accepted, and rejected (all roles with route access).
 * from_source match is case-insensitive. Status list includes variants so rejected rows are included.
 */
const getPaymentDetailsForAllEvents = async () => {
  try {
    const statusSql = `LOWER(TRIM(COALESCE(status, ''))) IN (
      'under review',
      'approved',
      'accepted',
      'rejected',
      'reject'
    )`;

    const eventScopeSql = `
      event_id IS NOT NULL
      OR LOWER(TRIM(COALESCE(from_source, ''))) = 'event registration'
      OR LOWER(TRIM(COALESCE(from_source, ''))) LIKE 'event regist%'
    `;

    const [rows] = await db.query(
      `SELECT *
        FROM payments
        WHERE (${eventScopeSql})
        AND (${statusSql})
        ORDER BY created_at DESC`,
    );
    return rows;
  } catch (error) {
    console.error("Error in getPaymentDetailsForAllEvents:", error);
    throw error;
  }
};

const getPaymentDetailsForAllBooking = async () => {
  try {
    const [rows] = await db.query(
      `SELECT *
        FROM payments
        WHERE (from_source = 'Date booking' OR from_source = 'Date Booking')
        AND status = 'under review'`,
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

const getPaymentDetailsForEventsByOphId = async (ophid) => {
  try {
    // Query for event payments by oph_id - check by event_id (most reliable)
    // and also check from_source for backward compatibility
    // Return all statuses so admin can approve/reject any payment
    const [rows] = await db.query(
      `SELECT 
        p.id,
        p.oph_id,
        p.transaction_id,
        p.review,
        p.status,
        p.from_source,
        p.song_id,
        p.event_id,
        p.release_date,
        p.reject_reason,
        p.reject_for,
        p.amount,
        p.created_at,
        p.updated_at,
        eb.first_name AS booking_first_name,
        eb.last_name AS booking_last_name,
        eb.email AS booking_email,
        eb.phone AS booking_phone,
        eb.instagram_handle AS booking_instagram_handle,
        pr.name AS booking_profession
      FROM payments p
      LEFT JOIN event_bookings eb
        ON eb.payment_transaction_id = p.transaction_id
      LEFT JOIN professions pr ON pr.id = eb.profession_id
      WHERE (
        p.event_id IS NOT NULL
        OR p.from_source = 'Event Registration'
        OR p.from_source LIKE 'Event Regist%'
      )
      AND p.oph_id = ?
      ORDER BY p.created_at DESC`,
      [ophid],
    );
    return rows;
  } catch (error) {
    console.error("Error in getPaymentDetailsForEventsByOphId:", error);
    throw error;
  }
};

const updateSongPaymentSp = async (ophid, transactionId, FormData, status) => {
  let query = `CALL sp_update_sign_up_payment(?,?,?,?)`;
  const values = [ophid, transactionId, FormData, status];

  console.log("Values:", values);
  console.log("in sp updates");
  
  console.log(
    "Value types:",
    values.map((v) => typeof v),
  );

  try {
    const [result] = await db.execute(query, values);
    console.log("Stored procedure result:", result);
    return result;
  } catch (error) {
    console.error("Stored procedure error details:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
    });
    throw error;
  }
};

const updateEventPaymentSp = async (
  connection,
  ophId,
  transactionId,
  status,
  reject_reason,
  eventId,
  isRejected = false,
) => {
  try {
    // Use provided connection if available (for transactions), otherwise use default db
    const dbConnection = connection || db;

    // For external events, oph_id contains the participant name (not a valid OPH_ID)
    // Primary match MUST be transaction_id + event identity.
    // For backward compatibility with older rejected rows (where event_id was NULL and moved to reject_for),
    // we also match `(event_id IS NULL AND reject_for = eventId)`.
    const normalizedEventId = parseInt(eventId, 10);
    const eventMatchClause = `(event_id = ? OR (event_id IS NULL AND reject_for = ?))`;

    // Also include oph_id in the match if provided (for additional specificity).
    const whereClause = ophId
      ? `transaction_id = ? AND ${eventMatchClause} AND (oph_id = ? OR oph_id IS NULL)`
      : `transaction_id = ? AND ${eventMatchClause} AND oph_id IS NULL`;

    const whereParams = ophId
      ? [transactionId, normalizedEventId, normalizedEventId, ophId]
      : [transactionId, normalizedEventId, normalizedEventId];

    // IMPORTANT:
    // Do NOT NULL-out event_id on rejection.
    // If event_id becomes NULL, a single user having multiple event payments becomes ambiguous in admin/payment flows
    // and can cause the "action on one event affects the other" behavior.
    // Keep event_id so updates and UI remain scoped to (transaction_id + event_id).
    if (isRejected) {
      const [result] = await dbConnection.query(
        `UPDATE payments 
         SET status = ?, 
             reject_reason = ?,
             updated_at = NOW()
         WHERE ${whereClause}`,
        [
          status,
          reject_reason || null,
          ...whereParams,
        ],
      );

      console.log("Update event payment result (rejected):", result);
      return result;
    } else {
      // For approved or under review, normal update
      const [result] = await dbConnection.query(
        `UPDATE payments 
         SET status = ?, 
             reject_reason = ?,
             updated_at = NOW()
         WHERE ${whereClause}`,
        [
          status,
          reject_reason || null,
          ...whereParams,
        ],
      );

      console.log("Update event payment result:", result);
      return result;
    }
  } catch (error) {
    console.error("Error updating event payment:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
    });
    throw error;
  }
};

const getPaymentDetailsByTransactionId = async (transactionId) => {
  try {
    const [rows] = await db.query(
      `SELECT *
        FROM payments
        WHERE transaction_id = ?`,
      [transactionId],
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

const getPaymentDetailsForSongByOphId = async (ophid, songid) => {
  try {
    const [rows] = await db.query(
      `SELECT *
        FROM payments
        WHERE (from_source = 'Song Registration' OR from_source = 'Song Repayment' OR from_source = 'Special artist song registration')
        AND oph_id = ?
        AND (song_id = ? OR reject_for = ?)     
        ORDER BY updated_at DESC
        LIMIT 1
        `,
      [ophid, songid,songid],
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

const updateStatusPayment = async (ophId, songId, status) => {
  try {
    const [result] = await db.query(
      `UPDATE payments 
       SET status = ?
       WHERE oph_id = ? AND song_id = ?`,
      [status, ophId, songId],
    );

    return result;
  } catch (error) {
    throw error;
  }
};

const getTransactionDetails = async (release_date, oph_id, song_id) => {
  try {
    // When release_date and oph_id: return BOTH Date Booking and Song Registration for this slot (2 entries).
    if (release_date && oph_id) {
      const [rows] = await db.execute(
        `SELECT 
          sp.id,
          sp.oph_id AS OPH_ID, 
          sp.transaction_id AS Transaction_ID, 
          sp.from_source AS \`From\`, 
          sp.song_id, 
          sp.status AS Status,
          sp.amount,
          sp.release_date,
          COALESCE(MIN(c.current_booking_date), sp.release_date) AS current_booking_date,
          MIN(c.id) AS calendar_id,
          sp.oph_id,
          MIN(c.song_id) AS calendar_song_id,
          MIN(c.previous_booking_date) AS previous_booking_date,
          MIN(c.original_booking_date) AS original_booking_date,
          MAX(c.song_name) AS song_name,
          MAX(c.project_type) AS project_type,
          MAX(c.reason) AS reason,
          MAX(c.reason_history) AS reason_history,
          MIN(c.created_at) AS created_at,
          MAX(c.updated_at) AS updated_at
        FROM payments sp 
        LEFT JOIN calender c ON (sp.release_date = c.current_booking_date OR DATE(sp.release_date) = DATE(c.current_booking_date))
          AND sp.oph_id = c.oph_id
        WHERE sp.oph_id = ?
          AND (sp.release_date = ? OR DATE(sp.release_date) = ?)
          AND (
            LOWER(TRIM(sp.from_source)) = 'date booking'
            OR sp.from_source = 'Date Booking'
            OR sp.from_source = 'Song Registration'
            OR sp.from_source = 'Release date change'
            OR sp.from_source = 'Release Date Change'
          )
        GROUP BY sp.id
        ORDER BY CASE WHEN LOWER(TRIM(sp.from_source)) = 'date booking' THEN 0 ELSE 1 END, sp.created_at ASC`,
        [oph_id, release_date, release_date],
      );
      if (rows && rows.length > 0) {
        return rows;
      }
    }

    // When oph_id and song_id are provided (from time calendar click), return the latest
    // under-review Song Registration payment for that artist/song so we show the same
    // payment as the Song Payment page (not an older payment for a different date).
    if (oph_id && song_id) {
      const [rowsByArtistSong] = await db.execute(
        `SELECT 
          sp.oph_id AS OPH_ID, 
          sp.transaction_id AS Transaction_ID, 
          sp.from_source AS \`From\`, 
          sp.song_id, 
          sp.status AS Status,
          COALESCE(c.current_booking_date, sp.release_date) AS current_booking_date,
          c.id,
          c.oph_id,
          c.song_id AS calendar_song_id,
          c.previous_booking_date,
          c.original_booking_date,
          c.song_name,
          c.project_type,
          c.reason,
          c.reason_history,
          c.created_at,
          c.updated_at
        FROM payments sp 
        LEFT JOIN calender c ON sp.release_date = c.current_booking_date 
          AND sp.oph_id = c.oph_id
          AND (c.song_id = sp.song_id OR c.song_id = sp.reject_for)
        WHERE sp.oph_id = ?
          AND (sp.song_id = ? OR sp.reject_for = ?)
          AND (sp.from_source = 'Song Registration' OR sp.from_source = 'Song Repayment')
          AND sp.status = 'under review'
          AND (sp.release_date = ? OR c.current_booking_date = ?)
        ORDER BY sp.created_at DESC
        LIMIT 1`,
        [oph_id, song_id, song_id, release_date, release_date],
      );
      if (rowsByArtistSong && rowsByArtistSong.length > 0) {
        return rowsByArtistSong;
      }
      // No under-review payment: still return this slot's payment by release_date + oph_id + song_id (any status)
      // so the verify page shows OPHID, Transaction ID, etc. instead of empty or wrong artist.
      const [rowsByDateArtistSong] = await db.execute(
        `SELECT 
          sp.oph_id AS OPH_ID, 
          sp.transaction_id AS Transaction_ID, 
          sp.from_source AS \`From\`, 
          sp.song_id, 
          sp.status AS Status,
          sp.release_date,
          COALESCE(c.current_booking_date, sp.release_date) AS current_booking_date,
          c.id,
          c.oph_id,
          c.song_id AS calendar_song_id,
          c.previous_booking_date,
          c.original_booking_date,
          c.song_name,
          c.project_type,
          c.reason,
          c.reason_history,
          c.created_at,
          c.updated_at
        FROM payments sp 
        LEFT JOIN calender c ON sp.release_date = c.current_booking_date 
          AND sp.oph_id = c.oph_id
          AND (c.song_id = sp.song_id OR c.song_id = sp.reject_for)
        WHERE sp.oph_id = ?
          AND (sp.song_id = ? OR sp.reject_for = ?)
          AND (sp.from_source = 'Song Registration' OR sp.from_source = 'Song Repayment')
          AND (sp.release_date = ? OR c.current_booking_date = ?)
        ORDER BY sp.created_at DESC
        LIMIT 1`,
        [oph_id, song_id, song_id, release_date, release_date],
      );
      if (rowsByDateArtistSong && rowsByDateArtistSong.length > 0) {
        return rowsByDateArtistSong;
      }
      // Slot date may differ from payment's release_date (e.g. calendar shows slot date, payment has different date).
      // Return latest Song Registration/Repayment for this artist+song so the sidebar shows payment info.
      const [rowsByArtistSongOnly] = await db.execute(
        `SELECT 
          sp.oph_id AS OPH_ID, 
          sp.transaction_id AS Transaction_ID, 
          sp.from_source AS \`From\`, 
          sp.song_id, 
          sp.status AS Status,
          sp.release_date,
          sp.release_date AS current_booking_date,
          NULL AS id,
          sp.oph_id,
          sp.song_id AS calendar_song_id,
          NULL AS previous_booking_date,
          NULL AS original_booking_date,
          NULL AS song_name,
          NULL AS project_type,
          NULL AS reason,
          NULL AS reason_history,
          NULL AS created_at,
          NULL AS updated_at
        FROM payments sp
        WHERE sp.oph_id = ?
          AND (sp.song_id = ? OR sp.reject_for = ?)
          AND (sp.from_source = 'Song Registration' OR sp.from_source = 'Song Repayment')
        ORDER BY sp.created_at DESC
        LIMIT 1`,
        [oph_id, song_id, song_id],
      );
      if (rowsByArtistSongOnly && rowsByArtistSongOnly.length > 0) {
        return rowsByArtistSongOnly;
      }
    }

    const [rows] = await db.execute(
      `SELECT 
        sp.oph_id AS OPH_ID, 
        sp.transaction_id AS Transaction_ID, 
        sp.from_source AS \`From\`, 
        sp.song_id, 
        sp.status AS Status,
        c.id,
        c.oph_id,
        c.song_id AS calendar_song_id,
        c.current_booking_date,
        c.previous_booking_date,
        c.original_booking_date,
        c.song_name,
        c.project_type,
        c.reason,
        c.reason_history,
        c.created_at,
        c.updated_at
      FROM payments sp 
      JOIN calender c ON sp.release_date = c.current_booking_date 
        AND sp.oph_id = c.oph_id
      WHERE sp.release_date = ?
      ORDER BY sp.created_at DESC
      LIMIT 1`,
      [release_date],
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

function normalizeCalendarDateOnly(val) {
  if (val == null || val === "") return null;
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString().slice(0, 10);
  }
  const s = String(val).trim();
  if (!s || s === "0000-00-00") return null;
  return s.length >= 10 ? s.slice(0, 10) : s;
}

const RELEASE_DATE_CHANGE_FROM_SQL = `(LOWER(TRIM(from_source)) = 'release date change' OR from_source = 'Release date change' OR from_source = 'Release Date Change')`;

/**
 * On reject: move calender back to the original date so the requested (new) date is free to book again.
 */
async function restoreCalendarAfterReleaseDateChangeReject(
  connection,
  { release_date, oph_id, rejectReason, parseReasonHistory },
) {
  const newDate = normalizeCalendarDateOnly(release_date);
  if (!newDate) return { restored: false };

  const ophNorm = oph_id ? String(oph_id).trim() : null;
  let calendarEntries = [];

  if (ophNorm) {
    const [rows] = await connection.execute(
      `SELECT song_id, previous_booking_date, oph_id, reason_history, current_booking_date
       FROM calender
       WHERE oph_id = ?
         AND (
           DATE(current_booking_date) = DATE(?)
           OR current_booking_date = ?
           OR (previous_booking_date IS NOT NULL AND (
             DATE(previous_booking_date) = DATE(?)
             OR previous_booking_date = ?
           ))
         )
       ORDER BY updated_at DESC
       LIMIT 1`,
      [ophNorm, newDate, newDate, newDate, newDate],
    );
    calendarEntries = rows;
  }

  if (calendarEntries.length === 0) {
    const [rows] = await connection.execute(
      `SELECT song_id, previous_booking_date, oph_id, reason_history, current_booking_date
       FROM calender
       WHERE DATE(current_booking_date) = DATE(?)
          OR current_booking_date = ?
       ORDER BY updated_at DESC
       LIMIT 1`,
      [newDate, newDate],
    );
    calendarEntries = rows;
  }

  if (calendarEntries.length === 0) {
    return { restored: false };
  }

  const entry = calendarEntries[0];
  const ophId = entry.oph_id;
  const songId = entry.song_id;
  let previousDate = normalizeCalendarDateOnly(entry.previous_booking_date);

  if (!previousDate && ophId) {
    const [payRows] = await connection.execute(
      `SELECT old_release_date FROM payments
       WHERE oph_id = ?
         AND ${RELEASE_DATE_CHANGE_FROM_SQL}
         AND (release_date = ? OR DATE(release_date) = DATE(?))
         AND old_release_date IS NOT NULL
       ORDER BY updated_at DESC, created_at DESC
       LIMIT 1`,
      [ophId, newDate, newDate],
    );
    previousDate = normalizeCalendarDateOnly(payRows[0]?.old_release_date);
  }

  if (!previousDate) {
    console.warn(
      `[release date change reject] No previous_booking_date for oph ${ophId}; calender may still hold ${newDate}`,
    );
    return { restored: false, ophId, songId };
  }

  const existingHistory = parseReasonHistory(entry.reason_history);
  const updatedHistory = existingHistory.map((item, index) => {
    if (
      index === existingHistory.length - 1 &&
      item.status === "pending"
    ) {
      return {
        ...item,
        status: "rejected",
        rejected_at: new Date().toISOString(),
        admin_reject_reason: rejectReason,
      };
    }
    return item;
  });

  await connection.execute(
    `UPDATE calender
     SET current_booking_date = ?,
         previous_booking_date = NULL,
         reason = NULL,
         reason_history = ?,
         updated_at = NOW()
     WHERE oph_id = ?
       AND (
         DATE(current_booking_date) = DATE(?)
         OR current_booking_date = ?
       )`,
    [previousDate, JSON.stringify(updatedHistory), ophId, newDate, newDate],
  );

  if (songId) {
    await connection.execute(
      `UPDATE songs_register sr
       JOIN calender c ON c.song_id = sr.song_id AND (c.oph_id = sr.oph_id OR c.oph_id = sr.OPH_ID)
       SET sr.release_date = c.current_booking_date,
           sr.updated_at = NOW()
       WHERE sr.song_id = ?
         AND (sr.oph_id = ? OR sr.OPH_ID = ?)`,
      [songId, ophId, ophId],
    );
  }

  return { restored: true, ophId, songId };
}

const setPaymentVerification = async (decision, reason, release_date, from, song_id, oph_id) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Normalize from_source for branching (DB may store "Release date change" or "Release Date Change")
    const fromNorm = typeof from === "string" ? from.trim() : "";
    const isReleaseDateChange =
      fromNorm.toLowerCase().replace(/\s+/g, " ") === "release date change";

    // Parse reason_history: may be string (JSON) or already an object from driver
    const parseReasonHistory = (val) => {
      if (val == null) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === "string") {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    let isReasonEmpty =
      reason === "null" || reason === null || reason === "" ? null : reason;
    let affectedRows = 0;
    const statusUpdatesToRun = []; // { songId, ophId, reason, decision } - run AFTER commit with fresh connections

    if (from === "Date booking" || from === "Date Booking") {
      if (decision === "rejected") {
        // Build query with optional oph_id filter (narrow to specific artist when provided)
        const payWhereOphParams = oph_id ? [oph_id, release_date, release_date] : [release_date, release_date];

        const [paymentsToUpdate] = await connection.execute(
          `SELECT id, oph_id, release_date, from_source, status, song_id FROM payments 
           WHERE (LOWER(from_source) = 'date booking' OR from_source = 'Release date change')
           AND status != 'rejected'
           ${oph_id ? "AND oph_id = ?" : ""}
           AND (release_date = ? OR DATE(release_date) = ?)`,
          payWhereOphParams,
        );

        // If no payments found with status != 'rejected', try to find any payments for this date
        if (paymentsToUpdate.length === 0) {
          const [allPayments] = await connection.execute(
            `SELECT id, oph_id, release_date, from_source, status, song_id FROM payments 
             WHERE (LOWER(from_source) = 'date booking' OR from_source = 'Release date change')
             ${oph_id ? "AND oph_id = ?" : ""}
             AND (release_date = ? OR DATE(release_date) = ?)`,
            payWhereOphParams,
          );
          console.log(
            `[setPaymentVerification] No non-rejected payments found. All payments for this date:`,
            allPayments,
          );
        }

        console.log(
          `[setPaymentVerification] Found ${paymentsToUpdate.length} payments to update for date: ${release_date}`,
        );
        console.log(`[setPaymentVerification] Payments:`, paymentsToUpdate);

        // Delete calendar entry (filter by oph_id when provided to target the correct slot)
        const [deleteResult] = await connection.execute(
          oph_id
            ? "DELETE FROM calender WHERE oph_id = ? AND (current_booking_date = ? OR DATE(current_booking_date) = ?)"
            : "DELETE FROM calender WHERE current_booking_date = ? OR DATE(current_booking_date) = ?",
          oph_id ? [oph_id, release_date, release_date] : [release_date, release_date],
        );
        console.log(
          `[setPaymentVerification] Deleted ${deleteResult.affectedRows} calendar entries`,
        );
        affectedRows += deleteResult.affectedRows;

        // Update payments: set status, reject_reason, move song_id to reject_for (keep release_date)
        if (paymentsToUpdate.length > 0) {
          const paymentIds = paymentsToUpdate.map((p) => p.id);
          console.log(
            `[setPaymentVerification] Updating payment IDs:`,
            paymentIds,
          );

          // Update each payment: reject_for = song_id, song_id = NULL; release_date stays
          for (const p of paymentsToUpdate) {
            const [updateResult] = await connection.execute(
              `UPDATE payments 
               SET status = ?, 
                   reject_reason = ?, 
                   reject_for = ?,
                   song_id = NULL,
                   updated_at = NOW()
               WHERE id = ?`,
              [decision, isReasonEmpty, p.song_id ?? null, p.id],
            );
            console.log(
              `[setPaymentVerification] Updated ${updateResult.affectedRows} payment record(s) for id=${p.id}`,
            );
            affectedRows += updateResult.affectedRows;
            if (updateResult.affectedRows === 0) {
              console.log(
                `[setPaymentVerification] WARNING: Update for payment id=${p.id} affected no rows`,
              );
            }
          }
        } else {
          console.log(
            `[setPaymentVerification] WARNING: No payments found to update for date ${release_date}`,
          );
        }

        // Update song_application_status for any songs using this date (paid-in-advance)
        // Use oph_ids from paymentsToUpdate (we have them before the update; after update reject_for holds song_id not release_date)
        const songIdsToUpdate = new Set();
        for (const p of paymentsToUpdate) {
          if (p.song_id) songIdsToUpdate.add(p.song_id);
        }
        const ophIdsFromPayments = [...new Set(paymentsToUpdate.map((p) => p.oph_id).filter(Boolean))];
        for (const ophIdForSong of ophIdsFromPayments) {
          const [songsOnDate] = await connection.execute(
            `SELECT song_id FROM songs_register 
             WHERE oph_id = ? AND (release_date = ? OR DATE(release_date) = ?)`,
            [ophIdForSong, release_date, release_date]
          );
          for (const row of songsOnDate) {
            songIdsToUpdate.add(row.song_id);
          }
        }
        for (const songIdToUpdate of songIdsToUpdate) {
          let ophIdResolved = paymentsToUpdate.find((p) => p.song_id === songIdToUpdate)?.oph_id;
          if (!ophIdResolved && ophIdsFromPayments.length > 0) {
            ophIdResolved = ophIdsFromPayments[0];
          }
          if (!ophIdResolved) {
            const [srRow] = await connection.execute(
              "SELECT oph_id FROM songs_register WHERE song_id = ? LIMIT 1",
              [songIdToUpdate]
            );
            ophIdResolved = srRow?.[0]?.oph_id;
          }
          if (ophIdResolved) {
            statusUpdatesToRun.push({ songId: songIdToUpdate, ophId: ophIdResolved, reason: isReasonEmpty, decision });
          }
        }
      } else if (decision === "approved") {
        // Approve the payment
        const [updateResult] = await connection.execute(
          `UPDATE payments 
           SET status = ?, 
               reject_reason = NULL,
               updated_at = NOW()
           WHERE release_date = ? 
           AND (from_source = 'Date booking' OR from_source = 'Release date change')
           AND status != 'approved'`,
          [decision, release_date],
        );

        // Update song_application_status for songs using this date (paid-in-advance)
        const [approvedOphIds] = await connection.execute(
          `SELECT DISTINCT oph_id FROM payments 
           WHERE release_date = ? 
           AND (from_source = 'Date booking' OR from_source = 'Release date change')
           AND oph_id IS NOT NULL`,
          [release_date]
        );
        for (const { oph_id: ophIdForSong } of approvedOphIds) {
          const [songsOnDate] = await connection.execute(
            `SELECT song_id FROM songs_register 
             WHERE oph_id = ? AND (release_date = ? OR DATE(release_date) = ?)`,
            [ophIdForSong, release_date, release_date]
          );
          for (const row of songsOnDate) {
            statusUpdatesToRun.push({ songId: row.song_id, ophId: ophIdForSong, reason, decision });
          }
        }

        affectedRows += updateResult.affectedRows;
      }
    } else if (isReleaseDateChange) {
      if (decision === "rejected") {
        await restoreCalendarAfterReleaseDateChangeReject(connection, {
          release_date,
          oph_id,
          rejectReason: isReasonEmpty,
          parseReasonHistory,
        });

        const payParams = [decision, isReasonEmpty, release_date, release_date];
        let paySql = `UPDATE payments
           SET status = ?,
               reject_reason = ?,
               updated_at = NOW()
           WHERE (release_date = ? OR DATE(release_date) = ?)
           AND ${RELEASE_DATE_CHANGE_FROM_SQL}`;
        if (oph_id) {
          paySql += " AND oph_id = ?";
          payParams.push(String(oph_id).trim());
        }
        const [updateResult] = await connection.execute(paySql, payParams);
        affectedRows += updateResult.affectedRows;
      } else if (decision === "approved") {
        // When approving a date change, sync songs_register from calender.
        // This is the only place songs_register.release_date is updated for a release date change;
        // the calendar is updated when the user pays (/change-release-date), but songs_register
        // is updated here only after admin approval.
        // Get the calendar entry to update reason_history (use DATE() so we match regardless of time part)
        const [calendarEntries] = await connection.execute(
          `SELECT song_id, oph_id, reason_history 
           FROM calender 
           WHERE (DATE(current_booking_date) = DATE(?) OR current_booking_date = ?)
           AND oph_id = (SELECT oph_id FROM payments WHERE (release_date = ? OR DATE(release_date) = ?) AND (LOWER(TRIM(from_source)) = 'release date change' OR from_source = 'Release date change' OR from_source = 'Release Date Change') LIMIT 1)`,
          [release_date, release_date, release_date, release_date],
        );

        if (calendarEntries.length > 0) {
          const entry = calendarEntries[0];
          const songId = entry.song_id;
          const ophId = entry.oph_id;
          if (songId && ophId) statusUpdatesToRun.push({ songId, ophId, reason, decision });
          const existingHistory = parseReasonHistory(entry.reason_history);

          // Update reason_history - mark the latest pending entry as approved
          const updatedHistory = existingHistory.map((item, index) => {
            if (
              index === existingHistory.length - 1 &&
              item.status === "pending"
            ) {
              return {
                ...item,
                status: "approved",
                approved_at: new Date().toISOString(),
              };
            }
            return item;
          });

          // Clear reason and update history (use DATE() for robust match)
          await connection.execute(
            `UPDATE calender 
             SET reason = NULL,
                 reason_history = ?,
                 updated_at = NOW()
             WHERE (DATE(current_booking_date) = DATE(?) OR current_booking_date = ?)
             AND oph_id = ?`,
            [JSON.stringify(updatedHistory), release_date, release_date, ophId],
          );

          // Sync songs_register.release_date from calender if song_id exists
          if (songId) {
            await connection.execute(
              `UPDATE songs_register sr
               JOIN calender c ON c.song_id = sr.song_id AND (c.oph_id = sr.oph_id OR c.oph_id = sr.OPH_ID)
               SET sr.release_date = c.current_booking_date,
                   sr.updated_at = NOW()
               WHERE sr.song_id = ?
               AND (sr.oph_id = ? OR sr.OPH_ID = ?)`,
              [songId, ophId, ophId],
            );
          }
        }

        // Fallback: when verify page sent oph_id and song_id, ensure songs_register.release_date is set to the new date
        // (handles calendar lookup failure or schema differences like OPH_ID vs oph_id)
        if (oph_id && song_id) {
          const [srResult] = await connection.execute(
            `UPDATE songs_register 
             SET release_date = ?, updated_at = NOW() 
             WHERE song_id = ? AND (oph_id = ? OR OPH_ID = ?)`,
            [release_date, song_id, oph_id, oph_id],
          );
          if (srResult.affectedRows > 0 && !calendarEntries?.length) {
            statusUpdatesToRun.push({ songId: song_id, ophId: oph_id, reason, decision });
          }
        }

        // Update payment status
        const [updateResult] = await connection.execute(
          `UPDATE payments 
           SET status = ?, 
               reject_reason = NULL,
               updated_at = NOW()
           WHERE (release_date = ? OR DATE(release_date) = ?)
           AND (LOWER(TRIM(from_source)) = 'release date change' OR from_source = 'Release date change' OR from_source = 'Release Date Change')`,
          [decision, release_date, release_date],
        );
        affectedRows += updateResult.affectedRows;
      }
    } else if (from === "Song Registration" || from === "Song Repayment") {
      if (decision === "rejected" || decision === "approved") {
        // When oph_id and song_id are provided (from verify page that showed payment by artist/song),
        // update the payment we actually displayed — the latest under-review for that artist/song —
        // not by release_date (which may be the calendar cell date, not the payment's date).
        const useOphIdSongId = oph_id && song_id;
        let paymentRecords = [];
        let updateResult = { affectedRows: 0 };

        if (useOphIdSongId) {
          const [byArtistSong] = await connection.execute(
            `SELECT song_id, oph_id, id, release_date FROM payments 
             WHERE oph_id = ? 
             AND (song_id = ? OR reject_for = ?)
             AND (from_source = 'Song Registration' OR from_source = 'Song Repayment')
             AND status = 'under review'
             ORDER BY created_at DESC
             LIMIT 1`,
            [oph_id, song_id, song_id],
          );
          paymentRecords = byArtistSong;
          if (paymentRecords.length > 0) {
            const paymentId = paymentRecords[0].id;
            const songIdValue = paymentRecords[0].song_id;
            const isRejected = decision === "rejected" || decision === "Rejected";
            if (isRejected && songIdValue) {
              await connection.execute(
                `UPDATE payments 
                 SET reject_for = ?, song_id = NULL, status = ?, reject_reason = ?, updated_at = NOW()
                 WHERE id = ?`,
                [songIdValue, decision, isReasonEmpty, paymentId],
              );
            } else {
              const [res] = await connection.execute(
                `UPDATE payments 
                 SET status = ?, 
                     reject_reason = ?,
                     updated_at = NOW()
                 WHERE id = ?`,
                [decision, isReasonEmpty, paymentId],
              );
              updateResult = res;
            }
            affectedRows += 1;
          }
        }

        if (!useOphIdSongId || paymentRecords.length === 0) {
          const [byDate] = await connection.execute(
            `SELECT song_id, oph_id, release_date FROM payments 
             WHERE release_date = ? 
             AND (from_source = 'Song Registration' OR from_source = 'Song Repayment')
             LIMIT 1`,
            [release_date],
          );
          paymentRecords = byDate;
          if (paymentRecords.length > 0 && paymentRecords[0].release_date == null) {
            paymentRecords[0].release_date = release_date;
          }
          const [res] = await connection.execute(
            `UPDATE payments 
             SET status = ?, 
                 reject_reason = ?,
                 updated_at = NOW()
             WHERE release_date = ? 
             AND (from_source = 'Song Registration' OR from_source = 'Song Repayment')`,
            [decision, isReasonEmpty, release_date],
          );
          updateResult = res;
          affectedRows += res.affectedRows;
        }

        const songIdForStatus = paymentRecords[0]?.song_id ?? paymentRecords[0]?.reject_for;
        const ophIdForStatus = paymentRecords[0]?.oph_id ?? oph_id;
        if (songIdForStatus && ophIdForStatus) {
          statusUpdatesToRun.push({ songId: songIdForStatus, ophId: ophIdForStatus, reason: isReasonEmpty, decision });
        }

      }
    }

    await connection.commit();

    // Run song status updates with FRESH connections (avoids "connection in closed state")
    const SongApplicationStatusService = require('../../services/song/SongApplicationStatusService');
    for (const u of statusUpdatesToRun) {
      const conn2 = await db.getConnection();
      try {
        const didRecompute = await SongApplicationStatusService.recomputePaymentStatusFromPayments(conn2, u.songId, u.ophId);
        if (!didRecompute && u.decision) {
          const paymentStatus = u.decision === "rejected" || u.decision === "Rejected" ? "rejected"
            : u.decision === "approved" || u.decision === "Approved" ? "approved" : "under review";
          await SongApplicationStatusService.updateStepStatus(conn2, u.songId, "payment", paymentStatus, u.reason);
        }
        await AdminSongService.recalculateSongStatus(conn2, u.songId, u.ophId, u.reason);
      } catch (err) {
        console.error('[setPaymentVerification] Status update failed for song', u.songId, err.message);
      } finally {
        conn2.release();
      }
    }

    return { success: true, affectedRows };
  } catch (error) {
    await connection.rollback();
    console.error("Error in setPaymentVerification:", error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  updateStatus,
  getPaymentDetailsForAllSong,
  getPaymentDetailsForAllBooking,
  getPaymentDetailsForAllEvents,
  getPaymentDetailsForEventsByOphId,
  updateSongPaymentSp,
  updateEventPaymentSp,
  getPaymentDetailsByTransactionId,
  getPaymentDetailsForSongByOphId,
  updateStatusPayment,
  getTransactionDetails,
  setPaymentVerification,
};
