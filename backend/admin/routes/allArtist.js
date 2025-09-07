const express = require("express");
const router = express.Router();
const userDetails = require("../controllers/allArtist");
const multer = require("multer");
const authMiddleware = require("../../middleware/authenticate");

const upload = multer({ storage: multer.memoryStorage() });

// GET /user-details/under-review/:ophid
router.get("/completed", userDetails.getAllUserDetails);
router.get("/completed/:ophid", userDetails.getAllDetails);

// PUT /update-user-details
router.put("/update-user-details", authMiddleware, upload.single("profile_image"), userDetails.updateUserDetails);
router.put("/update-professional-details", authMiddleware, upload.fields([
  { name: "photos", maxCount: 5 },
  { name: "video", maxCount: 1 }
]), userDetails.updateProfessionalDetailsController);

// POST /update-documentation-details
router.post(
  "/update-documentation-details",
  authMiddleware,
  upload.fields([
    { name: "AadharFrontURL", maxCount: 1 },
    { name: "AadharBackURL", maxCount: 1 },
    { name: "PanFrontURL", maxCount: 1 },
    { name: "SignatureImageURL", maxCount: 1 },
  ]),
  userDetails.updateDocumentationDetails
);

module.exports = router;