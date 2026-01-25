const db = require("../DB/connect"); // Your mysql2/promise connection

// Insert a new withdraw request
async function createWithdrawRequest(OPH_ID, withdraw_amount, withdrawal_id) {
  const query = `
    INSERT INTO withdraw (OPH_ID, withdraw_amount, withdrawal_id)
    VALUES (?, ?, ?)
  `;
  const [result] = await db.execute(query, [
    OPH_ID,
    withdraw_amount,
    withdrawal_id,
  ]);
  return result;
}


const getWithdraw = async (ophID) => {
  const [rows] = await db.execute("SELECT * FROM withdraw WHERE OPH_ID = ?", [
    ophID,
  ]);
  return rows;
};

module.exports = {
  createWithdrawRequest,
  getWithdraw,
};
