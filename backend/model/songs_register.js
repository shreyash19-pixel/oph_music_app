const db = require("../DB/connect");

const getSongID = async (name, ophId) => {
  // Get the most recent song_id for the given song name and oph_id
  const [rows] = await db.execute(
    "SELECT song_id FROM songs_register WHERE Song_name = ? AND oph_id = ? ORDER BY created_at DESC LIMIT 1",
    [name, ophId]
  );

  return rows;
};

// Get song_id from insert result (preferred method)
const getSongIdFromInsert = (insertResult) => {
  return insertResult.insertId;
};

// INSERT song record
const insertNewSong = async (
  OPH_ID,
  project_type,
  Song_name,
  release_date,
  Lyrics_services,
  next_step,
  videoType,
  connection = null
) => {
  // Convert Lyrics_services to boolean (1 or 0 for MySQL)
  const lyricsServicesBoolean = Lyrics_services === true || 
                                 Lyrics_services === 'true' || 
                                 Lyrics_services === 1 || 
                                 Lyrics_services === '1' ||
                                 Lyrics_services === 'base + lyrics';
  
  // Convert to integer (1 for true, 0 for false) for MySQL BOOLEAN type
  const lyricsServicesValue = lyricsServicesBoolean ? 1 : 0;
  
  // Use provided connection if available (for transactions), otherwise use pool
  const query = connection || db;
  const [result] = await query.execute(
    `INSERT INTO songs_register 
      (oph_id, project_type, Song_name, release_date, Lyrics_services, current_page, video_type)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      project_type = VALUES(project_type),
      release_date = VALUES(release_date),
      Lyrics_services = VALUES(Lyrics_services),
      current_page = VALUES(current_page),
      video_type = VALUES(video_type)
      `,
      
    [
      OPH_ID,
      project_type,
      Song_name,
      release_date,
      lyricsServicesValue,
      next_step,
      videoType
    ]
  );

  return result;
};

const insertHybridSong = async (
  OPH_ID,
  project_type,
  Song_name,
  release_date,
  Lyrics_services,
  available_on_music_platforms,
  next_step,
  projectsType,
  videoType,
  connection = null
) => {
  // Convert Lyrics_services to boolean (1 or 0 for MySQL)
  const lyricsServicesBoolean = Lyrics_services === true || 
                                 Lyrics_services === 'true' || 
                                 Lyrics_services === 1 || 
                                 Lyrics_services === '1' ||
                                 Lyrics_services === 'base + lyrics';
  
  // Convert to integer (1 for true, 0 for false) for MySQL BOOLEAN type
  const lyricsServicesValue = lyricsServicesBoolean ? 1 : 0;
  
  // Convert availability_on_music_platforms to boolean (1 or 0 for MySQL)
  const availabilityBoolean = available_on_music_platforms === true || 
                               available_on_music_platforms === 'true' || 
                               available_on_music_platforms === 1 || 
                               available_on_music_platforms === '1';
  
  // Convert to integer (1 for true, 0 for false) for MySQL BOOLEAN type
  const availabilityValue = availabilityBoolean ? 1 : 0;
  
  // Use provided connection if available (for transactions), otherwise use pool
  const query = connection || db;
  const [result] = await query.execute(
    `INSERT INTO songs_register 
      (oph_id, project_type, Song_name, release_date, Lyrics_services, availability_on_music_platform, current_page, projects_type, video_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      project_type = VALUES(project_type),
      release_date = VALUES(release_date),
      Lyrics_services = VALUES(Lyrics_services),
      availability_on_music_platform = VALUES(availability_on_music_platform),
      current_page = VALUES(current_page),
      projects_type = VALUES(projects_type),
      video_type = VALUES(video_type)
      `,
    [
      OPH_ID,
      project_type,
      Song_name,
      release_date,
      lyricsServicesValue,
      availabilityValue,
      next_step,
      projectsType,
      videoType
    ]
  );

  return result;
};

