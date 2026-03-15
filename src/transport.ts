import { SendGridError } from "./errors";
import type { RateLimitInfo, SendGridErrorDetail } from "./types";
import { SENDGRID_BASE_URL, MAIL_SEND_PATH } from "./constants";

/** Mail Send API request body (SendGrid v3 format) */
export interface MailSendBody {
  personalizations: Array<{
    to: Array<{ email: string; name?: string }>;
    cc?: Array<{ email: string; name?: string }>;
    bcc?: Array<{ email: string; name?: string }>;
    subject?: string;
    dynamic_template_data?: Record<string, unknown>;
    custom_args?: Record<string, string>;
    send_at?: number;
  }>;
  from: { email: string; name?: string };
  reply_to?: { email: string; name?: string };
  reply_to_list?: Array<{ email: string; name?: string }>;
  subject?: string;
  content?: Array<{ type: string; value: string }>;
  attachments?: Array<{
    content: string;
    filename: string;
    type?: string;
    disposition?: string;
    content_id?: string;
  }>;
  template_id?: string;
  categories?: string[];
  custom_args?: Record<string, string>;
  send_at?: number;
  asm?: { group_id: number; groups_to_display?: number[] };
  ip_pool_name?: string;
  mail_settings?: { sandbox_mode?: { enable: boolean } };
  [key: string]: unknown;
}

export interface TransportConfig {
  apiKey: string;
  baseUrl?: string;
}

function parseRateLimitHeaders(headers: Headers): RateLimitInfo | undefined {
  const limit = headers.get("x-ratelimit-limit");
  const remaining = headers.get("x-ratelimit-remaining");
  const reset = headers.get("x-ratelimit-reset");
  if (limit && remaining && reset) {
    return {
      limit: parseInt(limit, 10),
      remaining: parseInt(remaining, 10),
      reset: parseInt(reset, 10),
    };
  }
  return undefined;
}

function headersToRecord(headers: Headers): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((value, key) => {
    record[key] = value;
  });
  return record;
}

/**
 * Send mail via SendGrid v3 API.
 */
export async function sendMail(
  body: MailSendBody,
  config: TransportConfig
): Promise<{ statusCode: number; headers: Record<string, string>; rateLimit?: RateLimitInfo }> {
  const baseUrl = config.baseUrl ?? SENDGRID_BASE_URL;
  const url = `${baseUrl}${MAIL_SEND_PATH}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseHeaders = headersToRecord(response.headers);
  const rateLimit = parseRateLimitHeaders(response.headers);

  if (response.ok) {
    return {
      statusCode: response.status,
      headers: responseHeaders,
      rateLimit,
    };
  }

  let errors: SendGridErrorDetail[] = [];
  try {
    const json = await response.json();
    if (json.errors && Array.isArray(json.errors)) {
      errors = json.errors;
    }
  } catch {
    // Response body may not be JSON
  }

  const errorMessages = errors.map((e) => e.message).join("; ");
  const message =
    errorMessages || `SendGrid API error: ${response.status} ${response.statusText}`;

  throw new SendGridError(
    message,
    response.status,
    errors,
    rateLimit
  );
}
