/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // database drivers load native/WASM code at runtime; keep them out of the server bundle
    serverComponentsExternalPackages: ['pg', '@electric-sql/pglite'],
  },
  images: {
    domains: ['images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
