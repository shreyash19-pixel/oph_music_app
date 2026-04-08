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

/**
 * Returns total participant count for an event (internal + external, all statuses).
 * Matches admin EventParticipation counting: event_participants + event_bookings.
 */
const getParticipantCountByEventId = async (event_id) => {
  const [internalRows] = await db.execute(
    "SELECT COUNT(*) AS cnt FROM event_participants WHERE event_id = ?",
    [event_id]
  );
  const [externalRows] = await db.execute(
    "SELECT COUNT(*) AS cnt FROM event_bookings WHERE event_id = ?",
    [event_id]
  );
  const internal = Number(internalRows?.[0]?.cnt ?? 0);
  const external = Number(externalRows?.[0]?.cnt ?? 0);
  return internal + external;
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

/**
 * Admin detail view: internal = event_participants row + user + professional + event.
 * external = event_bookings row + profession name + event.
 */
const getParticipantAdminDetail = async (source, recordId) => {
  const idNum = Number(recordId);
  if (!Number.isFinite(idNum) || idNum < 1) return null;

  if (source === "internal") {
    const [rows] = await db.execute(
      `SELECT
         ep.id AS participant_row_id,
         ep.oph_id,
         ep.event_id,
         ep.status AS participation_status,
         ep.created_at AS participant_created_at,
         ep.updated_at AS participant_updated_at,
         ud.full_name,
         ud.stage_name,
         ud.email,
         ud.contact_number,
         ud.artist_type,
         ud.location,
         ud.personal_photo,
         pd.profession,
         pd.bio,
         pd.instagram_link,
         pd.spotify_link,
         pd.facebook_link,
         pd.apple_music_link,
         ev.EventName AS event_name,
         ev.dateTime AS event_date_time,
         ev.location AS event_location,
         ev.registrationFee_normal AS event_registration_fee,
         ev.winnerReward AS event_winner_reward,
         ev.registrationStart AS event_registration_start,
         ev.registrationEnd AS event_registration_end
       FROM event_participants ep
       LEFT JOIN user_details ud ON ud.oph_id = ep.oph_id
       LEFT JOIN professional_details pd ON pd.oph_id = ep.oph_id
       LEFT JOIN events ev ON ev.id = ep.event_id
       WHERE ep.id = ?
       LIMIT 1`,
      [idNum],
    );
    return rows?.[0] ?? null;
  }

  if (source === "external") {
    const [rows] = await db.execute(
      `SELECT
         eb.id AS booking_id,
         eb.event_id,
         eb.first_name,
         eb.last_name,
         eb.email,
         eb.phone,
         eb.instagram_handle,
         eb.booking_reference,
         eb.status AS booking_status,
         eb.payment_transaction_id,
         eb.oph_id AS linked_oph_id,
         eb.created_at AS booking_created_at,
         eb.updated_at AS booking_updated_at,
         pr.name AS profession,
         ev.EventName AS event_name,
         ev.dateTime AS event_date_time,
         ev.location AS event_location,
         ev.registrationFee_normal AS event_registration_fee,
         ev.winnerReward AS event_winner_reward,
         ev.registrationStart AS event_registration_start,
         ev.registrationEnd AS event_registration_end
       FROM event_bookings eb
       LEFT JOIN professions pr ON pr.id = eb.profession_id
       LEFT JOIN events ev ON ev.id = eb.event_id
       WHERE eb.id = ?
       LIMIT 1`,
      [idNum],
    );
    return rows?.[0] ?? null;
  }

  return null;
};

module.exports = {
  getParticipantByOphAndEvent,
  getParticipantsByOphId,
  getParticipantsByEventId,
  getParticipantCountByEventId,
  registerParticipant,
  updateParticipantStatus,
  getParticipant,
  getParticipantUnified,
  getParticipantAdminDetail,
};
