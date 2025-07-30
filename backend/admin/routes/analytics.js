const express = require("express");
const router = express.Router();
const controller = require("../controllers/analytics");


// POST new metrics
// router.post("/", controller.createMetrics);

// PUT update existing metrics by id
router.put("/update_analytics/:id", controller.updateMetrics);

// GET all metrics
router.get("/allanalytics", controller.getAllMetrics);

// GET single metric by id
router.get("/analytics/:id", controller.getMetricById);

router.get('/kpi', controller.kpi);

module.exports = router;
