import { ROLES } from "./roles";

/** Stable keys for All Data export cards / API checks */
export const ALL_DATA_EXPORT_KEYS = {
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

/** @typedef {'hidden' | 'download_full' | 'download_scoped' | 'show_only'} AllDataExportAccess */

const ALL_EXPORT_KEYS = Object.values(ALL_DATA_EXPORT_KEYS);

const SALES_HEAD_SCOPED = [
  ALL_DATA_EXPORT_KEYS.COMPLETE_ARTIST_STATUS,
  ALL_DATA_EXPORT_KEYS.PERSONAL_DETAILS,
  ALL_DATA_EXPORT_KEYS.PROFESSIONAL_DETAILS,
  ALL_DATA_EXPORT_KEYS.DOCUMENTATION_DETAILS,
  ALL_DATA_EXPORT_KEYS.ALL_PAYMENTS,
  ALL_DATA_EXPORT_KEYS.WITHDRAWALS,
  ALL_DATA_EXPORT_KEYS.EVENT_PARTICIPANTS,
  ALL_DATA_EXPORT_KEYS.CONTACT_US,
];

const OPERATION_HEAD_SCOPED = [
  ALL_DATA_EXPORT_KEYS.BOOKINGS,
  ALL_DATA_EXPORT_KEYS.SONGS_REGISTER,
  ALL_DATA_EXPORT_KEYS.AUDIO_DETAILS,
  ALL_DATA_EXPORT_KEYS.VIDEO_DETAILS,
  ALL_DATA_EXPORT_KEYS.SONG_REGISTRATION_APPLICATION_STATUS,
];

const PROJECT_HEAD_SCOPED = [
  ALL_DATA_EXPORT_KEYS.ALL_PAYMENTS,
  ALL_DATA_EXPORT_KEYS.EVENT_PARTICIPANTS,
];

const CREATIVE_HEAD_SCOPED = [
  ALL_DATA_EXPORT_KEYS.BOOKINGS,
  ALL_DATA_EXPORT_KEYS.SONGS_REGISTER,
  ALL_DATA_EXPORT_KEYS.AUDIO_DETAILS,
  ALL_DATA_EXPORT_KEYS.VIDEO_DETAILS,
  ALL_DATA_EXPORT_KEYS.SONG_REGISTRATION_APPLICATION_STATUS,
  ALL_DATA_EXPORT_KEYS.TV_PUBLISHING,
];

const ACCOUNTS_HEAD_SCOPED = [
  ALL_DATA_EXPORT_KEYS.COMPLETE_ARTIST_STATUS,
  ALL_DATA_EXPORT_KEYS.ALL_PAYMENTS,
  ALL_DATA_EXPORT_KEYS.BOOKINGS,
  ALL_DATA_EXPORT_KEYS.SONG_REGISTRATION_APPLICATION_STATUS,
  ALL_DATA_EXPORT_KEYS.WITHDRAWALS,
  ALL_DATA_EXPORT_KEYS.EVENT_PARTICIPANTS,
  ALL_DATA_EXPORT_KEYS.SPECIAL_ARTIST_SONGS,
];

const ADMIN_HEAD_HIDDEN = [ALL_DATA_EXPORT_KEYS.EVENT_PARTICIPANTS];

/** Map member role → department head role for All Data visibility */
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

/**
 * Head / super-admin download policy (members use show_only for same visible exports).
 * @param {string} role
 * @returns {Map<string, AllDataExportAccess>}
 */
function buildHeadExportMap(role) {
  const map = new Map();

  if (role === ROLES.SUPER_ADMIN) {
    for (const k of ALL_EXPORT_KEYS) map.set(k, "download_full");
    return map;
  }

  if (role === ROLES.ADMINISTRATIVE_HEAD) {
    for (const k of keysExcept(ADMIN_HEAD_HIDDEN)) {
      map.set(k, "download_full");
    }
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

  const scoped = scopedLists[role];
  if (scoped) {
    for (const k of ALL_EXPORT_KEYS) {
      map.set(k, scoped.includes(k) ? "download_scoped" : "hidden");
    }
    return map;
  }

  return map;
}

/**
 * @param {string} [role]
 * @returns {AllDataExportAccess}
 */
export function getAllDataExportAccess(role, exportKey) {
  if (!role || role === ROLES.NOT_ASSIGNED) return "hidden";

  const headRole =
    role === ROLES.SUPER_ADMIN || role.endsWith(" head")
      ? role
      : MEMBER_TO_HEAD[role];

  if (!headRole) return "hidden";

  const headMap = buildHeadExportMap(headRole);
  const headAccess = headMap.get(exportKey) ?? "hidden";

  if (headAccess === "hidden") return "hidden";

  if (role.endsWith(" member")) return "show_only";

  return headAccess;
}

export function canDownloadAllDataExport(role, exportKey) {
  const access = getAllDataExportAccess(role, exportKey);
  return access === "download_full" || access === "download_scoped";
}

export function usesFullExportDataset(role, exportKey) {
  return getAllDataExportAccess(role, exportKey) === "download_full";
}

/** Membership PDF on artist detail — heads and super admin only */
export function canDownloadMembershipPdf(role) {
  if (!role) return false;
  if (role === ROLES.SUPER_ADMIN) return true;
  return role.endsWith(" head");
}

export function getVisibleAllDataExports(role) {
  return ALL_EXPORT_KEYS.filter(
    (key) => getAllDataExportAccess(role, key) !== "hidden",
  );
}
