const SongSocialMetrics = require('../model/kpi');

const getSongMetricsSummary = async (req, res) => {
  try {
    const metrics = await SongSocialMetrics.getMetricsSummary();
    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error fetching song metrics summary:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const insertOrUpdateKpiScore = async (req, res) => {
  try {
    const {
      OPH_ID,
      user_traffic,
      song_count,
      total_views,
      avg_view_duration,
      total_accepted_events,
      score
    } = req.body;

    if (!OPH_ID) {
      return res.status(400).json({ error: "Missing OPH_ID" });
    }

    await SongSocialMetrics.KpiScore({
      OPH_ID,
      user_traffic,
      song_count,
      total_views,
      avg_view_duration,
      total_accepted_events,
      score
    });

    res.status(200).json({ message: "Score inserted/updated successfully." });
  } catch (error) {
    console.error("Error inserting/updating KPI score:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const fetchAllKpiScores = async (req, res) => {
  try {
    const scores = await SongSocialMetrics.getAllKpiScores();
    res.status(200).json(scores);
  } catch (error) {
    console.error("Error fetching KPI scores:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getSongMetricsSummary,fetchAllKpiScores,insertOrUpdateKpiScore
};
