const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authenticate");
const requireWithdrawApprovalRole = require("../../middleware/requireWithdrawApprovalRole");
const {
  getWithdrawSummaries,
  updateWithdrawStatus,
  getWithdraw
} = require("../controllers/withdraw");

router.get("/getAllWithdraw", getWithdrawSummaries);
router.post(
  "/updateWithdrawStatus",
  authMiddleware,
  requireWithdrawApprovalRole,
  updateWithdrawStatus,
);
router.get("/getWithdrawAdmin", getWithdraw);


module.exports = router;
