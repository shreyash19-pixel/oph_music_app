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
 * Internal (`event_participants`) + outside (`event_bookings`) — unified shape for Excel export.
 */
const eventParticipantsDetails = async () => {
  const [portalRows] = await db.execute(
    `SELECT * FROM event_participants
     ORDER BY COALESCE(updated_at, created_at) DESC, id DESC`
  );
  const [outsideRows] = await db.execute(
    `SELECT * FROM event_bookings
     ORDER BY COALESCE(updated_at, created_at) DESC, id DESC`
  );

  const professionIds = [
    ...new Set(
      (outsideRows || [])
        .map((r) => r.profession_id)
        .filter((id) => id != null && id !== ""),
    ),
  ];
  const professionById = new Map();
  if (professionIds.length > 0) {
    const ph = professionIds.map(() => "?").join(",");
    const [profRows] = await db.execute(
      `SELECT id, name FROM professions WHERE id IN (${ph})`,
      professionIds,
    );
    for (const p of profRows || []) {
      professionById.set(Number(p.id), p.name ?? "");
    }
  }

  const portal = (portalRows || []).map((r) => ({
    user_type: "internal",
    source_table: "event_participants",
    source_row_id: r.id,
    event_id: r.event_id,
    oph_id: r.oph_id ?? r.OPH_ID ?? "",
    first_name: r.first_name ?? "",
    last_name: r.last_name ?? "",
    email: "",
    phone: "",
    profession: "",
    instagram_link: "",
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));

  const outside = (outsideRows || []).map((r) => ({
    user_type: "outside",
    source_table: "event_bookings",
    source_row_id: r.id,
    event_id: r.event_id,
    oph_id: r.oph_id ?? r.OPH_ID ?? "",
    first_name: r.first_name ?? "",
    last_name: r.last_name ?? "",
    email: r.email ?? "",
    phone: r.phone ?? "",
    profession:
      r.profession_id != null && r.profession_id !== ""
        ? professionById.get(Number(r.profession_id)) ?? ""
        : "",
    instagram_link: r.instagram_handle ?? "",
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));

  const combined = [...portal, ...outside];
  const ophKeys = [
    ...new Set(
      combined
        .map((r) => String(r.oph_id ?? "").trim())
        .filter(Boolean),
    ),
  ];

  const emptyNames = { artist_full_name: "", artist_stage_name: "" };
  if (ophKeys.length === 0) {
    return combined.map((r) => ({ ...r, ...emptyNames }));
  }

  const artistByOph = new Map();
  const chunkSize = 200;
  for (let i = 0; i < ophKeys.length; i += chunkSize) {
    const chunk = ophKeys.slice(i, i + chunkSize);
    const ph = chunk.map(() => "?").join(",");
    const [artistRows] = await db.execute(
      `SELECT
         ud.oph_id AS oph_key,
         ud.full_name AS artist_full_name,
         ud.stage_name AS artist_stage_name
       FROM user_details ud
       WHERE ud.oph_id IN (${ph})`,
      chunk,
    );
    for (const row of artistRows || []) {
      const k = String(row.oph_key ?? "").trim();
      if (k) artistByOph.set(k, row);
    }
  }

  return combined.map((r) => {
    const k = String(r.oph_id ?? "").trim();
    const a = k ? artistByOph.get(k) : null;
    if (!a) return { ...r, ...emptyNames };
    return {
      ...r,
      artist_full_name: a.artist_full_name ?? "",
      artist_stage_name: a.artist_stage_name ?? "",
    };
  });
};


const contactDetails = async () => {
  const [rows] = await db.execute("SELECT * FROM contact_us");
  return rows;
};

const epkDetails = async () => {
  const [rows] = await db.execute("SELECT * FROM special_artist_details");
  return rows;
};

/** Specialist / special artist songs only (matches public isSpecialArtistProfile rules). */
const specialistArtistSongsExport = async () => {
  const [rows] = await db.execute(
    `SELECT
      sas.song_id,
      sas.oph_id,
      sas.song_name,
      sas.song_type,
      sas.status,
      sas.views,
      sas.credits,
      sas.duration,
      sas.proof,
      sas.reject_reason,
      sas.created_at,
      sas.updated_at
    FROM special_artist_songs sas
    INNER JOIN user_details ud ON ud.oph_id = sas.oph_id
    WHERE UPPER(COALESCE(ud.oph_id, '')) LIKE '%-SA-%'
       OR LOWER(TRIM(COALESCE(ud.artist_type, ''))) LIKE '%special%'
    ORDER BY sas.updated_at DESC, sas.song_id DESC`,
  );
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
  specialistArtistSongsExport,
  SongRegistrationDetails,
  getAllAudioDetails,
  getAllVideoDetails
};