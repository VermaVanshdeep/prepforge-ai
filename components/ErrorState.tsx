import { AlertCircle, RotateCcw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading this view. Please try reloading or contact support if the issue persists.",
  onRetry,
  className = "min-h-[300px]"
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl glass ${className}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-white tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-slate-400 max-w-sm font-medium leading-relaxed">
        {message}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 active:scale-[0.98] transition-all"
        >
          <RotateCcw className="h-4 w-4 text-indigo-400" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}
