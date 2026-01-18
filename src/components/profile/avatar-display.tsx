import { cn } from "@/lib/utils";
import { User } from "@nsmr/pixelart-react";

interface AvatarDisplayProps {
  animal: string;
  color: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function AvatarDisplay({
  animal,
  color,
  className,
  size = "md",
}: AvatarDisplayProps) {
  const sizeClasses = {
    sm: "w-8 h-8 p-1 border-2",
    md: "w-16 h-16 p-2 border-4",
    lg: "w-32 h-32 p-4 border-4",
  };

  const iconSizes = {
    sm: "w-full h-full",
    md: "w-full h-full",
    lg: "w-full h-full",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-black border-black",
        sizeClasses[size],
        className,
      )}
      style={{ borderColor: color }}
      title={animal}
    >
      <div style={{ color: color }} className={cn(iconSizes[size], "relative")}>
        {/* We use a generic User icon colored with the chosen color */}
        {/* If specific animal icons become available, we can map them here */}
        <User className="w-full h-full opacity-50" />
        <span
          className="absolute inset-0 flex items-center justify-center font-display font-bold text-inherit uppercase"
          style={{
            fontSize:
              size === "sm" ? "0.75rem" : size === "md" ? "1.5rem" : "3rem",
          }}
        >
          {animal.charAt(0)}
        </span>
      </div>
    </div>
  );
}
