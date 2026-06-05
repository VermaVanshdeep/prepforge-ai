"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brain, Menu, X, User, Sparkles } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Logo } from "@/components/ui/Logo";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const isAuthPage = pathname?.startsWith("/auth");
  const isAdmin = session?.user?.role === "ADMIN";

  const navigation = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Start Interview", href: "/interview" },
    { name: "Reports", href: "/reports" },
    { name: "Profile", href: "/profile" },
    ...(isAdmin ? [{ name: "Admin", href: "/admin" }] : []),
  ];

  if (isAuthPage) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#09090b]/75 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="group">
              <Logo className="group-hover:scale-105 transition-transform duration-200" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-8">
            <div className="flex gap-6">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-sm font-medium transition-colors hover:text-white ${
                      isActive ? "text-indigo-400" : "text-slate-400"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="h-4 w-px bg-white/10" />

            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl select-none max-w-[150px] truncate">
                  {session?.user?.name || session?.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  className="text-sm font-semibold text-red-400 hover:text-red-300 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-200"
                >
                  <Sparkles className="h-4 w-4" />
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#09090b]/95 backdrop-blur-lg">
          <div className="space-y-1 px-4 py-3">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-xl px-4 py-2.5 text-base font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
          {isLoggedIn ? (
            <div className="border-t border-white/5 px-4 py-4 space-y-3">
              <div className="text-xs font-semibold text-slate-400 px-4">
                Signed in as: <span className="text-indigo-400 block mt-1 truncate">{session?.user?.name || session?.user?.email}</span>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: "/auth/login" });
                }}
                className="block w-full rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-center text-base font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="border-t border-white/5 px-4 py-4 space-y-2">
              <Link
                href="/auth/login"
                onClick={() => setIsOpen(false)}
                className="block w-full rounded-xl border border-white/10 px-4 py-2.5 text-center text-base font-medium text-white hover:bg-white/5 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setIsOpen(false)}
                className="block w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-base font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
