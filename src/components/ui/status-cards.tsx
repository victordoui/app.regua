import React from "react";
import { cn } from "@/lib/utils";

type StatusColor = "blue" | "green" | "red" | "amber" | "purple" | "primary";

interface StatusCardItem {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: StatusColor;
  suffix?: string;
}

interface StatusCardsProps {
  items: StatusCardItem[];
  className?: string;
}

const colorMap: Record<StatusColor, { border: string; text: string; iconBg: string }> = {
  blue: { border: "border-l-blue-500", text: "text-blue-600 dark:text-blue-400", iconBg: "bg-blue-500/10 text-blue-500" },
  green: { border: "border-l-green-500", text: "text-green-600 dark:text-green-400", iconBg: "bg-green-500/10 text-green-500" },
  red: { border: "border-l-red-500", text: "text-red-600 dark:text-red-400", iconBg: "bg-red-500/10 text-red-500" },
  amber: { border: "border-l-amber-500", text: "text-amber-600 dark:text-amber-400", iconBg: "bg-amber-500/10 text-amber-500" },
  purple: { border: "border-l-purple-500", text: "text-purple-600 dark:text-purple-400", iconBg: "bg-purple-500/10 text-purple-500" },
  primary: { border: "border-l-primary", text: "text-primary", iconBg: "bg-primary/10 text-primary" },
};

const StatusCards = ({ items, className }: StatusCardsProps) => {
  return (
    <div className={cn("grid gap-4", className)} style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))` }}>
      {items.map((item, index) => {
        const colors = colorMap[item.color || "primary"];
        return (
          <div
            key={index}
            className={cn(
              "relative flex items-center gap-4 rounded-xl border border-border/40 bg-card p-4 shadow-sm transition-all hover:shadow-md",
              "border-l-4",
              colors.border
            )}
          >
            {item.icon && (
              <div className={cn("flex items-center justify-center h-10 w-10 rounded-lg shrink-0", colors.iconBg)}>
                {item.icon}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">{item.label}</p>
              <p className={cn("text-2xl font-bold leading-tight", colors.text)}>
                {item.value}
                {item.suffix && <span className="text-sm font-normal ml-1">{item.suffix}</span>}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export { StatusCards };
export type { StatusCardItem };
