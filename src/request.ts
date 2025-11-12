import type { BacklogConfig, BacklogError, RetryConfig } from "./config.ts";

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  retryableStatusCodes: [429, 500, 502, 503, 504],
  exponentialBackoff: true,
};

/**
 * Check if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  // Network errors (fetch throws)
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return true;
  }

  // AbortError (timeout) should not be retried by default
  if (error instanceof Error && error.name === "AbortError") {
    return false;
  }

  return false;
}

/**
 * Check if a status code is retryable
 */
function isRetryableStatusCode(statusCode: number, retryConfig: Required<RetryConfig>): boolean {
  return retryConfig.retryableStatusCodes.includes(statusCode);
}

/**
 * Calculate delay for the next retry attempt
 */
function calculateRetryDelay(attempt: number, retryConfig: Required<RetryConfig>): number {
  if (!retryConfig.exponentialBackoff) {
    return retryConfig.baseDelay;
  }

  // Exponential backoff with jitter
  const exponentialDelay = retryConfig.baseDelay * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 0.1 * exponentialDelay; // Add up to 10% jitter
  const delay = exponentialDelay + jitter;

  return Math.min(delay, retryConfig.maxDelay);
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build query string from parameters
 */
function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(`${key}[]`, String(item));
      }
    } else {
      searchParams.append(key, String(value));
    }
  }

  return searchParams.toString();
}

/**
 * Build request URL
 */
export function buildUrl(
  config: BacklogConfig,
  path: string,
  params?: Record<string, unknown>,
): string {
  const protocol = config.host.startsWith("localhost:") ? "http" : "https";
  const baseUrl = `${protocol}://${config.host}/api/v2/${path}`;

  const queryParams: Record<string, unknown> = { ...params };

  if (config.apiKey) {
    queryParams.apiKey = config.apiKey;
  }

  const queryString = buildQueryString(queryParams);
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Build request headers
 */
function buildHeaders(config: BacklogConfig): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (config.accessToken) {
    headers.Authorization = `Bearer ${config.accessToken}`;
  }

  return headers;
}

/**
 * Execute a single HTTP request attempt
 */
async function executeRequest<T>(
  url: string,
  requestOptions: RequestInit,
  logger?: BacklogConfig["logger"],
  method: string = "GET",
): Promise<{ response: Response; data: T; duration: number }> {
  const startTime = performance.now();

  try {
    const response = await fetch(url, requestOptions);
    const duration = performance.now() - startTime;

    if (!response.ok) {
      // For non-ok responses, we need to handle them specially for retry logic
      let errorData: BacklogError;

      try {
        errorData = (await response.json()) as BacklogError;
      } catch {
        errorData = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          code: response.status,
        };
      }

      // Log error if logger is configured
      if (logger?.error) {
        logger.error(method, url, errorData, duration);
      }

      // Create a custom error that includes the status code for retry logic
      const error = new Error(
        errorData.errors?.[0]?.message || errorData.message || "Unknown error",
      ) as Error & { status?: number };
      error.status = response.status;

      throw error;
    }

    // Clone the response so we can read it twice
    const responseClone = response.clone();
    const data = await response.json() as T;

    // Log response if logger is configured
    if (logger?.response) {
      logger.response(
        method,
        url,
        responseClone.status,
        responseClone.headers,
        data,
        duration,
      );
    }

    return { response: responseClone, data, duration };
  } catch (error) {
    const duration = performance.now() - startTime;

    // Re-throw with duration for potential logging
    const errorWithDuration = error as Error & { duration?: number };
    errorWithDuration.duration = duration;
    throw errorWithDuration;
  }
}

/**
 * Send HTTP request with retry logic
 */
