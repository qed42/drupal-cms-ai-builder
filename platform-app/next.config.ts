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
  outputFileTracingIncludes: {
    "/**": [
      "./src/lib/curated-components/**/*.json",
      "./src/lib/curated-components/components/**/*.tsx",
      "./src/lib/curated-components/components/**/*.css",
      "./src/lib/rules/definitions/**/*.yaml",
    ],
  },
};

export default nextConfig;
