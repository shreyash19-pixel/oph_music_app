const db = require("../../DB/connect");

const updateStatus = async (connection, ophId, transactionId, newStatus, reject_reason) => {
  try {
    // Use provided connection if available (for transactions), otherwise use default db
    const dbConnection = connection || db;
    const [result] = await dbConnection.query(
      `UPDATE payments 
       SET status = ?, reject_reason = ?
       WHERE oph_id = ? AND transaction_id = ?`,
      [newStatus, reject_reason, ophId, transactionId]
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
        AND status = 'under review'`
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
        AND status = 'under review'`
    );
    return rows;
  } catch (error) {
    console.error('Error in getPaymentDetailsForAllEvents:', error);
    throw error;
  }
};

const getPaymentDetailsForAllBooking = async () => {
  try {
    const [rows] = await db.query(
      `SELECT *
        FROM payments
        WHERE (from_source = 'Date booking' OR from_source = 'Date Booking')
        AND status = 'under review'`
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
      [ophid]
    );
    return rows;
  } catch (error) {
    console.error('Error in getPaymentDetailsForEventsByOphId:', error);
    throw error;
  }
};

const updateSongPaymentSp = async (ophid, transactionId, FormData, status) => {
  let query = `CALL sp_update_sign_up_payment(?,?,?,?)`;
  const values = [ophid, transactionId, FormData, status];

  console.log("Values:", values);
  console.log(
    "Value types:",
    values.map((v) => typeof v)
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
  isRejected = false
) => {
  try {
    // Use provided connection if available (for transactions), otherwise use default db
    const dbConnection = connection || db;
    
    // If payment is rejected, move event_id to reject_for and set event_id to NULL
    if (isRejected) {
      const [result] = await dbConnection.query(
        `UPDATE payments 
         SET status = ?, 
             reject_reason = ?,
             reject_for = ?,
             event_id = NULL,
             updated_at = NOW()
         WHERE oph_id = ? 
           AND transaction_id = ? 
           AND event_id = ?`,
        [status, reject_reason || null, eventId, ophId, transactionId, parseInt(eventId)]
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
         WHERE oph_id = ? 
           AND transaction_id = ? 
           AND event_id = ?`,
        [status, reject_reason || null, ophId, transactionId, parseInt(eventId)]
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
      [transactionId]
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
      [ophid, songid]
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
      [status, ophId, songId]
    );

    return result;
  } catch (error) {
    throw error;
  }
};

const getTransactionDetails = async (release_date) => {
  try {
    const [rows] = await db.execute(
      "SELECT sp.oph_id AS OPH_ID, sp.transaction_id AS Transaction_ID, sp.from_source AS `From`, sp.song_id, sp.status AS Status, c.* FROM payments sp JOIN calender c ON sp.release_date = c.current_booking_date WHERE sp.release_date = ?",
      [release_date]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

const setPaymentVerification = async (decision, reason, release_date, from) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    let isReasonEmpty = reason === "null" || reason === null || reason === "" ? null : reason;
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
          [release_date]
        );
        
        // If no payments found with status != 'rejected', try to find any payments for this date
        if (paymentsToUpdate.length === 0) {
          const [allPayments] = await connection.execute(
            `SELECT id, oph_id, release_date, from_source, status FROM payments 
             WHERE release_date = ? 
             AND (LOWER(from_source) = 'date booking' OR from_source = 'Release date change')`,
            [release_date]
          );
          console.log(`[setPaymentVerification] No non-rejected payments found. All payments for this date:`, allPayments);
        }

        console.log(`[setPaymentVerification] Found ${paymentsToUpdate.length} payments to update for date: ${release_date}`);
        console.log(`[setPaymentVerification] Payments:`, paymentsToUpdate);

        // Delete calendar entry
        const [deleteResult] = await connection.execute(
          "DELETE FROM calender WHERE current_booking_date = ?",
          [release_date]
        );
        console.log(`[setPaymentVerification] Deleted ${deleteResult.affectedRows} calendar entries`);
        affectedRows += deleteResult.affectedRows;

        // Update payments: set status, reject_reason, and move release_date to reject_for
        if (paymentsToUpdate.length > 0) {
          const paymentIds = paymentsToUpdate.map(p => p.id);
          console.log(`[setPaymentVerification] Updating payment IDs:`, paymentIds);
          
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
            const placeholders = paymentIds.map(() => '?').join(',');
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
          
          const [updateResult] = await connection.execute(updateQuery, updateParams);
          console.log(`[setPaymentVerification] Updated ${updateResult.affectedRows} payment records`);
          affectedRows += updateResult.affectedRows;
          
          if (updateResult.affectedRows === 0) {
            console.log(`[setPaymentVerification] WARNING: Update query executed but no rows were affected!`);
          }
        } else {
          console.log(`[setPaymentVerification] WARNING: No payments found to update for date ${release_date}`);
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
          [decision, release_date]
        );
        affectedRows += updateResult.affectedRows;
      }
    } else if (from === "Release date change") {
      if (decision === "rejected" || decision === "approved") {
        const [updateResult] = await connection.execute(
          `UPDATE payments 
           SET status = ?, 
               reject_reason = ?,
               updated_at = NOW()
           WHERE release_date = ? 
           AND from_source = 'Release date change'`,
          [decision, isReasonEmpty, release_date]
        );
        affectedRows += updateResult.affectedRows;
      }
    } else if (from === "Song Registration") {
      if (decision === "rejected" || decision === "approved") {
        const [updateResult] = await connection.execute(
          `UPDATE payments 
           SET status = ?, 
               reject_reason = ?,
               updated_at = NOW()
           WHERE release_date = ? 
           AND from_source = 'Song Registration'`,
          [decision, isReasonEmpty, release_date]
        );
        affectedRows += updateResult.affectedRows;
      }
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
