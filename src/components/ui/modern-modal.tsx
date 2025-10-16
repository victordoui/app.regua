// File contents excluded from context for conciseness: Provided original content.
import * as React from "react"
import { forwardRef } from "react"
import { Dialog as ShadcnDialog } from "@radix-ui/react-dialog"
import { DialogContent as ShadcnDialogContent } from "@radix-ui/react-dialog"
import { cn } from "@/lib/utils"

export interface ModernModalProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const ModernModal = forwardRef<HTMLDivElement, ModernModalProps>(
  ({ children, open, onOpenChange, className }, ref) => {
  return (
    <ShadcnDialog open={open} onOpenChange={onOpenChange}>
      <ShadcnDialogContent
        ref={ref}
        className={cn(
          "sm:max-w-[425px] p-6",
          className
        )}
      >
        {children}
      </ShadcnDialogContent>
    </ShadcnDialog>
  );
});

ModernModal.displayName = "ModernModal";