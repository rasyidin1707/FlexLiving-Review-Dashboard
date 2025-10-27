/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  webpack: (config, { dev }) => {
    // Mitigate intermittent Windows file-lock and cache rename issues
    if (dev) {
      // Disable persistent filesystem cache during dev on Windows
      config.cache = false
    }
    return config
  },
}
export default nextConfig
