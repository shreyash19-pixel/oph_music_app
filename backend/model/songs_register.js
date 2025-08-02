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
  next_step
) => {
  const [result] = await db.execute(
    `INSERT INTO songs_register 
      (OPH_ID, project_type, Song_name, release_date, payment, Lyrics_services, current_page)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      project_type = VALUES(project_type),
      release_date = VALUES(release_date),
      payment = VALUES(payment),
      Lyrics_services = VALUES(Lyrics_services),
      current_page = VALUES(current_page)`,
    [
      OPH_ID,
      project_type,
      Song_name,
      release_date,
      payment,
      Lyrics_services,
      next_step,
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
  next_step
) => {
  const [result] = await db.execute(
    `INSERT INTO songs_register 
      (OPH_ID, project_type, Song_name, release_date, payment, Lyrics_services, availability_on_music_platform, current_page)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      project_type = VALUES(project_type),
      release_date = VALUES(release_date),
      payment = VALUES(payment),
      Lyrics_services = VALUES(Lyrics_services),
      availability_on_music_platform = VALUES(availability_on_music_platform),
      current_page = VALUES(current_page)`,
    [
      OPH_ID,
      project_type,
      Song_name,
      release_date,
      payment,
      Lyrics_services,
      available_on_music_platforms,
      next_step,
    ]
  );

  return result;
};

const getPendingSongsList = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT Song_name,project_type,release_date ,status, song_id, reject_reason, current_page FROM songs_register WHERE OPH_ID = ?",
    [ophid]
  );

  return rows;
};

module.exports = {
  insertNewSong,
  insertHybridSong,
  getSongID,
  getPendingSongsList,
};
