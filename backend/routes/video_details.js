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
  // Note: Multer doesn't provide progress events for memory storage
  // Progress is tracked during S3 upload in utils.js
});
const authMiddleware = require("../middleware/authenticate")

// Middleware to increase timeout for video uploads (large files can take 5-10 minutes)
const videoUploadTimeout = (req, res, next) => {
  // Increase timeout to 10 minutes (600 seconds) for video uploads
  req.setTimeout(600000); // 10 minutes
  res.setTimeout(600000); // 10 minutes
  next();
};

router.post(
  "/video-details",
  authMiddleware,
  videoUploadTimeout, // Apply timeout middleware before multer
  upload.fields([
    { name: "video_file", maxCount: 1 },
    { name: "thumbnails", maxCount: 3 }, // support multiple images
  ]),
  controller.createVideoDetails
);

router.get("/video-details", controller.getVideoDetails);
router.get("/check-payment-status", authMiddleware, controller.checkPaymentStatusController);

module.exports = router;
