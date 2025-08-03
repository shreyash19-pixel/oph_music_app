const express = require('express');
const router = express.Router();
const {
  getSongMetricsSummary,insertOrUpdateKpiScore,fetchAllKpiScores, getTopSearchedArtistsController
} = require('../controllers/kpi');

router.get('/get_kpi_model', getSongMetricsSummary);
router.post("/insert_kpi_score", insertOrUpdateKpiScore);
router.get("/get-top-searched-artist", getTopSearchedArtistsController)

// GET /api/kpi-score — Get all scores sorted by highest
router.get("/kpi_score", fetchAllKpiScores);

module.exports = router;
