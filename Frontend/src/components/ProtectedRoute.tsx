import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, type Role } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    // If not authenticated, redirect to sign-in page
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // If user's role is not in the allowedRoles list, redirect to their specific home page
    // (We could also redirect to an "Unauthorized" page, but for now we'll route them back home)
    switch (user.role) {
      case 'employee':
        return <Navigate to="/employee" replace />;
      case 'agent':
        return <Navigate to="/agent" replace />;
      case 'department lead':
        return <Navigate to="/department-lead" replace />;
      case 'system admin':
        return <Navigate to="/system-admin" replace />;
      case 'platform admin':
        return <Navigate to="/platform-admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // If authenticated and authorized, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
