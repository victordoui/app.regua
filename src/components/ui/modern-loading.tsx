import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ModernLoadingProps {
  variant?: "spinner" | "dots" | "pulse" | "bars" | "skeleton";
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

const ModernLoading: React.FC<ModernLoadingProps> = ({
  variant = "spinner",
  size = "md",
  className,
  text,
}) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  if (variant === "spinner") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <motion.div
          className={cn(
            "border-2 border-muted border-t-primary rounded-full",
            sizes[size]
          )}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        {text && (
          <motion.p
            className={cn("text-muted-foreground", textSizes[size])}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === "dots") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div className="flex space-x-1">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className={cn(
                "bg-primary rounded-full",
                size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : "h-4 w-4"
              )}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            />
          ))}
        </div>
        {text && (
          <motion.p
            className={cn("text-muted-foreground", textSizes[size])}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <motion.div
          className={cn(
            "bg-primary rounded-full",
            sizes[size]
          )}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        {text && (
          <motion.p
            className={cn("text-muted-foreground", textSizes[size])}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === "bars") {
    return (
      <div className={cn("flex flex-col items-center gap-3", className)}>
        <div className="flex space-x-1">
          {[0, 1, 2, 3].map((index) => (
            <motion.div
              key={index}
              className={cn(
                "bg-primary",
                size === "sm" ? "h-4 w-1" : size === "md" ? "h-6 w-1" : "h-8 w-1"
              )}
              animate={{
                scaleY: [1, 2, 1],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: index * 0.1,
              }}
            />
          ))}
        </div>
        {text && (
          <motion.p
            className={cn("text-muted-foreground", textSizes[size])}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="space-y-2">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-4 w-5/6" />
        </div>
        {text && (
          <motion.p
            className={cn("text-muted-foreground", textSizes[size])}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  return null;
};

// Full page loading overlay
interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  variant?: ModernLoadingProps["variant"];
  backdrop?: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  text = "Carregando...",
  variant = "spinner",
  backdrop = true,
}) => {
  if (!isLoading) return null;

  return (
    <motion.div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        backdrop && "bg-background/80 backdrop-blur-sm"
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="glass rounded-lg p-8"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <ModernLoading variant={variant} size="lg" text={text} />
      </motion.div>
    </motion.div>
  );
};

export { ModernLoading, LoadingOverlay };