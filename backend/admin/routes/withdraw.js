const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authenticate");
const forbidSalesMemberApprovals = require("../../middleware/forbidSalesMemberApprovals");
const {
  getWithdrawSummaries,
  updateWithdrawStatus,
  getWithdraw
} = require("../controllers/withdraw");

router.get("/getAllWithdraw", getWithdrawSummaries);
router.post(
  "/updateWithdrawStatus",
  authMiddleware,
  forbidSalesMemberApprovals,
  updateWithdrawStatus
);
router.get("/getWithdrawAdmin", getWithdraw);


module.exports = router;
