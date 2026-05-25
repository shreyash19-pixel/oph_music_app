const express = require("express");
const router = express.Router();
const membershipForm = require("../controllers/membership");
const authMiddleware = require("../middleware/authenticate");
const { canDownloadMembershipPdf } = require("../admin/utils/allDataRolePermissions");

const requireMembershipPdfHead = (req, res, next) => {
  const role = req.user?.role;
  if (!canDownloadMembershipPdf(role)) {
    return res.status(403).json({
      success: false,
      message: "Membership PDF download is available to department heads only",
    });
  }
  next();
};

router.get(
  "/auth/membership/pdf-url",
  authMiddleware,
  requireMembershipPdfHead,
  membershipForm.getPdfDownloadUrl,
);
router.get(
  "/auth/membership/pdf",
  authMiddleware,
  requireMembershipPdfHead,
  membershipForm.downloadMembershipPdf,
);
router.get("/auth/membership", membershipForm);

module.exports = router;