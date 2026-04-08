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
      COUNT(CASE WHEN status = 'approved' AND song_type = 'free' THEN 1 END) AS approved_count,
      COUNT(CASE WHEN status = 'pending' AND song_type = 'free' THEN 1 END) AS pending_count
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
    // One resubmission after rejection clears a single rejection credit (not on brand-new inserts).
    if (songID && rejectedCount > 0) {
      rejectedCount -= 1;
    }
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

/**
 * Whether the artist may register another song as free (2 approved free max).
 * @param {string|number} ophid
 * @param {string|number|null|undefined} excludeSongId - When updating an existing row, exclude it from pending/approved free counts so edits are not blocked by the row itself.
 */
const getIsSongFree = async (ophid, excludeSongId = null) => {
  const hasExclude =
    excludeSongId !== null &&
    excludeSongId !== undefined &&
    String(excludeSongId).trim() !== "";

  const [counts] = await db.execute(
    `SELECT 
      COALESCE(SUM(CASE WHEN status = 'approved' AND song_type = 'free' THEN 1 ELSE 0 END), 0) AS approved_free,
      COALESCE(SUM(CASE WHEN status = 'pending' AND song_type = 'free' THEN 1 ELSE 0 END), 0) AS pending_free
     FROM special_artist_songs
     WHERE oph_id = ?${hasExclude ? " AND song_id <> ?" : ""}`,
    hasExclude ? [ophid, excludeSongId] : [ophid],
  );

  const approvedFree = Number(counts[0]?.approved_free ?? 0);
  const pendingFree = Number(counts[0]?.pending_free ?? 0);

  const [rows] = await db.execute(
    "SELECT rejected_count FROM special_artist_free_songs WHERE oph_id = ?",
    [ophid],
  );
  const rejected = rows?.length ? Number(rows[0].rejected_count) : 0;

  if (approvedFree >= 2) return false;
  if (approvedFree === 0 && rejected === 0 && pendingFree >= 2) return false;
  if (approvedFree > 0 && rejected === 0 && pendingFree >= 1) return false;
  return true;
};

module.exports = {
  insertSpecialArtistSongs,
  getSpeicalArtistSongStatus,
  getIsSongFree,
  getSpeicalArtistSong,
};
