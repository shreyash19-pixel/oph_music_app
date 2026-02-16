const {
  checkSpecialArtistIncomeStatus,
  setSpecialArtistIncomeStatus,
  getSpecialArtistIncome,
  getIndividualSpecialArtistIncome,
} = require("../model/special-artist-income");

const checkSpecialArtistIncomeStatusCont = async (req, res) => {
  try {
    const { ophid } = req.query;

    if (!ophid) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const response = await checkSpecialArtistIncomeStatus(ophid);

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

const getSpecialArtistIncomeCont = async (req, res) => {
  try {
    const response = await getSpecialArtistIncome();

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

const getIndividualSpecialArtistIncomeCont = async (req, res) => {
  try {
    const { ophid } = req.query;

    if (!ophid) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const response = await getIndividualSpecialArtistIncome(ophid);

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

const setSpecialArtistIncomeStatusCont = async (req, res) => {
  try {
    const { ophid, status } = req.body;

    if (!ophid) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const response = await setSpecialArtistIncomeStatus(ophid, status);

    if (response) {
      return res.status(201).json({
        success: true,
        message: "Data posted successfully",
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  checkSpecialArtistIncomeStatusCont,
  setSpecialArtistIncomeStatusCont,
  getSpecialArtistIncomeCont,
  getIndividualSpecialArtistIncomeCont,
};
