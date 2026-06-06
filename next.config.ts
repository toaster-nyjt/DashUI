import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable React Strict Mode so dev does not double-invoke mount effects. The
  // auto-generate effect in GeneratedBox fires a one-shot, cleanup-less network
  // generation; a double-invoke would launch a duplicate stream.
  reactStrictMode: false,
};

export default nextConfig;
