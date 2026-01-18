import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const constraintBadgeVariants = cva(
  "inline-flex items-center rounded-none border-4 border-black px-2.5 py-0.5 text-xs font-semibold font-display transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        success: "border-black bg-primary text-primary-foreground",
        forbidden: "border-black bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "success",
    },
  },
);

export interface ConstraintBadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof constraintBadgeVariants> {}

function ConstraintBadge({
  className,
  variant,
  ...props
}: ConstraintBadgeProps) {
  return (
    <div
      className={cn(constraintBadgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { ConstraintBadge, constraintBadgeVariants };
