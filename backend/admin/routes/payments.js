const express = require('express');
const router = express.Router();
const signUpPaymentController = require('../controllers/payments');


router.put('/payment-update-status', signUpPaymentController.updateStatus);

module.exports = router;