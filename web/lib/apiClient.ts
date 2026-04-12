/**
 * Unified API URL utility
 * - Server-side: Calls the internal loopback (port 4000)
 * - Browser: Calls the relative path (/api/v1)
 */
export function getApiUrl() {
  if (typeof window === "undefined") {
    // SERVER-SIDE: Always call the local container port directly
    return "http://127.0.0.1:4000/api/v1";
  }
  
  // CLIENT-SIDE: Use the relative path provided by the proxy (Nginx)
  return process.env.NEXT_PUBLIC_API_URL || "/api/v1";
}

/** Utility to get shared accessToken from cookies */
export function getAccessToken() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(^| )accessToken=([^;]+)/);
  return match ? match[2] : null;
}
