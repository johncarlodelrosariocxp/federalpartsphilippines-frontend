// src/components/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    return token && userRole === "admin";
  };

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
