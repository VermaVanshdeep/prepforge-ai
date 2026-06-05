import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Loading data, please wait...", className = "min-h-[300px]" }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 rounded-2xl glass ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Decorative background glow */}
        <div className="absolute h-16 w-16 animate-ping rounded-full bg-indigo-500/10 blur-xl duration-1000" />
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-300 tracking-wide animate-pulse">
        {message}
      </p>
    </div>
  );
}
