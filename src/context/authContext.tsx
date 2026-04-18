import { createContext, useState } from "react";

interface IAuthContext {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const defaultAuthContext = {
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
};

export const AuthContext = createContext<IAuthContext>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );

  
}