const express = require("express");
const router = express.Router();
const multer = require("multer");
const uploadController = require("../controllers/upload_video");
const aboutUsController = require("../controllers/about_us");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 1024 * 1024 * 1024
  }
});

const videoUploadTimeout = (req, res, next) => {
  req.setTimeout(600000);
  res.setTimeout(600000);
  next();
};

router.post(
  "/upload-video",
  videoUploadTimeout,
  upload.single("video"),
  uploadController.uploadVideo
);

router.get("/about-us", aboutUsController.getAboutUs);

module.exports = router;
