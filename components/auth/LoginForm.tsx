"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations/auth";
import { loginUser } from "@/actions/auth";
import { Mail, Lock, ArrowRight } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await loginUser(data);
      
      if (result && result.error) {
        setError(result.error);
        setIsLoading(false);
      } else {
        // Redirect upon successful sign in
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: unknown) {
      // In Next.js App Router, redirects work by throwing a special error.
      // If the error is a redirect error, we let it flow naturally.
      if ((err instanceof Error ? err.message : "Unknown error") === "NEXT_REDIRECT" || (err instanceof Error && err.name === "RedirectError")) {
        return;
      }
      console.error("Login submission error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const inputClass = "px-4 py-3 border border-white/10 rounded-xl text-sm font-medium text-white bg-slate-950/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-md w-full placeholder-slate-600 pl-11";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
      {error && (
        <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs font-semibold text-rose-400">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
            <Mail className="h-4.5 w-4.5" />
          </span>
          <input
            type="email"
            placeholder="you@example.com"
            disabled={isLoading}
            {...register("email")}
            className={inputClass}
          />
        </div>
        {errors.email && (
          <span className="text-xs font-semibold text-rose-400">{errors.email.message}</span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
            <Lock className="h-4.5 w-4.5" />
          </span>
          <input
            type="password"
            placeholder="••••••••"
            disabled={isLoading}
            {...register("password")}
            className={inputClass}
          />
        </div>
        {errors.password && (
          <span className="text-xs font-semibold text-rose-400">{errors.password.message}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <span>Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}
