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

/** Event payments nav + `/EventPayments` route (Artist Portal). */
export const EVENT_PAYMENTS_SIDEBAR_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.SALES_HEAD,
  ROLES.PROJECT_HEAD,
  ROLES.PROJECT_MEMBER,
  ROLES.ACCOUNTS_HEAD,
  ROLES.ACCOUNTS_MEMBER,
];

/**
 * Website Config → Event Management (sidebar + event admin routes).
 * Sales see only Participants / Winning in the sidebar; other roles here see all sub-links.
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

/** TV Publishing routes + nav — not available to creative member. */
export const TV_PUBLISHING_PORTAL_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRATIVE_HEAD,
  ROLES.ADMINISTRATIVE_MEMBER,
  ROLES.CREATIVE_HEAD,
];

/** Artist Portal Tickets (Submitted / Resolved) + ticket detail routes. */
export const TICKETS_PORTAL_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRATIVE_HEAD,
  ROLES.ADMINISTRATIVE_MEMBER,
  ROLES.ACCOUNTS_HEAD,
  ROLES.ACCOUNTS_MEMBER,
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
