import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 gap-2",
  {
    variants: {
      variant: {
        default: "bg-emerald-600 text-white hover:bg-emerald-700",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-border bg-transparent text-foreground hover:bg-secondary hover:border-white/15",
        secondary: "bg-secondary text-foreground hover:bg-white/10",
        ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
        link: "text-emerald-400 underline-offset-4 hover:underline p-0 h-auto",
        gradient: "bg-emerald-600 text-white hover:bg-emerald-700",
        "outline-gradient": "border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400/60",
      },
      size: {
        default: "h-9 px-3.5 py-2",
        sm: "h-7 rounded px-2.5 text-xs",
        lg: "h-10 px-5 text-sm",
        xl: "h-12 px-8 text-base rounded-lg",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
