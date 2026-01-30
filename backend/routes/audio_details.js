const express = require("express");
const router = express.Router();
const multer = require("multer");
const { insertSongDetailsController,getSongDetailsController, checkVideoDetailsStatusController } = require("../controllers/audio_details");

// Optimized for large audio files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 200 * 1024 * 1024, // 200MB for audio files
    fieldSize: 10 * 1024 * 1024, // 10MB for other fields
  },
}); // For S3 upload
const authMiddleware = require("../middleware/authenticate")

router.post("/audio-details", authMiddleware , upload.single("audio_file") ,insertSongDetailsController);
router.get("/audio-and-secondary-artist", authMiddleware, getSongDetailsController)
router.get("/check-video-status", authMiddleware, checkVideoDetailsStatusController)

module.exports = router;
