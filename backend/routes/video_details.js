const express = require("express");
const router = express.Router();
const multer = require("multer");
// const authMiddleware = require("../middleware/authenticate");

const controller = require("../controllers/video_details");

// store the file in memory; your controller calls uploadToS3
// Increased limit for large video files (500MB max)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 500 * 1024 * 1024, // 500MB for videos
    fieldSize: 10 * 1024 * 1024, // 10MB for other fields
  },
});
const authMiddleware = require("../middleware/authenticate")

router.post(
  "/video-details",
  authMiddleware,
  upload.fields([
    { name: "video_file", maxCount: 1 },
    { name: "thumbnails", maxCount: 3 }, // support multiple images
  ]),
  controller.createVideoDetails
);

router.get("/video-details", controller.getVideoDetails);
router.get("/check-payment-status", authMiddleware, controller.checkPaymentStatusController);

module.exports = router;
