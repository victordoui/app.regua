import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-open-sans transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-accent text-accent-foreground hover:bg-accent/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent text-[#16A34A]",
        warning:
          "border-transparent text-[#D97706]",
        info:
          "border-transparent text-[#0D9488]",
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

function Badge({ className, variant, style, ...props }: BadgeProps) {
  const semanticStyles: Record<string, React.CSSProperties> = {
    success: { background: 'rgba(22, 163, 74, 0.10)', border: '1px solid rgba(22, 163, 74, 0.20)' },
    warning: { background: 'rgba(217, 119, 6, 0.10)', border: '1px solid rgba(217, 119, 6, 0.20)' },
    info: { background: 'rgba(13, 148, 136, 0.10)', border: '1px solid rgba(13, 148, 136, 0.20)' },
  };

  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      style={{ ...(variant && semanticStyles[variant] ? semanticStyles[variant] : {}), ...style }}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
