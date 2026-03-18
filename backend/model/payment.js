const db = require("../DB/connect");

/**
 * Payment model - Database operations only
 * Uses standardized column names: oph_id (not OPH_ID)
 * Uses table name: payments (not sign_up_payment)
 */

const insertPayment = async (
  connection,
  oph_id,
  transaction_id,
  review,
  status,
  from_source,
  song_id,
  event_id,
  release_date,
  amount
) => {
  // Convert undefined values to null (MySQL2 doesn't accept undefined)
  const [result] = await connection.execute(
    "INSERT INTO payments (oph_id, transaction_id, review, status, from_source, song_id, event_id, release_date, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      oph_id,
      transaction_id,
      review ?? null,
      status,
      from_source,
      song_id ?? null,
      event_id ?? null,
      release_date ?? null,
      amount ?? null,
    ]
  );
  return result;
};

const insertSongId = async (connection, ophId, songId) => {
  // Only update payments that are NOT rejected. Rejected payments have song_id moved to NULL
  // but reject_for holds the original song; we must never overwrite them with a different song.
  const [rows] = await connection.execute(
    `UPDATE payments SET song_id = ?
     WHERE oph_id = ? AND from_source = 'Song Registration' AND song_id IS NULL
     AND (status IS NULL OR status != 'rejected')`,
    [songId, ophId]
  );
  return rows;
};

/**
 * Link Date Booking payment to song (paid-in-advance flow).
 * When user completes video for a paid-in-advance song, the Date Booking payment
 * (created when they blocked the date) needs to be linked to the song.
 */
const linkDateBookingPaymentToSong = async (
  connection,
  ophId,
  songId,
  releaseDate
) => {
  if (!releaseDate) return;
  const dateStr =
    typeof releaseDate === "string"
      ? releaseDate.trim().slice(0, 10)
      : releaseDate instanceof Date
        ? releaseDate.toISOString().slice(0, 10)
        : null;
  if (!dateStr) return;

  const [result] = await connection.execute(
    `UPDATE payments SET song_id = ?
     WHERE oph_id = ? AND (release_date = ? OR DATE(release_date) = ?)
     AND (from_source = 'Date booking' OR from_source = 'Date Booking')
     AND song_id IS NULL
     AND (status IS NULL OR status != 'rejected')`,
    [songId, ophId, dateStr, dateStr]
  );
  return result;
};

const getPaymentByOphId = async (connection, ophId, fromSource = null) => {
  let query = "SELECT * FROM payments WHERE oph_id = ?";
  const params = [ophId];

  if (fromSource) {
    query += " AND from_source = ?";
    params.push(fromSource);
  }

  query += " ORDER BY created_at DESC";

  const [rows] = await connection.execute(query, params);
  return rows;
};

const getPaymentByTransactionId = async (connection, transactionId) => {
  const [rows] = await connection.execute(
    "SELECT * FROM payments WHERE transaction_id = ?",
    [transactionId]
  );
  return rows;
};


const getSignupPaymentByOphId = async (OPH_ID) => {
  const [rows] = await db.execute(
    "SELECT * FROM sign_up_payment WHERE OPH_ID = ? AND `From` = 'Registration' ORDER BY createdAt DESC LIMIT 1",
    [OPH_ID]
  );
  return rows;
};

module.exports = {
  insertPayment,
  insertSongId,
  linkDateBookingPaymentToSong,
  getPaymentByOphId,
  getPaymentByTransactionId,
};
