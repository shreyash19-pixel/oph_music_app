const db = require("../../DB/connect"); // Your mysql2/promise connection


const getAllWithdraw = async () => {
  const [rows] = await db.execute("SELECT * FROM withdraw", [
  ]);
  return rows;
};

const updateResolvedSummary = async (withdrawal_id, reason) => {
  const [rows] = await db.execute(
    `UPDATE tickets SET reason = ?, status = 'reason' WHERE withdrawal_id = ?`,
    [withdrawal_id, reason]
  );
  return rows;
};

module.exports = {
  getAllWithdraw,
  updateResolvedSummary,
};
