import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Register - PrepForge",
  description: "Create your PrepForge account and start practicing.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass rounded-2xl border border-white/5 bg-[#09090b]/40 backdrop-blur-md p-8 relative overflow-hidden shadow-2xl">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <Link href="/" className="inline-block">
            <Logo compact />
          </Link>
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Create Account</h2>
            <p className="text-xs font-semibold text-slate-500 mt-1.5">
              Start preparing with your free AI mock interview session.
            </p>
          </div>
        </div>

        {/* RegisterForm handles credentials signup */}
        <RegisterForm />

        <p className="text-center text-xs font-semibold text-slate-500 pt-6 border-t border-white/5">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:text-primary/80 transition-colors hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
