const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  getAllPageMediaController,
  getPageMediaController,
  uploadPageMediaController,
} = require("../controllers/page_media");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

router.get("/page-media", getPageMediaController);
router.get("/all-page-media", getAllPageMediaController);
router.post(
  "/upload-page-media",
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  uploadPageMediaController,
);

module.exports = router;
