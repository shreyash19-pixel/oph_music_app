const express = require('express');
const router = express.Router();
const {
  getSongMetricsSummary,insertOrUpdateKpiScore,fetchAllKpiScores
} = require('../controllers/kpi');

router.get('/get_kpi_model', getSongMetricsSummary);
router.post("/insert_kpi_score", insertOrUpdateKpiScore);

// GET /api/kpi-score — Get all scores sorted by highest
router.get("/kpi_score", fetchAllKpiScores);

module.exports = router;
