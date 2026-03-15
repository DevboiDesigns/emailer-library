/**
 * SendGrid API constants and limits per official documentation.
 * @see https://docs.sendgrid.com/api-reference/mail-send/limitations
 */

/** Base URL for global SendGrid API */
export const SENDGRID_BASE_URL = "https://api.sendgrid.com";

/** Base URL for EU regional SendGrid API */
export const SENDGRID_EU_BASE_URL = "https://api.eu.sendgrid.com";

/** Mail Send API path */
export const MAIL_SEND_PATH = "/v3/mail/send";

/** Maximum total recipients (to + cc + bcc) per request */
export const MAX_RECIPIENTS = 1000;

/** Maximum personalizations per request */
export const MAX_PERSONALIZATIONS = 1000;

/** Maximum total email size in bytes (headers + body + attachments) */
export const MAX_EMAIL_SIZE_BYTES = 30 * 1024 * 1024; // 30MB

/** Maximum custom args size in bytes */
export const MAX_CUSTOM_ARGS_BYTES = 10000;

/** Maximum reply-to list addresses */
export const MAX_REPLY_TO_LIST = 1000;

/** Maximum categories per email */
export const MAX_CATEGORIES = 10;

/** Maximum category name length in characters */
export const MAX_CATEGORY_LENGTH = 255;

/** Maximum schedule time in advance: 72 hours in seconds */
export const MAX_SEND_AT_ADVANCE_SECONDS = 72 * 60 * 60;
