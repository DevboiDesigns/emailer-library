import { ValidationError } from "../errors";
import type { EmailAddress, Personalization } from "../types";
import {
  MAX_CATEGORIES,
  MAX_CATEGORY_LENGTH,
  MAX_CUSTOM_ARGS_BYTES,
  MAX_EMAIL_SIZE_BYTES,
  MAX_PERSONALIZATIONS,
  MAX_RECIPIENTS,
  MAX_REPLY_TO_LIST,
  MAX_SEND_AT_ADVANCE_SECONDS,
} from "../constants";
import { toEmailAddresses } from "./schemas";

/**
 * Count recipients in a personalization.
 */
function countRecipientsInPersonalization(p: Personalization): number {
  let count = p.to?.length ?? 0;
  count += p.cc?.length ?? 0;
  count += p.bcc?.length ?? 0;
  return count;
}

/**
 * Validate total recipient count does not exceed 1,000.
 */
export function validateRecipientCount(
  personalizations: Personalization[]
): void {
  let total = 0;
  for (const p of personalizations) {
    total += countRecipientsInPersonalization(p);
  }
  if (total > MAX_RECIPIENTS) {
    throw new ValidationError(
      `Total recipients (to + cc + bcc) cannot exceed ${MAX_RECIPIENTS}. Got ${total}`,
      "personalizations"
    );
  }
}

/**
 * Validate personalization count does not exceed 1,000.
 */
export function validatePersonalizationCount(
  personalizations: Personalization[]
): void {
  if (personalizations.length > MAX_PERSONALIZATIONS) {
    throw new ValidationError(
      `Personalizations cannot exceed ${MAX_PERSONALIZATIONS}. Got ${personalizations.length}`,
      "personalizations"
    );
  }
}

/**
 * Calculate byte size of a string (UTF-8).
 */
function getByteSize(str: string): number {
  return Buffer.byteLength(str, "utf8");
}

/**
 * Calculate byte size of custom args object.
 */
function getCustomArgsSize(args: Record<string, string>): number {
  return getByteSize(JSON.stringify(args));
}

/**
 * Validate custom args total size is under 10,000 bytes.
 */
export function validateCustomArgsSize(
  customArgs: Record<string, string> | undefined
): void {
  if (!customArgs || Object.keys(customArgs).length === 0) return;
  const size = getCustomArgsSize(customArgs);
  if (size >= MAX_CUSTOM_ARGS_BYTES) {
    throw new ValidationError(
      `Custom args must be less than ${MAX_CUSTOM_ARGS_BYTES} bytes. Got ${size}`,
      "custom_args"
    );
  }
}

/**
 * Validate categories (max 10, each max 255 chars).
 */
export function validateCategories(categories: string[] | undefined): void {
  if (!categories || categories.length === 0) return;
  if (categories.length > MAX_CATEGORIES) {
    throw new ValidationError(
      `Categories cannot exceed ${MAX_CATEGORIES}. Got ${categories.length}`,
      "categories"
    );
  }
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    if (typeof cat !== "string") {
      throw new ValidationError(
        `Category at index ${i} must be a string`,
        "categories"
      );
    }
    if (getByteSize(cat) > MAX_CATEGORY_LENGTH) {
      throw new ValidationError(
        `Category "${cat}" exceeds ${MAX_CATEGORY_LENGTH} characters`,
        "categories"
      );
    }
  }
}

/**
 * Validate send_at is not more than 72 hours in the future.
 */
export function validateSendAt(sendAt: number | undefined): void {
  if (sendAt === undefined) return;
  const now = Math.floor(Date.now() / 1000);
  const maxFuture = now + MAX_SEND_AT_ADVANCE_SECONDS;
  if (sendAt > maxFuture) {
    throw new ValidationError(
      `Scheduled send cannot be more than 72 hours in advance. send_at=${sendAt}, max=${maxFuture}`,
      "send_at"
    );
  }
}

/**
 * Validate reply-to list does not exceed 1,000 addresses.
 */
export function validateReplyToList(replyToList: EmailAddress[] | undefined): void {
  if (!replyToList || replyToList.length === 0) return;
  if (replyToList.length > MAX_REPLY_TO_LIST) {
    throw new ValidationError(
      `Reply-to list cannot exceed ${MAX_REPLY_TO_LIST} addresses. Got ${replyToList.length}`,
      "reply_to_list"
    );
  }
}

/**
 * Estimate total email size (headers + body + attachments).
 * This is an approximation; actual size may differ slightly.
 */
export function estimateEmailSize(payload: {
  personalizations: Personalization[];
  from: { email: string; name?: string };
  subject?: string;
  content?: Array<{ type: string; value: string }>;
  attachments?: Array<{ content: string; filename: string; type?: string }>;
  templateId?: string;
  categories?: string[];
  customArgs?: Record<string, string>;
}): number {
  let size = getByteSize(JSON.stringify(payload));
  // Base64 increases size by ~33%; attachments are already base64 in payload
  return size;
}

/**
 * Validate total email size is under 30MB.
 */
export function validateEmailSize(estimatedSize: number): void {
  if (estimatedSize >= MAX_EMAIL_SIZE_BYTES) {
    throw new ValidationError(
      `Total email size cannot exceed ${MAX_EMAIL_SIZE_BYTES} bytes (30MB). Estimated ${estimatedSize} bytes`,
      "content"
    );
  }
}
