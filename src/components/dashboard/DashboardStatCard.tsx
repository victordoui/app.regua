import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, MoreHorizontal } from "lucide-react";

interface DashboardStatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  iconBgClass: string;
  iconColorClass: string;
}

const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgClass,
  iconColorClass,
}) => {
  return (
    <Card className="rounded-2xl border border-border/60 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${iconBgClass}`}>
            <Icon className={`h-5 w-5 ${iconColorClass}`} />
          </div>
          <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm font-medium text-muted-foreground font-inter">{title}</p>
        <p className="text-3xl font-bold text-foreground font-montserrat mt-1">{value}</p>
        <p className="text-xs text-muted-foreground mt-1 font-inter">{subtitle}</p>
      </CardContent>
    </Card>
  );
};

export default DashboardStatCard;
