const db = require("../../DB/connect");

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
};

const KpiScore = async ({
  OPH_ID,
  user_traffic,
  song_count,
  total_views,
  avg_view_duration,
  total_accepted_events,
  score,
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
    score,
  ]);
};

// const getTopSearchedArtists = asybc 

// Fetch all KPI scores, sorted by score descending
const getAllKpiScores = async () => {
  const [rows] = await db.execute(
    "WITH CTEKPI AS (SELECT  ud.ophid, ud.full_name, ud.stage_name, ud.personal_photo, ad.Song_name, ad.primary_artist, ad.audio_url ,sa.artist_name, kpi.score, sr.song_id , sr.`status` song_register_status, ad.`status` audio_details_status, vd.`status` video_details_status FROM user_details ud LEFT JOIN songs_register sr ON ud.ophid = sr.OPH_ID LEFT JOIN audio_details ad ON sr.song_id = ad.song_id LEFT JOIN video_details vd ON sr.song_id = vd.song_id LEFT JOIN secondary_artist sa ON sr.song_id = sa.song_id JOIN KPI_score kpi ON ud.ophid = kpi.OPH_ID) SELECT * FROM CTEKPI WHERE song_register_status = 'Approved' AND audio_details_status = 'approved' AND video_details_status = 'approved'"
  );

  const songMap = {};

  rows.forEach((row) => {
    const ophid = row.ophid;

    if (!songMap[ophid]) {
      songMap[ophid] = {
        ophid: row.ophid,
        fullName: row.full_name,
        stageName: row.stage_name,
        personalPhoto: row.personal_photo,
        kpiScore: row.score,
        songs: [
          {
            songId: row.song_id,
            songName: row.Song_name,
            primaryArtist: row.primary_artist,
            audioUrl: row.audio_url,
            secondaryArtist: [row.artist_name],
          },
        ],
      };
    } else {
      if(songMap[ophid].songs[0].songId === row.song_id)
      {
        songMap[ophid].songs[0].secondaryArtist.push(row.artist_name)
        return
      }
      songMap[ophid].songs.push({
        songId: row.song_id,
        songName: row.Song_name,
        primaryArtist: row.primary_artist,
        audioUrl: row.audio_url,
        secondaryArtist: [row.artist_name],
      });
    }
  });

  return songMap;
};

module.exports = { getMetricsSummary, getAllKpiScores, KpiScore };
