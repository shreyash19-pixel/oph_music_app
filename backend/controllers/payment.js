const paymentInfo = require("../model/payment.js");
const { setCurrentStep } = require("../model/common/set_step.js");
const user_details = require("../model/signin.js");

const payment = async (req, res) => {
  try {
    console.log("PAYMENT FUNCTION CALLED WITH:", req.body);
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

    // Validate: 'from' field is required for event payments
    if (event_id && !from) {
      return res.status(400).json({
        success: false,
        message: "'from' field is required for event payments.",
      });
    }

    // Validate: 'from' field is required for all payments
    if (!from || from === null || from === undefined || from === '') {
      return res.status(400).json({
        success: false,
        message: "'from' field is required to identify payment source.",
      });
    }

    // Call insertPayment with song_id or event_id (whichever is provided, null for the other)
    const dbResponse = await paymentInfo.insertPayment(
      OPH_ID,
      Transaction_ID,
      Review,
      Status,
      from || null,
      song_id || null,
      event_id || null,
      release_date || null,
      old_release_date || null,
      amount || null
    );

    if (dbResponse) {
      console.log("in response", step);
      
      let navTo = "";
      
      // Check if this is event payment
      if (event_id) {
        const eventPayment = await paymentInfo.getEventPaymentByOphId(OPH_ID);
        if (eventPayment && eventPayment.length > 0) {
          console.log("Event payment status:", eventPayment[0].Status);
          navTo = eventPayment[0].Status === "approved" ? "/dashboard" : step || "/dashboard/events";
        }
      } else {
        // Check signup payment
        const result = await paymentInfo.getSignupPaymentByOphId(OPH_ID);
        if (result && result.length > 0) {
          const signupPayment = result[0];
          console.log("Signup payment status:", signupPayment.Status);
          navTo = signupPayment.Status === "approved" ? "/dashboard" : step || "/auth/create-profile/personal-details";
        } else {
          navTo = "/auth/create-profile/personal-details";
        }
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
