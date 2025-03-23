
import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NeonInputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: "blue" | "purple" | "pink" | "orange";
  error?: string;
  label?: string;
}

const NeonInput = forwardRef<HTMLInputElement, NeonInputProps>(
  ({ className, variant = "blue", error, label, ...props }, ref) => {
    const variantClasses = {
      blue: "border-neon-blue focus:border-neon-blue neon-blue-glow",
      purple: "border-neon-purple focus:border-neon-purple neon-purple-glow",
      pink: "border-neon-pink focus:border-neon-pink neon-pink-glow",
      orange: "border-neon-orange focus:border-neon-orange neon-orange-glow",
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-sm font-medium text-gray-200">{label}</label>
        )}
        <input
          className={cn(
            "w-full px-4 py-2 bg-transparent border rounded-md transition-all duration-300",
            "text-gray-100 focus:outline-none focus:ring-1 focus:ring-opacity-50",
            error ? "border-red-500" : variantClasses[variant],
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

NeonInput.displayName = "NeonInput";

export { NeonInput };
