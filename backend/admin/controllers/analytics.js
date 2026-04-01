const SongSocialMetrics = require("../model/analytics");
const db = require("../../DB/connect");
const { readFromS3 } = require("../../utils");

const getVideoyId = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await SongSocialMetrics.getVideoyId(id);
    res.status(200).json(data);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch metric", details: err.message });
  }
};

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

const getMetricByOph = async (req, res) => {
  const { OPH_ID } = req.query;
  if (!OPH_ID) {
    return res
      .status(400)
      .json({ success: false, message: "Missing OPH ID in query" });
  } else {
    try {
       const Metric = await SongSocialMetrics.getMetricByOph(OPH_ID);
      
      const Key = "monthly_kpi/song_metrics.json";

      const s3Data = await readFromS3(Key);

       // 3. Extract only records for the given OPH_ID
       const matchedRecords = [];
       for (const year of Object.keys(s3Data)) {
         for (const month of Object.keys(s3Data[year])) { 
           const records = s3Data[year][month];
           const filtered = records.filter((r) => r.OPH_ID === OPH_ID);
           if (filtered.length > 0) {
             matchedRecords.push(...filtered);
           }
         }
       }

      res.status(200).json({ success: true, data: Metric, s3Metrics: matchedRecords });
    } catch (error) {
      console.error("Error fetching Metric:", error);
      console.log("Controller - ophID:", OPH_ID);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
};

const kpi = async (req, res) => {
  try {
    const [[freshness]] = await db.execute(
      `SELECT MAX(updated_at) AS max_metric_time FROM song_social_metrics`
    );
    const maxT = freshness?.max_metric_time;
    if (maxT != null) {
      const iso =
        maxT instanceof Date ? maxT.toISOString() : String(maxT);
      res.setHeader("X-Leaderboard-Metrics-Through", iso);
    }

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
  getVideoyId,
  createMetrics,
  updateMetrics,
  getAllMetrics,
  getMetricById,
  getMetricByOph,
  kpi,
};
