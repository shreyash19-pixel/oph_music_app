const express = require('express');
const router = express.Router();
const songMetricsController = require('../controllers/audioPlatform');


router.get("/get_song_metrics", songMetricsController.getSongMetrics);
router.get("/get_song_metrics/:id", songMetricsController.getSongMetricsByID);

router.post("/create_audio_metrics", songMetricsController.createMetric);
router.post("/update_audio_metrics", songMetricsController.updateMetric);


router.get("/get_audio_platforms", songMetricsController.getAllAudioPlatforms);
router.post("/new_audio_platform", songMetricsController.addAudioPlatform);
router.delete("/delete_audio_platform/:id", songMetricsController.deleteAudioPlatform);

module.exports = router;