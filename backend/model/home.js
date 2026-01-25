const db = require("../DB/connect");

const newReleases = async () => {
  try {
    // Since song tables were removed in Phase 2, return empty object
    // This prevents SQL errors when tables don't exist
    const [rows] = await db.execute(
      "WITH CTESongRankings AS (SELECT sr.song_id, vd.image_url, ad.Song_name, sa.artist_name, ssm.youtube_views, ad.audio_url, ad.primary_artist, sr.`status` song_register_status, ad.`status` audio_details_status, vd.`status` video_details_status FROM song_social_metrics ssm LEFT JOIN songs_register sr ON ssm.song_id = sr.song_id LEFT JOIN audio_details ad ON ssm.song_id = ad.song_id LEFT JOIN video_details vd ON ssm.song_id = vd.song_id LEFT JOIN secondary_artist sa ON ssm.song_id = sa.song_id ORDER BY ssm.youtube_views DESC LIMIT 5) SELECT * FROM CTESongRankings WHERE song_register_status = 'Approved' AND audio_details_status = 'approved' AND video_details_status = 'approved' ",
    );

    const songMap = {};

    rows.forEach((row) => {
      const songId = row.song_id;

      if (!songMap[songId]) {
        songMap[songId] = {
          ophid: row.oph_id,
          songName: row.Song_name,
          primaryArtist: row.primary_artist,
          songId: row.song_id,
          imageUrl: row.image_url ? JSON.parse(row.image_url) : null,
          audioUrl: row.audio_url,
          youtubeViews: row.youtube_views,
          secondaryArtist: [],
        };
      }

      if (row.artist_name) {
        songMap[songId].secondaryArtist.push(row.artist_name);
      } else {
        if (songMap[songId].secondaryArtist.length === 0) {
          songMap[songId].secondaryArtist.push(null);
        }
      }
    });

    return songMap;
  } catch (error) {
    // If tables don't exist (removed in Phase 2), return empty object
    // This prevents frontend crashes
    console.log(
      "Song tables not available (Phase 2), returning empty new releases",
    );
    return {};
  }
};

const getReleatedArtists = async (profession) => {
  const [rows] = await db.execute(
    "SELECT ud.oph_id, ud.personal_photo, ud.stage_name, kpi.total_views FROM user_details ud LEFT JOIN KPI_score kpi ON ud.oph_id = kpi.oph_id LEFT JOIN professional_details pd ON ud.oph_id = pd.oph_id WHERE pd.Profession = ?",
    [profession],
  );
  return rows;
};

const getArtistDetail = async (ophid) => {
  const [rows] = await db.execute(
    `
  WITH CTEArtistDetail AS (
    SELECT 
      ud.oph_id,
      ud.full_name AS name,
      pd.photo_urls AS photos,
      ud.personal_photo,
      ud.stage_name,
      pd.video_url AS video_bio,
      pd.profession AS profession,
      ud.location,
      kpi.total_views,
      pd.bio AS bio,
      pd.facebook_link AS facebook_url,
      pd.instagram_link AS instagram_url,
      ad.song_name AS song_name,
      ad.primary_artist AS primary_artist,
      ssm.youtube_views AS total_song_views,
      ad.audio_url AS audio_url,
      sas.overall_status AS overall_status
    FROM user_details ud
    LEFT JOIN professional_details pd ON ud.oph_id = pd.oph_id
    LEFT JOIN KPI_score kpi ON ud.oph_id = kpi.oph_id
    LEFT JOIN songs_register sr ON ud.oph_id = sr.oph_id
    LEFT JOIN audio_details ad ON sr.song_id = ad.song_id
    LEFT JOIN song_application_status sas ON sr.song_id = sas.song_id
    LEFT JOIN song_social_metrics ssm ON sr.song_id = ssm.song_id
    WHERE ud.oph_id = ?
  )
  SELECT * 
  FROM CTEArtistDetail 
  WHERE overall_status = 'approved'
  `,
    [ophid],
  );

  const [song_count] = await db.execute(
    "WITH CTEArtistSongCount AS (SELECT sr.oph_id, sas.overall_status overall_status FROM songs_register sr LEFT JOIN song_application_status sas ON sr.song_id = sas.song_id  WHERE sr.oph_id = ?) SELECT oph_id, COUNT(oph_id) song_count FROM CTEArtistSongCount WHERE overall_status = 'approved' GROUP BY oph_id",
    [ophid],
  );

  let totalSongs = 0;

  if (song_count && song_count.length > 0 && song_count[0].song_count) {
    totalSongs = song_count[0].song_count;
  }

  const songMap = {};

  rows.forEach((row) => {
    const ophid = row.oph_id;

    if (!songMap[ophid]) {
      songMap[ophid] = {
        name: row.name,
        photos: JSON.parse(row.photos),
        personal_photo: row.personal_photo,
        stage_name: row.stage_name,
        video_bio: row.video_bio,
        profession: row.profession,
        location: row.location,
        total_views: row.total_views,
        total_content: parseInt(totalSongs),
        bio: row.bio,
        facebook_url: row.facebook_url,
        instagram_url: row.instagram_url,
        songs: [
          {
            song_name: row.song_name,
            primaryArtist: row.primary_artist,
            total_song_views: row.total_song_views,
            duration_in_minutes: row.duration_in_minutes,
          },
        ],
      };
    } else {
      songMap[ophid].songs.push({
        song_name: row.song_name,
        primaryArtist: row.primary_artist,
        total_song_views: row.total_song_views,
        duration_in_minutes: row.duration_in_minutes,
      });
    }
  });

  return songMap[ophid];
};

const getUpcomingSong = async (ophid) => {
  try {
    const [rows] = await db.execute(
      `SELECT DISTINCT sre.*, sr.release_date, vd.image_url
FROM song_release sre
LEFT JOIN songs_register sr ON sre.songId = sr.song_id
LEFT JOIN video_details vd ON sr.song_id = vd.song_id
WHERE sre.oph_id = ?
  AND CURDATE() < sr.release_date
ORDER BY sr.release_date
LIMIT 1;
`,
      [ophid],
    );

    let songMap = {};
    if (rows.length !== 0) {
      songMap = {
        song_id: rows[0].songId,
        dateTime: rows[0].release_date,
        EventName: rows[0].song_name,
        image: rows[0].image_url ? JSON.parse(rows[0].image_url) : null,
      };
    }

    return songMap;
  } catch (error) {
    // If tables don't exist (removed in Phase 2), return empty object
    // This prevents frontend crashes
    console.log(
      "Song tables not available (Phase 2), returning empty upcoming song",
    );
    return {};
  }
};

module.exports = {
  newReleases,
  getArtistDetail,
  getReleatedArtists,
  getUpcomingSong,
};
