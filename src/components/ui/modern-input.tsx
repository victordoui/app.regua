import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ModernInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "glass" | "neumorphism";
}

const ModernInput = React.forwardRef<HTMLInputElement, ModernInputProps>(
  ({ 
    className, 
    type = "text", 
    label, 
    error, 
    success, 
    icon, 
    rightIcon, 
    variant = "default",
    id,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    const variants = {
      default: "bg-input border border-border",
      glass: "glass border border-glass-border",
      neumorphism: "bg-card shadow-neumorphism dark:shadow-neumorphism-dark border-0"
    };

    const containerClass = cn(
      "relative",
      label && "floating-label"
    );

    const inputClass = cn(
      "flex h-12 w-full rounded-lg px-3 py-3 text-sm transition-all duration-300 ease-out",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium",
      "placeholder:text-muted-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      variants[variant],
      icon && "pl-10",
      rightIcon && "pr-10",
      error && "border-destructive focus-visible:ring-destructive",
      success && "border-green-500 focus-visible:ring-green-500",
      label && "placeholder:opacity-0 focus:placeholder:opacity-100",
      className
    );

    return (
      <motion.div 
        className={containerClass}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        
        <input
          type={type}
          className={inputClass}
          ref={ref}
          id={inputId}
          placeholder={label ? " " : props.placeholder}
          {...props}
        />
        
        {label && (
          <motion.label
            htmlFor={inputId}
            className={cn(
              "absolute left-3 top-3 text-muted-foreground transition-all duration-200 ease-out",
              "pointer-events-none origin-left bg-background px-1",
              icon && "left-10"
            )}
            initial={{ scale: 1, y: 0 }}
            animate={{ scale: 1, y: 0 }}
          >
            {label}
          </motion.label>
        )}
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
        
        {error && (
          <motion.p
            className="mt-1 text-sm text-destructive"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
        
        {success && (
          <motion.div
            className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </motion.div>
        )}
      </motion.div>
    );
  }
);

ModernInput.displayName = "ModernInput";

export { ModernInput };