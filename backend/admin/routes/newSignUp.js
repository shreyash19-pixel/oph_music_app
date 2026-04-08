const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authenticate");
const {
  getAllOphIdsWithRegistration,
  getSingleUserDetails,
  getTransactionDetails,
  getRejectedSignupPayments,
  getUnifiedNewSignup,
} = require("../controllers/newSignUp");

const requireSalesHeadOrSuperAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (role === "sales head" || role === "super admin") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden" });
};

router.get("/newsignup/unified", getUnifiedNewSignup);
router.get("/newsignup", getAllOphIdsWithRegistration);
router.get(
  "/newsignup/rejected-signup-payments",
  authMiddleware,
  requireSalesHeadOrSuperAdmin,
  getRejectedSignupPayments
);
router.get("/user-details/:ophid", getSingleUserDetails);
router.get("/transaction-details/:ophid", getTransactionDetails);

module.exports = router;