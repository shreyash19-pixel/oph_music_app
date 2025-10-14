const {
  getSupportingNumbers,
  updateSupportingNumbers,
} = require("../model/supporting_number");

// 🟢 Controller: Get Supporting Numbers
const getSupportingNumbersController = async (req, res) => {
  try {
    const response = await getSupportingNumbers();

    if (response && response.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Supporting numbers fetched successfully",
        data: response,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "No supporting numbers found",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// 🟠 Controller: Update Supporting Numbers (Admin)
const updateSupportingNumbersController = async (req, res) => {
  try {
    const { total_artists, total_songs, total_audience } = req.body;

    if (!total_artists || !total_songs || !total_audience) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const response = await updateSupportingNumbers(
      total_artists,
      total_songs,
      total_audience
    );

    return res.status(200).json({
      success: true,
      message: "Supporting numbers updated successfully",
      data: response,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getSupportingNumbersController,
  updateSupportingNumbersController,
};
