import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#1F4EF5] text-white shadow hover:bg-[#4880EE]",
        destructive: "bg-destructive text-white shadow-sm hover:bg-destructive/90",
        outline: "border border-[#D6DADF] bg-white text-[#1A1E27] hover:bg-[#D6DADF]/30",
        secondary: "bg-[#4880EE] text-white shadow-sm hover:bg-[#83B4F9]",
        ghost: "text-[#505866] hover:bg-[#D6DADF]/30 hover:text-[#1A1E27]",
        link: "text-[#1F4EF5] underline-offset-4 hover:underline",
        primary: "bg-[#1F4EF5] text-white hover:bg-[#4880EE] shadow-sm",
        nav: "text-[#505866] hover:text-[#1A1E27] hover:bg-[#D6DADF]/30",
        navActive: "text-[#1F4EF5] font-semibold bg-[#1F4EF5]/10",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-8",
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
