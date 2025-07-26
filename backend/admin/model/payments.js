const db = require('../../DB/connect');

const updateStatus = async (ophId, transactionId, newStatus,reject_reason) => {
  try {
    const [result] = await db.query(
      `UPDATE sign_up_payment 
       SET Status = ?, reject_reason = ?
       WHERE OPH_ID = ? AND Transaction_ID = ?`,
      [newStatus,reject_reason, ophId, transactionId]
    );

    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  updateStatus,
};
