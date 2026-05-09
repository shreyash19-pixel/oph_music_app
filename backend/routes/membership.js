const express = require("express");
const router = express.Router();
const membershipForm = require("../controllers/membership");

router.get("/auth/membership/pdf-url", membershipForm.getPdfDownloadUrl);
router.get("/auth/membership/pdf", membershipForm.downloadMembershipPdf);
router.get("/auth/membership", membershipForm);

module.exports = router;