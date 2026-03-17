import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatMiniCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  borderColor?: string;
  subtitle?: string;
}

const StatMiniCard: React.FC<StatMiniCardProps> = ({ label, value, icon: Icon, borderColor = "border-primary", subtitle }) => {
  return (
    <Card className={`border-l-4 ${borderColor} rounded-2xl`}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatMiniCard;
