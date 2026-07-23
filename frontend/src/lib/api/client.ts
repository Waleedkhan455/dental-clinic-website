/**
 * Typed API client.
 *
 * All calls to the FastAPI backend go through this module rather than scattering
 * `fetch` throughout components. The base URL is read from an environment
 * variable so it is configurable per environment and never hardcoded.
 */

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

/** Error thrown for any non-2xx API response, carrying status and details. */
export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  /** JSON-serialisable request body. Serialisation and headers are handled here. */
  body?: unknown;
  /** Optional bearer token for authenticated requests (used from Phase 3). */
  token?: string;
}

/**
 * Perform a typed request against the API and return the parsed JSON body.
 * Throws {@link ApiError} on network failure or a non-2xx response.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = options;
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const finalHeaders = new Headers(headers);
  if (body !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (token) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (cause) {
    throw new ApiError(
      "Unable to reach the server. Please check your connection and try again.",
      0,
      cause,
    );
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json().catch(() => undefined) : undefined;

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && "detail" in payload
        ? String((payload as { detail: unknown }).detail)
        : undefined) ?? `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

/** Health payload returned by the backend `/health` endpoint. */
export interface HealthResponse {
  status: string;
  service: string;
  environment: string;
  database: { connected: boolean; name: string | null };
}

/** Fetch backend health (service + database connectivity). */
export function getHealth(): Promise<HealthResponse> {
  return apiFetch<HealthResponse>("/health");
}

/** Simple connectivity check against the API. */
export function ping(): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/ping");
}

export { API_BASE_URL };
