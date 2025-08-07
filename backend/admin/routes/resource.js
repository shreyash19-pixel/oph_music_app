const express = require("express");
const router = express.Router();
const Resource = require("../controllers/resource");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/createPodcast",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  Resource.insertPodcast,
);

router.get("/allPodcast", Resource.fetchAllPodcast);

router.post(
  "/createReels",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  Resource.insertReels,
);
router.get("/allReels", Resource.fetchAllReels);

router.get("/allPodcast", Resource.fetchAllPodcast);

router.post(
  "/createStories",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  Resource.insertStories,
);
router.get("/allStories", Resource.fetchAllStories);

module.exports = router;
