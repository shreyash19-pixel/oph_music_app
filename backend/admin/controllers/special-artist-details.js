const {
  getSpecialArtistRequestedDetails,
  getIndividualSpecialArtistDetails,
  setArtistDetails,
} = require("../model/special-artist-details");

const getSpecialArtistRequestedDetailsController = async (req, res) => {
  try {
    const response = await getSpecialArtistRequestedDetails();

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

const getIndividualSpecialArtistDetailsController = async (req, res) => {
  try {
    const { ophid, field } = req.query;

    if (!ophid || !field) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const response = await getIndividualSpecialArtistDetails(ophid, field);

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

const setArtistDetailsController = async (req, res) => {
  try {
    const { ophid, section, type, reason, content } = req.body;

    if (!ophid || !section || !type || !content) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const response = await setArtistDetails(
      ophid,
      section,
      type,
      reason,
      content
    );

    if(response)
    {
      return res.status(201).json({
        success: true,
        message: "Data updated successfully",
      })
    }

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getSpecialArtistRequestedDetailsController,
  getIndividualSpecialArtistDetailsController,
  setArtistDetailsController
};
