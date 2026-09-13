import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, type Role } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center loader"></div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // If user's role is not in the allowedRoles list, redirect to their specific home page
    // (We could also redirect to an "Unauthorized" page, but for now we'll route them back home)
    switch (user.role) {
      case 'Employee':
        return <Navigate to="/employee" replace />;
      case 'Agent':
        return <Navigate to="/agent" replace />;
      case 'Department Lead':
        return <Navigate to="/department-lead" replace />;
      case 'System Admin':
        return <Navigate to="/system-admin" replace />;
      case 'Platform Admin':
        return <Navigate to="/platform-admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
