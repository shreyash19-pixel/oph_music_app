const paymentInfo = require("../model/payment");
const { setCurrentStep } = require("../model/common/set_step.js");

const payment = async (req, res) => {
  try {
    const {
      OPH_ID,
      Transaction_ID,
      Review,
      Status,
      step,
      from,
      song_id,
      event_id,
      release_date,
    } = req.body;
    const ophid = OPH_ID;

    // Validate: only one of song_id or event_id should be present
    if (song_id && event_id) {
      return res.status(400).json({
        success: false,
        message: "Only one of song_id or event_id should be provided.",
      });
    }

    // Call insertPayment with song_id or event_id (whichever is provided, null for the other)
    const dbResponse = await paymentInfo.insertPayment(
      OPH_ID,
      Transaction_ID,
      Review,
      Status,
      from,
      song_id || null,
      event_id || null,
      release_date
    );

    if (dbResponse) {
      if (from === "Registeration") {
        await setCurrentStep(step, ophid);
      }

      return res.status(200).json({
        success: true,
        message: "Payment ID sent for verification",
        step: step,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Payment - server Error",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Payment - server Error",
    });
  }
};

const insertSongIDController = async (req, res) => {
  try {
    const { ophid, song_id } = req.body;

    if (!ophid || !song_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required field",
      });
    }

    const response = await paymentInfo.insertSongID(ophid, song_id);

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

const songRepaymentController = async (req, res) => {
  try {
    const {
      OPH_ID,
      Transaction_ID,
      Review,
      Status,
      step,
      from,
      song_id,
      event_id,
      release_date,
    } = req.body;

    if (
      !OPH_ID ||
      !Transaction_ID ||
      !Status ||
      !step ||
      !from ||
      !song_id ||
      !release_date
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const response = await paymentInfo.songRepayment(
      OPH_ID,
      Transaction_ID,
      Review,
      Status,
      from,
      song_id || null,
      event_id || null,
      release_date
    );

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

module.exports = { payment, insertSongIDController, songRepaymentController };
