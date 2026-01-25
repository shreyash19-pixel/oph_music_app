const db = require("../../DB/connect");

const SongSocialMetrics = {
  updateMetrics: async (metrics) => {
    const {
      song_id,
      OPH_ID,
      song_name,
      youtube_views,
      youtube_engagement,
      youtube_avg_view_duration,
      youtube_revenue,
      insta_engagement,
    } = metrics;

    // Check if a MANUAL entry (with non-zero values) was created within the last 48 hours
    // Skip the initial auto-created entry (which has all zero values) from song approval
    const [recentEntry] = await db.execute(
      `SELECT id, created_at FROM song_social_metrics 
       WHERE song_id = ? 
       AND created_at > DATE_SUB(NOW(), INTERVAL 48 HOUR)
       AND (youtube_views > 0 OR youtube_engagement > 0 OR youtube_revenue > 0 OR insta_engagement > 0)
       ORDER BY created_at DESC 
       LIMIT 1`,
      [song_id]
    );

    if (recentEntry.length > 0) {
      const lastCreatedAt = new Date(recentEntry[0].created_at);
      const nextAllowedTime = new Date(lastCreatedAt.getTime() + 48 * 60 * 60 * 1000);
      const hoursRemaining = Math.ceil((nextAllowedTime - new Date()) / (1000 * 60 * 60));
      throw new Error(
        `An entry was already created within the last 48 hours. Please wait approximately ${hoursRemaining} hour(s) before creating a new entry.`
      );
    }

    // Create a new entry with the provided data
    const [result] = await db.execute(
      `INSERT INTO song_social_metrics
      (
        song_id,
        OPH_ID,
        song_name,
        youtube_views,
        youtube_engagement,
        youtube_avg_view_duration,
        youtube_revenue,
        insta_engagement,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        song_id,
        OPH_ID,
        song_name,
        youtube_views,
        youtube_engagement,
        youtube_avg_view_duration,
        youtube_revenue,
        insta_engagement,
      ]
    );

    // If youtube_revenue is provided and > 0, try to insert into artist_income table
    // This is optional - fails gracefully if table doesn't exist
    if (youtube_revenue && parseFloat(youtube_revenue) > 0) {
      try {
        await db.execute(
          `INSERT INTO artist_income (oph_id, song_id, song_name, income_type, amount, description, created_at)
           VALUES (?, ?, ?, 'youtube_revenue', ?, 'YouTube revenue from Content Analysis', NOW())`,
          [OPH_ID, song_id, song_name, youtube_revenue]
        );
      } catch (err) {
        console.log('Note: artist_income table insert skipped (table may not exist yet)');
      }
    }

    return result;
  },

  getAllMetrics: async () => {
    const [rows] = await db.query(`SELECT *
          FROM song_social_metrics
          GROUP BY song_id`);
    return rows;
  },

  getMetricById: async (id) => {
    // Return aggregated/cumulative metrics for the song across all entries
    const [rows] = await db.query(
      `SELECT 
        song_id,
        OPH_ID as oph_id,
        song_name,
        SUM(youtube_views) as youtube_views,
        SUM(youtube_engagement) as youtube_engagement,
        SEC_TO_TIME(SUM(TIME_TO_SEC(youtube_avg_view_duration))) as youtube_avg_view_duration,
        SUM(youtube_revenue) as youtube_revenue,
        SUM(insta_engagement) as insta_engagement,
        MAX(created_at) as last_updated
      FROM song_social_metrics 
      WHERE song_id = ?
      GROUP BY song_id, OPH_ID, song_name`,
      [id],
    );
    return rows[0];
  },

  getMetricByOph: async (OPH_ID) => {
    const [rows] = await db.query(
      `SELECT * FROM song_social_metrics WHERE OPH_ID = ?`,
      [OPH_ID],
    );
    return rows;
  },

  getVideoyId: async (id) => {
    const [rows] = await db.query(
      `SELECT * FROM video_details WHERE song_id = ?`,
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
