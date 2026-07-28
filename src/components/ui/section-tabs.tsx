import type { ElementType, ReactNode } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface SectionTabItem {
  value: string;
  label: string;
  description: string;
  icon: ElementType;
}

interface SectionTabsLayoutProps {
  items: readonly SectionTabItem[];
  children: ReactNode;
  navigationTitle?: string;
  className?: string;
  contentClassName?: string;
}

interface SectionTabsBarProps {
  items: readonly SectionTabItem[];
  className?: string;
}

const SectionTabsLayout = ({
  items,
  children,
  navigationTitle = "O que você quer acessar?",
  className,
  contentClassName,
}: SectionTabsLayoutProps) => (
  <div className={cn("grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]", className)}>
    <aside className="surface-panel p-3 lg:sticky lg:top-[5.5rem]">
      <p className="px-3 pb-2 pt-1 text-sm font-bold text-foreground">{navigationTitle}</p>
      <TabsList className="grid h-auto w-full grid-cols-2 gap-2 border-0 bg-transparent p-0 lg:flex lg:flex-col lg:items-stretch">
        {items.map(({ value, label, description, icon: Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="group min-h-[56px] w-full justify-start gap-2 whitespace-normal px-3 text-left data-[state=active]:bg-primary/10 data-[state=active]:text-primary lg:min-h-[62px] lg:gap-3"
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="hidden min-w-0 lg:block">
              <span className="block truncate text-sm font-bold">{label}</span>
              <span className="mt-0.5 block truncate text-xs font-medium text-muted-foreground group-data-[state=active]:text-primary/75">{description}</span>
            </span>
            <span className="text-xs leading-tight lg:hidden">{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </aside>
    <div className={cn("min-w-0", contentClassName)}>{children}</div>
  </div>
);

const SectionTabsBar = ({ items, className }: SectionTabsBarProps) => (
  <TabsList className={cn("flex h-auto min-w-max gap-1 border border-border bg-muted/70 p-1", className)}>
    {items.map(({ value, label, description, icon: Icon }) => (
      <TabsTrigger key={value} value={value} className="min-h-[42px] gap-2 px-3 text-left sm:px-4">
        <Icon className="h-4 w-4 shrink-0" />
        <span>
          <span className="block text-sm font-bold leading-tight">{label}</span>
          <span className="hidden text-xs font-medium text-muted-foreground data-[state=active]:text-primary/70 xl:block">{description}</span>
        </span>
      </TabsTrigger>
    ))}
  </TabsList>
);

export { SectionTabsBar, SectionTabsLayout };
export type { SectionTabItem };
