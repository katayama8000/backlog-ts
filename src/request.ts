import type { BacklogConfig, BacklogError } from "./config.ts";

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
 * Handle API error response
 */
async function handleErrorResponse(response: Response): Promise<never> {
  let errorData: BacklogError;

  try {
    errorData = (await response.json()) as BacklogError;
  } catch {
    // For non-JSON responses, create an error with status and text
    errorData = {
      message: `HTTP ${response.status}: ${response.statusText}`,
      code: response.status,
    };
  }

  throw new Error(
    errorData.errors?.[0]?.message || errorData.message || "Unknown error",
  );
}

/**
 * Send HTTP request
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

  // Start timing the request
  const startTime = performance.now();

  if (config.timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    requestOptions.signal = controller.signal;

    try {
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);
      const duration = performance.now() - startTime;

      if (!response.ok) {
        try {
          // Clone the response before handling the error so we can read it twice
          const responseClone = response.clone();
          const errorData = await response.json();

          // Log error if logger is configured
          if (logger?.error) {
            logger.error(method, url, errorData, duration);
          }

          // Pass the clone to error handler
          await handleErrorResponse(responseClone);
        } catch (parseError) {
          // If we can't parse the error response as JSON
          if (logger?.error) {
            logger.error(method, url, parseError, duration);
          }
          throw parseError;
        }
      }

      // Clone the response so we can read it twice (once for logging, once for returning)
      const responseClone = response.clone();
      const responseData = await response.json() as T;

      // Log response if logger is configured
      if (logger?.response) {
        logger.response(
          method,
          url,
          responseClone.status,
          responseClone.headers,
          responseData,
          duration,
        );
      }

      return responseData;
    } catch (error) {
      clearTimeout(timeoutId);
      const duration = performance.now() - startTime;

      // Log error if logger is configured
      if (logger?.error) {
        logger.error(method, url, error, duration);
      }

      throw error;
    }
  }

  try {
    const response = await fetch(url, requestOptions);
    const duration = performance.now() - startTime;

    if (!response.ok) {
      try {
        // Clone the response before handling the error so we can read it twice
        const responseClone = response.clone();
        const errorData = await response.json();

        // Log error if logger is configured
        if (logger?.error) {
          logger.error(method, url, errorData, duration);
        }

        // Pass the clone to error handler
        await handleErrorResponse(responseClone);
      } catch (parseError) {
        // If we can't parse the error response as JSON
        if (logger?.error) {
          logger.error(method, url, parseError, duration);
        }
        throw parseError;
      }
    }

    // Clone the response so we can read it twice (once for logging, once for returning)
    const responseClone = response.clone();
    const responseData = await response.json() as T;

    // Log response if logger is configured
    if (logger?.response) {
      logger.response(
        method,
        url,
        responseClone.status,
        responseClone.headers,
        responseData,
        duration,
      );
    }

    return responseData;
  } catch (error) {
    const duration = performance.now() - startTime;

    // Log error if logger is configured
    if (logger?.error) {
      logger.error(method, url, error, duration);
    }

    throw error;
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
      try {
        // Clone the response before handling the error
        const responseClone = response.clone();

        // Try to parse error as JSON if possible
        let errorData;
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

        // Pass the clone to error handler
        await handleErrorResponse(responseClone);
      } catch (parseError) {
        // If we can't parse the error response as JSON
        if (logger?.error) {
          logger.error(method, url, parseError, duration);
        }
        throw parseError;
      }
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
