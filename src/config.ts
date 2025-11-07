/**
 * Logger interface for request/response logging
 */
export interface Logger {
  /**
   * Log request details before sending
   * @param method HTTP method
   * @param url Request URL
   * @param headers Request headers
   * @param body Request body (if any)
   */
  request?(method: string, url: string, headers: Record<string, string>, body?: unknown): void;

  /**
   * Log response details after receiving
   * @param method Original HTTP method
   * @param url Original request URL
   * @param status Response status code
   * @param headers Response headers
   * @param body Response body (if any)
   * @param duration Request duration in milliseconds
   */
  response?(
    method: string,
    url: string,
    status: number,
    headers: Headers,
    body: unknown,
    duration: number,
  ): void;

  /**
   * Log error details
   * @param method Original HTTP method
   * @param url Original request URL
   * @param error Error object
   * @param duration Request duration in milliseconds
   */
  error?(method: string, url: string, error: unknown, duration: number): void;
}

/**
 * Default logger that logs to console
 */
export const consoleLogger: Logger = {
  request(method, url, _headers, body) {
    const sanitizedUrl = url.replace(/apiKey=([^&]+)/, "apiKey=****");
    console.log(`🔼 [${method}] ${sanitizedUrl}`);
    if (body) {
      console.log("Request Body:", typeof body === "string" ? body : JSON.stringify(body, null, 2));
    }
  },
  response(method, url, status, _headers, body, duration) {
    const sanitizedUrl = url.replace(/apiKey=([^&]+)/, "apiKey=****");
    console.log(
      `🔽 [${method}] ${sanitizedUrl} - ${status} (${duration.toFixed(2)}ms)`,
    );
    if (body && typeof body !== "string" && !(body instanceof ArrayBuffer)) {
      console.log("Response Body:", JSON.stringify(body, null, 2));
    }
  },
  error(method, url, error, duration) {
    const sanitizedUrl = url.replace(/apiKey=([^&]+)/, "apiKey=****");
    console.error(
      `❌ [${method}] ${sanitizedUrl} - Error (${duration.toFixed(2)}ms)`,
      error,
    );
  },
};

/**
 * Retry configuration
 */
export interface RetryConfig {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number;
  /** Base delay between retries in milliseconds (default: 1000) */
  baseDelay?: number;
  /** Maximum delay between retries in milliseconds (default: 30000) */
  maxDelay?: number;
  /** HTTP status codes to retry on (default: [429, 500, 502, 503, 504]) */
  retryableStatusCodes?: number[];
  /** Whether to use exponential backoff (default: true) */
  exponentialBackoff?: boolean;
}

/**
 * Backlog client configuration
 */
export interface BacklogConfig {
  /** Backlog host (e.g., "your-space.backlog.com") */
  host: string;
  /** API key for authentication */
  apiKey?: string;
  /** OAuth2 access token for authentication */
  accessToken?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Logger for request/response logging */
  logger?: Logger;
  /** Retry configuration for failed requests */
  retry?: RetryConfig;
}

/**
 * HTTP request options
 */
export interface RequestOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
}

/**
 * Backlog API error
 */
export interface BacklogError {
  message: string;
  code?: number;
  errors?: Array<{
    message: string;
    code: number;
    errorInfo?: string;
    moreInfo?: string;
  }>;
}
