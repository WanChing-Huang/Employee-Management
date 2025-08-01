import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

// PrivateRoute component to protect routes based on authentication and role
//implements for protect routes in the application 
const PrivateRoute = ({ children, requireHR = false }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const loading = useSelector((state) => state.auth.loading);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireHR && user?.role !== 'hr') {
    return <Navigate to="/dashboard" />;
  }

  return children || <Outlet />;
};

export default PrivateRoute;