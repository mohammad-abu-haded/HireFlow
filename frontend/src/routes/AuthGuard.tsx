import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { useContext } from "react";


const AuthGuard = () => {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;