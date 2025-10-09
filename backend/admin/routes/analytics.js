const express = require("express");
const router = express.Router();
const controller = require("../controllers/analytics");

// POST new metrics
// router.post("/", controller.createMetrics);

// PUT update existing metrics by id
router.post("/update_analytics", controller.updateMetrics);

// GET all metrics  
router.get("/allanalytics", controller.getAllMetrics);

// GET single metric by id
router.get("/analytics/:id", controller.getMetricById);

router.get("/getMetricByOph", controller.getMetricByOph);

router.get("/leaderboard_data", controller.kpi);

router.get("/getVideoyId/:id", controller.getVideoyId);

module.exports = router;
