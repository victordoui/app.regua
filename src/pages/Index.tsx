import React from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Crown, Calendar, DollarSign, Target, Heart, Users } from "lucide-react";

const Index = () => {
  const stats = [
    {
      title: "Assinantes Ativos",
      value: "12",
      change: "MRR: R$ 750,00",
      icon: Crown,
      color: "purple",
      progress: 75
    },
    {
      title: "Agendamentos",
      value: "24",
      change: "18 concluídos",
      trend: "up",
      icon: Calendar,
      color: "blue",
      progress: 75
    },
    {
      title: "Receita Mensal",
      value: "R$ 15.000",
      change: "+12% vs mês anterior",
      trend: "up",
      icon: DollarSign,
      color: "green",
      progress: 75
    },
    {
      title: "Taxa de Ocupação",
      value: "75.0%",
      change: "Eficiência: 88%",
      trend: "up",
      icon: Target,
      color: "orange",
      progress: 75
    },
    {
      title: "Satisfação do Cliente",
      value: "4.7⭐",
      change: "22 clientes VIP",
      trend: "up",
      icon: Heart,
      color: "pink",
      progress: 94
    },
    {
      title: "Novos Clientes",
      value: "18",
      change: "Total: 150 clientes",
      trend: "up",
      icon: Users,
      color: "indigo",
      progress: 12
    }
  ];

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Visão geral do sistema
            </p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`p-3 rounded-full bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs ${
                        stat.trend === 'up' ? 'text-green-600' : 
                        stat.trend === 'warning' ? 'text-orange-600' : 
                        stat.trend === 'down' ? 'text-red-600' : 
                        'text-muted-foreground'
                      }`}>
                        {stat.change}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {stat.progress?.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${stat.progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Novo agendamento confirmado</p>
                    <p className="text-xs text-muted-foreground">João Silva - Corte + Barba</p>
                  </div>
                  <span className="text-xs text-muted-foreground">há 5 min</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Novo cliente cadastrado</p>
                    <p className="text-xs text-muted-foreground">Maria Santos</p>
                  </div>
                  <span className="text-xs text-muted-foreground">há 15 min</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Assinatura ativada</p>
                    <p className="text-xs text-muted-foreground">Plano Premium - Pedro Costa</p>
                  </div>
                  <span className="text-xs text-muted-foreground">há 1 hora</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agendamentos de Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Carlos Silva</p>
                    <p className="text-xs text-muted-foreground">Corte Masculino</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">14:00</p>
                    <p className="text-xs text-green-600">Confirmado</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">João Santos</p>
                    <p className="text-xs text-muted-foreground">Corte + Barba</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">15:30</p>
                    <p className="text-xs text-green-600">Confirmado</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Pedro Oliveira</p>
                    <p className="text-xs text-muted-foreground">Barba</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">17:00</p>
                    <p className="text-xs text-yellow-600">Pendente</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;