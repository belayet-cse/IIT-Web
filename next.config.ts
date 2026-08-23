import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["localhost", "192.168.0.150"],
  // Bundles only the files the server needs into .next/standalone — a much
  // smaller, self-contained runtime image for the Docker deploy.
  output: "standalone",
};

export default nextConfig;
