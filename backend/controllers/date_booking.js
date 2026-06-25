const bookingModel = require("../model/date_booking");
const DateBookingService = require("../services/dateBooking/DateBookingService");
const db = require("../DB/connect");

exports.createBooking = async (req, res) => {
  try {
    const { oph_id, booking_date, song_name, project_type, song_id } = req.body;
    console.log(oph_id, booking_date, song_name, project_type, song_id, "calendar booking");
    
    if (!oph_id || !booking_date) {
      return res.status(400).json({ 
        success: false,
        error: "oph_id and booking_date are required" 
      });
    }

    // Use DateBookingService for application logic
    const response = await DateBookingService.createBooking(
      oph_id,
      booking_date,
      song_name || null,
      project_type || null,
      song_id || null
    );

    return res.status(201).json(response);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Internal server error" 
    });
  }
};

exports.insertSongAndProjectController = async (req, res) => {
  try {
    const { oph_id, song_name, project_type, release_date, song_id } = req.body;

    if (!oph_id || !song_name || !project_type || !release_date || !song_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: oph_id, song_name, project_type, and release_date are required",
      });
    }

    // Use DateBookingService for application logic
    const response = await DateBookingService.linkSongToBooking(
      oph_id,
      song_name,
      project_type,
      release_date
    );

    return res.status(201).json(response);
  } catch (err) {
    console.error("Error linking song to booking:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { oph_id, old_booking_date, new_booking_date, reason } = req.body;

    if (!oph_id || !old_booking_date || !new_booking_date) {
      return res.status(400).json({ 
        success: false,
        error: "oph_id, old_booking_date, and new_booking_date are required" 
      });
    }

    // Use DateBookingService for application logic
    const response = await DateBookingService.updateBookingDate(
      oph_id,
      old_booking_date,
      new_booking_date,
      reason || null
    );

    return res.status(201).json(response);
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Internal server error" 
    });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await bookingModel.getAllBookings();

    return res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: bookings || [],
    });
  } catch (error) {
    console.error("Error in getAllBookings controller:", error);
    res.status(500).json({ 
      success: false,
      error: error.message || "Internal server error" 
    });
  }
};

exports.getPendingReleaseDateChange = async (req, res) => {
  try {
    const oph_id =
      req.user?.userData?.artist?.id ||
      req.user?.userData?.artist?.OPH_ID ||
      req.user?.ophid ||
      req.user?.oph_id;

    if (!oph_id) {
      return res.status(400).json({
        success: false,
        message: "Missing artist id",
      });
    }

    const { getPendingReleaseDateChangeForOph } = require("../utils/releaseDateChangeQueries");
    const { normalizeCalendarDateOnly } = require("../utils/calendarDateUtils");
    const pending = await getPendingReleaseDateChangeForOph(db, oph_id);

    if (!pending) {
      return res.status(200).json({ success: true, pending: null });
    }

    return res.status(200).json({
      success: true,
      pending: {
        release_date: normalizeCalendarDateOnly(pending.release_date),
        old_release_date: normalizeCalendarDateOnly(pending.old_release_date),
        status: pending.status,
        transaction_id: pending.transaction_id,
      },
    });
  } catch (error) {
    console.error("Error fetching pending release date change:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.getAllBookingsByID = async (req, res) => {
  try {
    const { ophid } = req.query;

    const bookings = await bookingModel.getAllBookingsByID(ophid);

    if (bookings) {
      res.status(200).json({
        success: true,
        message: "Data fetched successfully",
        data: bookings,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
