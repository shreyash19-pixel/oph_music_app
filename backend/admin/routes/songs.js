const express = require('express');
const router = express.Router();
const songsController = require('../controllers/songs')


router.get('/under-review-songs', songsController.getAll);
router.get('/songs-under-review/:ophId/:songId', songsController.getSongsUnderReview);
router.get("/approved-songs", songsController.getAllApprovedSongs);
router.get('/song-approved/:ophId/:songId', songsController.getSongApproved);
router.put("/songs/update-status", songsController.updateSongSectionStatus);


module.exports = router;