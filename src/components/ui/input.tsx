import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-[10px] bg-card px-3 py-2 text-[13px] font-open-sans text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          className
        )}
        style={{
          border: '1px solid rgba(34, 96, 184, 0.10)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#3278D4';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(34,96,184,0.10)';
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(34,96,184,0.10)';
          e.currentTarget.style.boxShadow = 'none';
          props.onBlur?.(e);
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
