import React from "react";
import Layout from "@/components/Layout";
import { useRole } from "@/contexts/RoleContext";
import BarberDashboard from "./BarberDashboard";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

const Index = () => {
  const { isBarbeiro, isAdmin, isSuperAdmin } = useRole();

  if (isBarbeiro && !isAdmin && !isSuperAdmin) {
    return <BarberDashboard />;
  }

  return (
    <Layout>
      <DashboardOverview />
    </Layout>
  );
};

export default Index;
