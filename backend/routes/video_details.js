const express = require("express");
const router = express.Router();
const multer = require("multer");
// const authMiddleware = require("../middleware/authenticate");

const controller = require("../controllers/video_details");

// store the file in memory; your controller calls uploadToS3
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
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
