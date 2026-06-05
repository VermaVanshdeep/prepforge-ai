"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Sparkles, 
  History, 
  User, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Brain
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const isAuthPage = pathname?.startsWith("/auth");

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Resumes & Interviews", href: "/interview", icon: FileText },
    { name: "Reports & Evaluation", href: "/reports", icon: History },
    { name: "Profile", href: "/profile", icon: User },
    ...(isAdmin ? [{ name: "Admin Panel", href: "/admin", icon: Settings }] : []),
  ];

  if (isAuthPage) return null;

  return (
    <aside
      className={`fixed top-16 bottom-0 left-0 z-30 hidden md:flex flex-col border-r border-white/5 bg-[#09090b] transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Navigation Menu */}
      <div className="flex-1 space-y-1.5 px-3 py-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-medium transition-all group ${
                isActive
                  ? "bg-primary text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${isActive ? "" : "group-hover:scale-105 transition-transform"}`} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* Collapse Toggle Button */}
      <div className="border-t border-white/5 p-3 flex flex-col gap-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex w-full items-center justify-center rounded-xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <div className="flex w-full items-center gap-3.5 text-sm font-medium">
              <ChevronLeft className="h-5 w-5" />
              <span>Collapse Menu</span>
            </div>
          )}
        </button>

        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="flex w-full items-center gap-3.5 rounded-xl p-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
