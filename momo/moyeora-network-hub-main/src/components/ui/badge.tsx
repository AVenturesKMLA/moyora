import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        trust_high: "border-green-500/50 bg-green-100 text-green-700",
        trust_mid: "border-blue-500/50 bg-blue-100 text-blue-700",
        trust_low: "border-amber-500/50 bg-amber-100 text-amber-700",
        accent: "border-primary/50 bg-primary/20 text-primary",
        success: "border-green-500/50 bg-green-100 text-green-700",
        warning: "border-amber-500/50 bg-amber-100 text-amber-700",
        ghost: "border-border bg-muted/30 text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
