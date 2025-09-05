const db = require("../../DB/connect");

const getMetricsSummary = async () => {
  const [rows] = await db.execute(`
    SELECT
        sm.OPH_ID,
        COUNT(DISTINCT sm.song_id) AS song_count,
        SUM(sm.youtube_views) AS total_views,
        SEC_TO_TIME(
            SUM(TIME_TO_SEC(sm.youtube_avg_view_duration)) / COUNT(DISTINCT sm.song_id)
        ) AS avg_view_duration,
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

const getTopSearchedArtists = async (searchQuery) => {
  const key = `%${searchQuery}%`;

  const [rows] = await db.execute(
    "SELECT kpi.OPH_ID, ud.personal_photo, ud.stage_name, kpi.total_views FROM KPI_score kpi LEFT JOIN user_details ud ON kpi.OPH_ID = ud.ophid WHERE ud.stage_name LIKE ? OR ud.stage_name LIKE ?",
    [key, key]
  );

  return rows;
};

const getTopArtists = async () => {
  const [rows] = await db.execute(`SELECT kpi.OPH_ID, ud.personal_photo, ud.stage_name, kpi.total_views FROM KPI_score kpi LEFT JOIN user_details ud ON kpi.OPH_ID = ud.ophid`);
  return rows;
};

const getArtistProfile = async (ophid) => {
  const [rows] = await db.execute(
    "WITH CTEArtistProfile AS ( SELECT ud.ophid, ud.personal_photo, ud.stage_name, ud.full_name, pd.Profession, sa.artist_name,ud.location, kpi.total_views, pd.Bio,sr.song_id ,sr.Song_name,ssm.youtube_views,ad.audio_url , sr.`status` song_registeration_status, ad.`status` audio_details_status , vd.`status` video_details_status FROM user_details ud LEFT JOIN professional_details pd ON ud.ophid = pd.OPH_ID LEFT JOIN songs_register sr ON ud.ophid = sr.OPH_ID JOIN audio_details ad ON sr.song_id = ad.song_id LEFT JOIN secondary_artist sa ON sr.song_id = sa.song_id JOIN video_details vd ON sr.song_id = vd.song_id LEFT JOIN song_social_metrics ssm ON sr.song_id = ssm.song_id LEFT JOIN KPI_score kpi ON ud.ophid = kpi.OPH_ID WHERE ud.ophid = ?) SELECT * FROM CTEArtistProfile WHERE song_registeration_status = 'Approved' AND audio_details_status = 'approved' AND video_details_status = 'approved'",
    [ophid]
  );

  const [song_count] = await db.execute(
    "WITH CTEArtistSongCount AS (SELECT sr.OPH_ID, sr.`status` song_registration_status , ad.`status` audio_details_status, vd.`status` video_details_status FROM songs_register sr LEFT JOIN audio_details ad ON sr.song_id = ad.song_id LEFT JOIN video_details vd ON sr.song_id = vd.song_id WHERE sr.OPH_ID = ?) SELECT OPH_ID, COUNT(OPH_ID) song_count FROM CTEArtistSongCount WHERE song_registration_status = 'Approved' AND audio_details_status = 'approved' AND video_details_status = 'approved' GROUP BY OPH_ID",
    [ophid]
  );

  let totalSongs = 0;

  if (song_count && song_count.length > 0 && song_count[0].song_count) {
    totalSongs = song_count[0].song_count;
  }
  const songMap = {};

  rows.forEach((row) => {
    const ophid = row.ophid;

    if (!songMap[ophid]) {
      songMap[ophid] = {
        personal_photo: row.personal_photo,
        stage_name: row.stage_name,
        full_name: row.full_name,
        profession: row.Profession,
        location: row.location,
        total_views: row.total_views,
        bio: row.Bio,
        total_content: parseInt(totalSongs),
        songs: [],
      };
    }

    const existingSong = songMap[ophid].songs.find(
      (song) => song.name === row.Song_name
    );

    if (existingSong) {
      if (
        row.artist_name &&
        !existingSong.featuring_artists.includes(row.artist_name)
      ) {
        existingSong.featuring_artists.push(row.artist_name);
      }
    } else {
      songMap[ophid].songs.push({
        name: row.Song_name,
        song_id: row.song_id,
        youtube_views: row.youtube_views,
        audio_file_url: row.audio_url,
        featuring_artists: row.artist_name ? [row.artist_name] : [],
      });
    }
  });

  return songMap[ophid];
};

// Fetch all KPI scores, sorted by score descending
const getAllKpiScores = async () => {
  const [rows] = await db.execute(`
    WITH CTEKPI AS (
      SELECT
        ud.ophid,
        ud.full_name,
        ud.stage_name,
        ud.personal_photo,
        ad.Song_name,
        ad.primary_artist,
        ad.audio_url,
        sa.artist_name,
        kpi.score,
        sr.song_id,
        sr.status AS song_register_status,
        ad.status AS audio_details_status,
        vd.status AS video_details_status
      FROM user_details ud
      LEFT JOIN songs_register sr ON ud.ophid = sr.OPH_ID
      LEFT JOIN audio_details ad ON sr.song_id = ad.song_id
      LEFT JOIN video_details vd ON sr.song_id = vd.song_id
      LEFT JOIN secondary_artist sa ON sr.song_id = sa.song_id
      JOIN KPI_score kpi ON ud.ophid = kpi.OPH_ID
    )
    SELECT *
    FROM CTEKPI`);

    console.log("wqas");
    

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
        songs: [],
      };
    }

    const existingSong = songMap[ophid].songs.find(
      (song) => song.songId === row.song_id
    );

    if (existingSong) {
      if (
        row.artist_name &&
        !existingSong.secondaryArtist.includes(row.artist_name)
      ) {
        existingSong.secondaryArtist.push(row.artist_name);
      }
    } else {
      songMap[ophid].songs.push({
        songId: row.song_id,
        songName: row.Song_name,
        primaryArtist: row.primary_artist,
        audioUrl: row.audio_url,
        secondaryArtist: row.artist_name ? [row.artist_name] : [],
      });
    }
  });

  return songMap;
};

const fetchmonthly = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM KPI_score");
    return rows;
  } catch (error) {
    console.error("DB Error in fetchMonthly:", error);
    throw error;
  }
};

module.exports = {
  getMetricsSummary,
  getAllKpiScores,
  KpiScore,
  getTopSearchedArtists,
  getTopArtists,
  getArtistProfile,
  fetchmonthly,
};
