const db = require("../../DB/connect");

const updateStatus = async (ophId, transactionId, newStatus, reject_reason) => {
  try {
    const [result] = await db.query(
      `UPDATE sign_up_payment 
       SET Status = ?, reject_reason = ?
       WHERE OPH_ID = ? AND Transaction_ID = ?`,
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
        FROM sign_up_payment
        WHERE \`From\` = 'Song Registration'
        AND Status = 'under review';
      `
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

const getPaymentDetailsForAllEvents = async () => {
  try {
    const [rows] = await db.query(
      `SELECT *
        FROM sign_up_payment
        WHERE \`From\` = 'Event Registeration'
        AND Status = 'under review';
      `
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

const getPaymentDetailsForAllBooking = async () => {
  try {
    const [rows] = await db.query(
      `SELECT *
        FROM sign_up_payment
        WHERE \`From\` = 'Date Booking'
        AND Status = 'under review';
      `
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

const getPaymentDetailsForEventsByOphId = async (ophid) => {
  try {
    const [rows] = await db.query(
      `SELECT *
        FROM sign_up_payment
        WHERE \`From\` = 'Event Registeration'
        AND Status = 'under review'
        AND OPH_ID = ?;`,
      [ophid]
    )
    return rows;
  } catch (error) {
    throw error;
  }
};

const updateSongPaymentSp = async (ophid,transactionId,FormData,status) => {
  let query = `CALL sp_update_sign_up_payment(?,?,?,?)`;
  const values = [ophid,transactionId,FormData,status];


  console.log("Values:", values);
  console.log("Value types:", values.map(v => typeof v));

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
      sqlMessage: error.sqlMessage
    });
    throw error;
  }
};

const updateEventPaymentSp = async (ophId, transactionId, status, reject_reason, eventId) => {
  let query = `CALL sp_handle_event_payment(?, ?, ?, ?, ?)`;
  const values = [ophId, transactionId, status, reject_reason, eventId];

  console.log("Values:", values);
  console.log("Value types:", values.map(v => typeof v));

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
      sqlMessage: error.sqlMessage
    });
    throw error;
  }
};

const getPaymentDetailsByTransactionId = async (transactionId) => {
  try {
    const [rows] = await db.query(
      `SELECT *
        FROM sign_up_payment
        WHERE Transaction_ID = ?`,
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
        FROM sign_up_payment
        WHERE \`From\` = 'Song Registration'
        AND Status = 'under review'
        AND OPH_ID = ?
        AND song_id = ?;`,
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
      `UPDATE sign_up_payment 
       SET Status = ?
       WHERE OPH_ID = ? AND song_id = ?`,
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
      "SELECT OPH_ID, Transaction_ID, `From` FROM sign_up_payment WHERE release_date = ?",
      [release_date]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

const setPaymentVerification = async (decision, reason, release_date, from) => {
  let rows = [];

  let isReasonEmpty = reason === "null" ? null : reason

  if (from === "Date booking") {
    if (decision === "rejected") {
      rows.push(
        await db.execute(
          "DELETE FROM calender WHERE current_booking_date = ?",
          [release_date]
        )
      );
    } else {
      rows.push(
        await db.execute(
          "UPDATE sign_up_payment SET Status = ?, reject_reason = ? WHERE release_date = ?",
          [decision, isReasonEmpty, release_date]
        )
      );
    }
  } else if (from === "Song Registration") {
    if (decision === "rejected" || decision === "approved") {
      rows.push(
        await db.execute(
          "UPDATE sign_up_payment SET Status = ?, reject_reason = ? WHERE release_date = ?",
          [decision, isReasonEmpty, release_date]
        )
      );
    }
  }
  return rows;
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
