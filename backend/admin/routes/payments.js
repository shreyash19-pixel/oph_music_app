const express = require('express');
const router = express.Router();
const signUpPaymentController = require('../controllers/payments');


router.put('/payment-update-status', signUpPaymentController.updateStatus);
router.get('/payment-for-all-song', signUpPaymentController.getAllSongPayments);
router.get('/payment-for-all-events', signUpPaymentController.getAllEventsPayments);
router.get('/payment-for-all-booking', signUpPaymentController.getAllBookingPayments);
router.get('/payment-for-events-by-ophid/:ophid', signUpPaymentController.getPaymentDetailsForEventsByOphId);
router.get('/payment-for-song-by-ophid/:ophid/:songid', signUpPaymentController.getPaymentDetailsForSongByOphId);
router.put('/update-event-payment', signUpPaymentController.updateEventPaymentSp);
router.put('/update-song-payment', signUpPaymentController.updateSongPaymentSp);
router.put('/update-status-payment', signUpPaymentController.updateStatusPayment);

module.exports = router;