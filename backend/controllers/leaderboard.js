const { readFromS3 } = require("../utils");

const getLeaderBoardData = async (req, res) => {
  try {
    const response = await readFromS3("monthly_kpi/leaderboard.json");
    const data =
      response && typeof response === "object" && !Array.isArray(response)
        ? response
        : {};
    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = { getLeaderBoardData };
