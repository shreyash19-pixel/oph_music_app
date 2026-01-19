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
  const [rows] = await connection.execute(
    "UPDATE payments SET song_id = ? WHERE oph_id = ? AND from_source = 'Song Registration' AND song_id IS NULL",
    [songId, ophId]
  );
  return rows;
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
  getPaymentByOphId,
  getPaymentByTransactionId
};
