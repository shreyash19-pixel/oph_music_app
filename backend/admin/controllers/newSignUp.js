const newSignUp = require("../model/newSignUp");


const getAllOphIdsWithRegistration = async (req, res) => {
  try {
    const ophIdRows = await newSignUp.getUniqueOphIdsWithRegistration();
    const ophIds = ophIdRows.map(row => row.OPH_ID);

    // Fetch corresponding user details
    const userDetails = await newSignUp.getUserDetailsByOphIds(ophIds);

    res.status(200).json({
      success: true,
      userDetails,

    });

  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getSingleUserDetails = async (req, res) => {
  try {
    const { ophid } = req.params;

    if (!ophid) {
      return res.status(400).json({ success: false, message: "ophid is required" });
    }

    const userDetails = await newSignUp.getUserDetailsByOphId(ophid);

    if (!userDetails) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      userDetails,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getTransactionDetails = async (req, res) => {
  const { ophid } = req.params;

  try {
    const transactions = await newSignUp.getTransactionsByOphId(ophid);

    if (transactions.length === 0) {
      return res.status(404).json({ message: "No transactions found for this OPH_ID from Registeration." });
    }

    res.status(200).json({
      ophid,
      transactions: transactions.map((txn) => ({
        transactionId: txn.Transaction_ID,
        createdAt: txn.CreatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching transaction details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




const getRejectedSignupPayments = async (req, res) => {
  try {
    const rows = await newSignUp.getUserDetailsWithLatestRegistrationRejected();
    res.status(200).json({
      success: true,
      userDetails: rows,
    });
  } catch (error) {
    console.error("Error fetching rejected signup payments:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getAllOphIdsWithRegistration,
  getSingleUserDetails,
  getTransactionDetails,
  getRejectedSignupPayments,
};