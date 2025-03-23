
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "blue" | "purple" | "pink" | "orange";
  size?: "sm" | "md" | "lg";
  glowing?: boolean;
}

const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  ({ className, variant = "blue", size = "md", glowing = true, children, ...props }, ref) => {
    const variantClasses = {
      blue: "bg-transparent text-neon-blue border-neon-blue hover:bg-neon-blue/10",
      purple: "bg-transparent text-neon-purple border-neon-purple hover:bg-neon-purple/10",
      pink: "bg-transparent text-neon-pink border-neon-pink hover:bg-neon-pink/10",
      orange: "bg-transparent text-neon-orange border-neon-orange hover:bg-neon-orange/10",
    };

    const sizeClasses = {
      sm: "px-3 py-1 text-sm",
      md: "px-5 py-2",
      lg: "px-7 py-3 text-lg",
    };

    const glowClasses = {
      blue: glowing ? "neon-blue-glow animate-neon-pulse" : "",
      purple: glowing ? "neon-purple-glow animate-neon-pulse" : "",
      pink: glowing ? "neon-pink-glow animate-neon-pulse" : "",
      orange: glowing ? "neon-orange-glow animate-neon-pulse" : "",
    };

    return (
      <button
        className={cn(
          "relative border rounded-md transition-all duration-300 ease-in-out transform",
          variantClasses[variant],
          sizeClasses[size],
          glowClasses[variant],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

NeonButton.displayName = "NeonButton";

export { NeonButton };
