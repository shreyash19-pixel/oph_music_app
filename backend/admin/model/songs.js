const db = require('../../DB/connect');

getAllSongs = async () => {
  const [rows] = await db.query(`SELECT sr.*
FROM songs_register sr
JOIN audio_details ad ON sr.song_id = ad.song_id
JOIN video_details vd ON sr.song_id = vd.song_id
WHERE (
    ad.status IN ('under review')
    OR vd.status IN ('under review')
)
AND ad.status != 'rejected'
AND vd.status != 'rejected'
`);
  return Array.isArray(rows) ? rows : [];
};

const getSongsByOphIdUnderReview = async (ophId,songId) => {
   const [rows] = await db.execute(`
    SELECT 
    sr.oph_id AS OPH_ID,
    sr.project_type,
    sr.Song_name AS register_song_name,
    sr.release_date,
    sr.Lyrics_services,
    sr.availability_on_music_platform,
    sr.song_id,
    sr.current_page,
    sr.reject_reason AS register_reject_reason,
    sr.status AS register_status,
    sr.projects_type AS register_projects_type,
    sr.video_type AS register_video_type,

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

WHERE sr.oph_id = ?
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
    sr.oph_id AS OPH_ID,
    sr.project_type,
    sr.Song_name AS register_song_name,
    sr.release_date,
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
LEFT JOIN audio_details ad 
       ON sr.song_id = ad.song_id
LEFT JOIN video_details vd 
       ON sr.song_id = vd.song_id
LEFT JOIN song_application_status sas 
       ON sr.song_id = sas.song_id
WHERE ad.status = 'approved'
  AND vd.status = 'approved'
  AND sas.overall_status = 'approved';

  `;

  const [rows] = await db.execute(query);
  return rows;
};

const updateSongSectionStatus = async (table, status, reason, songId, ophid) => {
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
   const [rows] = await db.execute(`SELECT 
    sr.oph_id AS OPH_ID,
    sr.project_type,
    sr.Song_name AS register_song_name,
    sr.release_date,
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
    vd.status AS video_status,

    -- Secondary artist fields
    GROUP_CONCAT(sa.artist_type SEPARATOR ', ') AS secondary_artist_types,
    GROUP_CONCAT(sa.artist_name SEPARATOR ', ') AS secondary_artist_names,
    GROUP_CONCAT(sa.Legal_name SEPARATOR ', ') AS secondary_legal_names

FROM songs_register sr
LEFT JOIN audio_details ad ON sr.song_id = ad.song_id
LEFT JOIN video_details vd ON sr.song_id = vd.song_id
LEFT JOIN secondary_artist sa ON sr.song_id = sa.song_id

WHERE sr.oph_id = ?
  AND sr.song_id = ?
  AND (ad.status = 'approved' AND vd.status = 'approved')

GROUP BY sr.song_id;
`, [ophId,songId]);

  return rows;
};

const updateSongStatus = async (songId, ophid, reason) => {
  // This function is now handled by AdminSongService.recalculateSongStatus
  // Keeping for backward compatibility but delegating to service
  const AdminSongService = require('../services/AdminSongService');
  const connection = await db.getConnection();
  
  try {
    await AdminSongService.recalculateSongStatus(connection, songId, ophid, reason);
    return { affectedRows: 1 };
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// Update audio details
const updateAudioDetails = async (songId, ophId, audioData) => {
  const {
    Song_name,
    language,
    genre,
    sub_genre,
    mood,
    lyrics,
    primary_artist,
    audio_url,
    reject_reason
  } = audioData;

  // Build dynamic query to only update provided fields
  const updateFields = [];
  const values = [];

  if (Song_name !== undefined) {
    updateFields.push('Song_name = ?');
    values.push(Song_name || null);
  }
  if (language !== undefined) {
    updateFields.push('language = ?');
    values.push(language || null);
  }
  if (genre !== undefined) {
    updateFields.push('genre = ?');
    values.push(genre || null);
  }
  if (sub_genre !== undefined) {
    updateFields.push('sub_genre = ?');
    values.push(sub_genre || null);
  }
  if (mood !== undefined) {
    updateFields.push('mood = ?');
    values.push(mood || null);
  }
  if (lyrics !== undefined) {
    updateFields.push('lyrics = ?');
    values.push(lyrics || null);
  }
  if (primary_artist !== undefined) {
    updateFields.push('primary_artist = ?');
    values.push(primary_artist || null);
  }
  if (audio_url !== undefined) {
    updateFields.push('audio_url = ?');
    values.push(audio_url || null);
  }
  if (reject_reason !== undefined) {
    updateFields.push('reject_reason = ?');
    values.push(reject_reason || null);
  }

  if (updateFields.length === 0) {
    throw new Error('No fields to update');
  }

  const query = `
    UPDATE audio_details 
    SET ${updateFields.join(', ')}
    WHERE song_id = ? AND OPH_ID = ?
  `;

  values.push(songId, ophId);

  const [result] = await db.execute(query, values);
  return result;
};

// Update video details with image validation (max 3 images)
const updateVideoDetails = async (songId, videoData) => {
  const {
    credits,
    image_url,
    video_url,
    reject_reason
  } = videoData;

  // Build dynamic query to only update provided fields
  const updateFields = [];
  const values = [];

  if (credits !== undefined) {
    updateFields.push('credits = ?');
    values.push(credits || null);
  }
  if (video_url !== undefined) {
    updateFields.push('video_url = ?');
    values.push(video_url || null);
  }
  if (reject_reason !== undefined) {
    updateFields.push('reject_reason = ?');
    values.push(reject_reason || null);
  }
  if (image_url !== undefined) {
    // Validate image_url - ensure it's an array with max 3 images
    let processedImageUrl = image_url;
    if (Array.isArray(image_url)) {
      if (image_url.length > 3) {
        throw new Error('Maximum 3 images allowed for video section');
      }
      // Convert array to JSON string for storage
      processedImageUrl = JSON.stringify(image_url);
    } else if (typeof image_url === 'string') {
      // If it's a string, try to parse it as JSON array
      try {
        const parsed = JSON.parse(image_url);
        if (Array.isArray(parsed) && parsed.length > 3) {
          throw new Error('Maximum 3 images allowed for video section');
        }
      } catch (e) {
        // If it's not JSON, treat as single image
        processedImageUrl = image_url;
      }
    }
    
    updateFields.push('image_url = ?');
    values.push(processedImageUrl || null);
  }

  if (updateFields.length === 0) {
    throw new Error('No fields to update');
  }

  const query = `
    UPDATE video_details 
    SET ${updateFields.join(', ')}
    WHERE song_id = ?
  `;

  values.push(songId);

  const [result] = await db.execute(query, values);
  return result;
};

// Get current video details to check image count
const getVideoDetails = async (songId) => {
  const query = `SELECT image_url FROM video_details WHERE song_id = ?`;
  const [rows] = await db.execute(query, [songId]);
  return rows[0];
};

module.exports = {
  getAllSongs,
  getSongsByOphIdUnderReview,
  getAllApprovedSongs,
  updateSongSectionStatus,
  updateSongStatus,
  getSongsByOphIdApproved,
  updateAudioDetails,
  updateVideoDetails,
  getVideoDetails
};