import { sleep } from "./utils.js";

const RETRY_BASE_DELAY_IN_MS = 1_000;
const RETRY_JITTER_IN_MS = 250;
const RETRY_MAX_ATTEMPTS = 4;

const RATE_LIMIT_REGEX = /rate limit|too many requests|exceeded.*compute units/i;

/**
 * Check if the error is an object and has a nested property with key.
 * @param error object
 * @param key property key
 * @returns value of the nested property
 */
const getNestedErrorValue = (error: unknown, key: string): unknown => {
  const isObject = typeof error === "object" && error !== null;

  if (!isObject) {
    return undefined;
  }

  return (error as Record<string, unknown>)[key];
};

/**
 * Check if the error is a rate limit error by looking for a 429 status code or a rate limit message in the error properties.
 * @param error object
 * @returns yes if the error is a rate limit error, no otherwise
 * @dev different RPC providers return different error shapes, so we check multiple properties and nested properties for both the status code and the message.
 */
const isRateLimitError = (error: unknown): boolean => {
  const code = getNestedErrorValue(error, "code") ?? getNestedErrorValue(getNestedErrorValue(error, "cause"), "code");
  const details = getNestedErrorValue(error, "details");
  const shortMessage = getNestedErrorValue(error, "shortMessage");
  const message =
    getNestedErrorValue(error, "message") ?? getNestedErrorValue(getNestedErrorValue(error, "cause"), "message");

  const hasRateLimitMessage = [details, shortMessage, message].some(
    (value) => typeof value === "string" && RATE_LIMIT_REGEX.test(value),
  );

  return code === 429 || hasRateLimitMessage;
};

/**
 * Retry a request if it fails due to a rate limit error.
 * @param request function that returns a promise
 * @param maxAttempts maximum number of retry attempts
 * @param attempt current attempt number (used recursively)
 * @returns result of the request
 */
export const withRetries = async <T>(
  request: () => Promise<T>,
  maxAttempts = RETRY_MAX_ATTEMPTS,
  attempt = 1,
): Promise<T> => {
  try {
    return await request();
  } catch (error) {
    if (!isRateLimitError(error) || attempt >= maxAttempts) {
      throw error;
    }

    const delay = RETRY_BASE_DELAY_IN_MS + Math.floor(Math.random() * (RETRY_JITTER_IN_MS + 1));
    await sleep(delay);

    return withRetries(request, maxAttempts, attempt + 1);
  }
};
