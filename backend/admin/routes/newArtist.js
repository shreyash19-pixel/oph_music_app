const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authenticate");
const requireArtistOnboardingApprover = require("../../middleware/requireArtistOnboardingApprover");
const userDetailsController = require("../controllers/newArtist");

/** Who may read the rejected-onboarding queue (JWT). */
const REJECTED_ONBOARDING_LIST_ROLES = new Set([
  "super admin",
  "administrative head",
  "administrative member",
  "sales head",
  "sales member",
]);

const NEW_ARTIST_UNIFIED_QUEUE_ROLES = REJECTED_ONBOARDING_LIST_ROLES;

const requireRejectedOnboardingListAccess = (req, res, next) => {
  const role = req.user?.role;
  if (role && REJECTED_ONBOARDING_LIST_ROLES.has(role)) {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden" });
};

const requireNewArtistUnifiedQueueAccess = (req, res, next) => {
  const role = req.user?.role;
  if (role && NEW_ARTIST_UNIFIED_QUEUE_ROLES.has(role)) {
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
  requireRejectedOnboardingListAccess,
  userDetailsController.getAllUserDetailsIfAnyOnboardingStepRejected
);
/** Single table: under-review ∪ rejected onboarding + registration payment columns (JWT). */
router.get(
  "/new-artist-unified-queue",
  authMiddleware,
  requireNewArtistUnifiedQueueAccess,
  userDetailsController.getNewArtistUnifiedQueue
);
router.post(
  "/update-status",
  authMiddleware,
  requireArtistOnboardingApprover,
  userDetailsController.updateStatus
);
router.get("/getAllSales", userDetailsController.getAllSales);
router.get("/user-details-step-status/:ophid", userDetailsController.getUserDetailsStepStatus);
router.get("/professional-details-step-status/:ophid", userDetailsController.getProfessionalDetailsStepStatus);
router.get("/documentation-details-step-status/:ophid", userDetailsController.getDocumentationDetailsStepStatus);
router.get("/application-status/:ophid", userDetailsController.getApplicationStatus);   

module.exports = router;
