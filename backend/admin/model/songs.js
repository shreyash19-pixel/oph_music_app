const db = require('../../DB/connect');

getAllSongs = async () => {
  const [rows] = await db.execute(` SELECT sr.*
FROM songs_register sr
JOIN audio_details ad ON sr.song_id = ad.song_id
JOIN video_details vd ON sr.song_id = vd.song_id
WHERE (
    ad.status IN ('under review', 'approved')
    OR vd.status IN ('under review', 'approved')
)
AND NOT (
    ad.status = 'approved'
    AND vd.status = 'approved'
);`);
  return rows;
};

const getSongsByOphIdUnderReview = async (ophId,songId) => {
   const [rows] = await db.execute(`
    SELECT 
    sr.OPH_ID,
    sr.project_type,
    sr.Song_name AS register_song_name,
    sr.release_date,
    sr.payment,
    sr.Lyrics_services,
    sr.availability_on_music_platform,
    sr.song_id,
    sr.current_page,
    sr.reject_reason AS register_reject_reason,
    sr.status AS register_status,

    ad.Song_name AS audio_song_name,
    ad.language,
    ad.genre,
    ad.sub_genre,
    ad.mood,
    ad.lyrics,
    ad.primary_artist,
    ad.audio_url,
    ad.reject_reason AS audio_reject_reason,
    ad.status AS audio_status,

    vd.credits,
    vd.image_url,
    vd.video_url,
    vd.created_at,
    vd.reject_reason AS video_reject_reason,
    vd.status AS video_status,

    -- Secondary artist details
    GROUP_CONCAT(sa.artist_type SEPARATOR ', ') AS secondary_artist_types,
    GROUP_CONCAT(sa.artist_name SEPARATOR ', ') AS secondary_artist_names,
    GROUP_CONCAT(sa.Legal_name SEPARATOR ', ') AS secondary_legal_names

FROM songs_register sr
LEFT JOIN audio_details ad ON sr.song_id = ad.song_id
LEFT JOIN video_details vd ON sr.song_id = vd.song_id
LEFT JOIN secondary_artist sa ON sr.song_id = sa.song_id

WHERE sr.OPH_ID = ?
  AND sr.song_id = ?
  AND (
        sr.status = 'Pending'
     OR ad.status = 'under review'
     OR vd.status = 'under review'
  )

GROUP BY sr.song_id;
`, [ophId,songId]);

  return rows;
}

const getAllApprovedSongs = async () => {
  const query = `
    SELECT 
        sr.OPH_ID,
        sr.project_type,
        sr.Song_name AS register_song_name,
        sr.release_date,
        sr.payment,
        sr.Lyrics_services,
        sr.availability_on_music_platform,
        sr.song_id,
        sr.current_page,
        
        ad.Song_name AS audio_song_name,
        ad.language,
        ad.genre,
        ad.sub_genre,
        ad.mood,
        ad.lyrics,
        ad.primary_artist,
        ad.audio_url,
        ad.reject_reason AS audio_reject_reason,
        ad.status AS audio_status,
        
        vd.credits,
        vd.image_url,
        vd.video_url,
        vd.created_at,
        vd.reject_reason AS video_reject_reason,
        vd.status AS video_status

    FROM songs_register sr
    LEFT JOIN audio_details ad ON sr.song_id = ad.song_id
    LEFT JOIN video_details vd ON sr.song_id = vd.song_id
    WHERE ad.status = 'approved'
      AND vd.status = 'approved';
  `;

  const [rows] = await db.execute(query);
  return rows;
};

const updateSongStatus = async (table, status, reason, songId, ophid) => {
  let query = `UPDATE ${table} SET status = ?, reject_reason = ? WHERE song_id = ?`;
  const values = [status.toLowerCase(), reason, songId];

  
  if (table === "audio_details" && ophid) {
    query += ` AND oph_id = ?`;
    values.push(ophid);
  }

  const [result] = await db.execute(query, values);
  return result;
};

const getSongsByOphIdApproved= async (ophId,songId) => {
   const [rows] = await db.execute(`
   SELECT 
        sr.OPH_ID,
        sr.project_type,
        sr.Song_name AS register_song_name,
        sr.release_date,
        sr.payment,
        sr.Lyrics_services,
        sr.availability_on_music_platform,
        sr.song_id,
        sr.current_page,
        sr.song_register_journey,
        
        ad.Song_name AS audio_song_name,
        ad.language,
        ad.genre,
        ad.sub_genre,
        ad.mood,
        ad.lyrics,
        ad.primary_artist,
        ad.featuring,
        ad.lyricist,
        ad.composer,
        ad.producer,
        ad.audio_url,
        ad.reject_reason AS audio_reject_reason,
        ad.status AS audio_status,
        
        vd.credits,
        vd.image_url,
        vd.video_url,
        vd.created_at,
        vd.reject_reason AS video_reject_reason,
        vd.status AS video_status

    FROM songs_register sr
    LEFT JOIN audio_details ad ON sr.song_id = ad.song_id
    LEFT JOIN video_details vd ON sr.song_id = vd.song_id
    WHERE sr.OPH_ID = ?
      AND sr.song_id = ?
      AND (ad.status = 'approved' AND vd.status = 'approved');
  `, [ophId,songId]);

  return rows;
}


module.exports ={getAllSongs,getSongsByOphIdUnderReview,getAllApprovedSongs,updateSongStatus,getSongsByOphIdApproved}