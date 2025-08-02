const express = require("express");
const router = express.Router();
const {
  createWithdrawRequest,
  getWithdraw,
} = require("../controllers/withdraw");


router.post("/sendWithdraw", createWithdrawRequest);

router.get("/getWithdraw", getWithdraw);

module.exports = router;