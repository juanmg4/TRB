import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';
import { Role } from '../types/types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  element?: React.ReactElement; // Add element prop
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, element }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If an element is provided, render it. Otherwise, render Outlet for nested routes.
  return element ? element : <Outlet />;
};

export default ProtectedRoute;
