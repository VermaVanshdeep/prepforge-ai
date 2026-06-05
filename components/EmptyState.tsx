import { ReactNode } from "react";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title = "No data found",
  description = "You haven't uploaded or practices any items yet. Get started now to see statistics here.",
  icon = <FolderOpen className="h-6 w-6 text-slate-400" />,
  actionLabel,
  onAction,
  className = "min-h-[300px]"
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-white/10 glass ${className}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-bold text-white tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-slate-400 max-w-xs font-medium leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 active:scale-[0.98] transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
