
import { cn } from "@/lib/utils";
import { MouseEventHandler } from "react";

interface CourtCardProps {
  title: string;
  icon: React.ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
  className?: string;
}

export const CourtCard = ({ title, icon, onClick, className }: CourtCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "glass-card transition-scale p-6 rounded-lg cursor-pointer",
        "border border-gray-700 hover:border-neon-blue",
        "flex flex-col items-center justify-center gap-4",
        "animate-fade-in",
        className
      )}
    >
      <div className="text-4xl neon-blue-glow animate-float">{icon}</div>
      <h3 className="text-lg font-medium text-center">{title}</h3>
    </div>
  );
};
