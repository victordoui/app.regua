import Layout from "@/components/Layout";
import CustomerSuccessContent from "@/components/dashboard/CustomerSuccessContent";
import { HeartHandshake } from "lucide-react";

const DashboardCustomerSuccess = () => {
  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center gap-3 px-1">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary shrink-0">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-page-title">Sucesso do Cliente</h1>
            <p className="text-page-subtitle">Satisfação, fidelização e feedbacks dos seus clientes</p>
          </div>
        </div>
        <CustomerSuccessContent />
      </div>
    </Layout>
  );
};

export default DashboardCustomerSuccess;
