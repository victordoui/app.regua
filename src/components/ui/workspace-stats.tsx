import type { StatusCardItem } from '@/components/ui/status-cards';
import { cn } from '@/lib/utils';

const tones = {
  primary: 'bg-primary/10 text-primary', blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', red: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400', purple: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
};
export function StatusCards({ items, className }: { items: StatusCardItem[]; className?: string }) {
  return <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}>
    {items.map(item => <section key={item.label} className="relative min-w-0 rounded-[20px] border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-muted-foreground">{item.label}</p>{item.icon && <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', tones[item.color || 'primary'])}>{item.icon}</span>}</div>
      <p className="mt-3 break-words text-[28px] font-extrabold leading-tight tracking-tight text-foreground tabular-nums">{item.value}</p>
      {item.suffix && <p className="mt-1 text-xs text-muted-foreground">{item.suffix}</p>}
    </section>)}
  </div>;
}
