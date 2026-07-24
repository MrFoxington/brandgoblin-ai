/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Ship the bundled font pack inside every serverless function so the
    // text renderer can read font files straight off the lambda filesystem
    // (public/ is NOT included in lambdas by default on Vercel). The
    // renderer also has a fetch-from-our-own-CDN fallback if this ever
    // stops matching — see src/lib/studio/font-files.ts.
    outputFileTracingIncludes: {
      "/**": ["./public/fonts/**", "./src/lib/studio/font-manifest.json"],
    },
  },
};

module.exports = nextConfig;
