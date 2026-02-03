import { cn } from "@/lib/utils";
import { Loader } from "@nsmr/pixelart-react";

interface LoadingScreenProps {
  message?: string;
  className?: string;
}

export function LoadingScreen({
  message = "CHARGEMENT...",
  className,
}: LoadingScreenProps) {
  return (
    <div
      className={cn(
        "min-h-screen flex gap-4 items-center justify-center bg-background text-theme font-display animate-pulse text-center p-4",
        className,
      )}
    >
      <Loader className="size-8 animate-spin hidden md:block" />
      <span className="text-2xl md:text-4xl">{message}</span>
    </div>
  );
}
