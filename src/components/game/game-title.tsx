import { cn } from "@/lib/utils";

interface GameTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  game?: boolean;
  children: React.ReactNode;
}

export function GameTitle({
  children,
  className,
  game = false,
  ...props
}: GameTitleProps) {
  return (
    <h1
      className={cn(
        "font-display text-theme text-center",
        game ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl",
        "drop-shadow-[4px_4px_0_#000000]",
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  );
}
