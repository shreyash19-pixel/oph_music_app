const express = require('express');
const router = express.Router();
const {
  getKPI,
  getSongMetricsSummary,
  insertOrUpdateKpiScore,
  insertKpiRunMetadata,
  fetchAllKpiScores,
  getCollabArtistKpiDetailController,
  getTopSearchedArtistsController,
  getTopArtistsController,
  getArtistProfile,
  fetchmonthly,
} = require("../controllers/kpi");

router.get('/get_kpi_model', getSongMetricsSummary);
router.post("/insert_kpi_score", insertOrUpdateKpiScore);
router.post("/insert_kpi_run_metadata", insertKpiRunMetadata);
router.get("/get-top-searched-artist", getTopSearchedArtistsController)
router.get("/get-top-artist", getTopArtistsController)
router.get("/get-top-artist-detail", getArtistProfile)

// GET /api/kpi-score — Get all scores sorted by highest



router.get("/kpi_score", fetchAllKpiScores);
router.get("/collab_artist_kpi/:ophId", getCollabArtistKpiDetailController);
router.get("/kpi_monthly_score", fetchmonthly);
router.get("/getKPI", getKPI);

module.exports = router;
