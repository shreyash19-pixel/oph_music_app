const db = require("../DB/connect");

const parseVideoImageUrl = (raw) => {
  if (raw == null || raw === "") return null;
  if (typeof raw === "object") return raw;
  const s = String(raw).trim();
  if (!s) return null;
  try {
    return JSON.parse(s);
  } catch {
    return [s];
  }
};

/**
 * Top approved platform songs by YouTube views (from song_social_metrics).
 * @param {string|null|undefined} excludeOphId — logged-in artist; their songs are omitted
 */
const newReleases = async (excludeOphId = null) => {
  try {
    const exclude =
      excludeOphId != null && String(excludeOphId).trim() !== ""
        ? String(excludeOphId).trim()
        : null;
    const excludeClause = exclude ? "AND sr.oph_id <> ?" : "";
    const params = exclude ? [exclude] : [];

    const [rows] = await db.execute(
      `SELECT
        b.song_id,
        b.oph_id,
        b.image_url,
        b.Song_name,
        b.audio_url,
        b.primary_artist,
        b.youtube_views,
        sa.artist_name
      FROM (
        SELECT
          sr.song_id,
          sr.oph_id,
          vd.image_url,
          ad.Song_name AS Song_name,
          ad.audio_url,
          ad.primary_artist,
          COALESCE(ssm.youtube_views, 0) AS youtube_views
        FROM songs_register sr
        INNER JOIN song_application_status sas ON sr.song_id = sas.song_id
        INNER JOIN audio_details ad ON sr.song_id = ad.song_id
        INNER JOIN video_details vd ON sr.song_id = vd.song_id
        LEFT JOIN song_social_metrics ssm ON sr.song_id = ssm.song_id
        WHERE LOWER(TRIM(COALESCE(sas.overall_status, ''))) = 'approved'
          AND ad.status = 'approved'
          AND vd.status = 'approved'
          AND ad.audio_url IS NOT NULL
          AND TRIM(ad.audio_url) <> ''
          ${excludeClause}
        ORDER BY COALESCE(ssm.youtube_views, 0) DESC, sr.song_id ASC
        LIMIT 60
      ) b
      LEFT JOIN secondary_artist sa ON b.song_id = sa.song_id
      ORDER BY b.youtube_views DESC, b.song_id ASC`,
      params,
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
          imageUrl: parseVideoImageUrl(row.image_url),
          audioUrl: row.audio_url,
          youtubeViews: Number(row.youtube_views) || 0,
          secondaryArtist: [],
        };
      }

      if (row.artist_name) {
        songMap[songId].secondaryArtist.push(row.artist_name);
      } else if (songMap[songId].secondaryArtist.length === 0) {
        songMap[songId].secondaryArtist.push(null);
      }
    });

    return songMap;
  } catch (error) {
    console.log(
      "Song tables not available (Phase 2), returning empty new releases",
      error?.message || error,
    );
    return {};
  }
};

