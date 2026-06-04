import Layout from "@/components/Layout";
import BarberPerformanceContent from "@/components/dashboard/BarberPerformanceContent";
import { Users } from "lucide-react";

const DashboardPerformance = () => {
  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center gap-3 px-1">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-page-title">Desempenho dos Profissionais</h1>
            <p className="text-page-subtitle">Acompanhe a performance individual da sua equipe</p>
          </div>
        </div>
        <BarberPerformanceContent />
      </div>
    </Layout>
  );
};

export default DashboardPerformance;
