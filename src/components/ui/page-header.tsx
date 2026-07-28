import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
  eyebrow?: string;
}

const PageHeader = ({ icon, title, subtitle, children, className, eyebrow }: PageHeaderProps) => {
  return (
    <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-primary/[0.08] text-primary shadow-sm">
            {icon}
          </div>
        )}
        <div>
          {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
          <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.025em] text-foreground md:text-[30px]">{title}</h1>
          {subtitle && (
            <p className="mt-1 max-w-2xl text-[15px] font-medium text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {children && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
};

const PageContainer = ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
  <div className={cn("page-container", className)}>{children}</div>
);

const PageToolbar = ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
  <div className={cn("surface-toolbar", className)}>{children}</div>
);

export { PageHeader, PageContainer, PageToolbar };
