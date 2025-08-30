const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/date-booking');


router.post('/booking', bookingController.createBooking);
router.post('/change-release-date', bookingController.updateBooking);
router.get('/bookings', bookingController.getAllBookings);
router.get('/bookings-by-id', bookingController.getAllBookingsByID);
router.post('/insert-calender-song-project', bookingController.insertSongAndProjectController)

module.exports = router;