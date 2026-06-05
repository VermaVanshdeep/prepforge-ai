import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Silence the "multiple lockfiles" workspace root detection warning
    root: path.resolve(__dirname),
  },
};

export default nextConfig;

