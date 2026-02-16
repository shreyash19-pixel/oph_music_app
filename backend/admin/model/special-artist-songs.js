const db = require("../../DB/connect");

const getSongsList = async () => {
  const [rows] = await db.execute(
    "SELECT * FROM special_artist_songs WHERE status != 'approved'",
  );

  return rows;
};

const getIndividualSongDetails = async (ophid, songId) => {
  const [rows] = await db.execute(
    "SELECT * FROM special_artist_songs WHERE oph_id = ? AND song_id = ?",
    [ophid, songId],
  );

  return rows;
};

const setSongStatus = async (ophid, songId, type, reason) => {
  let getReason = "";
  let rejectCount = 0;

  if (type === "approved") {
    getReason = null;
  } else if (type === "rejected") {
    getReason = reason;
  }

  const [rows] = await db.execute(
    "UPDATE special_artist_songs SET status = ?, reject_reason = ? WHERE oph_id = ? AND song_id = ?",
    [type, getReason, ophid, songId],
  );

  const [resp] = await db.execute(
    "SELECT * FROM special_artist_free_songs WHERE oph_id = ?",
    [ophid],
  );

  if (resp && resp.length > 0) {
    rejectCount = Number(resp[0].rejected_count);
  }

  const [songPaymentStat] = await db.execute(
    "SELECT status FROM payments WHERE oph_id = ? AND reject_for = ?",
    [ophid, songId],
  );

  let stat = null;
  
  if (songPaymentStat && songPaymentStat.length > 0) {
    stat = songPaymentStat[0].status;
  }

  // If empty OR status is not rejected
  if (!stat || stat !== "rejected") {
    if (type === "rejected") {
      await db.execute(
        `INSERT INTO special_artist_free_songs 
       (oph_id, rejected_count) 
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE
         rejected_count = VALUES(rejected_count)`,
        [ophid, rejectCount + 1],
      );

      return [rows];
    }
  }

  const [records] = await db.execute(
    `SELECT 
         COUNT(CASE WHEN status = 'approved' THEN 1 END) AS approved_count,
         COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_count
       FROM special_artist_songs
       WHERE oph_id = ?`,
    [ophid],
  );

  const res = records[0] || {
    approved_count: 0,
    pending_count: 0,
  };

  const approved = Number(res.approved_count);
  const pending = Number(res.pending_count);

  await db.execute(
    `INSERT INTO special_artist_free_songs 
       (oph_id, approved_count, pending_count) 
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         approved_count = VALUES(approved_count),
         pending_count = VALUES(pending_count)`,
    [ophid, approved, pending],
  );

  return rows;
};

module.exports = { getSongsList, getIndividualSongDetails, setSongStatus };
