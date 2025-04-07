/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  // Add other Next.js config options as needed
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig