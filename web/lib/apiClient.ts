/**
 * Unified API URL utility for separate service deployment
 *
 * - When Next.js rewrites are configured: returns relative "/api/v1" 
 *   (Next.js proxies the request → no CORS issues)
 * - When rewrites are NOT configured: returns NEXT_PUBLIC_API_URL directly
 */
export function getApiUrl() {
  // Use the public env var. Falls back to relative path if not set.
  return process.env.NEXT_PUBLIC_API_URL || "/api/v1";
}

/** Utility to get shared accessToken from cookies */
export function getAccessToken() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(^| )accessToken=([^;]+)/);
  return match ? match[2] : null;
}

/** Returns authentication headers for client-side fetch/axios calls */
export function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}
