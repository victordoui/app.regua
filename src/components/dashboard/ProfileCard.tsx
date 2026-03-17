import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, QrCode } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCompanySettings } from "@/hooks/useCompanySettings";

const ProfileCard: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useCompanySettings();

  const companyName = settings?.company_name || "Meu Negócio";
  const email = user?.email || "";
  const initials = companyName.slice(0, 2).toUpperCase();
  const logoUrl = settings?.logo_url;

  return (
    <Card className="rounded-2xl overflow-hidden h-full">
      <div className="h-2 bg-gradient-to-r from-primary to-primary/60" />
      <CardContent className="p-5 flex flex-col items-center text-center gap-3">
        <Avatar className="h-16 w-16 border-2 border-primary/30">
          {logoUrl ? (
            <AvatarImage src={logoUrl} alt={companyName} />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
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

        <Badge variant="secondary" className="text-xs">
          <Building2 className="h-3 w-3 mr-1" />
          Plano Ativo
        </Badge>

        {settings?.is_public_page_enabled && (
          <div className="mt-2 p-3 rounded-xl bg-muted/50 flex items-center gap-2">
            <QrCode className="h-8 w-8 text-primary" />
            <div className="text-left">
              <p className="text-[10px] font-medium text-muted-foreground uppercase">Página Pública</p>
              <p className="text-xs text-primary font-medium">Ativa</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
