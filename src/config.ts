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
