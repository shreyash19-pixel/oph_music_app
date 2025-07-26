const bookingModel = require('../model/date_booking');

exports.createBooking = async (req, res) => {


  try {

    const { oph_id, booking_date } = req.body;

    if (!oph_id) {
      return res.status(400).json({ error: 'oph_id is required' });
    }
    console.log("ashdjsagdasgdhgashdsad");


    const response = await bookingModel.insertBooking(oph_id, booking_date)

    if (response) {
      return res.status(201).json({
        success: true,
        message: "Release date has been booked successfully"
      })
    }

  } catch (error) {
    res.status(500).json({ success: false ,error: error.message });
  }
};


exports.updateBooking = async (req, res) => {

  try {
    const { oph_id, old_booking_date, new_booking_date } = req.body;

    if (!oph_id) {

      return res.status(400).json({ error: 'oph_id is required' })
    }

    const getExistingBookingDate = await bookingModel.findBookingByOphIdAndDate(oph_id, old_booking_date)

    if (getExistingBookingDate) {
      const updatedExistingBookingDate = await bookingModel.updateBooking(oph_id, old_booking_date, new_booking_date)

      if (updatedExistingBookingDate) {
        return res.status(201).json({
          success: true,
          message: "Date Updated successfully"
        })
      }
    }

  }
  catch (error) {
    res.status(500).json({ error: error.message });
  }

}

const moment = require("moment-timezone");

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await bookingModel.getAllBookings();

    const formattedBookings = bookings.map(booking => ({
      ...booking,
      current_booking_date: booking.current_booking_date
        ? moment(booking.current_booking_date).tz("Asia/Kolkata").format("YYYY-MM-DD")
        : null,
      original_booking_date: booking.original_booking_date
        ? moment(booking.original_booking_date).tz("Asia/Kolkata").format("YYYY-MM-DD")
        : null,
      previous_booking_date: booking.previous_booking_date
        ? moment(booking.previous_booking_date).tz("Asia/Kolkata").format("YYYY-MM-DD")
        : null,
    }));

    res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      data: formattedBookings
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
        data: bookings
      });
    }
  } catch (error) {
    res.status(500).json({ success: false ,error: error.message });
  }
};
