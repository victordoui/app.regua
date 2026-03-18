import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";

const ProfileCard: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useCompanySettings();
  const { metrics } = useRealtimeDashboard();

  const companyName = settings?.company_name || "Meu Negócio";
  const email = user?.email || "";
  const initials = companyName.slice(0, 2).toUpperCase();
  const logoUrl = settings?.logo_url;

  const usagePercent = Math.min((metrics.monthAppointments / 500) * 100, 100);

  return (
    <Card className="rounded-xl overflow-hidden h-full border-0 bg-gradient-to-br from-card to-[hsl(0,0%,12%)]">
      <div className="h-1.5 bg-gradient-to-r from-[#4FA3FF] to-[#1F4FA3]" />
      <CardContent className="p-5 flex flex-col items-center text-center gap-4">
        <Avatar className="h-16 w-16 border-2 border-primary/30 shadow-lg shadow-primary/10">
          {logoUrl ? <AvatarImage src={logoUrl} alt={companyName} /> : null}
          <AvatarFallback className="bg-gradient-to-br from-[#4FA3FF] to-[#1F4FA3] text-white text-lg font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">{companyName}</h3>
          {settings?.slogan && (
            <p className="text-xs text-muted-foreground">{settings.slogan}</p>
          )}
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>

        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
          <Building2 className="h-3 w-3 mr-1" />
          Plano Ativo
        </Badge>

        <div className="w-full space-y-2 mt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Uso do plano</span>
            <span className="text-foreground font-medium">{metrics.monthAppointments}/500</span>
          </div>
          <Progress value={usagePercent} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
