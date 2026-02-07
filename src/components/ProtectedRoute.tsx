import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRole, AppRole } from '@/contexts/RoleContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: AppRole;
  allowedRoles?: AppRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole, allowedRoles }) => {
  const { user, loading: authLoading } = useAuth();
  const { userRole, hasRole, loading: roleLoading } = useRole();

  const loading = authLoading || roleLoading;

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
        return <Navigate to={`/b/${user.id}/home`} replace />;
      }
      if (userRole === 'barbeiro') {
        return <Navigate to="/appointments" replace />;
      }
      return <Navigate to="/" replace />;
    }
  }

  // If user is a cliente trying to access admin area without allowedRoles specified
  // (fallback for routes without explicit role config)
  if (userRole === 'cliente' && !allowedRoles) {
    return <Navigate to={`/b/${user.id}/home`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