const getPendingSongsList = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT sr.song_id, sr.Song_name, sr.project_type, sr.Lyrics_services, sr.release_date, sr.current_page, sr.status as register_status, ad.`status` audio_status , ad.reject_reason audio_reason, vd.`status` video_status, vd.reject_reason video_reason,  p.`status` payment_status, p.reject_reason payment_reason FROM songs_register sr LEFT JOIN audio_details ad ON sr.song_id = ad.song_id LEFT JOIN video_details vd ON sr.song_id = vd.song_id LEFT JOIN payments p ON sr.song_id = p.song_id AND (p.from_source = 'Song Registration' OR p.from_source = 'Song Repayment') WHERE sr.oph_id = ?",
    [ophid]
  );

  const songDetails = {};
  var firstRejectedStep = "";
  var firstRejectedStepReason = "";
  var currentStep = "";
  var status = "";
  rows.forEach((row) => {
    const songId = row.song_id;

    if (!songDetails[songId]) {
      if (row.audio_status === "rejected") {
        firstRejectedStep = "Audio Details has been rejected";
        firstRejectedStepReason = row.audio_reason;
        currentStep = "/dashboard/upload-song/audio-metadata/";
        status = row.audio_status;
      } else if (row.video_status === "rejected") {
        firstRejectedStep = "Video Details has been rejected";
        firstRejectedStepReason = row.video_reason;
        currentStep = "/dashboard/upload-song/video-metadata/";
        status = row.video_status;
      } else if (row.payment_status === "rejected") {
        firstRejectedStep = "Payment Details has been rejected";
        firstRejectedStepReason = row.payment_reason;
        currentStep = "/dashboard/upload-song/video-metadata/";
        status = row.payment_status;
      } else if (
        row.audio_status === null ||
        row.video_status === null ||
        row.payment_status === null ||
        row.register_status === "Pending" ||
        row.register_status === "draft"
      ) {
        status = "draft";
        firstRejectedStepReason = "";
        firstRejectedStep = "";
        currentStep = row.current_page || "/dashboard/upload-song/audio-metadata/";
      } else if (
        row.audio_status === "approved" &&
        row.video_status === "approved" &&
        row.payment_status === "approved"
      ) {
        status = "approved";
        firstRejectedStepReason = "";
        firstRejectedStep = "";
        currentStep = "";
      } else if (
        row.audio_status === "under review" ||
        row.video_status === "under review" ||
        row.payment_status === "under review"
      ) {
        status = "under review";
        firstRejectedStepReason = "";
        firstRejectedStep = "";
        currentStep = "";
      }

      songDetails[songId] = {
        Song_name: row.Song_name,
        status: status,
        song_id: row.song_id,
        reject_reason: firstRejectedStepReason,
        next_page: currentStep,
        projectType: row.project_type,
        release_date: row.release_date,
        firstRejectedStep: firstRejectedStep,
        lyrical_services: row.Lyrics_services
      };
    }
  });
  
  return songDetails;
};

const updateSongStatusToDraft = async (song_id, oph_id) => {
  const [result] = await db.execute(
    "UPDATE songs_register SET status = 'draft', updated_at = NOW() WHERE song_id = ? AND oph_id = ?",
    [song_id, oph_id]
  );
  return result;
};

const getSongById = async (song_id, oph_id, connection = null) => {
  // Use provided connection if available (for transactions), otherwise use pool
  const query = connection || db;
  const [rows] = await query.execute(
    "SELECT song_id, oph_id, Song_name FROM songs_register WHERE song_id = ? AND oph_id = ?",
    [song_id, oph_id]
  );
  return rows[0] || null;
};

const updateSongStatusToUnderReview = async (connection, song_id, oph_id) => {
  const [result] = await connection.execute(
    "UPDATE songs_register SET status = 'under review', updated_at = NOW() WHERE song_id = ? AND oph_id = ?",
    [song_id, oph_id]
  );
  return result;
};

const updateReleaseDate = async (song_id, oph_id, release_date) => {
  const [result] = await db.execute(
    "UPDATE songs_register SET release_date = ?, updated_at = NOW() WHERE song_id = ? AND (oph_id = ? OR OPH_ID = ?)",
    [release_date, song_id, oph_id, oph_id]
  );
  return result;
};

module.exports = {
  insertNewSong,
  insertHybridSong,
  getSongID,
  getSongIdFromInsert,
  getPendingSongsList,
  updateSongStatusToDraft,
  getSongById,
  updateSongStatusToUnderReview,
  updateReleaseDate,
};
