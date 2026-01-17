import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Flame, Tag, Percent, TrendingDown, Clock, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PricingRule {
  id: string;
  name: string;
  type: "peak_hour" | "day_discount" | "professional" | "happy_hour" | "combo";
  modifier: number; // Percentage: positive = increase, negative = discount
  description?: string;
}

interface DynamicPriceDisplayProps {
  originalPrice: number;
  appliedRules?: PricingRule[];
  showOriginal?: boolean;
  size?: "sm" | "md" | "lg";
}

export const DynamicPriceDisplay = ({
  originalPrice,
  appliedRules = [],
  showOriginal = true,
  size = "md",
}: DynamicPriceDisplayProps) => {
  // Calculate final price
  const totalModifier = appliedRules.reduce((acc, rule) => acc + rule.modifier, 0);
  const finalPrice = originalPrice * (1 + totalModifier / 100);
  const hasDiscount = totalModifier < 0;
  const hasIncrease = totalModifier > 0;
  const hasPriceChange = appliedRules.length > 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getRuleIcon = (type: PricingRule["type"]) => {
    switch (type) {
      case "peak_hour":
        return <Flame className="h-3 w-3" />;
      case "day_discount":
        return <Tag className="h-3 w-3" />;
      case "professional":
        return <Percent className="h-3 w-3" />;
      case "happy_hour":
        return <Clock className="h-3 w-3" />;
      case "combo":
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Sun className="h-3 w-3" />;
    }
  };

  const getRuleBadgeColor = (modifier: number): string => {
    if (modifier < 0) return "bg-green-500/10 text-green-600 border-green-500/20";
    if (modifier > 0) return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    return "bg-muted";
  };

  const sizeClasses = {
    sm: {
      price: "text-base font-semibold",
      original: "text-xs",
      badge: "text-[10px] px-1.5 py-0.5",
    },
    md: {
      price: "text-xl font-bold",
      original: "text-sm",
      badge: "text-xs px-2 py-1",
    },
    lg: {
      price: "text-2xl font-bold",
      original: "text-base",
      badge: "text-sm px-2.5 py-1",
    },
  };

  const classes = sizeClasses[size];

  return (
    <TooltipProvider>
      <div className="space-y-1">
        {/* Price display */}
        <div className="flex items-baseline gap-2">
          <AnimatePresence mode="wait">
            <motion.span
              key={finalPrice}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`${classes.price} ${hasDiscount ? "text-green-600" : hasIncrease ? "text-orange-600" : ""}`}
            >
              {formatCurrency(finalPrice)}
            </motion.span>
          </AnimatePresence>

          {showOriginal && hasPriceChange && (
            <span className={`${classes.original} line-through text-muted-foreground`}>
              {formatCurrency(originalPrice)}
            </span>
          )}
        </div>

        {/* Applied rules badges */}
        {appliedRules.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {appliedRules.map((rule) => (
              <Tooltip key={rule.id}>
                <TooltipTrigger asChild>
                  <div
                    className={`inline-flex items-center gap-1 rounded-full border ${getRuleBadgeColor(rule.modifier)} ${classes.badge}`}
                  >
                    {getRuleIcon(rule.type)}
                    <span>
                      {rule.modifier > 0 ? "+" : ""}
                      {rule.modifier}%
                    </span>
                    <span className="hidden sm:inline">{rule.name}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-medium">{rule.name}</p>
                  {rule.description && (
                    <p className="text-xs text-muted-foreground">{rule.description}</p>
                  )}
                  <p className="text-xs mt-1">
                    {rule.modifier > 0 ? "Acréscimo" : "Desconto"} de{" "}
                    {Math.abs(rule.modifier)}%
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}

        {/* Summary badge */}
        {hasPriceChange && (
          <Badge
            variant="outline"
            className={`text-xs ${hasDiscount ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}
          >
            {hasDiscount
              ? `💰 Economia de ${formatCurrency(originalPrice - finalPrice)}`
              : `🔥 ${formatCurrency(finalPrice - originalPrice)} adicional`}
          </Badge>
        )}
      </div>
    </TooltipProvider>
  );
};
