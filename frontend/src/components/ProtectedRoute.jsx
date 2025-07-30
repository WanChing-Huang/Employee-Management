import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireHR = false }) => {
  const { isAuthenticated, isHR, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If HR access is required but user is not HR
  if (requireHR && !isHR()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has proper permissions
  return children;
};

export default ProtectedRoute; 