const WithdrawModel = require("../model/withdraw");

const updateWithdrawStatus = async (req, res) => {
  const { withdrawal_id, action, reason } = req.body;

  if (!withdrawal_id || !action) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (action === "reject" && !reason) {
    return res.status(400).json({ message: "Rejection reason is required" });
  }

  try {
    const result = await WithdrawModel.updateWithdrawStatus(
      withdrawal_id,
      action,
      reason
    );
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error updating withdraw status:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};


const getWithdrawSummaries = async (req, res) => {
  try {
    const withdraw = await WithdrawModel.getAllWithdraw();
    res.status(200).json({ success: true, data: withdraw });
  } catch (error) {
    console.error("Error fetching withdraw:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  getWithdrawSummaries,
  updateWithdrawStatus
};