import Layout from "@/components/Layout";
import BarberPerformanceContent from "@/components/dashboard/BarberPerformanceContent";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { Users } from "lucide-react";

const DashboardPerformance = () => (
  <Layout>
    <PageContainer>
      <PageHeader eyebrow="Dashboard" icon={<Users className="h-5 w-5" />} title="Desempenho dos Profissionais" subtitle="Acompanhe a performance individual da sua equipe" />
      <BarberPerformanceContent />
    </PageContainer>
  </Layout>
);

export default DashboardPerformance;
