const { getSongDetails } = require("../model/song_details");

const getSongDetailsController = async (req, res) => {
  try {
    const { ophid, song_id } = req.query;

    if (!ophid || !song_id) {
      return res.status({
        success: false,
        message: "Missing required fields",
      });
    }

    const response = await getSongDetails(ophid, song_id);

    if (response) {
      return res.status(200).json({
        success: true,
        message: "Data fetched successfully",
        data: response,
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = { getSongDetailsController };
