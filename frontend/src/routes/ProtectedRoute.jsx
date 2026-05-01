import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  // If user exists → allow
  if (user) {
    return children;
  }

  
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;