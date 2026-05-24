const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const os = require("os");

const controller = require("../controllers/video_details");
const presignedController = require("../controllers/presigned_upload");

// Disk storage: avoids buffering 1GB in RAM (OOM on small VPS / PM2). Streams to S3 from file.
const uploadDir = path.join(os.tmpdir(), "oph-video-uploads");
try {
  fs.mkdirSync(uploadDir, { recursive: true });
} catch (e) {
  console.error("[Video Upload] mkdir upload dir failed:", uploadDir, e.message);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${String(
      file.originalname || "file"
    ).replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB for videos
    fieldSize: 10 * 1024 * 1024, // 10MB for other fields
  },
});
const authMiddleware = require("../middleware/authenticate");

const videoUploadTimeout = (req, res, next) => {
  const ms = 2 * 60 * 60 * 1000;
  req.setTimeout(ms);
  res.setTimeout(ms);
  if (req.socket) {
    req.socket.setTimeout(ms);
  }
  next();
};

const logVideoUploadRequestStart = (req, res, next) => {
  req._videoUploadT0 = Date.now();
  const cl = req.headers["content-length"];
  const mb =
    cl && !Number.isNaN(Number(cl))
      ? (Number(cl) / (1024 * 1024)).toFixed(2)
      : null;
  console.log(
    `[Video Upload] ← POST /video-details | body≈${mb != null ? `${mb} MB` : "unknown"} | tmp=${uploadDir} | ${new Date().toISOString()}`
  );
  if (mb != null && Number(mb) > 100) {
    console.log(
      `[Video Upload] Hint: if this request never reaches Phase A, check nginx client_max_body_size / Cloudflare (100MB limit on many plans) / ALB idle timeout`
    );
  }
  next();
};

const uploadVideoFields = (req, res, next) => {
  const run = upload.fields([
    { name: "video_file", maxCount: 1 },
    { name: "thumbnails", maxCount: 3 },
  ]);
  run(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("[Video Upload] MulterError:", err.code, err.message, err.field);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          message: "File too large (max 1GB for video).",
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "Upload failed",
      });
    }
    if (err) return next(err);
    next();
  });
};

// Large video: browser PUTs directly to S3 (bypasses Cloudflare ~100MB limit on API hostname)
router.get(
  "/video-details/presigned-upload",
  authMiddleware,
  (req, res) => {
    if (!req.query.purpose) req.query.purpose = "song-video";
    presignedController.presignedVideoUpload(req, res);
  }
);

router.post(
  "/video-details",
  authMiddleware,
  videoUploadTimeout,
  logVideoUploadRequestStart,
  uploadVideoFields,
  controller.createVideoDetails
);

router.get("/video-details", controller.getVideoDetails);
router.get(
  "/check-payment-status",
  authMiddleware,
  controller.checkPaymentStatusController
);

module.exports = router;
