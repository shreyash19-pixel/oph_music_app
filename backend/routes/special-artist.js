const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middleware/authenticate");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
}); // For S3 upload

const {
  editSpecialArtistDetailsController,
  getSpecialArtistStatusController,
  getSpecialArtistPicController,
} = require("../controllers/special-artist");

router.post(
  "/edit-special-artist-details",
  authMiddleware,
  upload.fields([
    { name: "artistPhoto", maxCount: 1 },
    { name: "updateImages", maxCount: 1 },
  ]),
  editSpecialArtistDetailsController
);

router.get(
  "/get-special-artist-status",
  authMiddleware,
  getSpecialArtistStatusController
);
router.get(
  "/get-special-artist-pic",
  authMiddleware,
  getSpecialArtistPicController
);

module.exports = router;
