const express = require('express');
const router = express.Router();
const eventBookingController = require('../controllers/eventBookings');

// Public routes (no authentication required)
router.post('/events/bookings/:event_id', eventBookingController.createBooking);
router.get('/events/bookings/:booking_reference', eventBookingController.getBookingByReference);

// Internal routes (used by payment system)
router.put('/events/bookings/:booking_reference/payment', eventBookingController.updateBookingPayment);

// Admin routes (should be protected with auth middleware)
router.put('/events/bookings/:booking_reference/status', eventBookingController.updateBookingStatus);
router.get('/events/bookings', eventBookingController.getAllBookings);

module.exports = router;
