const withdrawModel = require("../../backend/model/withdraw");

const createWithdrawRequest = async (req, res) => {
  try {
    const { ophID, withdraw_amount, withdrawal_id } = req.body;

    if (!ophID || !withdraw_amount || !withdrawal_id) {
      return res.status(400).json({
        message: "ophID, withdraw_amount, and withdrawal_id are required",
      });
    }

    const result = await withdrawModel.createWithdrawRequest(
      ophID,
      withdraw_amount,
      withdrawal_id
    );

    res.status(201).json({
      success: true,
      message: "Withdrawal request submitted successfully.",
      withdraw: result,
    });

  } catch (error) {
    console.error("Error in withdrawController:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getWithdraw = async (req, res) => {
  try {
    const { ophID } = req.query;

    if (!ophID) {
      return res
        .status(400)
        .json({ success: false, message: "ophID is required" });
    }

    const withdraw = await withdrawModel.getWithdraw(ophID);
    
    // Handle case where no withdrawals exist - return empty array gracefully
    if (!withdraw || withdraw.length === 0) {
      return res.status(200).json({ success: true, data: [], message: "No withdrawal history found" });
    }
    
    res.status(200).json({ success: true, data: withdraw });
  } catch (error) {
    console.error("Error fetching withdraw:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


module.exports = { createWithdrawRequest, getWithdraw };
