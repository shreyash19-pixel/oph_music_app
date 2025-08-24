const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middleware/authenticate");
const upload = multer({ storage: multer.memoryStorage() }); // For S3 upload

const {
  editSpecialArtistDetailsController,
  getSpecialArtistStatusController
} = require("../controllers/special-artist");

router.post(
  "/edit-special-artist-details",
  authMiddleware,
  upload.fields([
    { name: "bioVideo", maxCount: 1 },
    { name: "artistStoryVideo", maxCount: 1 },
    { name: "artistPhoto", maxCount: 1 },
    { name: "updateImages", maxCount: 1 },
  ]),
  editSpecialArtistDetailsController
);

router.get("/get-special-artist-status", authMiddleware, getSpecialArtistStatusController)


module.exports = router;
