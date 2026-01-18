import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  message?: string;
  className?: string;
}

export function LoadingScreen({ 
  message = "CHARGEMENT...", 
  className 
}: LoadingScreenProps) {
  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center bg-background text-theme font-display animate-pulse text-center text-2xl md:text-4xl p-4",
      className
    )}>
      {message}
    </div>
  );
}
