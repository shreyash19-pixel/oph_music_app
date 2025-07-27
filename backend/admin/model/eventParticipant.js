const db = require('../../DB/connect'); // adjust path as needed

const getParticipantByOphAndEvent = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT * FROM event_participants WHERE OPH_ID = ?",
    [ophid]
  );
  return rows; // assuming one record per OPH_ID + event
};

const getParticipantsByEventId = async (event_id) => {
  const [rows] = await db.execute(
    "SELECT * FROM event_participants WHERE event_id = ?",
    [event_id]
  );
  return rows;
};

const registerParticipant = async ({ OPH_ID, event_id, status = 'under review' }) => {
  const [result] = await db.execute(
    "INSERT INTO event_participants (OPH_ID, event_id, status) VALUES (?, ?, ?)",
    [OPH_ID, event_id, status]
  );
  return result.insertId;
};

const updateParticipantStatus = async (id, status) => {
  await db.execute(
    "UPDATE event_participants SET status = ? WHERE id = ?",
    [status, id]
  );
};

module.exports = {
  getParticipantByOphAndEvent,
  getParticipantsByEventId,
  registerParticipant,
  updateParticipantStatus
};
