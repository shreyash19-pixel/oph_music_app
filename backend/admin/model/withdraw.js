const db = require("../../DB/connect"); // Your mysql2/promise connection


const getAllWithdraw = async () => {
  const [rows] = await db.execute("SELECT * FROM withdraw where status ='pending'", [
  ]);
  return rows;
};

const updateWithdrawStatus = async (withdrawal_id, action, reason = null) => {
  if (action === "reject") {
    // Reject: requires reason
    if (!reason) throw new Error("Rejection reason is required.");
    const [rows] = await db.execute(
      `UPDATE withdraw SET reason = ?, status = 'rejected' WHERE withdrawal_id = ? AND status = 'pending'`,
      [reason, withdrawal_id]
    );
    return rows;
  } else if (action === "approve") {
    // Approve: clears reason (optional)
    const [rows] = await db.execute(
      `UPDATE withdraw SET reason = NULL, status = 'approved' WHERE withdrawal_id = ? AND status = 'pending'`,
      [withdrawal_id]
    );
    return rows;
  } else {
    throw new Error("Invalid action. Use 'approve' or 'reject'.");
  }
};


module.exports = {
  getAllWithdraw,
  updateWithdrawStatus,
};
