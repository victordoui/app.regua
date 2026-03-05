import React from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Target, Star } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import BarberDashboard from "./BarberDashboard";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import CustomerSuccessContent from "@/components/dashboard/CustomerSuccessContent";
import BarberPerformanceContent from "@/components/dashboard/BarberPerformanceContent";
import ReviewsContent from "@/components/dashboard/ReviewsContent";

const Index = () => {
  const { isBarbeiro, isAdmin, isSuperAdmin } = useRole();

  if (isBarbeiro && !isAdmin && !isSuperAdmin) {
    return <BarberDashboard />;
  }

  return (
    <Layout>
      <div className="flex-1 space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-sm text-muted-foreground">
            Visão completa do seu negócio em um só lugar
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4 hidden sm:block" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="customer-success" className="gap-2">
              <TrendingUp className="h-4 w-4 hidden sm:block" />
              Sucesso do Cliente
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <Target className="h-4 w-4 hidden sm:block" />
              Desempenho
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <Star className="h-4 w-4 hidden sm:block" />
              Avaliações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="customer-success">
            <CustomerSuccessContent />
          </TabsContent>

          <TabsContent value="performance">
            <BarberPerformanceContent />
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsContent />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Index;
