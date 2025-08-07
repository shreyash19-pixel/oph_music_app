const db = require("../../DB/connect");

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

  updateMetrics: async (metrics) => {
    const {
      song_id,
      youtube_views,
      youtube_engagement,
      youtube_avg_view_duration,
      youtube_revenue,
      insta_engagement,
    } = metrics;

    const [result] = await db.execute(
      `INSERT INTO song_social_metrics_bkp
       (song_id, youtube_views, youtube_engagement, youtube_avg_view_duration, youtube_revenue, insta_engagement)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        song_id,
        youtube_views,
        youtube_engagement,
        youtube_avg_view_duration,
        youtube_revenue,
        insta_engagement,
      ],
    );

    return result;
  },

  getAllMetrics: async () => {
    const [rows] = await db.execute(
      `SELECT *
      FROM song_social_metrics_bkp
      GROUP BY song_id;`,
    );
    return rows;
  },

  getMetricById: async (id) => {
    const [rows] = await db.execute(
      `SELECT * FROM song_social_metrics_bkp WHERE song_id = ?`,
      [id],
    );
    return rows[0];
  },
};

module.exports = SongSocialMetrics;

// SELECT
//   OPH_ID,
//   SUM(youtube_views) AS total_youtube_views,
//   COUNT(DISTINCT song_id) AS distinct_song_count
// FROM song_social_metrics_bkp
// GROUP BY OPH_ID;

// SELECT
//   id,
//   song_id,
//   OPH_ID,
//   song_name,
//   youtube_views,
//   youtube_engagement,
//   youtube_avg_view_duration,
//   youtube_revenue,
//   insta_engagement,
//   traffic,
//   Date,
//   created_at,
//   updated_at,

//   -- Cumulative sums per (song_id, OPH_ID), ordered by Date
//   SUM(youtube_views) OVER (
//     PARTITION BY song_id, OPH_ID
//     ORDER BY Date ASC
//   ) AS cumulative_youtube_views,

//   SUM(youtube_engagement) OVER (
//     PARTITION BY song_id, OPH_ID
//     ORDER BY Date ASC
//   ) AS cumulative_youtube_engagement,

//   SEC_TO_TIME(SUM(TIME_TO_SEC(youtube_avg_view_duration)) OVER (
//     PARTITION BY song_id, OPH_ID
//     ORDER BY Date ASC
//   )) AS cumulative_youtube_avg_view_duration,

//   SUM(youtube_revenue) OVER (
//     PARTITION BY song_id, OPH_ID
//     ORDER BY Date ASC
//   ) AS cumulative_youtube_revenue,

//   SUM(insta_engagement) OVER (
//     PARTITION BY song_id, OPH_ID
//     ORDER BY Date ASC
//   ) AS cumulative_insta_engagement

// FROM song_social_metrics_bkp
// ORDER BY song_id ASC, OPH_ID ASC, Date ASC;
