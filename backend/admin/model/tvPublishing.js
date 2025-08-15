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

const updateTvFiles = async (song_id, audio, video) => {
  let query = "UPDATE tvPublishing SET";
  const updates = [];
  const values = [];

  if (audio !== undefined) {
    updates.push(" audio = ? ");
    values.push(audio);
  }

  if (video !== undefined) {
    updates.push(" video = ? ");
    values.push(video);
  }

  if (updates.length === 0) {
    throw new Error("No file provided to update");
  }

  query += updates.join(", ") + " WHERE song_id = ?";
  values.push(song_id);

  const [result] = await db.execute(query, values);
  return result;
};





module.exports = {
  getAllTv,
  getTv,
  updateTvLock,
  updateTvStatus,
  updateTvFiles,
};
