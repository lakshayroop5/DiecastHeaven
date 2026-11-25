/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Product photos are served from pre-generated Blob variants (see
    // lib/image-loader.js). Anything else falls back to the optimizer; one
    // format and four widths keep its transformation count predictable.
    loader: 'custom',
    loaderFile: './lib/image-loader.js',
    formats: ['image/webp'],
    deviceSizes: [640, 828, 1080, 1920],
    imageSizes: [128, 256, 384],
    // Blob filenames are unique and immutable, so let both the optimizer and
    // the Blob CDN keep their output for a year.
    minimumCacheTTL: 31536000,
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
