const SongSocialMetrics = require("../model/analytics");
const db = require("../../DB/connect");
const createMetrics = async (req, res) => {
  try {
    const data = req.body;
    const result = await SongSocialMetrics.insertMetrics(data);
    res.status(201).json({ message: "Metrics inserted", id: result.insertId });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to insert metrics", details: err.message });
  }
};

const updateMetrics = async (req, res) => {
  try {
    const data = req.body;
    console.log(data);
    const result = await SongSocialMetrics.updateMetrics(data);
    res.status(200).json({ message: "Metrics updated", result });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update metrics", details: err.message });
  }
};

const getAllMetrics = async (req, res) => {
  try {
    console.log("tesing all metrics");
    const data = await SongSocialMetrics.getAllMetrics();

    // Check if data is null, undefined, or not an array
    if (!data || !Array.isArray(data)) {
      console.log("No data or invalid data returned:", data);
      return res.status(404).json({ message: "No metrics found." });
    }

    console.log("Data fetched successfully:", data);
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching metrics:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch metrics", details: err.message });
  }
};

const getMetricById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await SongSocialMetrics.getMetricById(id);
    res.status(200).json(data);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch metric", details: err.message });
  }
};

const kpi = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT
              OPH_ID,
              count(distinct song_id) AS song_count,
              SUM(youtube_views) AS total_views
            FROM song_social_metrics
            GROUP BY OPH_ID
    `);

    res.json(rows);
  } catch (error) {
    console.error("Error fetching OPH_ID song counts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createMetrics,
  updateMetrics,
  getAllMetrics,
  getMetricById,
  kpi,
};
