import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-md shadow-glass-soft",
  {
    variants: {
      variant: {
        default:
          "bg-primary/90 text-primary-foreground hover:bg-primary border-primary/20 shadow-primary",
        secondary:
          "bg-white/70 text-secondary-foreground hover:bg-white/85 border-white/40 backdrop-blur-xl",
        destructive:
          "bg-destructive/90 text-destructive-foreground hover:bg-destructive border-destructive/20",
        success:
          "bg-success/90 text-success-foreground hover:bg-success border-success/20",
        warning:
          "bg-warning/90 text-warning-foreground hover:bg-warning border-warning/20",
        info:
          "bg-info/90 text-info-foreground hover:bg-info border-info/20",
        outline: "bg-white/60 text-card-foreground hover:bg-white/80 border-white/30 backdrop-blur-xl",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
