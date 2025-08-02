const db = require('../DB/connect'); // MySQL connectionAdd commentMore actions


const insertPayment = async (OPH_ID, Transaction_ID, Review, Status, From, song_id, event_id) => {
  const [result] = await db.execute(
    'INSERT INTO sign_up_payment (OPH_ID, Transaction_ID, Review, Status, `From`, song_id, event_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [OPH_ID, Transaction_ID, Review, Status, From, song_id, event_id]
  );
  return result;
};




module.exports = {
  insertPayment
};