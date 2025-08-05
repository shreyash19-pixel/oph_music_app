const express = require('express');
const router = express.Router();
const {
  getSongMetricsSummary,insertOrUpdateKpiScore,fetchAllKpiScores, getTopSearchedArtistsController, getTopArtistsController,getArtistProfile
} = require('../controllers/kpi');

router.get('/get_kpi_model', getSongMetricsSummary);
router.post("/insert_kpi_score", insertOrUpdateKpiScore);
router.get("/get-top-searched-artist", getTopSearchedArtistsController)
router.get("/get-top-artist", getTopArtistsController)
router.get("/get-top-artist-detail", getArtistProfile)

// GET /api/kpi-score — Get all scores sorted by highest
router.get("/kpi_score", fetchAllKpiScores);

module.exports = router;
