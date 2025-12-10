const express = require("express");
const router = express.Router();
const Resource = require("../controllers/resource");
const multer = require("multer");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

router.get("/podcast/search", Resource.searchPodcasts);
router.post(
  "/createPodcast",
  upload.fields([
    { name: "video_url", maxCount: 1 },
    { name: "thumbnail_url", maxCount: 1 },
  ]),
  Resource.insertPodcast,
);

router.get("/allPodcasts", Resource.fetchAllPodcast);
router.get(`/podcast/:podcastId`, Resource.getPodcastById);
router.put(
  "/update_podcast/:podcastId",
  upload.fields([
    { name: "video_url", maxCount: 1 },
    { name: "thumbnail_url", maxCount: 1 },
  ]),
  Resource.updatePodcastById,
);

router.delete("/delete_podcast/:id", Resource.deletePodcast);

//Reels
router.post(
  "/createReels",
  upload.fields([
    { name: "video_url", maxCount: 1 },
    { name: "thumbnail_url", maxCount: 1 },
  ]),
  Resource.insertReels,
);
router.get("/allReels", Resource.fetchAllReels);
router.get(`/reel/:reelId`, Resource.getReelById);
router.put(
  "/update_reel/:reelId",
  upload.fields([
    { name: "video_url", maxCount: 1 },
    { name: "thumbnail_url", maxCount: 1 },
  ]),
  Resource.updateReelById,
);

router.delete("/delete_reel/:id", Resource.deleteReel);

//Stories
router.post(
  "/createStories",
  upload.fields([
    { name: "video_url", maxCount: 1 },
    { name: "thumbnail_url", maxCount: 1 },
  ]),
  Resource.insertStories,
);
router.get("/allStories", Resource.fetchAllStories);
router.get(`/story/:storyId`, Resource.getStroyById);
router.put(
  "/update_story/:storyId",
  upload.fields([
    { name: "video_url", maxCount: 1 },
    { name: "thumbnail_url", maxCount: 1 },
  ]),
  Resource.updateStroyById,
);

router.delete("/delete_story/:id", Resource.deleteStory);

//Learning
router.post(
  "/createLearning",
  upload.fields([
    { name: "video_url", maxCount: 1 },
    { name: "thumbnail_url", maxCount: 1 },
  ]),
  Resource.insertLearning,
);
router.get("/allLearning", Resource.fetchAllLearning);
router.get(`/learning/:learningId`, Resource.getLearningById);
router.put(
  "/update_learning/:learningId",
  upload.fields([
    { name: "video_url", maxCount: 1 },
    { name: "thumbnail_url", maxCount: 1 },
  ]),
  Resource.updateLearningById,
);
router.delete("/delete_learning/:id", Resource.deleteLearning);  

module.exports = router;
