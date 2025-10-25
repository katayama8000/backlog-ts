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
function buildUrl(
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

  const requestOptions: RequestInit = {
    method,
    headers,
  };

  if (options.body && method !== "GET") {
    requestOptions.body = JSON.stringify(options.body);
  }

  if (config.timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    requestOptions.signal = controller.signal;

    try {
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      if (!response.ok) {
        await handleErrorResponse(response);
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  const response = await fetch(url, requestOptions);

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  return (await response.json()) as T;
}

/**
 * Download file from Backlog
 */
export async function download(
  config: BacklogConfig,
  path: string,
): Promise<{ body: ArrayBuffer; fileName?: string }> {
  const url = buildUrl(config, path);
  const headers = buildHeaders(config);

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    await handleErrorResponse(response);
  }

  const body = await response.arrayBuffer();
  const contentDisposition = response.headers.get("Content-Disposition");
  let fileName: string | undefined;

  if (contentDisposition) {
    const match = contentDisposition.match(/filename="?(.+?)"?$/);
    if (match) {
      fileName = match[1];
    }
  }

  return { body, fileName };
}
