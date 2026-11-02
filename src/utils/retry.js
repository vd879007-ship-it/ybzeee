/**
 * Retry Utility with Exponential Backoff, Jitter, and Shopify Rate Limit Awareness
 */

const logger = require('./logger');

/**
 * Sleep for specified milliseconds
 * @param {number} ms 
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Executes an async operation with retry logic
 * @param {Function} fn Function to execute returning a Promise
 * @param {Object} options Configuration options
 * @param {number} options.maxRetries Maximum number of retries (default 5)
 * @param {number} options.baseDelay Initial delay in ms (default 1000)
 * @param {number} options.maxDelay Max delay cap in ms (default 30000)
 * @param {string} options.operationName Name of operation for logging
 * @returns {Promise<any>}
 */
async function withRetry(fn, options = {}) {
  const {
    maxRetries = 5,
    baseDelay = 1000,
    maxDelay = 30000,
    operationName = 'Operation'
  } = options;

  let attempt = 0;

  while (true) {
    attempt++;
    try {
      return await fn();
    } catch (error) {
      if (attempt > maxRetries) {
        logger.error(`[${operationName}] Failed after ${maxRetries} retries.`, error);
        throw error;
      }

      // Check if error is retryable
      const isRateLimited = 
        error.status === 429 ||
        error.message?.includes('429') ||
        error.message?.includes('THROTTLED') ||
        error.message?.includes('Throttled') ||
        error.extensions?.code === 'THROTTLED';

      const isNetworkError =
        error.code === 'ECONNRESET' ||
        error.code === 'ETIMEDOUT' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'EAI_AGAIN' ||
        error.name === 'FetchError' ||
        error.name === 'AbortError' ||
        (error.status >= 500 && error.status < 600);

      const isRetryable = isRateLimited || isNetworkError;

      if (!isRetryable) {
        // Non-retryable business logic / client error
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      let delay = Math.min(maxDelay, baseDelay * Math.pow(2, attempt - 1));
      
      // If server specified Retry-After header, respect it
      if (error.retryAfter) {
        const retryAfterMs = Number(error.retryAfter) * 1000;
        if (!isNaN(retryAfterMs) && retryAfterMs > 0) {
          delay = Math.max(delay, retryAfterMs);
        }
      }

      // Add full jitter (0 to 25% of delay)
      const jitter = Math.random() * (delay * 0.25);
      const totalDelay = Math.round(delay + jitter);

      if (isRateLimited) {
        logger.warn(`[${operationName}] Shopify rate limit reached (Attempt ${attempt}/${maxRetries}). Pausing for ${totalDelay}ms before retry...`);
      } else {
        logger.warn(`[${operationName}] Transient network error (${error.code || error.status || error.message}) on attempt ${attempt}/${maxRetries}. Retrying in ${totalDelay}ms...`);
      }

      await sleep(totalDelay);
    }
  }
}

module.exports = {
  sleep,
  withRetry
};
