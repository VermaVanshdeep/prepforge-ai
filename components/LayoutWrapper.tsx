"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");
  const isLandingPage = pathname === "/";
  const showSidebar = !isAuthPage && !isLandingPage;

  return (
    <div className="flex min-h-screen flex-col bg-[#050508] text-white antialiased font-sans">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Render Navbar on non-authentication pages */}
        {!isAuthPage && <Navbar />}
        
        <div className="flex flex-1 pt-16">
          {/* Render Sidebar on authenticated dashboard pages */}
          {showSidebar && <Sidebar />}
          
          <main className={`flex-1 flex flex-col ${showSidebar ? "md:pl-64" : ""}`}>
            <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col">
              {children}
            </div>
            
            {/* Show Footer only on landing or auth pages */}
            {(isLandingPage || isAuthPage) && <Footer />}
          </main>
        </div>
      </div>
    </div>
  );
}
