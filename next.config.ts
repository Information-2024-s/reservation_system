import type { NextConfig } from "next";

type ExtendedNextConfig = NextConfig & {
  allowedDevOrigins?: string[];
};

const defaultAllowedOrigins = [
  "https://debug.nittc-i24.tech",
];

const allowedDevOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: allowedDevOrigins.length > 0 ? allowedDevOrigins : defaultAllowedOrigins,
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/site/index.html'
      },
      {
        source: '/index.html',
        destination: '/site/index.html'
      },
      {
        source: '/access.html',
        destination: '/site/access.html'
      },
      {
        source: '/story.html',
        destination: '/site/story.html'
      },
      {
        source: '/play.html',
        destination: '/site/play.html'
      },
      {
        source: '/credit.html',
        destination: '/site/credit.html'
      },
      {
        source: '/making.html',
        destination: '/site/making.html'
      }
    ]
  }
}

module.exports = nextConfig


export default nextConfig;
