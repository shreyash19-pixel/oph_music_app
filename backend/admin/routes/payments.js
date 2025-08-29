const express = require('express');
const router = express.Router();
const signUpPaymentController = require('../controllers/payments');


router.put('/payment-update-status', signUpPaymentController.updateStatus);
router.get('/payment-for-all-song', signUpPaymentController.getAllSongPayments);
router.get('/payment-for-all-events', signUpPaymentController.getAllEventsPayments);
router.get('/payment-for-all-booking', signUpPaymentController.getAllBookingPayments);
router.get("/get-transaction-details", signUpPaymentController.getTransactionDetailsController)
router.post("/payment-verification", signUpPaymentController.setPaymentVerificationController)

module.exports = router;