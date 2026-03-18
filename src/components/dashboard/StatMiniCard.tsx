import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatMiniCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  borderColor?: string;
  subtitle?: string;
  trend?: { value: string; positive: boolean };
}

const StatMiniCard: React.FC<StatMiniCardProps> = ({ label, value, icon: Icon, subtitle, trend }) => {
  return (
    <Card className="rounded-xl border-0">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
            {(subtitle || trend) && (
              <div className="flex items-center gap-2">
                {trend && (
                  <span className={`flex items-center gap-0.5 text-xs font-medium ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
                    {trend.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {trend.value}
                  </span>
                )}
                {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
              </div>
            )}
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#4FA3FF] to-[#1F4FA3] shadow-lg shadow-primary/20">
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatMiniCard;
