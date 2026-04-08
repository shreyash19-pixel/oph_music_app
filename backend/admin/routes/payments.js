const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authenticate");
const forbidSalesMemberApprovals = require("../../middleware/forbidSalesMemberApprovals");
const requireBookingVerificationManager = require("../../middleware/requireBookingVerificationManager");
const signUpPaymentController = require("../controllers/payments");

router.put(
  "/payment-update-status",
  authMiddleware,
  forbidSalesMemberApprovals,
  signUpPaymentController.updateStatus
);
router.get('/payment-for-all-song', signUpPaymentController.getAllSongPayments);
router.get(
  "/payment-for-all-events",
  authMiddleware,
  signUpPaymentController.getAllEventsPayments,
);
router.get('/payment-for-all-booking', signUpPaymentController.getAllBookingPayments);
router.get('/payment-for-events-by-ophid/:ophid', signUpPaymentController.getPaymentDetailsForEventsByOphId);
router.get('/payment-for-song-by-ophid/:ophid/:songid', signUpPaymentController.getPaymentDetailsForSongByOphId);
router.put(
  "/update-event-payment",
  authMiddleware,
  forbidSalesMemberApprovals,
  signUpPaymentController.updateEventPaymentSp
);
router.put(
  "/update-song-payment",
  authMiddleware,
  forbidSalesMemberApprovals,
  signUpPaymentController.updateSongPaymentSp
);
router.put(
  "/update-status-payment",
  authMiddleware,
  forbidSalesMemberApprovals,
  signUpPaymentController.updateStatusPayment
);
router.get("/get-transaction-details", signUpPaymentController.getTransactionDetailsController)
router.post(
  "/payment-verification",
  authMiddleware,
  requireBookingVerificationManager,
  signUpPaymentController.setPaymentVerificationController,
);

module.exports = router;