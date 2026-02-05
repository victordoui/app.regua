import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'super_admin' | 'admin' | 'barbeiro' | 'cliente';

interface RoleContextType {
  userRole: AppRole | null;
  roles: AppRole[];
  loading: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isBarbeiro: boolean;
  isCliente: boolean;
  hasRole: (role: AppRole) => boolean;
  refetchRoles: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

interface RoleProviderProps {
  children: ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = async () => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching roles:', error);
        setRoles([]);
      } else {
        const userRoles = data?.map(r => r.role as AppRole) || [];
        setRoles(userRoles);
      }
    } catch (error) {
      console.error('Unexpected error fetching roles:', error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [user]);

  const hasRole = (role: AppRole): boolean => roles.includes(role);

  // Primary role (highest privilege)
  const userRole: AppRole | null = roles.includes('super_admin')
    ? 'super_admin'
    : roles.includes('admin')
    ? 'admin'
    : roles.includes('barbeiro')
    ? 'barbeiro'
    : roles.includes('cliente')
    ? 'cliente'
    : null;

  const value: RoleContextType = {
    userRole,
    roles,
    loading,
    isSuperAdmin: hasRole('super_admin'),
    isAdmin: hasRole('admin'),
    isBarbeiro: hasRole('barbeiro'),
    isCliente: hasRole('cliente'),
    hasRole,
    refetchRoles: fetchRoles,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};
