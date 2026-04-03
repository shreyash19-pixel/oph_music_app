const db = require("../DB/connect");

const getArtistInfo = async (ophid) => {
  const [rows] = await db.execute(
    `SELECT
      ud.oph_id,
      ud.full_name,
      ud.personal_photo,
      ud.stage_name,
      ud.notes,
      pd.profession AS Profession,
      pd.bio AS Bio
    FROM user_details ud
    LEFT JOIN professional_details pd ON ud.oph_id = pd.oph_id
    WHERE ud.oph_id = ?`,
    [ophid],
  );
  return rows;
};

const getSongsRankingsById = async (ophid) => {
  const [rows] = await db.execute(
    `
      WITH CTESongStatus AS (
        SELECT 
          sr.OPH_ID, 
          ad.primary_artist,
          sr.Song_name, 
          sr.song_id, 
          sr.status AS song_register_status,
          ad.status AS audio_details_status,
          ad.audio_url,
          vd.status AS video_details_status,
          sup.Status payment_status,
          sa.artist_type,
          sa.artist_name,
          sa.Legal_name,
          sa.artistPictureUrl,
          sa.SpotifyLink,
          sa.InstagramLink,
          sa.FacebookLink,
          sa.AppleMusicLink,
          sa.created_at
        FROM songs_register sr 
        LEFT JOIN audio_details ad ON sr.song_id = ad.song_id 
        LEFT JOIN video_details vd ON sr.song_id = vd.song_id 
        LEFT JOIN secondary_artist sa ON sr.song_id = sa.song_id 
        LEFT JOIN payments sup ON sr.song_id = sup.song_id
        WHERE sr.OPH_ID = ?
      ) 
      SELECT * FROM CTESongStatus 
      WHERE 
        audio_details_status = 'approved' 
        AND video_details_status = 'approved'
        AND payment_status = 'approved'
    `,
    [ophid]
  );

  // Transform into desired structure
  const songMap = {};

  rows.forEach((row) => {
    const songId = row.song_id;

    if (!songMap[songId]) {
      // Initialize song structure
      songMap[songId] = {
        OPH_ID: row.OPH_ID,
        primary_artist: row.primary_artist,
        Song_name: row.Song_name,
        song_id: row.song_id,
        song_register_status: row.song_register_status,
        audio_details_status: row.audio_details_status,
        video_details_status: row.video_details_status,
        audio_url: row.audio_url,
        secondary_artists: [],
      };
    }

    // Add secondary artist only if there is data
    if (
      row.artist_type ||
      row.artist_name ||
      row.Legal_name ||
      row.artistPictureUrl ||
      row.SpotifyLink ||
      row.InstagramLink ||
      row.FacebookLink ||
      row.AppleMusicLink ||
      row.created_at
    ) {
      songMap[songId].secondary_artists.push({
        song_id: row.song_id,
        artist_type: row.artist_type,
        artist_name: row.artist_name,
        Legal_name: row.Legal_name,
        artistPictureUrl: row.artistPictureUrl,
        SpotifyLink: row.SpotifyLink,
        InstagramLink: row.InstagramLink,
        FacebookLink: row.FacebookLink,
        AppleMusicLink: row.AppleMusicLink,
        created_at: row.created_at,
      });
    } else {
      // Push empty object once if no secondary artist (optional)
      if (songMap[songId].secondary_artists.length === 0) {
        songMap[songId].secondary_artists.push({
          song_id: null,
          artist_type: null,
          artist_name: null,
          Legal_name: null,
          artistPictureUrl: null,
          SpotifyLink: null,
          InstagramLink: null,
          FacebookLink: null,
          AppleMusicLink: null,
          created_at: null,
        });
      }
    }
  });

  return songMap;
};

module.exports = { getArtistInfo, getSongsRankingsById };
