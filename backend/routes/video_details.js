const express = require("express");
const router = express.Router();
const multer = require("multer");
// const authMiddleware = require("../middleware/authenticate");

const controller = require("../controllers/video_details");

// store the file in memory; your controller calls uploadToS3
// Increased limit for large video files (1GB max)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 1024 * 1024 * 1024, // 1GB for videos
    fieldSize: 10 * 1024 * 1024, // 10MB for other fields
  },
  // Note: Multer doesn't provide progress events for memory storage
  // Progress is tracked during S3 upload in utils.js
});
const authMiddleware = require("../middleware/authenticate")

// Middleware to increase timeout for video uploads (receive 1GB + S3 multipart can exceed 10m)
const videoUploadTimeout = (req, res, next) => {
  const ms = 2 * 60 * 60 * 1000; // 2 hours — same order as slow 1GB + S3 on weak links
  req.setTimeout(ms);
  res.setTimeout(ms);
  if (req.socket) {
    req.socket.setTimeout(ms);
  }
  next();
};

/** Multer buffers the whole body first — no per-chunk progress. Log start + size hint from client. */
const logVideoUploadRequestStart = (req, res, next) => {
  req._videoUploadT0 = Date.now();
  const cl = req.headers["content-length"];
  const mb =
    cl && !Number.isNaN(Number(cl))
      ? (Number(cl) / (1024 * 1024)).toFixed(2)
      : null;
  console.log(
    `[Video Upload] ← POST /video-details started | approx body: ${mb != null ? `${mb} MB` : "unknown (no Content-Length)"} | ${new Date().toISOString()}`
  );
  next();
};

router.post(
  "/video-details",
  authMiddleware,
  videoUploadTimeout, // Apply timeout middleware before multer
  logVideoUploadRequestStart,
  upload.fields([
    { name: "video_file", maxCount: 1 },
    { name: "thumbnails", maxCount: 3 }, // support multiple images
  ]),
  controller.createVideoDetails
);

router.get("/video-details", controller.getVideoDetails);
router.get("/check-payment-status", authMiddleware, controller.checkPaymentStatusController);

module.exports = router;
