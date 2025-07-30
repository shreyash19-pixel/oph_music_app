const db = require('../../DB/connect');

const SongSocialMetrics = {
//   insertMetrics: async (metrics) => {
//     const {
//       song_id,
//       youtube_views,
//       youtube_engagement,
//       youtube_avg_view_duration,
//       youtube_revenue,
//       insta_engagement,
//     } = metrics;

//     const [result] = await db.execute(
//       `INSERT INTO song_social_metrics 
//         (song_id, youtube_views, youtube_engagement, youtube_avg_view_duration, youtube_revenue, insta_engagement)
//        VALUES (?, ?, ?, ?, ?, ?)`,
//       [
//         song_id,
//         youtube_views,
//         youtube_engagement,
//         youtube_avg_view_duration,
//         youtube_revenue,
//         insta_engagement,
//       ]
//     );
//     return result;
//   },

  updateMetrics: async (id, metrics) => {
    const {
      youtube_views,
      youtube_engagement,
      youtube_avg_view_duration,
      youtube_revenue,
      insta_engagement,
    } = metrics;

    const [result] = await db.execute(
      `UPDATE song_social_metrics
       SET youtube_views = ?, youtube_engagement = ?, youtube_avg_view_duration = ?, youtube_revenue = ?, insta_engagement = ?
       WHERE song_id = ?`,
      [
        youtube_views,
        youtube_engagement,
        youtube_avg_view_duration,
        youtube_revenue,
        insta_engagement,
        id,
      ]
    );
    return result;
  },

  getAllMetrics: async () => {
    const [rows] = await db.execute(`SELECT * FROM song_social_metrics`);
    return rows;
  },

  getMetricById: async (id) => {
    const [rows] = await db.execute(`SELECT * FROM song_social_metrics WHERE song_id = ?`, [id]);
    return rows[0];
  },
};

module.exports = SongSocialMetrics;
