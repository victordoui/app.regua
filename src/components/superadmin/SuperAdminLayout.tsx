import { ReactNode } from 'react';
import Layout from '@/components/Layout';

interface SuperAdminLayoutProps {
  children: ReactNode;
}

export const SuperAdminLayout = ({ children }: SuperAdminLayoutProps) => {
  return <Layout><div className="page-container">{children}</div></Layout>;
};
