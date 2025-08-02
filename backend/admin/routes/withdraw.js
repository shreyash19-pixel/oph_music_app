const express = require("express");
const router = express.Router();
const {
  getWithdrawSummaries,
  updateWithdrawStatus,
} = require("../controllers/withdraw");

router.get("/getAllWithdraw", getWithdrawSummaries);
router.post("/updateWithdrawStatus", updateWithdrawStatus);


module.exports = router;
