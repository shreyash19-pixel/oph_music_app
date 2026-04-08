const db = require("../DB/connect");

const getSpeicalArtistSongStatus = async (ophid) => {
  const [rows] = await db.execute(
    `SELECT 
    sas.song_id,
    sas.oph_id,
    sas.song_name,
    sas.song_type,
    sas.created_at,
    p.created_at AS payment_created_at,
    sas.status AS song_status,
    p.status AS payment_status,
    sas.reject_reason AS song_rejection_reason ,
    p.reject_reason AS payment_rejection_reason
FROM special_artist_songs sas
LEFT JOIN (
    SELECT *
    FROM (
        SELECT *,
               COALESCE(song_id, reject_for) AS ref_song_id,
               ROW_NUMBER() OVER (
                   PARTITION BY COALESCE(song_id, reject_for)
                   ORDER BY updated_at DESC
               ) AS rn
        FROM payments
        WHERE from_source = 'Special Artist Song Registration'
          AND oph_id = ?
    ) latest
    WHERE rn = 1
) p 
ON p.ref_song_id = sas.song_id
WHERE sas.oph_id = ?
ORDER BY sas.updated_at DESC; `,
    [ophid, ophid],
  );

  return rows.map((row) => {
    let finalStatus = "";

    const isPaid = row.song_type === "paid";
    const isSongRejected = row.song_status === "rejected";
    const isPaymentRejected = row.payment_status === "rejected";

    // 🔴 Both rejected (paid only)
    if (isPaid && isSongRejected && isPaymentRejected) {
      finalStatus = "song & payment rejected";
    }
    // 🔴 Song rejected
    else if (isSongRejected) {
      finalStatus = "song rejected";
    }
    // 🔴 Payment rejected
    else if (isPaymentRejected) {
      finalStatus = "payment rejected";
    }
    // ✅ Approved
    else if (
      row.song_status === "approved" &&
      (row.song_type === "free" || row.payment_status === "approved")
    ) {
      finalStatus = "approved";
    } else {
      finalStatus = "pending";
    }

    return {
      song_id: row.song_id,
      oph_id: row.oph_id,
      song_name: row.song_name,
      song_type: row.song_type,
      created_at: row.created_at,
      status: finalStatus,
      payment_status: row.payment_status,
      song_rejection_reason: row.song_rejection_reason || "-",
      payment_rejection_reason: row.payment_rejection_reason || "-",
    };
  });
};

const insertSpecialArtistSongs = async (
  songID,
  ophid,
  song_name,
  views,
  credits,
  duration,
  proof,
  songType,
  audio_url,
) => {
  let rejectedCount = 0;

  if (songID) {
    // 🔁 UPDATE
    const [rows] = await db.execute(
      `UPDATE special_artist_songs 
       SET song_name = ?, 
           views = ?, 
           credits = ?, 
           duration = ?, 
           proof = ?, 
           audio_url = ?, 
           song_type = ?,
           status = 'pending',
           reject_reason = ''
       WHERE song_id = ? AND oph_id = ?`,
      [
        song_name,
        views,
        credits,
        duration,
        proof,
        audio_url,
        songType,
        songID,
        ophid,
      ],
    );

  } else {
    // ➕ INSERT
    const [rows] = await db.execute(
      `INSERT INTO special_artist_songs 
       (oph_id, song_name, views, credits, duration, proof, audio_url, song_type) 
       VALUES (?,?,?,?,?,?,?,?)`,
      [ophid, song_name, views, credits, duration, proof, audio_url, songType],
    );
  }
  // console.log(rows);

  const [songId] = await db.execute(
    "SELECT song_id FROM special_artist_songs WHERE oph_id = ? AND song_name = ?",
    [ophid, song_name],
  );

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
    rejected_count: 0,
  };

  const approved = Number(res.approved_count);
  const pending = Number(res.pending_count);

  const [resp] = await db.execute(
    "SELECT * FROM special_artist_free_songs WHERE oph_id = ?",
    [ophid],
  );

  if (resp && resp.length > 0) {
    rejectedCount = Number(resp[0].rejected_count);
    rejectedCount = rejectedCount === 0 ? 0 : rejectedCount - 1;
  }

  await db.execute(
    `INSERT INTO special_artist_free_songs 
   (oph_id, approved_count, rejected_count, pending_count) 
   VALUES (?, ?, ?, ?)
   ON DUPLICATE KEY UPDATE
     approved_count = VALUES(approved_count),
     rejected_count = VALUES(rejected_count),
     pending_count = VALUES(pending_count)`,
    [ophid, approved, rejectedCount, pending],
  );
  return songId;
};

const getSpeicalArtistSong = async (songId) => {
  const [rows] = await db.execute(
    "SELECT * FROM special_artist_songs WHERE song_id = ?",
    [songId],
  );

  return rows;
};

const getIsSongFree = async (ophid) => {
  let isFree = true;

  const [rows] = await db.execute(
    "SELECT * FROM special_artist_free_songs WHERE oph_id = ?",
    [ophid],
  );

  if (rows && rows.length > 0) {
    if (rows[0].approved_count >= 2) {
      isFree = false;
    } else if (
      rows[0].approved_count >= 0 &&
      rows[0].approved_count < 2 &&
      rows[0].rejected_count > 0
    ) {
      isFree = true;
    } else if (
      rows[0].approved_count === 0 &&
      rows[0].rejected_count === 0 &&
      rows[0].pending_count >= 2
    ) {
      return false;
    }
    else if (
      rows[0].approved_count > 0 &&
      rows[0].rejected_count === 0 &&
      rows[0].pending_count > 1
    ) {
      return false;
    }
  }

  return isFree;
};

module.exports = {
  insertSpecialArtistSongs,
  getSpeicalArtistSongStatus,
  getIsSongFree,
  getSpeicalArtistSong,
};
