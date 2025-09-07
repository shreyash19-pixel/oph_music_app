const db = require('../DB/connect');

const getByOPH_ID = async (OPH_ID) => {
  const [results] = await db.execute(
    'SELECT * FROM user_details WHERE ophid = ?',
    [OPH_ID]
  );
  return results;
};

const updateNotes = async (ophid, notes) => {
  const [result] = await db.execute(
    'UPDATE user_details SET Notes = ? WHERE ophid = ?',
    [notes, ophid]
  );
  return result;
};

module.exports = {
  getByOPH_ID,
  updateNotes,
};
