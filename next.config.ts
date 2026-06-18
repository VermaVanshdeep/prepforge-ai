import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Silence the "multiple lockfiles" workspace root detection warning
    root: path.resolve(__dirname),
  },
  // Keep these packages as native Node.js modules — don't bundle them
  serverExternalPackages: ["pdf-parse", "groq-sdk"],
};

export default nextConfig;
