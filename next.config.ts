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

const nextConfig: ExtendedNextConfig = {
  allowedDevOrigins: allowedDevOrigins.length > 0 ? allowedDevOrigins : defaultAllowedOrigins,
};

export default nextConfig;
