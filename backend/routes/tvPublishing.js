const express = require("express");
const router = express.Router();
const multer = require("multer");
const { TvUser, createContentFiles } = require("../controllers/tvPublishing");
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/TvUser", TvUser);
router.post(
  "/content",
  upload.fields([
    { name: "audio", maxCount: 1 },
  ]),
  createContentFiles
);


module.exports = router;
