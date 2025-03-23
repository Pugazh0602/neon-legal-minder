
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  variant?: "blue" | "purple" | "pink" | "white";
  className?: string;
}

export const LoadingSpinner = ({ 
  size = "md", 
  variant = "blue",
  className 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  const variantClasses = {
    blue: "border-neon-blue",
    purple: "border-neon-purple",
    pink: "border-neon-pink",
    white: "border-white",
  };

  return (
    <div
      className={cn(
        "rounded-full animate-spin border-t-transparent",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  );
};
