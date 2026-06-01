const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authenticate');
const forbidAccountsContentEdits = require('../../middleware/forbidAccountsContentEdits');
const songsController = require('../controllers/songs')
const multer = require('multer');
const memoryStorage = multer.memoryStorage();
const uploadAudio = multer({
  storage: memoryStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // matches admin updateAudioSection validation
});
const uploadThumbnails = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get('/under-review-songs', songsController.getAll);
router.get('/songs-under-review/:ophId/:songId', songsController.getSongsUnderReview);
router.get('/approved-songs', songsController.getAllApprovedSongs);
router.get('/song-approved/:ophId/:songId', songsController.getSongApproved);
router.put(
  "/songs/update-status",
  authMiddleware,
  forbidAccountsContentEdits,
  songsController.updateSongSectionStatus,
);

// Update routes for audio and video sections
router.put(
  '/audio/:songId/:ophId',
  authMiddleware,
  forbidAccountsContentEdits,
  uploadAudio.single('audio_file'),
  songsController.updateAudioSection,
);
router.put(
  "/video/:songId",
  authMiddleware,
  forbidAccountsContentEdits,
  uploadThumbnails.fields([{ name: "thumbnails", maxCount: 3 }]),
  songsController.updateVideoSection,
);


module.exports = router;