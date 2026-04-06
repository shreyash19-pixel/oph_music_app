const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authenticate");
const forbidSalesMemberApprovals = require("../../middleware/forbidSalesMemberApprovals");
const userDetailsController = require("../controllers/newArtist");

const requireSalesHeadOrSalesMember = (req, res, next) => {
  const role = req.user?.role;
  if (role === "sales head" || role === "sales member") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden" });
};

// GET /user-details/under-review/:ophid
router.get("/under-review/:ophid", userDetailsController.getAllDetailsUnderReview);
router.get("/any-under-review", userDetailsController.getAllUserDetailsIfAnyStepUnderReview);
router.get(
  "/any-rejected-onboarding",
  authMiddleware,
  requireSalesHeadOrSalesMember,
  userDetailsController.getAllUserDetailsIfAnyOnboardingStepRejected
);
router.post(
  "/update-status",
  authMiddleware,
  forbidSalesMemberApprovals,
  userDetailsController.updateStatus
);
router.get("/getAllSales", userDetailsController.getAllSales);
router.get("/user-details-step-status/:ophid", userDetailsController.getUserDetailsStepStatus);
router.get("/professional-details-step-status/:ophid", userDetailsController.getProfessionalDetailsStepStatus);
router.get("/documentation-details-step-status/:ophid", userDetailsController.getDocumentationDetailsStepStatus);
router.get("/application-status/:ophid", userDetailsController.getApplicationStatus);   

module.exports = router;
