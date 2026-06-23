import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-blue-600/20 text-blue-300 border border-blue-600/30",
        secondary: "bg-secondary text-muted-foreground border border-border",
        destructive: "bg-red-600/15 text-red-400 border border-red-600/20",
        outline: "border border-border text-foreground",
        success: "bg-emerald-600/15 text-emerald-400 border border-emerald-600/20",
        warning: "bg-amber-600/15 text-amber-400 border border-amber-600/20",
        info: "bg-blue-600/15 text-blue-400 border border-blue-600/20",
        purple: "bg-blue-600/15 text-blue-400 border border-blue-600/20",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
