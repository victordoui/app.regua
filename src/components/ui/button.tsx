import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-open-sans",
  {
    variants: {
      variant: {
        default: "bg-gradient-vizzu text-primary-foreground shadow-btn hover:brightness-110 hover:-translate-y-[1px]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-accent text-accent-foreground hover:bg-accent/80",
        ghost: "text-muted-foreground hover:bg-accent hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        modern: "bg-gradient-vizzu text-primary-foreground shadow-btn hover:brightness-110 hover:-translate-y-[1px]",
        hero: "bg-gradient-vizzu text-primary-foreground shadow-btn hover:brightness-110 hover:-translate-y-[1px]",
        barber: "bg-gradient-vizzu text-primary-foreground shadow-btn hover:brightness-110",
        "barber-outline": "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        xl: "h-12 rounded-lg px-10 text-base",
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
