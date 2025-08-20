const express = require("express");
const router = express.Router(); 
const { payment, insertSongIDController, songRepaymentController } = require("../controllers/payment");

router.post("/auth/payment",payment);
router.post("/insert-songid-payment", insertSongIDController)
router.post("/song-payment",songRepaymentController )

module.exports = router;
