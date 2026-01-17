import * as React from "react"
import { cn } from "@/lib/utils"

interface StickyActionZoneProps extends React.HTMLAttributes<HTMLElement> {}

const StickyActionZone = React.forwardRef<HTMLElement, StickyActionZoneProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <footer
        ref={ref}
        className={cn(
          "sticky bottom-0 z-50 w-full border-t-4 border-black bg-background p-4 shadow-sm",
          className
        )}
        {...props}
      >
        {children}
      </footer>
    )
  }
)
StickyActionZone.displayName = "StickyActionZone"

export { StickyActionZone }
