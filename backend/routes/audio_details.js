const express = require("express");
const router = express.Router();
const multer = require("multer");
const { insertSongDetailsController,getSongDetailsController, checkVideoDetailsStatusController } = require("../controllers/audio_details");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
}); // For S3 upload
const authMiddleware = require("../middleware/authenticate")

router.post("/audio-details", authMiddleware , upload.single("audio_file") ,insertSongDetailsController);
router.get("/audio-and-secondary-artist", authMiddleware, getSongDetailsController)
router.get("/check-video-status", authMiddleware, checkVideoDetailsStatusController)

module.exports = router;
