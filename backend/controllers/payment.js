const PaymentService = require("../services/payment/PaymentService");

const payment = async (req, res) => {
  try {
    // Normalize input - handle both old (OPH_ID) and new (oph_id) field names
    const oph_id = req.body.OPH_ID || req.body.oph_id;
    const transaction_id = req.body.Transaction_ID || req.body.transaction_id;
    const review = req.body.Review || req.body.review;
    const status = req.body.Status || req.body.status;
    const from_source = req.body.from || req.body.from_source || "Registration";
    const step = req.body.step;
    const song_id = req.body.song_id;
    const event_id = req.body.event_id;
    let release_date = req.body.release_date;
    if (release_date != null && typeof release_date === 'string') {
      const s = release_date.trim().toLowerCase();
      if (s === '' || s === 'null' || s === 'undefined' || s === '0000-00-00' || s.startsWith('0000-00-00')) {
        release_date = null;
      }
    }
    const old_release_date = req.body.old_release_date;
    const amount = req.body.amount;

    // For external event registrations, oph_id contains the participant name
    // For internal users, oph_id is a valid OPH_ID
    // oph_id is always required (either OPH_ID or participant name)
    if (!oph_id || !transaction_id || !status) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: oph_id (or participant name), transaction_id, status",
      });
    }

    // Extract optional booking details for external event registrations
    const booking_details = {
      email: req.body.email || req.body.booking_email,
      phone: req.body.phone || req.body.booking_phone,
      instagram_handle: req.body.instagram_handle || req.body.booking_instagram_handle,
      profession_id: req.body.profession_id || req.body.booking_profession_id,
      first_name: req.body.first_name || req.body.booking_first_name,
      last_name: req.body.last_name || req.body.booking_last_name,
    };

    const result = await PaymentService.insertPayment({
      oph_id,
      transaction_id,
      review,
      status,
      from_source,
      song_id,
      event_id,
      release_date,
      old_release_date,
      amount,
      step,
      booking_details // Pass booking details if available
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Payment error:", error);
    console.error("Payment error stack:", error.stack);
    console.error("Payment error details:", {
      oph_id: req.body.OPH_ID || req.body.oph_id,
      from_source: req.body.from || req.body.from_source,
      event_id: req.body.event_id,
      error_message: error.message,
      error_name: error.name
    });
    
    if (error.message === 'Only one of song_id or event_id should be provided.') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Payment - server Error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const insertSongIDController = async (req, res) => {
  try {
    // Handle both old (ophid) and new (oph_id) field names
    const ophId = req.body.ophid || req.body.oph_id;
    const song_id = req.body.song_id;

    if (!ophId || !song_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: oph_id, song_id",
      });
    }

    const response = await PaymentService.insertSongId(ophId, song_id);

    return res.status(201).json(response);
  } catch (error) {
    console.error("Insert song ID error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

const songRepaymentController = async (req, res) => {
  try {
    // Normalize input - handle both old and new field names
    const oph_id = req.body.OPH_ID || req.body.oph_id;
    const transaction_id = req.body.Transaction_ID || req.body.transaction_id;
    const review = req.body.Review || req.body.review;
    const status = req.body.Status || req.body.status;
    const step = req.body.step;
    const song_id = req.body.song_id;
    const event_id = req.body.event_id;
    const release_date = req.body.release_date;
    const amount = req.body.amount;

    if (!oph_id || !transaction_id || !status || !step || !song_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const response = await PaymentService.songRepayment({
      oph_id,
      transaction_id,
      review,
      status,
      song_id,
      event_id,
      release_date,
      amount
    });

    return res.status(201).json(response);
  } catch (error) {
    console.error("Song repayment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

module.exports = { payment, insertSongIDController, songRepaymentController };
