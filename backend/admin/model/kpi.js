const db = require('../../DB/connect');


  const getMetricsSummary = async () => {
    const [rows] = await db.execute(`
      SELECT 
        sm.OPH_ID,
        COUNT(*) AS song_count,
        SUM(sm.youtube_views) AS total_views,
        SEC_TO_TIME(SUM(TIME_TO_SEC(sm.youtube_avg_view_duration)) / COUNT(*)) AS avg_view_duration,
        SUM(sm.insta_engagement) AS total_insta_engagement,
        IFNULL(ud.traffic, 0) AS user_traffic,
        IFNULL(ep.accepted_event_count, 0) AS total_accepted_events
      FROM 
        OphData.song_social_metrics sm
      LEFT JOIN (
        SELECT 
          OPH_ID,
          COUNT(*) AS accepted_event_count
        FROM 
          event_participants
        WHERE 
          status = 'accepted'
        GROUP BY 
          OPH_ID
      ) ep ON sm.OPH_ID = ep.OPH_ID
      LEFT JOIN 
        user_details ud ON sm.OPH_ID = ud.ophid
      GROUP BY 
        sm.OPH_ID;
    `);

    return rows;
  }


const KpiScore = async ({
  OPH_ID,
  user_traffic,
  song_count,
  total_views,
  avg_view_duration,
  total_accepted_events,
  score
}) => {
  const query = `
    INSERT INTO KPI_score (
      OPH_ID, user_traffic, song_count, total_views,
      avg_view_duration, total_accepted_events, score
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      user_traffic = VALUES(user_traffic),
      song_count = VALUES(song_count),
      total_views = VALUES(total_views),
      avg_view_duration = VALUES(avg_view_duration),
      total_accepted_events = VALUES(total_accepted_events),
      score = VALUES(score)
  `;

  await db.execute(query, [
    OPH_ID,
    user_traffic,
    song_count,
    total_views,
    avg_view_duration,
    total_accepted_events,
    score
  ]);
};

// Fetch all KPI scores, sorted by score descending
const getAllKpiScores = async () => {
  const [rows] = await db.execute("SELECT * FROM KPI_score ORDER BY score DESC");
  return rows;
};

module.exports = {getMetricsSummary,getAllKpiScores,KpiScore};
