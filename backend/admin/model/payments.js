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
        WHERE (from_source = 'Song Registration' OR from_source = 'Special artist song registration')
        AND status = 'under review'`,
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

const getPaymentDetailsForAllEvents = async () => {
  try {
    // Query for event payments - check by event_id (most reliable)
    // and also check from_source for backward compatibility
    const [rows] = await db.query(
      `SELECT *
        FROM payments
        WHERE (
          event_id IS NOT NULL
          OR from_source = 'Event Registration'
          OR from_source LIKE 'Event Regist%'
        )
        AND status = 'under review'`,
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
        id,
        oph_id,
        transaction_id,
        review,
        status,
        from_source,
        song_id,
        event_id,
        release_date,
        reject_reason,
        reject_for,
        amount,
        created_at,
        updated_at
      FROM payments
      WHERE (
        event_id IS NOT NULL
        OR from_source = 'Event Registration'
        OR from_source LIKE 'Event Regist%'
      )
      AND oph_id = ?
      ORDER BY created_at DESC`,
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
        AND song_id = ?
        ORDER BY created_at DESC`,
      [ophid, songid],
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

const setPaymentVerification = async (decision, reason, release_date, from, song_id, oph_id) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    let isReasonEmpty =
      reason === "null" || reason === null || reason === "" ? null : reason;
    let affectedRows = 0;

    if (from === "Date booking" || from === "Date Booking") {
      if (decision === "rejected") {
        // First, get the payment IDs that will be affected (before we update release_date)
        // Check for any payments with this release_date, regardless of status
        const [paymentsToUpdate] = await connection.execute(
          `SELECT id, oph_id, release_date, from_source, status FROM payments 
           WHERE release_date = ? 
           AND (LOWER(from_source) = 'date booking' OR from_source = 'Release date change')
           AND status != 'rejected'`,
          [release_date],
        );

        // If no payments found with status != 'rejected', try to find any payments for this date
        if (paymentsToUpdate.length === 0) {
          const [allPayments] = await connection.execute(
            `SELECT id, oph_id, release_date, from_source, status FROM payments 
             WHERE release_date = ? 
             AND (LOWER(from_source) = 'date booking' OR from_source = 'Release date change')`,
            [release_date],
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

        // Delete calendar entry
        const [deleteResult] = await connection.execute(
          "DELETE FROM calender WHERE current_booking_date = ?",
          [release_date],
        );
        console.log(
          `[setPaymentVerification] Deleted ${deleteResult.affectedRows} calendar entries`,
        );
        affectedRows += deleteResult.affectedRows;

        // Update payments: set status, reject_reason, and move release_date to reject_for
        if (paymentsToUpdate.length > 0) {
          const paymentIds = paymentsToUpdate.map((p) => p.id);
          console.log(
            `[setPaymentVerification] Updating payment IDs:`,
            paymentIds,
          );

          // For single payment, use direct WHERE clause; for multiple, use IN clause
          let updateQuery;
          let updateParams;

          if (paymentIds.length === 1) {
            updateQuery = `UPDATE payments 
             SET status = ?, 
                 reject_reason = ?, 
                 reject_for = release_date,
                 release_date = NULL,
                 updated_at = NOW()
             WHERE id = ?`;
            updateParams = [decision, isReasonEmpty, paymentIds[0]];
          } else {
            const placeholders = paymentIds.map(() => "?").join(",");
            updateQuery = `UPDATE payments 
             SET status = ?, 
                 reject_reason = ?, 
                 reject_for = release_date,
                 release_date = NULL,
                 updated_at = NOW()
             WHERE id IN (${placeholders})`;
            updateParams = [decision, isReasonEmpty, ...paymentIds];
          }

          console.log(`[setPaymentVerification] Executing query:`, updateQuery);
          console.log(`[setPaymentVerification] With params:`, updateParams);

          const [updateResult] = await connection.execute(
            updateQuery,
            updateParams,
          );
          console.log(
            `[setPaymentVerification] Updated ${updateResult.affectedRows} payment records`,
          );
          affectedRows += updateResult.affectedRows;

          if (updateResult.affectedRows === 0) {
            console.log(
              `[setPaymentVerification] WARNING: Update query executed but no rows were affected!`,
            );
          }
        } else {
          console.log(
            `[setPaymentVerification] WARNING: No payments found to update for date ${release_date}`,
          );
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

        const [updatedSongApplication] = await connection.execute(
          `UPDATE song_application_status 
           SET status_payment = ? 
           WHERE song_id = ?`,
          [decision,song_id],
        );


        await AdminSongService.recalculateSongStatus(connection,song_id,oph_id, reason)

        affectedRows += updateResult.affectedRows;
        affectedRows += updatedSongApplication.affectedRows;
      }
    } else if (from === "Release date change") {
      if (decision === "rejected") {
        // When rejecting a date change, restore previous date in calender
        // Get the calendar entry to find song_id, previous_booking_date, reason, and reason_history
        const [calendarEntries] = await connection.execute(
          `SELECT song_id, previous_booking_date, oph_id, reason, reason_history 
           FROM calender 
           WHERE current_booking_date = ? 
           AND oph_id = (SELECT oph_id FROM payments WHERE release_date = ? AND from_source = 'Release date change' LIMIT 1)`,
          [release_date, release_date],
        );

        if (calendarEntries.length > 0) {
          const entry = calendarEntries[0];
          const songId = entry.song_id;
          const previousDate = entry.previous_booking_date;
          const ophId = entry.oph_id;
          const existingHistory = entry.reason_history
            ? JSON.parse(entry.reason_history)
            : [];

          if (previousDate) {
            // Update reason_history - mark the latest pending entry as rejected
            const updatedHistory = existingHistory.map((item, index) => {
              if (
                index === existingHistory.length - 1 &&
                item.status === "pending"
              ) {
                return {
                  ...item,
                  status: "rejected",
                  rejected_at: new Date().toISOString(),
                  admin_reject_reason: isReasonEmpty || null,
                };
              }
              return item;
            });

            // Restore previous date in calender (master) and clear reason
            await connection.execute(
              `UPDATE calender 
               SET current_booking_date = previous_booking_date,
                   previous_booking_date = NULL,
                   reason = NULL,
                   reason_history = ?,
                   updated_at = NOW()
               WHERE current_booking_date = ? 
               AND oph_id = ?`,
              [JSON.stringify(updatedHistory), release_date, ophId],
            );

            // Sync songs_register.release_date from calender if song_id exists
            if (songId) {
              await connection.execute(
                `UPDATE songs_register sr
                 JOIN calender c ON c.song_id = sr.song_id
                 SET sr.release_date = c.current_booking_date,
                     sr.updated_at = NOW()
                 WHERE sr.song_id = ?
                 AND c.oph_id = ?`,
                [songId, ophId],
              );
            }
          }
        }

        // Update payment status
        const [updateResult] = await connection.execute(
          `UPDATE payments 
           SET status = ?, 
               reject_reason = ?,
               updated_at = NOW()
           WHERE release_date = ? 
           AND from_source = 'Release date change'`,
          [decision, isReasonEmpty, release_date],
        );
        affectedRows += updateResult.affectedRows;
      } else if (decision === "approved") {
        // When approving a date change, sync songs_register from calender
        // Get the calendar entry to update reason_history
        const [calendarEntries] = await connection.execute(
          `SELECT song_id, oph_id, reason_history 
           FROM calender 
           WHERE current_booking_date = ? 
           AND oph_id = (SELECT oph_id FROM payments WHERE release_date = ? AND from_source = 'Release date change' LIMIT 1)`,
          [release_date, release_date],
        );

        if (calendarEntries.length > 0) {
          const entry = calendarEntries[0];
          const songId = entry.song_id;
          const ophId = entry.oph_id;
          const existingHistory = entry.reason_history
            ? JSON.parse(entry.reason_history)
            : [];

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

          // Clear reason and update history
          await connection.execute(
            `UPDATE calender 
             SET reason = NULL,
                 reason_history = ?,
                 updated_at = NOW()
             WHERE current_booking_date = ? 
             AND oph_id = ?`,
            [JSON.stringify(updatedHistory), release_date, ophId],
          );

          // Sync songs_register.release_date from calender if song_id exists
          if (songId) {
            await connection.execute(
              `UPDATE songs_register sr
               JOIN calender c ON c.song_id = sr.song_id
               SET sr.release_date = c.current_booking_date,
                   sr.updated_at = NOW()
               WHERE sr.song_id = ?
               AND c.oph_id = ?`,
              [songId, ophId],
            );
          }
        }

        // Update payment status
        const [updateResult] = await connection.execute(
          `UPDATE payments 
           SET status = ?, 
               reject_reason = NULL,
               updated_at = NOW()
           WHERE release_date = ? 
           AND from_source = 'Release date change'`,
          [decision, release_date],
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

        const songIdForStatus = paymentRecords[0]?.song_id;
        if (songIdForStatus) {
          let paymentStatus = "pending";
          if (decision === "rejected" || decision === "Rejected") {
            paymentStatus = "rejected";
          } else if (decision === "approved" || decision === "Approved") {
            paymentStatus = "approved";
          } else if (
            decision === "under review" ||
            decision === "Under Review"
          ) {
            paymentStatus = "under review";
          }
          const SongApplicationStatusService = require("../../services/song/SongApplicationStatusService");
          await SongApplicationStatusService.updateStepStatus(
            connection,
            songIdForStatus,
            "payment",
            paymentStatus,
            isReasonEmpty,
          );
        }

      }
    }

    const transactionDet = await getTransactionDetails(release_date);
    const songIdForSync = transactionDet?.[0]?.song_id ?? transactionDet?.[0]?.calendar_song_id;
    if (songIdForSync) {
      await SongApplicationStatusService.updateStepStatus(
        connection,
        songIdForSync,
        "payment",
        decision,
        reason,
      );
    }

    await connection.commit();

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
