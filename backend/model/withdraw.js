const db = require("../DB/connect"); // Your mysql2/promise connection

// Insert a new withdraw request
async function createWithdrawRequest(ophID, withdrawAmount) {
  const query = `
    INSERT INTO withdraw (ophID, withdraw_amount)
    VALUES (?, ?)
  `;
    const [result] = await db.execute(query, [ophID, withdrawAmount]);
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
