import { cn } from "@/lib/utils";

interface ErrorCardProps {
  title?: string;
  message: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  variant?: "default" | "filled";
}

export function ErrorCard({
  title = "ERREUR",
  message,
  action,
  className,
  variant = "default",
}: ErrorCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 w-full max-w-md animate-in fade-in duration-500",
        className,
      )}
    >
      <div
        className={cn(
          "font-bold p-6 border-4 shadow-hard text-center w-full",
          variant === "default" &&
            "bg-black text-destructive border-destructive shadow-[4px_4px_0_var(--border)]",
          variant === "filled" &&
            "bg-destructive text-destructive-foreground border-black",
        )}
      >
        <p className="font-display text-xl mb-2 uppercase">{title}</p>
        <div className="text-md">{message}</div>
      </div>
      {action && <div className="flex flex-col gap-4 w-full">{action}</div>}
    </div>
  );
}
