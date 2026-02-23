"use client";

import { ProfileBadge } from "@/components/profile/profile-badge";
import { NetworkStatusBadge } from "@/components/layout/network-status-badge";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import * as React from "react";

type MainLayoutProps = React.HTMLAttributes<HTMLElement>;

const MainLayout = React.forwardRef<HTMLElement, MainLayoutProps>(
  ({ className, children, ...props }, ref) => {
    const pathname = usePathname();
    const showProfileBadge = !pathname?.startsWith("/game");

    return (
      <main
        ref={ref}
        className={cn(
          "flex min-h-dvh flex-col bg-background relative",
          className,
        )}
        {...props}
      >
        <NetworkStatusBadge className="absolute top-4 left-4 z-20" />
        {showProfileBadge && (
          <ProfileBadge className="absolute top-4 right-4 z-20" />
        )}
        {children}
      </main>
    );
  },
);
MainLayout.displayName = "MainLayout";

export { MainLayout };
