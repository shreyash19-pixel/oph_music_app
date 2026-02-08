const db = require('../../DB/connect'); // adjust path as needed

// NOTE:
// A single user (oph_id) can register for multiple events.
// The correct uniqueness is (oph_id, event_id), not just oph_id.
const getParticipantByOphAndEvent = async (ophid, event_id) => {
  const [rows] = await db.execute(
    "SELECT * FROM event_participants WHERE oph_id = ? AND event_id = ?",
    [ophid, event_id]
  );
  return rows;
};

// Backward compatible helper: fetch all participant rows for a user across events
const getParticipantsByOphId = async (ophid) => {
  const [rows] = await db.execute(
    "SELECT * FROM event_participants WHERE oph_id = ? ORDER BY created_at DESC",
    [ophid],
  );
  return rows;
};

const getParticipant = async () => {
  const [rows] = await db.execute(
    "SELECT * FROM event_participants",
  );
  return rows; 
};

const getParticipantsByEventId = async (event_id) => {
  const [rows] = await db.execute(
    "SELECT * FROM event_participants WHERE event_id = ?",
    [event_id]
  );
  return rows;
};

const registerParticipant = async ({ OPH_ID, event_id, status = 'under review' }) => {
  // Use INSERT ... ON DUPLICATE KEY UPDATE to handle cases where participant already exists
  // This prevents duplicate key errors when a user tries to register for the same event multiple times
  const [result] = await db.execute(
    `INSERT INTO event_participants (oph_id, event_id, status, created_at, updated_at)
     VALUES (?, ?, ?, NOW(), NOW())
     ON DUPLICATE KEY UPDATE
       status = VALUES(status),
       updated_at = NOW()`,
    [OPH_ID, event_id, status]
  );
  // Return the ID - if it was an update, insertId will be 0, but affectedRows will be 2
  return result.insertId || result.affectedRows;
};

const updateParticipantStatus = async (id, status) => {
  await db.execute(
    "UPDATE event_participants SET status = ? WHERE id = ?",
    [status, id]
  );
};

module.exports = {
  getParticipantByOphAndEvent,
  getParticipantsByOphId,
  getParticipantsByEventId,
  registerParticipant,
  updateParticipantStatus,
  getParticipant,
};
