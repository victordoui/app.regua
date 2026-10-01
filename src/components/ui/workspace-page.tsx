import type { PropsWithChildren, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import './workspace-page.css';

/** Scoped design system: never applied to Home or Company settings. */
export function PageContainer({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn('page-container workspace-page', className)}>{children}</div>;
}

export function PageHeader({ title, subtitle, eyebrow, icon, children, className }: {
  title: string; subtitle?: string; eyebrow?: string; icon?: ReactNode; children?: ReactNode; className?: string;
}) {
  return <header className={cn('workspace-hero', className)}>
    <div className="relative flex min-w-0 items-start gap-4">
      {icon && <div className="workspace-hero-icon">{icon}</div>}
      <div className="min-w-0">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{eyebrow || 'Seu espaço de trabalho'}</p>
        <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
    {children && <div className="relative flex flex-wrap items-center gap-2 sm:justify-end">{children}</div>}
  </header>;
}

export function WorkspaceEmpty({ icon, title, description, children }: { icon: ReactNode; title: string; description: string; children?: ReactNode }) {
  return <div className="workspace-empty"><span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">{icon}</span><h2 className="text-lg font-bold">{title}</h2><p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>{children && <div className="mt-5">{children}</div>}</div>;
}

export function WorkspaceGuide({ title, children }: PropsWithChildren<{ title: string }>) {
  return <aside className="workspace-guide"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" /><div><h2 className="text-sm font-bold">{title}</h2><div className="mt-1 text-sm leading-relaxed text-muted-foreground">{children}</div></div></aside>;
}
