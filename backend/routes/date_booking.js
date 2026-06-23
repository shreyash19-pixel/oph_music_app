const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/date_booking');
const authMiddleware = require("../middleware/authenticate")

router.post('/booking', authMiddleware, bookingController.createBooking);
router.post('/change-release-date', authMiddleware, bookingController.updateBooking);
router.get('/bookings',  authMiddleware,bookingController.getAllBookings);
router.get('/pending-release-date-change', authMiddleware, bookingController.getPendingReleaseDateChange);
router.get('/bookings-by-id', authMiddleware, bookingController.getAllBookingsByID);
router.post('/insert-calender-song-project', authMiddleware, bookingController.insertSongAndProjectController)

module.exports = router;