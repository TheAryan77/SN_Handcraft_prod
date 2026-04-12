/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy /api/v1/* requests to the actual API server.
  // This avoids CORS issues when Web and API are on different domains.
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
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
