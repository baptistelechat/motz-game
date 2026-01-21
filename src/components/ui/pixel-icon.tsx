import { cn } from "@/lib/utils";
import { PixelIconName } from "@/types/pixel-icons";
import Image from "next/image";
import React from "react";

interface PixelIconProps extends React.HTMLAttributes<HTMLDivElement> {
  name: PixelIconName;
  alt?: string;
}

export function PixelIcon({ name, alt, className, ...props }: PixelIconProps) {
  return (
    <div className={cn("relative inline-block", className)} {...props}>
      <Image
        src={`/assets/icons/${name}.svg`}
        alt={alt || `${name} icon`}
        fill
        className="object-contain rendering-pixelated"
        style={{ imageRendering: "pixelated" }}
        unoptimized
      />
    </div>
  );
}
