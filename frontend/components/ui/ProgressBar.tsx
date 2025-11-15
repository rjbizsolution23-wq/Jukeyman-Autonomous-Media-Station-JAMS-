import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  variant?: "default" | "success" | "warning" | "error";
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, max = 100, showLabel = false, variant = "default", ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    const variantClasses = {
      default: "bg-violet-600",
      success: "bg-green-600",
      warning: "bg-yellow-600",
      error: "bg-red-600",
    };

    return (
      <div ref={ref} className={cn("relative w-full", className)} {...props}>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
          <div
            className={cn(
              "h-full transition-all duration-300 ease-in-out",
              variantClasses[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <div className="mt-1 text-xs text-gray-400 text-right">
            {percentage.toFixed(0)}%
          </div>
        )}
      </div>
    );
  }
);
ProgressBar.displayName = "ProgressBar";

export { ProgressBar };

