import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

const FormSection = ({ icon, title, description, children, className, actions }: FormSectionProps) => (
  <section className={cn("form-section", className)}>
    <div className="form-section-header">
      {icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-sm font-medium text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </div>
    <div className="form-section-body">{children}</div>
  </section>
);

interface FieldHelpProps {
  children: ReactNode;
}

const FieldHelp = ({ children }: FieldHelpProps) => (
  <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">{children}</p>
);

export { FieldHelp, FormSection };
