const paymentInfo = require("../model/payment");
const { setCurrentStep } = require("../model/common/set_step.js");
const user_details = require("../model/signin.js");

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
      old_release_date,
      amount,
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
      release_date || null,
      old_release_date || null,
      amount || null
    );

    if (dbResponse) {
      console.log("in response", step);

      const result = await user_details.checkRejectedStep(OPH_ID);

      const checkRejectedStep = result[0];

      if (
        checkRejectedStep.user_status === "under review" &&
        checkRejectedStep.professional_status === "under review" &&
        checkRejectedStep.documentation_status === "under review" &&
        checkRejectedStep.payment_status === "under review"
      ) {
        navTo = "/auth/profile-status";
      }
      else if (checkRejectedStep.payment_status === "rejected") {
        navTo = "/auth/payment";
      } else if (checkRejectedStep.user_status === "rejected") {
        navTo = "/auth/create-profile/personal-details";
      } else if (checkRejectedStep.professional_status === "rejected") {
        navTo = "/auth/create-profile/professional-details";
      } else if (checkRejectedStep.documentation_status === "rejected") {
        navTo = "/auth/create-profile/documentation-details";
      } else if (checkRejectedStep.payment_status === "rejected") {
        navTo = "/auth/payment";
      } else if (
        checkRejectedStep.user_status === "under review" ||
        checkRejectedStep.professional_status === "under review" ||
        checkRejectedStep.documentation_status === "under review" ||
        checkRejectedStep.payment_status === "under review"
      ) {
        navTo = step;
      } else if (checkRejectedStep.overall_status === "completed") {
        navTo = "/dashboard";
      } else {
        navTo = step;
      }

      if (from === "Registration") {
        await setCurrentStep(step, ophid);
      }

      return res.status(200).json({
        success: true,
        message: "Payment ID sent for verification",
        step: navTo,
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
      song_id,
      event_id,
      release_date,
      amount,
    } = req.body;

    if (
      !OPH_ID ||
      !Transaction_ID ||
      !Status ||
      !step ||
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
      song_id || null,
      event_id || null,
      release_date,
      amount || null
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
