import { ValidationError } from "../errors";
import type { EmailAddress } from "../types";

/** Basic email regex - validates format */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** ASCII-only regex for from field (SendGrid does not support Unicode in from) */
const ASCII_ONLY_REGEX = /^[\x00-\x7F]*$/;

/**
 * Normalize a value to an array of EmailAddress.
 */
export function toEmailAddresses(
  value: string | EmailAddress | EmailAddress[]
): EmailAddress[] {
  if (typeof value === "string") {
    return [{ email: value }];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [value];
}

/**
 * Validate email format.
 */
export function validateEmailFormat(email: string): void {
  if (!email || typeof email !== "string") {
    throw new ValidationError("Email is required and must be a string", "email");
  }
  const trimmed = email.trim();
  if (!trimmed) {
    throw new ValidationError("Email cannot be empty", "email");
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    throw new ValidationError(`Invalid email format: ${email}`, "email");
  }
}

/**
 * Validate that the from field contains only ASCII (no Unicode).
 * @see https://docs.sendgrid.com/api-reference/mail-send/limitations
 */
export function validateFromEmailAscii(from: EmailAddress): void {
  if (from.name && !ASCII_ONLY_REGEX.test(from.name)) {
    throw new ValidationError(
      "From name must contain only ASCII characters (Unicode not supported)",
      "from.name"
    );
  }
  if (!ASCII_ONLY_REGEX.test(from.email)) {
    throw new ValidationError(
      "From email must contain only ASCII characters (Unicode not supported)",
      "from.email"
    );
  }
}

/**
 * Validate all email addresses in a list.
 */
export function validateEmailAddresses(
  addresses: EmailAddress[],
  field: string
): void {
  for (let i = 0; i < addresses.length; i++) {
    const addr = addresses[i];
    if (!addr || typeof addr !== "object") {
      throw new ValidationError(
        `${field}[${i}] must be an object with email property`,
        field
      );
    }
    validateEmailFormat(addr.email);
  }
}
