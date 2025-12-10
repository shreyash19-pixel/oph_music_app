const express = require('express');
const router = express.Router();
const songsController = require('../controllers/songs')
const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});


router.get('/under-review-songs', songsController.getAll);
router.get('/songs-under-review/:ophId/:songId', songsController.getSongsUnderReview);
router.get('/approved-songs', songsController.getAllApprovedSongs);
router.get('/song-approved/:ophId/:songId', songsController.getSongApproved);
router.put("/songs/update-status", songsController.updateSongSectionStatus);

// Update routes for audio and video sections
router.put('/audio/:songId/:ophId', upload.single('audio_file'), songsController.updateAudioSection);
router.put('/video/:songId', upload.fields([
  { name: "video_file", maxCount: 1 },
  { name: "thumbnails", maxCount: 3 },
]), songsController.updateVideoSection);


module.exports = router;