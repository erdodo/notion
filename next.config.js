/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.edgestore.dev',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  devIndicators: {
    allowedDevOrigins: ['http://127.0.0.1:3000'],
  },
}

module.exports = nextConfig
