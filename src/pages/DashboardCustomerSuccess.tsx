import Layout from "@/components/Layout";
import CustomerSuccessContent from "@/components/dashboard/CustomerSuccessContent";
import { PageContainer, PageHeader } from "@/components/ui/page-header";
import { HeartHandshake } from "lucide-react";

const DashboardCustomerSuccess = () => (
  <Layout>
    <PageContainer>
      <PageHeader eyebrow="Dashboard" icon={<HeartHandshake className="h-5 w-5" />} title="Sucesso do Cliente" subtitle="Satisfação, fidelização e feedbacks dos seus clientes" />
      <CustomerSuccessContent />
    </PageContainer>
  </Layout>
);

export default DashboardCustomerSuccess;
