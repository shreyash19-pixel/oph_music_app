const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  getTv,
  getAllTv,
  updateLockStatus,
  updateTvStatus,
  updateTvFiles,
} = require("../controllers/tvPublishing");
const authMiddleware = require("../../middleware/authenticate");
const requireTvPublishingManager = require("../../middleware/requireTvPublishingManager");
const requireTvPublishingStatusEditor = require("../../middleware/requireTvPublishingStatusEditor");

router.get("/getTv", getTv);
router.get("/getAllTv", getAllTv);
router.post(
  "/updateLockStatus",
  authMiddleware,
  requireTvPublishingManager,
  updateLockStatus,
);
router.post(
  "/updateTvStatus",
  authMiddleware,
  requireTvPublishingStatusEditor,
  updateTvStatus,
);
router.post(
  "/updateTvFiles",
  authMiddleware,
  requireTvPublishingManager,
  upload.fields([
    { name: "audio_url", maxCount: 1 },
    { name: "video_url", maxCount: 1 },
  ]),
  updateTvFiles,
);

module.exports = router;
