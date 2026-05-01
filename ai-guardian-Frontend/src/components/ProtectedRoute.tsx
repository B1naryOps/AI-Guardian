import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  allowedRoles = [], 
  redirectPath = '/auth' 
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedRoles.length > 0 && user) {
    const isAdmin = user.role === 'admin' || user.role === 'superadmin';
    const isUserAdmin = allowedRoles.includes('admin');
    
    if (isUserAdmin && !isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};
