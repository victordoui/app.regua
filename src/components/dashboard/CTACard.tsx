import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CTACard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="rounded-xl overflow-hidden h-full border-0 bg-gradient-to-br from-[#1F4FA3]/30 via-[#4FA3FF]/10 to-card border border-[#4FA3FF]/20">
      <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
        <div className="space-y-3">
          <Badge className="bg-[#4FA3FF]/15 text-[#4FA3FF] border-0 text-[10px] uppercase tracking-wider">
            <Sparkles className="h-3 w-3 mr-1" />
            VIZZU Insights
          </Badge>

          <h3 className="text-lg font-bold text-foreground leading-tight">
            Veja seu Relatório Mensal Completo
          </h3>
          <p className="text-sm text-muted-foreground">
            Analise receita, serviços mais populares e desempenho da equipe em um relatório detalhado.
          </p>
        </div>

        <div className="space-y-2">
          <Button onClick={() => navigate("/reports")} className="w-full gap-2">
            <BarChart3 className="h-4 w-4" />
            Ver Relatórios
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/sales-reports")}
            className="w-full text-xs text-muted-foreground"
          >
            Relatório de vendas →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CTACard;
