import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StickyActionZoneProps {
  children: ReactNode;
  className?: string;
}

export function StickyActionZone({
  children,
  className,
}: StickyActionZoneProps) {
  return (
    <div
      data-testid="sticky-action-zone"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex flex-row-reverse items-end gap-4 pointer-events-none",
        className,
      )}
    >
      {/* Les enfants doivent réactiver le pointer-events */}
      <div className="contents *:pointer-events-auto">{children}</div>
    </div>
  );
}
