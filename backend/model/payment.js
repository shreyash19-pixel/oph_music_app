const db = require('../DB/connect'); // MySQL connectionAdd commentMore actions


const insertPayment = async (OPH_ID, Transaction_ID, Review, Status, From, song_id, event_id) => {
  const [result] = await db.execute(
    'INSERT INTO sign_up_payment (OPH_ID, Transaction_ID, Review, Status, `From`, song_id, event_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [OPH_ID, Transaction_ID, Review, Status, From, song_id, event_id]
  );
  return result;
};


const insertSongID = async (ophid, song_id) => {

  const [rows] = await db.execute("UPDATE sign_up_payment SET song_id = ? WHERE OPH_ID = ?", [song_id, ophid])
  return rows

}


module.exports = {
  insertPayment,
  insertSongID
};