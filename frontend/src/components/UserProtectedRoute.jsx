import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../services/userAuth.jsx';

export default function UserProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useUserAuth();
  const location = useLocation();

  if (loading) return <div className="page-loading">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
