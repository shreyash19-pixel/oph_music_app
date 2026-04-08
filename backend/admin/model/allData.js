const db = require('../../DB/connect');

const getAllApplicationStatus = async () => {
  const [rows] = await db.execute("SELECT * FROM application_status");
  return rows;
};

const getAllUserDetails = async () => {
    const [rows] = await db.execute("SELECT * FROM user_details");
    return rows;
};



const getAllProfessionalDetails = async () => {
  // Matches professional_details schema (snake_case; see model/professional_details.js)
  const [rows] = await db.execute(`
    SELECT
      oph_id,
      profession,
      bio,
      spotify_link,
      instagram_link,
      facebook_link,
      apple_music_link,
      experience_yearly,
      experience_monthly,
      songs_planning_count,
      songs_planning_type,
      created_at,
      updated_at
    FROM professional_details
  `);
  return rows;
};



const getDocumentationDetails = async () => {
  const [rows] = await db.execute("SELECT * FROM documentation_details");

  return rows;
};

/**
 * All portal payments: song registration, date booking / calendar, events, SA, EPK-related, etc.
 * (single `payments` table — replaces legacy sign_up_payment-only export.)
 */
const paymentDetails = async () => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM payments ORDER BY id DESC`
    );
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    console.error("Error fetching payment details:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
    });
    return [];
  }
};


const bookingsDetails = async () => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM calender ORDER BY COALESCE(updated_at, created_at) DESC, id DESC`
    );
    return rows;
  } catch (err) {
    console.error("DB ERROR:", err);
    throw err;
  }
};

const songRegistrationDetails = async () => {
  const [rows] = await db.execute("SELECT * FROM song_application_status");
  return rows;
};

/** TV Publishing rows that are unlocked for editing (`lock` = 1; 0 = page locked). */
const tvpublishingDetails = async () => {
  const [rows] = await db.execute(
    "SELECT * FROM tvPublishing WHERE `lock` = 1"
  );
  return rows;
};


const withdrawalsDetails = async () => {
  const [rows] = await db.execute("SELECT * FROM withdraw");
  return rows;
};

const ticketsDetails = async () => {
  const [rows] = await db.execute("SELECT * FROM tickets");
  return rows;
};

/**
 * Internal portal signups (`event_participants`) + outside/public registrations (`event_bookings`).
 * Outside participants (no portal account, or not yet linked) live only in `event_bookings`.
 */
const eventParticipantsDetails = async () => {
  const [portalRows] = await db.execute(
    `SELECT id, oph_id, event_id, status, created_at, updated_at
     FROM event_participants
     ORDER BY COALESCE(updated_at, created_at) DESC, id DESC`
  );
  const [outsideRows] = await db.execute(
    `SELECT * FROM event_bookings
     ORDER BY COALESCE(updated_at, created_at) DESC, id DESC`
  );

  const portal = (portalRows || []).map((r) => ({
    source: "portal",
    record_id: r.id,
    oph_id: r.oph_id ?? r.OPH_ID ?? "",
    event_id: r.event_id,
    status: r.status,
    created_at: r.created_at,
    updated_at: r.updated_at,
    booking_reference: "",
    participant_name: "",
    email: "",
  }));

  const outside = (outsideRows || []).map((r) => ({
    source: "outside",
    record_id: r.id != null ? `eb-${r.id}` : "",
    oph_id: r.oph_id ?? r.OPH_ID ?? "",
    event_id: r.event_id,
    status: r.status,
    created_at: r.created_at,
    updated_at: r.updated_at,
    booking_reference: r.booking_reference ?? "",
    participant_name: `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim(),
    email: r.email ?? "",
  }));

  return [...portal, ...outside];
};


const contactDetails = async () => {
  const [rows] = await db.execute("SELECT * FROM contact_us");
  return rows;
};

const epkDetails = async () => {
  const [rows] = await db.execute("SELECT * FROM special_artist_details");
  return rows;
};


const SongRegistrationDetails = async () => {
  const [rows] = await db.execute("SELECT * FROM songs_register");
  return rows;
};

const getAllAudioDetails = async () => {
  const [rows] = await db.execute(
    "SELECT * FROM audio_details ORDER BY song_id ASC"
  );
  return rows;
};

const getAllVideoDetails = async () => {
  const [rows] = await db.execute(
    "SELECT * FROM video_details ORDER BY song_id ASC"
  );
  return rows;
};

module.exports = {
  getAllApplicationStatus,
  getAllUserDetails,
  getAllProfessionalDetails,
  getDocumentationDetails,
  paymentDetails,
  bookingsDetails,
  songRegistrationDetails,
  tvpublishingDetails,
  withdrawalsDetails,
  ticketsDetails,
  eventParticipantsDetails,
  contactDetails, 
  epkDetails,
  SongRegistrationDetails,
  getAllAudioDetails,
  getAllVideoDetails
};