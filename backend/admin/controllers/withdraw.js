const WithdrawModel = require("../model/withdraw");

const updateResolvedSummary = async (req, res) => {
  const { ticketNumber, notes } = req.body;

  if (!ticketNumber || !notes) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const summary = await ticketModel.updateResolvedSummary(
      ticketNumber,
      notes
    );
    return res.status(200).json({ uccess: true, data: summary });
  } catch (error) {
    console.error("Error updating ticket:", error.message);
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
};