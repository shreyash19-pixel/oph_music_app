const express = require("express");
const router = express.Router(); 
const { payment, insertSongIDController } = require("../controllers/payment");

router.post("/auth/payment",payment);
router.post("/insert-songid-payment", insertSongIDController)

module.exports = router;
