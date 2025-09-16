import React from "react";
import { Navigate,Outlet } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // If user is not logged in, redirect to unlock page
  if (!token) {
    return <Navigate to="/" replace />;
  }

    return <Outlet />;
};

export default ProtectedRoute;
