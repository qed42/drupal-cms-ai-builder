import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@anthropic-ai/sdk"],
  transpilePackages: [
    "@ai-builder/ds-types",
    "@ai-builder/ds-space-ds",
    "@ai-builder/ds-mercury",
    "@ai-builder/ds-civictheme",
  ],
};

export default nextConfig;
