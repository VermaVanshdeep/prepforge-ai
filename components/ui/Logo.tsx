import React from "react";
import { Hammer, Sparkles } from "lucide-react";

interface LogoProps {
  compact?: boolean;
  className?: string;
}

export function Logo({ compact = false, className }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#C084FC] shadow-lg shadow-primary/20">
        <Hammer className="w-4 h-4 text-white absolute transform -rotate-12" />
        <Sparkles className="w-3 h-3 text-yellow-300 absolute top-1.5 right-1.5" />
      </div>
      {!compact && (
        <span className="text-xl font-extrabold tracking-tight text-white">
          Prep<span className="text-primary">Forge</span>
        </span>
      )}
    </div>
  );
}
