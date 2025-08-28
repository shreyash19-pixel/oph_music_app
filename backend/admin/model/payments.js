const db = require('../../DB/connect');

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
    )
    return rows;
  } catch (error) {
    throw error;
  }
}


const getPaymentDetailsForAllEvents = async () => {
  try {
    const [rows] = await db.query(
      `SELECT *
        FROM sign_up_payment
        WHERE \`From\` = 'Event Registeration'
        AND Status = 'under review';
      `
    )
    return rows;
  } catch (error) {
    throw error;
  }
}

const getPaymentDetailsForAllBooking = async () => {
  try {
    const [rows] = await db.query(
      `SELECT *
        FROM sign_up_payment
        WHERE \`From\` = 'Date Booking'
        AND Status = 'under review';
      `
    )
    return rows;
  } catch (error) {
    throw error;
  }
}

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

module.exports = {
  updateStatus,
  getPaymentDetailsForAllSong,
  getPaymentDetailsForAllBooking,
  getPaymentDetailsForAllEvents,
  getPaymentDetailsForEventsByOphId
};
