const db = require("../DB/connect"); // Your mysql2/promise connection

// Insert a new withdraw request
const withdrawal_id = Math.floor(1000 + Math.random() * 9000).toString();
async function createWithdrawRequest(ophID, withdraw_amount) {
  const query = `
    INSERT INTO withdraw (ophID, withdraw_amount,withdrawal_id)
    VALUES (?, ?, ?)
  `;
  const [result] = await db.execute(query, [
    ophID,
    withdraw_amount,
    withdrawal_id,
  ]);
  return result;
}

const getWithdraw = async (ophID) => {
  const [rows] = await db.execute("SELECT * FROM withdraw WHERE ophID = ?", [
    ophID,
  ]);
  return rows;
};

module.exports = {
  createWithdrawRequest,
  getWithdraw,
};
