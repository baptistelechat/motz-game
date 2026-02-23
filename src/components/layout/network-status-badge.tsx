"use client";

import { Badge } from "@/components/ui/badge";
import { PixelIcon } from "@/components/ui/pixel-icon";
import { useLatency } from "@/hooks/use-latency";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NetworkStatusBadgeProps {
  className?: string;
}

export function NetworkStatusBadge({ className }: NetworkStatusBadgeProps) {
  const { latency, isOffline, status } = useLatency();
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // Show detail on hover or click
  const showDetail = isHovered || isClicked;

  // Status colors
  const statusColors = {
    good: "bg-primary hover:bg-primary/90",
    fair: "bg-theme hover:bg-theme/90",
    poor: "bg-destructive hover:bg-destructive/90",
    offline: "bg-muted hover:bg-muted/90",
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  const handleClick = () => setIsClicked(!isClicked);

  if (isOffline) {
    return (
      <Badge
        className={cn(
          "cursor-pointer transition-all h-8",
          statusColors.offline,
          className,
        )}
        onClick={handleClick}
        title="Connexion perdue"
      >
        <PixelIcon name="wifi" className="w-4 h-4 opacity-50" />
        <span className="ml-2">Reconnexion...</span>
      </Badge>
    );
  }

  return (
    <Badge
      className={cn(
        "cursor-pointer transition-all h-8  text-primary-foreground",
        statusColors[status],
        className,
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      title={latency !== null ? `${latency}ms` : "Connexion..."}
    >
      <PixelIcon name="wifi" className="w-4 h-4" />
      {showDetail && latency !== null && (
        <span className="ml-2 font-mono text-xs">{latency}ms</span>
      )}
    </Badge>
  );
}
