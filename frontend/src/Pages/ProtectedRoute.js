// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role'); // You must set this on login

  if (!token || !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
