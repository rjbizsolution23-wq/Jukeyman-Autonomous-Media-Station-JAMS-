import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  as?: "input" | "textarea";
}

const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ className, type, as = "input", ...props }, ref) => {
    const baseClassName = cn(
      "flex w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 disabled:cursor-not-allowed disabled:opacity-50",
      as === "textarea" ? "min-h-[80px] resize-y" : "h-10",
      className
    );

    if (as === "textarea") {
      return (
        <textarea
          className={baseClassName}
          ref={ref as React.Ref<HTMLTextAreaElement>}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      );
    }

    return (
      <input
        type={type}
        className={baseClassName}
        ref={ref as React.Ref<HTMLInputElement>}
        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

