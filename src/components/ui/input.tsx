import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-base text-card-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-card-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:bg-background focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 shadow-sm hover:border-primary/50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
