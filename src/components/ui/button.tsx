import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 backdrop-blur-md",
  {
    variants: {
      variant: {
        default: "bg-primary/90 text-primary-foreground hover:bg-primary shadow-primary hover:shadow-glow border border-primary/20 backdrop-blur-lg",
        destructive:
          "bg-destructive/90 text-destructive-foreground hover:bg-destructive border border-destructive/20 backdrop-blur-lg",
        outline:
          "border border-white/30 bg-white/60 hover:bg-white/80 backdrop-blur-xl text-card-foreground shadow-glass-soft",
        secondary:
          "bg-white/70 text-secondary-foreground hover:bg-white/85 border border-white/40 backdrop-blur-xl shadow-glass-soft",
        ghost: "hover:bg-white/40 text-card-foreground hover:text-card-foreground backdrop-blur-md",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-gradient-success text-success-foreground hover:opacity-95 shadow-lg border border-success/20 backdrop-blur-lg",
        gradient: "bg-gradient-primary text-primary-foreground hover:opacity-95 shadow-primary border border-primary/30 backdrop-blur-lg",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-11 rounded-2xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
