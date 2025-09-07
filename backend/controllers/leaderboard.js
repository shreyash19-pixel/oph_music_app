const { readFromS3 } = require("../utils");
const getLeaderBoardData = async (req, res) => {
  try {
    const response = await readFromS3("monthly_kpi/leaderboard.json");

    if (response) {
      return res.status(200).json({
        success: true,
        message: "Data fetched successfully",
        data: response
      })
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = { getLeaderBoardData };