const getReleatedArtists = async (profession) => {
  if (
    profession === undefined ||
    profession === null ||
    String(profession).trim() === ""
  ) {
    return [];
  }
  const q = String(profession).trim();
  const isNumericId = /^[0-9]+$/.test(q);

  const [rows] = await db.execute(
    `SELECT
       ud.oph_id AS oph_id,
       ud.oph_id AS ophid,
       ud.personal_photo,
       ud.stage_name,
       IFNULL(kpi.total_views, 0) AS total_views
     FROM user_details ud
     INNER JOIN professional_details pd ON ud.oph_id = pd.OPH_ID
     LEFT JOIN KPI_score kpi ON ud.oph_id = kpi.oph_id
     WHERE ${
       isNumericId
         ? `(
             TRIM(CAST(pd.Profession AS CHAR)) = TRIM(?)
             OR CAST(pd.Profession AS UNSIGNED) = ?
             OR LOWER(TRIM(CAST(pd.Profession AS CHAR))) = LOWER(
               (SELECT TRIM(name) FROM professions WHERE id = ? LIMIT 1)
             )
           )`
         : `LOWER(TRIM(CAST(pd.Profession AS CHAR))) = LOWER(TRIM(?))`
     }
     ORDER BY IFNULL(kpi.total_views, 0) DESC
     LIMIT 48`,
    isNumericId ? [q, Number(q), Number(q)] : [q],
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
    pd.spotify_link AS spotify_url,
    pd.apple_music_link AS apple_music_url,
    ad.song_name AS song_name,
    ad.song_id,
    ad.primary_artist AS primary_artist,
    ad.audio_url AS audio_url,
    sas.overall_status AS overall_status,
    SUM(ssm.youtube_views) AS total_song_views
  FROM user_details ud
  LEFT JOIN professional_details pd ON ud.oph_id = pd.OPH_ID
  LEFT JOIN KPI_score kpi ON ud.oph_id = kpi.oph_id
  LEFT JOIN songs_register sr ON ud.oph_id = sr.oph_id
  LEFT JOIN audio_details ad ON sr.song_id = ad.song_id
  LEFT JOIN song_application_status sas ON sr.song_id = sas.song_id
  LEFT JOIN song_social_metrics ssm ON sr.song_id = ssm.song_id
  WHERE ud.oph_id = ?
  GROUP BY
    ud.oph_id,
    ud.full_name,
    pd.photo_urls,
    ud.personal_photo,
    ud.stage_name,
    pd.video_url,
    pd.profession,
    ud.location,
    kpi.total_views,
    pd.bio,
    pd.facebook_link,
    pd.instagram_link,
    pd.spotify_link,
    pd.apple_music_link,
    ad.song_id,
    ad.song_name,
    ad.primary_artist,
    ad.audio_url,
    sas.overall_status
)
SELECT *
FROM CTEArtistDetail
WHERE overall_status = 'approved';

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
        oph_id: ophid,
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
        spotify_url: row.spotify_url,
        apple_music_url: row.apple_music_url,
        songs: [
          {
            song_id: row.song_id,
            song_name: row.song_name,
            primaryArtist: row.primary_artist,
            primary_artist: row.primary_artist,
            total_song_views: row.total_song_views,
            audio_url: row.audio_url,
            audio_file_url: row.audio_url,
          },
        ],
      };
    } else {
      songMap[ophid].songs.push({
        song_id: row.song_id,
        song_name: row.song_name,
        primaryArtist: row.primary_artist,
        primary_artist: row.primary_artist,
        total_song_views: row.total_song_views,
        audio_url: row.audio_url,
        audio_file_url: row.audio_url,
      });
    }
  });

  if (songMap[ophid]) {
    return songMap[ophid];
  }

  const [fb] = await db.execute(
    `SELECT ud.oph_id, ud.full_name AS name, pd.photo_urls AS photos, ud.personal_photo, ud.stage_name,
            pd.video_url AS video_bio, pd.profession AS profession, ud.location, IFNULL(kpi.total_views, 0) AS total_views,
            pd.bio AS bio, pd.facebook_link AS facebook_url, pd.instagram_link AS instagram_url,
            pd.spotify_link AS spotify_url, pd.apple_music_link AS apple_music_url
     FROM user_details ud
     LEFT JOIN professional_details pd ON ud.oph_id = pd.OPH_ID
     LEFT JOIN KPI_score kpi ON ud.oph_id = kpi.OPH_ID
     WHERE ud.oph_id = ?
     LIMIT 1`,
    [ophid],
  );
  if (!fb || fb.length === 0) {
    return null;
  }
  const row = fb[0];
  let photos = [];
  try {
    photos = row.photos ? JSON.parse(row.photos) : [];
  } catch {
    photos = [];
  }
  if (!Array.isArray(photos) || photos.length === 0) {
    photos = row.personal_photo ? [row.personal_photo] : [];
  }

  return {
    oph_id: ophid,
    name: row.name,
    photos,
    personal_photo: row.personal_photo,
    stage_name: row.stage_name,
    video_bio: row.video_bio,
    profession: row.profession,
    location: row.location,
    total_views: row.total_views,
    total_content: parseInt(totalSongs, 10) || 0,
    bio: row.bio,
    facebook_url: row.facebook_url,
    instagram_url: row.instagram_url,
    spotify_url: row.spotify_url,
    apple_music_url: row.apple_music_url,
    songs: [],
  };
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
      const r = rows[0];
      let image = null;
      if (r.image_url) {
        try {
          image = JSON.parse(r.image_url);
        } catch {
          image = r.image_url;
        }
      }
      songMap = {
        song_id: r.songId,
        dateTime: r.release_date,
        EventName: r.song_name,
        image,
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
