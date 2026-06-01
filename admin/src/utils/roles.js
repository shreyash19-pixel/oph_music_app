export const ROLES = {
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

/** Artist Portal "Analytics" sidebar + KPI / content analytics / release / audio platform routes */
export const ANALYTICS_PORTAL_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.OPERATION_HEAD,
  ROLES.OPERATION_MEMBER,
];

/**
 * Approve/reject payment transactions (event, song, general status updates).
 * Project members may view event payments but cannot approve or reject.
 */
export const PAYMENT_APPROVE_REJECT_DENY_ROLES = [
  ROLES.SALES_MEMBER,
  ROLES.ADMINISTRATIVE_MEMBER,
  ROLES.ACCOUNTS_MEMBER,
  ROLES.PROJECT_MEMBER,
];

export const canApproveRejectPayments = (role) =>
  Boolean(role && !PAYMENT_APPROVE_REJECT_DENY_ROLES.includes(role));

/** Event payments nav + `/EventPayments` route (Artist Portal). Includes rejected rows in lists/detail; approve/reject stays gated in UI/API. */
export const EVENT_PAYMENTS_SIDEBAR_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.SALES_HEAD,
  ROLES.SALES_MEMBER,
  ROLES.PROJECT_HEAD,
  ROLES.PROJECT_MEMBER,
  ROLES.ACCOUNTS_HEAD,
  ROLES.ACCOUNTS_MEMBER,
];

/** Withdrawals: approve/reject pending requests (accounts member is view-only). */
export const WITHDRAWAL_APPROVE_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ACCOUNTS_HEAD,
];

export const canApproveRejectWithdrawals = (role) =>
  Boolean(role && WITHDRAWAL_APPROVE_ROLES.includes(role));

/** Artist Portal Payments → `/PaymentAll`, `/PaymentWithdraw` (matches Sidebar "Payments"). */
export const PAYMENTS_PORTAL_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRATIVE_HEAD,
  ROLES.ADMINISTRATIVE_MEMBER,
  ROLES.ACCOUNTS_HEAD,
  ROLES.ACCOUNTS_MEMBER,
];

/** MY EPK → Change Details & New Songs (not accounts head/member). */
export const MY_EPK_CHANGE_AND_SONGS_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRATIVE_HEAD,
  ROLES.ADMINISTRATIVE_MEMBER,
  ROLES.SALES_MEMBER,
  ROLES.SALES_HEAD,
];

/** MY EPK → Income (includes accounts). */
export const MY_EPK_INCOME_ROLES = [
  ...MY_EPK_CHANGE_AND_SONGS_ROLES,
  ROLES.ACCOUNTS_HEAD,
  ROLES.ACCOUNTS_MEMBER,
];

/**
 * Website Config → Event Management (sidebar + participants / winning routes).
 * Sales and accounts head/member see only Participants / Winning in the sidebar (see Sidebar).
 */
export const EVENT_MANAGEMENT_WEB_CONFIG_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.SALES_HEAD,
  ROLES.SALES_MEMBER,
  ROLES.PROJECT_HEAD,
  ROLES.PROJECT_MEMBER,
  ROLES.ACCOUNTS_HEAD,
  ROLES.ACCOUNTS_MEMBER,
];

/** Event Creation, Events list, `/event_management/:id` — not accounts head/member. */
export const EVENT_CREATION_AND_LIST_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.SALES_HEAD,
  ROLES.SALES_MEMBER,
  ROLES.PROJECT_HEAD,
  ROLES.PROJECT_MEMBER,
];

/**
 * Assign / change event winner (`/event-winner-assign/...`, POST /assign-winner).
 * Sales head & sales member are view-only on Event Winning (same as accounts / project member).
 */
export const EVENT_WINNER_ASSIGN_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.PROJECT_HEAD,
];

/** Artist Portal Content section (New / Manage; TV Publishing sub-item uses TV_PUBLISHING_PORTAL_ROLES). */
export const CONTENT_PORTAL_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRATIVE_HEAD,
  ROLES.ADMINISTRATIVE_MEMBER,
  ROLES.CREATIVE_HEAD,
  ROLES.CREATIVE_MEMBER,
  ROLES.ACCOUNTS_HEAD,
  ROLES.ACCOUNTS_MEMBER,
];

/** Content → New & Manage: approve/reject, edit, upload (accounts roles are view-only). */
export const CONTENT_MANAGE_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRATIVE_HEAD,
  ROLES.ADMINISTRATIVE_MEMBER,
  ROLES.CREATIVE_HEAD,
  ROLES.CREATIVE_MEMBER,
];

