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

/**
 * Returns unified list: internal (event_participants) + external (event_bookings).
 * Each row has participant_display: oph_id for internal, full name for external.
 */
const getParticipantUnified = async () => {
  const [internalRows] = await db.execute(
    `SELECT id, oph_id, event_id, status, created_at, updated_at,
            oph_id AS participant_display,
            'internal' AS source
     FROM event_participants
     ORDER BY created_at DESC`
  );
  const [externalRows] = await db.execute(
    `SELECT id, event_id, status, created_at, updated_at,
            TRIM(CONCAT(COALESCE(first_name,''), ' ', COALESCE(last_name,''))) AS participant_display,
            'external' AS source,
            booking_reference
     FROM event_bookings
     ORDER BY created_at DESC`
  );
  const internal = (internalRows || []).map((r) => ({
    ...r,
    participant_display: r.oph_id,
    source: 'internal',
  }));
  const external = (externalRows || []).map((r) => ({
    id: `eb-${r.id}`,
    event_id: r.event_id,
    status: r.status,
    created_at: r.created_at,
    updated_at: r.updated_at,
    participant_display: r.participant_display || '',
    source: 'external',
    booking_reference: r.booking_reference,
  }));
  return [...internal, ...external];
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
  getParticipantUnified,
};
