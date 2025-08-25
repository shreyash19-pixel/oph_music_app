const express = require("express");
const router = express.Router();
const {
  getWithdrawSummaries,
  updateWithdrawStatus,
  getWithdraw
} = require("../controllers/withdraw");

router.get("/getAllWithdraw", getWithdrawSummaries);
router.post("/updateWithdrawStatus", updateWithdrawStatus);
router.get("/getWithdrawAdmin", getWithdraw);


module.exports = router;
