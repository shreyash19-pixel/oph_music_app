const db = require('../DB/connect'); // MySQL connectionAdd commentMore actions


const insertPayment = async (OPH_ID, Transaction_ID, Review, Status, From, song_id, event_id, release_date) => {
  const [result] = await db.execute(
    'INSERT INTO sign_up_payment (OPH_ID, Transaction_ID, Review, Status, `From`, song_id, event_id, release_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [OPH_ID, Transaction_ID, Review, Status, From, song_id, event_id, release_date]
  );
  return result;
};


const insertSongID = async (ophid, song_id) => {

  const [rows] = await db.execute("UPDATE sign_up_payment SET song_id = ? WHERE OPH_ID = ?", [song_id, ophid])
  return rows

}

const songRepayment = async (song_id, Transaction_ID, Status) => {

  const [rows] = await db.execute("UPDATE sign_up_payment SET Transaction_ID = ?, Status = ?, reject_reason = ? WHERE song_id = ?", [Transaction_ID, Status,null,song_id]);
  return rows;
}

module.exports = {
  insertPayment,
  insertSongID,
  songRepayment
};