export async function request<T>(
  config: BacklogConfig,
  path: string,
  options: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    // deno-lint-ignore no-explicit-any
    params?: any;
    // deno-lint-ignore no-explicit-any
    body?: any;
  } = {},
): Promise<T> {
  const method = options.method || "GET";
  const url = buildUrl(config, path, options.params);
  const headers = buildHeaders(config);
  const logger = config.logger;

  // Merge retry configuration with defaults
  const retryConfig: Required<RetryConfig> = {
    ...DEFAULT_RETRY_CONFIG,
    ...config.retry,
  };

  const requestOptions: RequestInit = {
    method,
    headers,
  };

  if (options.body && method !== "GET") {
    requestOptions.body = JSON.stringify(options.body);
  }

  // Log request if logger is configured
  if (logger?.request) {
    logger.request(
      method,
      url,
      headers,
      options.body && method !== "GET" ? options.body : undefined,
    );
  }

  let lastError: Error | undefined;
  let attempt = 0;

  while (attempt < retryConfig.maxAttempts) {
    attempt++;

    try {
      // Handle timeout if configured
      if (config.timeout) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);
        requestOptions.signal = controller.signal;

        try {
          const result = await executeRequest<T>(url, requestOptions, logger, method);
          clearTimeout(timeoutId);
          return result.data;
        } catch (error) {
          clearTimeout(timeoutId);
          throw error;
        }
      } else {
        const result = await executeRequest<T>(url, requestOptions, logger, method);
        return result.data;
      }
    } catch (error) {
      lastError = error as Error;
      const errorWithStatus = error as Error & { status?: number; duration?: number };

      // Log error on final attempt or non-retryable errors
      const shouldRetry = attempt < retryConfig.maxAttempts &&
        (isRetryableError(error) ||
          (errorWithStatus.status && isRetryableStatusCode(errorWithStatus.status, retryConfig)));

      if (!shouldRetry && logger?.error) {
        logger.error(method, url, error, errorWithStatus.duration || 0);
      }

      if (!shouldRetry) {
        break;
      }

      // Calculate delay for next retry
      if (attempt < retryConfig.maxAttempts) {
        const delay = calculateRetryDelay(attempt, retryConfig);

        if (logger?.error) {
          logger.error(
            method,
            url,
            `Attempt ${attempt}/${retryConfig.maxAttempts} failed, retrying in ${delay}ms: ${
              lastError.message || "Unknown error"
            }`,
            errorWithStatus.duration || 0,
          );
        }

        await sleep(delay);
      }
    }
  }

  // If we get here, all retries failed
  if (lastError) {
    throw lastError;
  } else {
    throw new Error("Request failed after all retry attempts");
  }
}

/**
 * Download file from Backlog
 */
export async function download(
  config: BacklogConfig,
  path: string,
): Promise<{ body: ArrayBuffer; fileName?: string }> {
  const method = "GET";
  const url = buildUrl(config, path);
  const headers = buildHeaders(config);
  const logger = config.logger;

  // Log request if logger is configured
  if (logger?.request) {
    logger.request(method, url, headers);
  }

  // Start timing the request
  const startTime = performance.now();

  try {
    const response = await fetch(url, {
      method,
      headers,
    });
    const duration = performance.now() - startTime;

    if (!response.ok) {
      // Try to parse error as JSON if possible
      let errorData: BacklogError;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          message: `HTTP ${response.status}: ${response.statusText}`,
          code: response.status,
        };
      }

      // Log error if logger is configured
      if (logger?.error) {
        logger.error(method, url, errorData, duration);
      }

      throw new Error(
        errorData.errors?.[0]?.message || errorData.message || "Unknown error",
      );
    }

    const body = await response.arrayBuffer();
    const contentDisposition = response.headers.get("Content-Disposition");
    let fileName: string | undefined;

    if (contentDisposition) {
      let match = contentDisposition.match(/filename="?(.+?)"?$/);
      if (match) {
        fileName = match[1];
      } else {
        match = contentDisposition.match(/filename\*=UTF-8''(.+)$/);
        if (match) {
          fileName = decodeURIComponent(match[1]);
        }
      }
    }

    // Log response if logger is configured
    if (logger?.response) {
      logger.response(
        method,
        url,
        response.status,
        response.headers,
        { size: body.byteLength, fileName },
        duration,
      );
    }

    return { body, fileName };
  } catch (error) {
    const duration = performance.now() - startTime;

    // Log error if logger is configured
    if (logger?.error) {
      logger.error(method, url, error, duration);
    }

    throw error;
  }
}
