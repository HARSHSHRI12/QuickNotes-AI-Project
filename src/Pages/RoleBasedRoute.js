// src/Pages/RoleBasedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const RoleBasedRoute = ({ allowedRole, children }) => {
  // Try from localStorage first, fallback to sessionStorage
  const userData =
    JSON.parse(localStorage.getItem("userData")) ||
    JSON.parse(sessionStorage.getItem("userData"));

  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  const userRole = userData.role?.toLowerCase();
  const expectedRole = allowedRole.toLowerCase();

  if (userRole !== expectedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleBasedRoute;
