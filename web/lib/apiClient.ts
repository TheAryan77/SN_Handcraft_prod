/** Returns the API base URL for client-side fetch calls */
export function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
}

/** Reads the accessToken cookie for authenticated client-side requests */
export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/** Returns auth headers for client-side API calls */
export function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json", ...extra };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}
