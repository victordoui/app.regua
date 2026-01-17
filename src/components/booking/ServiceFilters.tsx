import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, Grid, List, ArrowUpDown, Clock, DollarSign, TrendingUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  category?: string;
  description?: string;
}

interface ServiceFiltersProps {
  services: Service[];
  selectedServices: string[];
  onFilteredServicesChange: (services: Service[]) => void;
  categories?: string[];
}

type SortOption = "name" | "price_asc" | "price_desc" | "duration" | "popularity";
type ViewMode = "grid" | "list";

export const ServiceFilters = ({
  services,
  selectedServices,
  onFilteredServicesChange,
  categories = [],
}: ServiceFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Extract unique categories from services if not provided
  const allCategories = useMemo(() => {
    if (categories.length > 0) return categories;
    const uniqueCategories = new Set<string>();
    services.forEach((service) => {
      if (service.category) uniqueCategories.add(service.category);
    });
    return Array.from(uniqueCategories);
  }, [services, categories]);

  // Filter and sort services
  const filteredServices = useMemo(() => {
    let result = [...services];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (service) =>
          service.name.toLowerCase().includes(query) ||
          service.description?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((service) => service.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "duration":
        result.sort((a, b) => a.duration_minutes - b.duration_minutes);
        break;
      case "popularity":
        // Would need popularity data, default to name for now
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [services, searchQuery, selectedCategory, sortBy]);

  // Notify parent of filtered results
  useMemo(() => {
    onFilteredServicesChange(filteredServices);
  }, [filteredServices, onFilteredServicesChange]);

  const getSortLabel = (option: SortOption): string => {
    const labels: Record<SortOption, string> = {
      name: "Nome (A-Z)",
      price_asc: "Menor Preço",
      price_desc: "Maior Preço",
      duration: "Duração",
      popularity: "Mais Populares",
    };
    return labels[option];
  };

  return (
    <div className="space-y-3">
      {/* Search and controls row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar serviço..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setSortBy("name")}
              className={sortBy === "name" ? "bg-accent" : ""}
            >
              Nome (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortBy("price_asc")}
              className={sortBy === "price_asc" ? "bg-accent" : ""}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Menor Preço
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortBy("price_desc")}
              className={sortBy === "price_desc" ? "bg-accent" : ""}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Maior Preço
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortBy("duration")}
              className={sortBy === "duration" ? "bg-accent" : ""}
            >
              <Clock className="h-4 w-4 mr-2" />
              Duração
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortBy("popularity")}
              className={sortBy === "popularity" ? "bg-accent" : ""}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Mais Populares
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View mode toggle */}
        <div className="flex border rounded-md">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="rounded-r-none"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="rounded-l-none"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Categories */}
      {allCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            Todos
          </Badge>
          {allCategories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      )}

      {/* Results info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredServices.length} serviço{filteredServices.length !== 1 ? "s" : ""}{" "}
          {searchQuery && `para "${searchQuery}"`}
        </span>
        <span>Ordenado por: {getSortLabel(sortBy)}</span>
      </div>
    </div>
  );
};

export { type ViewMode };
