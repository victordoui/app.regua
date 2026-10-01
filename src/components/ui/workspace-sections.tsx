import type { ReactNode } from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { SectionTabItem } from '@/components/ui/section-tabs';

export function SectionTabsLayout({ items, children, navigationTitle = 'Navegue por esta página', className, contentClassName }: {
  items: readonly SectionTabItem[]; children: ReactNode; navigationTitle?: string; className?: string; contentClassName?: string;
}) {
  return <div className={cn('min-w-0 space-y-6', className)}>
    <nav aria-label={navigationTitle} className="workspace-section-nav">
      <TabsList aria-label={navigationTitle} className="grid h-auto w-full grid-cols-2 gap-2 border-0 bg-transparent p-0 md:flex md:flex-wrap">
        {items.map(({ value, label, description, icon: Icon }) => <TabsTrigger key={value} value={value} className="workspace-section-tab group flex min-w-0 flex-1 justify-start gap-3 whitespace-normal px-4 py-3 text-left md:min-w-[140px]">
          <Icon className="h-5 w-5 shrink-0" /><span className="min-w-0"><span className="block text-sm font-bold">{label}</span><span className="mt-1 hidden text-xs font-medium text-muted-foreground sm:block">{description}</span></span>
        </TabsTrigger>)}
      </TabsList>
    </nav><div className={cn('min-w-0', contentClassName)}>{children}</div>
  </div>;
}
export { SectionTabsBar } from '@/components/ui/section-tabs';
