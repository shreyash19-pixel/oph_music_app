const db = require('../DB/connect');

const getByOPH_ID = async (OPH_ID) => {
  const [results] = await db.execute(
    'SELECT * FROM song_social_metrics WHERE OPH_ID = ?',
    [OPH_ID]
  );
  return results;
};

const updateNotes = async (ophid, notes) => {
  const [result] = await db.execute(
    'UPDATE song_social_metrics SET Notes = ? WHERE OPH_ID = ?',
    [notes, ophid]
  );
  return result;
};

module.exports = {
  getByOPH_ID,
  updateNotes,
};
