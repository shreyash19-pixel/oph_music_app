const express = require('express');
const router = express.Router();
const {

getKPI,getSongMetricsSummary,insertOrUpdateKpiScore,fetchAllKpiScores, getTopSearchedArtistsController, getTopArtistsController,getArtistProfile, fetchmonthly
} = require('../controllers/kpi');

router.get('/get_kpi_model', getSongMetricsSummary);
router.post("/insert_kpi_score", insertOrUpdateKpiScore);
router.get("/get-top-searched-artist", getTopSearchedArtistsController)
router.get("/get-top-artist", getTopArtistsController)
router.get("/get-top-artist-detail", getArtistProfile)

// GET /api/kpi-score — Get all scores sorted by highest
router.get("/kpi_score", fetchAllKpiScores);
router.get("/kpi_monthly_score", fetchmonthly);
router.get("/getKPI", getKPI);

module.exports = router;
