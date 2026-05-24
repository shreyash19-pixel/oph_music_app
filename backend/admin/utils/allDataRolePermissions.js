/**
 * All Data export permissions by admin role (mirrors admin/src/utils/allDataPermissions.js).
 */

const ROLES = {
  SUPER_ADMIN: "super admin",
  ADMINISTRATIVE_HEAD: "administrative head",
  ADMINISTRATIVE_MEMBER: "administrative member",
  SALES_HEAD: "sales head",
  SALES_MEMBER: "sales member",
  OPERATION_HEAD: "operation head",
  OPERATION_MEMBER: "operation member",
  PROJECT_HEAD: "project head",
  PROJECT_MEMBER: "project member",
  CREATIVE_HEAD: "creative head",
  CREATIVE_MEMBER: "creative member",
  ACCOUNTS_HEAD: "accounts head",
  ACCOUNTS_MEMBER: "accounts member",
  NOT_ASSIGNED: "not assigned",
};

const EXPORT_KEYS = {
  COMPLETE_ARTIST_STATUS: "COMPLETE_ARTIST_STATUS",
  PERSONAL_DETAILS: "PERSONAL_DETAILS",
  PROFESSIONAL_DETAILS: "PROFESSIONAL_DETAILS",
  DOCUMENTATION_DETAILS: "DOCUMENTATION_DETAILS",
  ALL_PAYMENTS: "ALL_PAYMENTS",
  BOOKINGS: "BOOKINGS",
  SONGS_REGISTER: "SONGS_REGISTER",
  AUDIO_DETAILS: "AUDIO_DETAILS",
  VIDEO_DETAILS: "VIDEO_DETAILS",
  SONG_REGISTRATION_APPLICATION_STATUS: "SONG_REGISTRATION_APPLICATION_STATUS",
  TV_PUBLISHING: "TV_PUBLISHING",
  WITHDRAWALS: "WITHDRAWALS",
  TICKETS: "TICKETS",
  EVENT_PARTICIPANTS: "EVENT_PARTICIPANTS",
  CONTACT_US: "CONTACT_US",
  SPECIAL_ARTIST_DETAILS: "SPECIAL_ARTIST_DETAILS",
  SPECIAL_ARTIST_SONGS: "SPECIAL_ARTIST_SONGS",
};

const ALL_EXPORT_KEYS = Object.values(EXPORT_KEYS);

const ROUTE_EXPORT_KEY = {
  "/application-status": EXPORT_KEYS.COMPLETE_ARTIST_STATUS,
  "/user-details": EXPORT_KEYS.PERSONAL_DETAILS,
  "/professional-details": EXPORT_KEYS.PROFESSIONAL_DETAILS,
  "/documentation-details": EXPORT_KEYS.DOCUMENTATION_DETAILS,
  "/All-payments": EXPORT_KEYS.ALL_PAYMENTS,
  "/bookings-excel": EXPORT_KEYS.BOOKINGS,
  "/songs-register-excel": EXPORT_KEYS.SONGS_REGISTER,
  "/audio-details-excel": EXPORT_KEYS.AUDIO_DETAILS,
  "/video-details-excel": EXPORT_KEYS.VIDEO_DETAILS,
  "/song-registration-details": EXPORT_KEYS.SONG_REGISTRATION_APPLICATION_STATUS,
  "/tv-publishing-excel": EXPORT_KEYS.TV_PUBLISHING,
  "/withdrawals-excel": EXPORT_KEYS.WITHDRAWALS,
  "/tickets-excel": EXPORT_KEYS.TICKETS,
  "/event-participants-excel": EXPORT_KEYS.EVENT_PARTICIPANTS,
  "/contact-us-excel": EXPORT_KEYS.CONTACT_US,
  "/special-artist-details-excel": EXPORT_KEYS.SPECIAL_ARTIST_DETAILS,
  "/special-artist-songs-excel": EXPORT_KEYS.SPECIAL_ARTIST_SONGS,
};

const SALES_HEAD_SCOPED = [
  EXPORT_KEYS.COMPLETE_ARTIST_STATUS,
  EXPORT_KEYS.PERSONAL_DETAILS,
  EXPORT_KEYS.PROFESSIONAL_DETAILS,
  EXPORT_KEYS.DOCUMENTATION_DETAILS,
  EXPORT_KEYS.ALL_PAYMENTS,
  EXPORT_KEYS.WITHDRAWALS,
  EXPORT_KEYS.EVENT_PARTICIPANTS,
  EXPORT_KEYS.CONTACT_US,
];

const OPERATION_HEAD_SCOPED = [
  EXPORT_KEYS.BOOKINGS,
  EXPORT_KEYS.SONGS_REGISTER,
  EXPORT_KEYS.AUDIO_DETAILS,
  EXPORT_KEYS.VIDEO_DETAILS,
  EXPORT_KEYS.SONG_REGISTRATION_APPLICATION_STATUS,
];

