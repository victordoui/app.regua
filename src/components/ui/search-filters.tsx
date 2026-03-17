import React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  resultCount?: number;
  resultLabel?: string;
  children?: React.ReactNode;
  className?: string;
}

const SearchFilters = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  resultCount,
  resultLabel = "registro(s)",
  children,
  className,
}: SearchFiltersProps) => {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-card border-border/40"
          />
        </div>
        {children}
      </div>
      {resultCount !== undefined && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{resultCount}</span> {resultLabel}
        </p>
      )}
    </div>
  );
};

export { SearchFilters };
