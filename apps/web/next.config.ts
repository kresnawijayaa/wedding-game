import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: ["@wedding-quest/config", "@wedding-quest/shared"],
};

export default nextConfig;
