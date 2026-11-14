/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Baseline hardening. None of this affects ranking directly; it stops the
        // site being framed or MIME-sniffed, which is a trust signal for users and
        // a prerequisite for passing a security review of a shopping destination.
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
        ],
      },
      {
        // Feeds and sitemaps are re-fetched by crawlers; let the edge serve them.
        source: '/:path(sitemap.xml|sitemap-images.xml|feed/google-merchant.xml)',
        headers: [{ key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' }],
      },
    ]
  },
}

module.exports = nextConfig
