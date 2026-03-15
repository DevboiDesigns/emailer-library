import type { RateLimitInfo, SendGridErrorDetail } from "./types";

/**
 * Base error for validation failures before the request is sent.
 */
export class ValidationError extends Error {
  readonly name = "ValidationError";
  readonly field?: string;

  constructor(message: string, field?: string) {
    super(message);
    Object.setPrototypeOf(this, ValidationError.prototype);
    this.field = field;
  }
}

/**
 * Error thrown when SendGrid API returns an error response.
 */
export class SendGridError extends Error {
  readonly name = "SendGridError";
  readonly statusCode: number;
  readonly errors: SendGridErrorDetail[];
  readonly rateLimit?: RateLimitInfo;

  constructor(
    message: string,
    statusCode: number,
    errors: SendGridErrorDetail[] = [],
    rateLimit?: RateLimitInfo
  ) {
    super(message);
    Object.setPrototypeOf(this, SendGridError.prototype);
    this.statusCode = statusCode;
    this.errors = errors;
    this.rateLimit = rateLimit;
  }
}
