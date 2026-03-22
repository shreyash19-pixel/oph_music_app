const db = require("../../DB/connect");

const getAllTv = async () => {
  const [rows] = await db.execute(
    "SELECT * FROM tvPublishing",
    []
  );
  return rows;
};

const getTv = async (song_id) => {
  const [rows] = await db.execute(
    "SELECT * FROM tvPublishing WHERE song_id = ?",
    [song_id]
  );
  return rows;
};

const updateTvLock = async (song_id, lock) => {
  const [result] = await db.execute(
    "UPDATE tvPublishing SET `lock` = ? WHERE song_id = ?",
    [lock, song_id]
  );
  return result;
};

const updateTvStatus = async (song_id, status, reason) => {
  const [result] = await db.execute(
    `UPDATE tvPublishing 
     SET status = ?, reason = ? 
     WHERE song_id = ?`,
    [status, reason, song_id]
  );
  return result;
};

const updateTvFiles = async (song_id, updates) => {
  const keys = Object.keys(updates);

  if (keys.length === 0) {
    throw new Error("No file provided to update");
  }

  // Build SET clause dynamically
  const setClause = keys.map((key) => `${key} = ?`).join(", ");
  const values = keys.map((key) => updates[key]);
  values.push(song_id);

  const query = `UPDATE tvPublishing SET ${setClause} WHERE song_id = ?`;

  const [result] = await db.execute(query, values);
  return result;
};



const getOphIdFromSongId = async (song_id) => {
  const [rows] = await db.execute(
    "SELECT OPH_ID FROM songs_register WHERE song_id = ?",
    [song_id]
  );
  return rows.length > 0 ? rows[0].OPH_ID : null;
};

const getOphIdAndSongNameFromSongId = async (song_id) => {
  const [rows] = await db.execute(
    "SELECT OPH_ID, Song_name FROM songs_register WHERE song_id = ?",
    [song_id]
  );
  if (rows.length === 0) return { ophid: null, songName: null };
  return {
    ophid: rows[0].OPH_ID,
    songName: rows[0].Song_name || "Song",
  };
};

module.exports = {
  getAllTv,
  getTv,
  updateTvLock,
  updateTvStatus,
  updateTvFiles,
  getOphIdFromSongId,
  getOphIdAndSongNameFromSongId,
};
