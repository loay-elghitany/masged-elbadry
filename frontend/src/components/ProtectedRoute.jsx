import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles, children }) {
  const token = localStorage.getItem("jwtToken");
  const storedUser = localStorage.getItem("user");
  let role = null;
  if (storedUser) {
    try {
      role = JSON.parse(storedUser)?.role || null;
    } catch {
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("user");
    }
  }
  const location = useLocation();

  if (!token || !role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
