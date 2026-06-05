import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = {
  title: "Login - PrepForge",
  description: "Sign in to your PrepForge account to practice interviews.",
};

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md p-8 relative overflow-hidden shadow-2xl">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <Link href="/" className="inline-block">
            <Logo compact />
          </Link>
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome to PrepForge</h2>
            <p className="text-xs font-semibold text-slate-500 mt-1.5">
              Sign in to your dashboard to practice interviews.
            </p>
          </div>
        </div>

        {/* LoginForm handles local password login */}
        <LoginForm />

        <p className="text-center text-xs font-semibold text-slate-500 pt-6 border-t border-white/5">
          New to PrepForge?{" "}
          <Link href="/auth/register" className="text-primary hover:text-primary/80 transition-colors hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
