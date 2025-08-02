const express = require("express");
const router = express.Router();
const { getWithdrawSummaries } = require("../controllers/withdraw");

router.get("/getAllWithdraw", getWithdrawSummaries);

module.exports = router;
