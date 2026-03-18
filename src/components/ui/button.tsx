import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary-500 text-primary-foreground hover:opacity-90 hover:shadow-lg hover:shadow-primary/20",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg hover:shadow-destructive/25",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-card hover:text-foreground",
        secondary:
          "bg-card text-primary hover:bg-card/80",
        ghost: "text-muted-foreground hover:bg-card hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "bg-gradient-to-r from-primary to-primary-500 text-primary-foreground hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300",
        barber: "bg-gradient-to-r from-primary to-primary-800 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300",
        "barber-outline": "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300",
        modern: "bg-gradient-to-r from-primary to-primary-500 text-primary-foreground shadow-md hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 ease-out border-0",
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
