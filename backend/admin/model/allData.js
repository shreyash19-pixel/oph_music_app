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
  // Only select allowed fields (excluding VideoURL, PhotoURLs, step_status, reject_reason)
  const [rows] = await db.execute(`
    SELECT 
      OPH_ID,
      Profession,
      Bio,
      SpotifyLink,
      InstagramLink,
      FacebookLink,
      AppleMusicLink,
      ExperienceYearly,
      ExperienceMonthly,
      SongsPlanningCount,
      SongsPlanningType,
      CreatedAt
    FROM professional_details
  `);
  return rows;
};



const getDocumentationDetails = async () => {
  const [rows] = await db.execute("SELECT * FROM documentation_details");

  return rows;
};

const paymentDetails = async () => {
  try {
    const result = await db.execute("SELECT * FROM sign_up_payment");
    // mysql2 execute returns [rows, fields] tuple
    if (Array.isArray(result) && result.length > 0) {
      const [rows] = result;
      return Array.isArray(rows) ? rows : [];
    }
    return [];
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
  const [rows] = await db.execute("SELECT * FROM calender");
  return rows;
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