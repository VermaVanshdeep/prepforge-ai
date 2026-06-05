import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function DashboardCard({ title, value, icon, description, trend }: DashboardCardProps) {
  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
      {/* Background glow highlight */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/5 blur-3xl" />

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">{title}</span>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-indigo-400">
          {icon}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-3xl font-extrabold tracking-tight text-white">{value}</h3>
        
        {(trend || description) && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            {trend && (
              <span
                className={`font-semibold ${
                  trend.isPositive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {trend.value}
              </span>
            )}
            {description && (
              <span className="text-slate-500 font-medium truncate">{description}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
