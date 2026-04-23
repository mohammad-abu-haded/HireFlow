import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { useContext } from "react";

interface IProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: IProps) => {
  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthGuard;