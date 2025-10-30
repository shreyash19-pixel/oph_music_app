const db = require("../DB/connect");

const getSongID = async (name) => {
  const [rows] = await db.execute(
    "SELECT song_id FROM songs_register WHERE Song_name = ?",
    [name]
  );

  return rows;
};

// INSERT song record
const insertNewSong = async (
  OPH_ID,
  project_type,
  Song_name,
  release_date,
  payment,
  Lyrics_services,
  next_step,
  videoType
) => {
  const [result] = await db.execute(
    `INSERT INTO songs_register 
      (OPH_ID, project_type, Song_name, release_date, payment, Lyrics_services, current_page, video_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      project_type = VALUES(project_type),
      release_date = VALUES(release_date),
      payment = VALUES(payment),
      Lyrics_services = VALUES(Lyrics_services),
      current_page = VALUES(current_page),
      video_type = VALUES(video_type)
      `,
      
    [
      OPH_ID,
      project_type,
      Song_name,
      release_date,
      payment,
      Lyrics_services,
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
  payment,
  Lyrics_services,
  available_on_music_platforms,
  next_step,
  projectsType,
  videoType
) => {
  const [result] = await db.execute(
    `INSERT INTO songs_register 
      (OPH_ID, project_type, Song_name, release_date, payment, Lyrics_services, availability_on_music_platform, current_page, projects_type, video_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?)
    ON DUPLICATE KEY UPDATE 
      project_type = VALUES(project_type),
      release_date = VALUES(release_date),
      payment = VALUES(payment),
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
      payment,
      Lyrics_services,
      available_on_music_platforms,
      next_step,
      projectsType,
      videoType
    ]
  );

  return result;
};

const getPendingSongsList = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT sr.song_id, sr.Song_name, sr.project_type, sr.Lyrics_services, sr.release_date, sr.current_page, ad.`status` audio_status , ad.reject_reason audio_reason, vd.`status` video_status, vd.reject_reason video_reason,  sp.`status` payment_status, sp.reject_reason payment_reason FROM songs_register sr LEFT JOIN audio_details ad ON sr.song_id = ad.song_id LEFT JOIN video_details vd ON sr.song_id = vd.song_id LEFT JOIN sign_up_payment sp ON sr.song_id = sp.song_id WHERE sr.OPH_ID = ?",
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
        firstRejectedStepReason = row.audio_reason;
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
        row.payment_status === null
      ) {
        status = "draft";
        firstRejectedStepReason = "";
        firstRejectedStep = "";
        currentStep = row.current_page;
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

module.exports = {
  insertNewSong,
  insertHybridSong,
  getSongID,
  getPendingSongsList,
};
