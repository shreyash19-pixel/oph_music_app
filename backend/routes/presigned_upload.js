const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authenticate");
const controller = require("../controllers/presigned_upload");

router.get(
  "/presigned-upload/video",
  authMiddleware,
  controller.presignedVideoUpload
);

module.exports = router;
