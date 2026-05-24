const express = require("express");
const router = express.Router();
const userDetails = require("../controllers/allArtist");
const multer = require("multer");
const authMiddleware = require("../../middleware/authenticate");
const forbidSalesMemberArtistEdits = require("../middleware/forbidSalesMemberArtistEdits");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

// GET /user-details/under-review/:ophid
router.get("/completed", userDetails.getAllUserDetails);
router.get("/completed/:ophid", userDetails.getAllDetails);

// PUT /update-user-details
router.put(
  "/update-user-details",
  authMiddleware,
  forbidSalesMemberArtistEdits,
  upload.single("profile_image"),
  userDetails.updateUserDetails
);
router.put(
  "/update-professional-details",
  authMiddleware,
  forbidSalesMemberArtistEdits,
  upload.fields([{ name: "photos", maxCount: 5 }]),
  userDetails.updateProfessionalDetailsController
);

// POST /update-documentation-details
router.post(
  "/update-documentation-details",
  authMiddleware,
  forbidSalesMemberArtistEdits,
  upload.fields([
    { name: "aadhar_front_url", maxCount: 1 },
    { name: "aadhar_back_url", maxCount: 1 },
    { name: "pan_front_url", maxCount: 1 },
    { name: "signature_image_url", maxCount: 1 },
  ]),
  userDetails.updateDocumentationDetails
);

module.exports = router;
