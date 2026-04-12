import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy /api/v1/* requests to the actual API server.
  // This avoids CORS issues when Admin and API are on different domains.
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiUrl) return [];

    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
