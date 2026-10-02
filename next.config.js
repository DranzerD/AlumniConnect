/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lets a test build live alongside a running dev server (e.g. NEXT_DIST_DIR=.next-test).
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

module.exports = nextConfig;
