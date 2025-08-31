const {
  getSongsList,
  getIndividualSongDetails,
  setSongStatus,
} = require("../model/special-artist-songs");

const getSongListContollers = async (req, res) => {
  try {
    const response = await getSongsList();

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

const getIndividualSongDetailsController = async (req, res) => {
  try {
    const { ophid, songId } = req.query;

    if (!ophid || !songId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const response = await getIndividualSongDetails(ophid, songId);

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

const setSongStatusController = async (req, res) => {
  try {
    const { ophid, songId, type, reason } = req.body;

    if (!ophid || !songId || !type) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const response = await setSongStatus(ophid, songId, type, reason);

    if (response) {
      return res.status(201).json({
        success: true,
        message: "Data updated successfully",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = { getSongListContollers, getIndividualSongDetailsController, setSongStatusController };
