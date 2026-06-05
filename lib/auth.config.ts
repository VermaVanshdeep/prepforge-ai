import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      const isDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isInterview = nextUrl.pathname.startsWith("/interview");
      const isReports = nextUrl.pathname.startsWith("/reports");
      const isProfile = nextUrl.pathname.startsWith("/profile");
      const isAdmin = nextUrl.pathname.startsWith("/admin");

      if (isDashboard || isInterview || isReports || isProfile || isAdmin) {
        if (isLoggedIn) {
          // If accessing administrative page, restrict to ADMIN role
          if (isAdmin && auth.user.role !== "ADMIN") {
            return Response.redirect(new URL("/dashboard", nextUrl));
          }
          return true;
        }
        return false; // Redirect to login
      }

      // Redirect authenticated users trying to access login/register back to dashboard
      const isAuthPage = nextUrl.pathname.startsWith("/auth");
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
