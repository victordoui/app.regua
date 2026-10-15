import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRole, AppRole } from '@/contexts/RoleContext';
import { supabase } from '@/integrations/supabase/client';
import { useSubscriptionAccess } from '@/hooks/useSubscriptionAccess';
import { getSubscriptionAccessDecision } from '@/lib/subscriptionAccess';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: AppRole;
  allowedRoles?: AppRole[];
  skipSubscriptionCheck?: boolean;
}

const ClientHomeRedirect: React.FC = () => {
  const { user } = useAuth();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadBusiness = async () => {
      const { data } = await supabase
        .from('client_profiles')
        .select('barbershop_user_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();
      setBusinessId(data?.barbershop_user_id ?? null);
      setLoading(false);
    };

    loadBusiness();
  }, [user]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  return <Navigate to={businessId ? `/b/${businessId}/home` : '/login'} replace />;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, allowedRoles, skipSubscriptionCheck = false }) => {
  const { user, loading: authLoading } = useAuth();
  const { userRole, businessId, hasRole, loading: roleLoading } = useRole();
  const location = useLocation();
  const isBusinessAccount = userRole === 'admin' || userRole === 'barbeiro';
  const subscriptionAccess = useSubscriptionAccess(businessId, Boolean(user) && isBusinessAccount && !skipSubscriptionCheck);

  const loading = authLoading || roleLoading || (isBusinessAccount && !skipSubscriptionCheck && subscriptionAccess.isLoading);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Super admin always has full access
  if (hasRole('super_admin')) {
    return <>{children}</>;
  }

  if (isBusinessAccount && !skipSubscriptionCheck) {
    if (subscriptionAccess.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
          <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
            <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-destructive" />
            <h1 className="text-xl font-bold">Não foi possível validar seu acesso</h1>
            <p className="mt-2 text-sm text-muted-foreground">Atualize a página. Se o problema continuar, fale com o suporte VIZZU.</p>
            <Button className="mt-6" onClick={() => window.location.reload()}>Tentar novamente</Button>
          </div>
        </div>
      );
    }

    const decision = getSubscriptionAccessDecision(subscriptionAccess.data);
    if (!decision.allowed) {
      if (userRole === 'admin' && location.pathname !== '/upgrade') {
        return <Navigate to={`/upgrade?motivo=${decision.reason}`} replace />;
      }

      if (userRole === 'barbeiro') {
        return (
          <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
              <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-amber-500" />
              <h1 className="text-xl font-bold">Acesso temporariamente indisponível</h1>
              <p className="mt-2 text-sm text-muted-foreground">A assinatura deste negócio precisa ser regularizada pelo gestor.</p>
            </div>
          </div>
        );
      }
    }
  }

  // Check legacy requiredRole prop (used for super_admin routes)
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  // Check allowedRoles list
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAccess = allowedRoles.some(role => hasRole(role));
    if (!hasAccess) {
      // Intelligent redirect based on actual role
      if (userRole === 'cliente') {
        return <ClientHomeRedirect />;
      }
      if (userRole === 'barbeiro') {
        return <Navigate to="/appointments" replace />;
      }
      // A página inicial deve sempre ser uma porta de entrada clara. A
      // conclusão de cadastro continua acessível pelo link de confirmação,
      // mas uma sessão incompleta não pode mandar o visitante direto para um
      // formulário inesperado ao abrir o domínio.
      return <Navigate to="/login?cadastro=pendente" replace />;
    }
  }

  // If user is a cliente trying to access admin area without allowedRoles specified
  // (fallback for routes without explicit role config)
  if (userRole === 'cliente' && !allowedRoles) {
    return <ClientHomeRedirect />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
