const SongSocialMetrics = require("../model/analytics");

const createMetrics = async (req, res) => {
  try {
    const data = req.body;
    const result = await SongSocialMetrics.insertMetrics(data);
    res.status(201).json({ message: "Metrics inserted", id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Failed to insert metrics", details: err.message });
  }
};

const updateMetrics = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;
    const result = await SongSocialMetrics.updateMetrics(id, data);
    res.status(200).json({ message: "Metrics updated", result });
  } catch (err) {
    res.status(500).json({ error: "Failed to update metrics", details: err.message });
  }
};

const getAllMetrics = async (req, res) => {
  try {
    const data = await SongSocialMetrics.getAllMetrics();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch metrics", details: err.message });
  }
};

const getMetricById = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await SongSocialMetrics.getMetricById(id);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch metric", details: err.message });
  }
};

module.exports ={
    createMetrics,updateMetrics,getAllMetrics,getMetricById

}