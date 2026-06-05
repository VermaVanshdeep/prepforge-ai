import { defineConfig } from "prisma/config";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env or .env.local manually
for (const file of [".env", ".env.local"]) {
  const envPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf-8");
    for (const line of envConfig.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...values] = trimmed.split("=");
        const value = values.join("=").replace(/^["']|["']$/g, "").trim();
        process.env[key.trim()] = value;
      }
    }
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
