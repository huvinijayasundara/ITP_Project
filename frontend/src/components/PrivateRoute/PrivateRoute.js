import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function PrivateRoute({ children }) {
  const { isLoggedIn, loading } = useContext(AuthContext);

  // while checking token, don't render or redirect
  if (loading) return <p>Loading...</p>; // or a spinner

  if (!isLoggedIn) {
    return <Navigate to="/log" replace />; // redirect if not logged in
  }

  return children;
}

export default PrivateRoute;
