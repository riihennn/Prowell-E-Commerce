// src/components/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../Context/UserContext";
import Loader from "./Loader";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    // Not logged in → redirect to login page
    return <Navigate to="/auth" replace />;
  }
  
  // Logged in → show the page
  return children;
}