const PROJECT_HEAD_SCOPED = [
  EXPORT_KEYS.ALL_PAYMENTS,
  EXPORT_KEYS.EVENT_PARTICIPANTS,
];

const CREATIVE_HEAD_SCOPED = [
  EXPORT_KEYS.BOOKINGS,
  EXPORT_KEYS.SONGS_REGISTER,
  EXPORT_KEYS.AUDIO_DETAILS,
  EXPORT_KEYS.VIDEO_DETAILS,
  EXPORT_KEYS.SONG_REGISTRATION_APPLICATION_STATUS,
  EXPORT_KEYS.TV_PUBLISHING,
];

const ACCOUNTS_HEAD_SCOPED = [
  EXPORT_KEYS.COMPLETE_ARTIST_STATUS,
  EXPORT_KEYS.ALL_PAYMENTS,
  EXPORT_KEYS.BOOKINGS,
  EXPORT_KEYS.SONG_REGISTRATION_APPLICATION_STATUS,
  EXPORT_KEYS.WITHDRAWALS,
  EXPORT_KEYS.EVENT_PARTICIPANTS,
  EXPORT_KEYS.SPECIAL_ARTIST_SONGS,
];

const ADMIN_HEAD_HIDDEN = [EXPORT_KEYS.EVENT_PARTICIPANTS];

const MEMBER_TO_HEAD = {
  [ROLES.ADMINISTRATIVE_MEMBER]: ROLES.ADMINISTRATIVE_HEAD,
  [ROLES.SALES_MEMBER]: ROLES.SALES_HEAD,
  [ROLES.OPERATION_MEMBER]: ROLES.OPERATION_HEAD,
  [ROLES.PROJECT_MEMBER]: ROLES.PROJECT_HEAD,
  [ROLES.CREATIVE_MEMBER]: ROLES.CREATIVE_HEAD,
  [ROLES.ACCOUNTS_MEMBER]: ROLES.ACCOUNTS_HEAD,
};

function keysExcept(hiddenKeys) {
  return ALL_EXPORT_KEYS.filter((k) => !hiddenKeys.includes(k));
}

function buildHeadExportMap(role) {
  const map = new Map();
  const r = String(role ?? "").trim().toLowerCase();

  if (r === ROLES.SUPER_ADMIN) {
    for (const k of ALL_EXPORT_KEYS) map.set(k, "download_full");
    return map;
  }

  if (r === ROLES.ADMINISTRATIVE_HEAD) {
    for (const k of keysExcept(ADMIN_HEAD_HIDDEN)) map.set(k, "download_full");
    for (const k of ADMIN_HEAD_HIDDEN) map.set(k, "hidden");
    return map;
  }

  const scopedLists = {
    [ROLES.SALES_HEAD]: SALES_HEAD_SCOPED,
    [ROLES.OPERATION_HEAD]: OPERATION_HEAD_SCOPED,
    [ROLES.PROJECT_HEAD]: PROJECT_HEAD_SCOPED,
    [ROLES.CREATIVE_HEAD]: CREATIVE_HEAD_SCOPED,
    [ROLES.ACCOUNTS_HEAD]: ACCOUNTS_HEAD_SCOPED,
  };

  const scoped = scopedLists[r];
  if (scoped) {
    for (const k of ALL_EXPORT_KEYS) {
      map.set(k, scoped.includes(k) ? "download_scoped" : "hidden");
    }
    return map;
  }

  return map;
}

function getAllDataExportAccess(role, exportKey) {
  const r = String(role ?? "").trim().toLowerCase();
  if (!r || r === ROLES.NOT_ASSIGNED) return "hidden";

  const headRole =
    r === ROLES.SUPER_ADMIN || r.endsWith(" head") ? r : MEMBER_TO_HEAD[r];

  if (!headRole) return "hidden";

  const headAccess = buildHeadExportMap(headRole).get(exportKey) ?? "hidden";
  if (headAccess === "hidden") return "hidden";
  if (r.endsWith(" member")) return "show_only";
  return headAccess;
}

function exportKeyFromRequestPath(req) {
  const pathOnly = (req.path || req.url || "").split("?")[0];
  return ROUTE_EXPORT_KEY[pathOnly] || null;
}

function canDownloadExport(role, exportKey) {
  const access = getAllDataExportAccess(role, exportKey);
  return access === "download_full" || access === "download_scoped";
}

function usesFullExportForRole(role, exportKey) {
  return getAllDataExportAccess(role, exportKey) === "download_full";
}

function canDownloadMembershipPdf(role) {
  const r = String(role ?? "").trim().toLowerCase();
  if (!r) return false;
  if (r === ROLES.SUPER_ADMIN) return true;
  return r.endsWith(" head");
}

module.exports = {
  EXPORT_KEYS,
  ROUTE_EXPORT_KEY,
  exportKeyFromRequestPath,
  getAllDataExportAccess,
  canDownloadExport,
  usesFullExportForRole,
  canDownloadMembershipPdf,
};
