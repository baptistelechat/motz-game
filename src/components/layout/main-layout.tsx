import * as React from "react"
import { cn } from "@/lib/utils"

interface MainLayoutProps extends React.HTMLAttributes<HTMLElement> {}

const MainLayout = React.forwardRef<HTMLElement, MainLayoutProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <main
        ref={ref}
        className={cn(
          "flex min-h-[100dvh] flex-col bg-background",
          className
        )}
        {...props}
      >
        {children}
      </main>
    )
  }
)
MainLayout.displayName = "MainLayout"

export { MainLayout }
