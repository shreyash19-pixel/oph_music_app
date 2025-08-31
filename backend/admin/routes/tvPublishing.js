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

router.get("/getTv", getTv);
router.get("/getAllTv", getAllTv);
router.post("/updateLockStatus", updateLockStatus);
router.post("/updateTvStatus", updateTvStatus);
router.post(
  "/updateTvFiles",
  upload.fields([
    { name: "audio_url", maxCount: 1 },
    { name: "video_url", maxCount: 1 },
  ]),
  updateTvFiles
);

module.exports = router;
