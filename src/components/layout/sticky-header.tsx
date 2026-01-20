import * as React from "react"
import { cn } from "@/lib/utils"

type StickyHeaderProps = React.HTMLAttributes<HTMLElement>

const StickyHeader = React.forwardRef<HTMLElement, StickyHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          "sticky top-0 z-50 w-full border-b-4 border-black bg-background p-4 shadow-sm",
          className
        )}
        {...props}
      >
        {children}
      </header>
    )
  }
)
StickyHeader.displayName = "StickyHeader"

export { StickyHeader }
