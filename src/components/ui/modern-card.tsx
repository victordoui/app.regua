import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const modernCardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "border-border",
        glass: "backdrop-blur-xl bg-white/10 border-white/20",
        elevated: "shadow-elegant"
      },
      transition: {
        default: "transition-all duration-300",
        smooth: "transition-all duration-500"
      }
    }
  }
)

export interface ModernCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modernCardVariants> {}

const ModernCard = React.forwardRef<HTMLDivElement, ModernCardProps>(
  ({ className, variant, transition, children, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(modernCardVariants({ variant, transition, className }))}
      whileHover={{ y: -2 }}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
});

ModernCard.displayName = "ModernCard";

export const ModernCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
ModernCardHeader.displayName = "ModernCardHeader";

export const ModernCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
));
ModernCardTitle.displayName = "ModernCardTitle";

export const ModernCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
ModernCardContent.displayName = "ModernCardContent";

export { ModernCard, modernCardVariants };