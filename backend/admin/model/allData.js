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

const tvpublishingDetails = async () => {
  const [rows] = await db.execute("SELECT * FROM tvPublishing");
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

const eventParticipantsDetails = async () => {
  const [rows] = await db.execute("SELECT * FROM event_participants");
  return rows;
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
  SongRegistrationDetails
};