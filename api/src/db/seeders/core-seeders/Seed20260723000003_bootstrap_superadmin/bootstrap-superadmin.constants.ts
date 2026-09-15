export const BOOTSTRAP_SUPERADMIN_NAME = "Superadmin";

export const BOOTSTRAP_SUPERADMIN_ERROR_MESSAGES = {
  MISSING_CREDENTIALS:
    "SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD are required when bootstrapping production",
  EMAIL_TAKEN_BY_OTHER_ROLE:
    "SUPERADMIN_EMAIL belongs to an existing non-superadmin user; refusing to promote it. Point SUPERADMIN_EMAIL at a new address or grant the superadmin role deliberately.",
} as const;
