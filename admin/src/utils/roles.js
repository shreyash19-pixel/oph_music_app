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
  ROLES.PROJECT_HEAD,
  ROLES.PROJECT_MEMBER,
];

/** Artist Portal Content section (New / Manage / TV Publishing). */
export const CONTENT_PORTAL_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMINISTRATIVE_HEAD,
  ROLES.ADMINISTRATIVE_MEMBER,
  ROLES.CREATIVE_HEAD,
  ROLES.CREATIVE_MEMBER,
];
