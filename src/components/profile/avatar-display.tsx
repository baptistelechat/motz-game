import { cn } from "@/lib/utils";
import { User } from "@nsmr/pixelart-react";
import { cva, type VariantProps } from "class-variance-authority";

const avatarDisplayVariants = cva(
  "flex items-center justify-center bg-black border-black transition-colors",
  {
    variants: {
      size: {
        sm: "w-8 h-8 p-1 border-2",
        md: "w-16 h-16 p-2 border-4",
        lg: "w-32 h-32 p-4 border-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const iconSizeVariants = cva("relative", {
  variants: {
    size: {
      sm: "w-full h-full text-[0.75rem]",
      md: "w-full h-full text-[1.5rem]",
      lg: "w-full h-full text-[3rem]",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface AvatarDisplayProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarDisplayVariants> {
  animal: string;
  color: string;
}

export function AvatarDisplay({
  animal,
  color,
  className,
  size = "md",
  ...props
}: AvatarDisplayProps) {
  return (
    <div
      className={cn(avatarDisplayVariants({ size }), className)}
      style={{ borderColor: color }}
      title={animal}
      {...props}
    >
      <div style={{ color: color }} className={iconSizeVariants({ size })}>
        {/* We use a generic User icon colored with the chosen color */}
        {/* If specific animal icons become available, we can map them here */}
        <User className="w-full h-full opacity-50" />
        <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-inherit uppercase">
          {animal.charAt(0)}
        </span>
      </div>
    </div>
  );
}
