import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";
import type { NextRequest } from "next/server";

// In Next.js 16, the file convention changed from middleware.ts → proxy.ts
// The function must be a declared function (default or named "proxy") so that
// Next.js static analysis can identify it correctly.
// NextAuth(authConfig).auth implements the authorized() callback from authConfig,
// protecting /dashboard, /interview, /reports, /profile routes.

const { auth } = NextAuth(authConfig);

export async function proxy(request: NextRequest) {
  return auth(request as any);
}

export const config = {
  // Match all routes except api, _next/static, _next/image, and favicon.ico
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