export const canManageContent = (role) =>
  Boolean(role && CONTENT_MANAGE_ROLES.includes(role));

/** TV Publishing routes + nav — not available to creative member. */
export const TV_PUBLISHING_PORTAL_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRATIVE_HEAD,
  ROLES.ADMINISTRATIVE_MEMBER,
  ROLES.CREATIVE_HEAD,
];

/** TV Publishing detail: page unlock, A/V lock toggles, save files — not administrative member. */
export const TV_PUBLISHING_LOCK_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRATIVE_HEAD,
];

/** TV Publishing: approve / reject status (includes administrative member). */
export const TV_PUBLISHING_APPROVE_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRATIVE_HEAD,
  ROLES.ADMINISTRATIVE_MEMBER,
];

/** @deprecated Use TV_PUBLISHING_LOCK_ROLES */
export const TV_PUBLISHING_MANAGE_ROLES = TV_PUBLISHING_LOCK_ROLES;

export const canLockUnlockTvPublishing = (role) =>
  Boolean(role && TV_PUBLISHING_LOCK_ROLES.includes(role));

export const canApproveTvPublishing = (role) =>
  Boolean(role && TV_PUBLISHING_APPROVE_ROLES.includes(role));

/** @deprecated Use canLockUnlockTvPublishing */
export const canManageTvPublishing = canLockUnlockTvPublishing;

/** Collab (Website Config / Artist Portal) — view for accounts; no edit actions on these pages. */
export const COLLAB_VIEW_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRATIVE_HEAD,
  ROLES.ADMINISTRATIVE_MEMBER,
  ROLES.ACCOUNTS_HEAD,
  ROLES.ACCOUNTS_MEMBER,
];

/** Time Calendar + verify-booking-dates — view for accounts; approve/reject uses BOOKING_VERIFICATION_MANAGE_ROLES. */
export const TIME_CALENDAR_VIEW_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRATIVE_HEAD,
  ROLES.ADMINISTRATIVE_MEMBER,
  ROLES.ACCOUNTS_HEAD,
  ROLES.ACCOUNTS_MEMBER,
];

export const isAccountsPortalViewOnlyRole = (role) =>
  role === ROLES.ACCOUNTS_HEAD || role === ROLES.ACCOUNTS_MEMBER;

/**
 * Time Calendar → /verify-booking-dates: approve/reject date booking & release date change payments.
 * Administrative members may view only.
 */
export const BOOKING_VERIFICATION_MANAGE_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRATIVE_HEAD,
];

export const canManageBookingVerification = (role) =>
  Boolean(role && BOOKING_VERIFICATION_MANAGE_ROLES.includes(role));

/** Artist Portal Tickets (Submitted / Resolved) + ticket detail routes — not accounts head/member. */
export const TICKETS_PORTAL_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRATIVE_HEAD,
  ROLES.ADMINISTRATIVE_MEMBER,
];

/** Dashboard "Website Config" hub + sidebar — not for creative head / creative member. */
export const WEBSITE_CONFIG_HUB_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRATIVE_HEAD,
  ROLES.ADMINISTRATIVE_MEMBER,
  ROLES.SALES_HEAD,
  ROLES.SALES_MEMBER,
  ROLES.OPERATION_HEAD,
  ROLES.OPERATION_MEMBER,
  ROLES.PROJECT_HEAD,
  ROLES.PROJECT_MEMBER,
  ROLES.ACCOUNTS_HEAD,
  ROLES.ACCOUNTS_MEMBER,
];

/** Website Config → Setting (costing / QR codes). Sales roles cannot access UI or POST/PUT costing. */
export const WEBSITE_CONFIG_SETTINGS_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRATIVE_HEAD,
];

/** Artist Portal → All Data (/data): roles with at least one visible export (see allDataPermissions.js). */
export const ALL_DATA_DOWNLOAD_PORTAL_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRATIVE_HEAD,
  ROLES.ADMINISTRATIVE_MEMBER,
  ROLES.SALES_HEAD,
  ROLES.SALES_MEMBER,
  ROLES.OPERATION_HEAD,
  ROLES.OPERATION_MEMBER,
  ROLES.PROJECT_HEAD,
  ROLES.PROJECT_MEMBER,
  ROLES.CREATIVE_HEAD,
  ROLES.CREATIVE_MEMBER,
  ROLES.ACCOUNTS_HEAD,
  ROLES.ACCOUNTS_MEMBER,
];
