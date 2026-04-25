import { createContext, useState } from "react";

interface IAuthContext {
  isAuthenticated: boolean;
  email: string;
  userName: string;
  login: (email: string) => void;
  logout: () => void;
  signup: (email: string, password: string, userName: string) => void;
}

const defaultAuthContext = {
  isAuthenticated: false,
  email: "",
  userName: "",
  login: () => {},
  logout: () => {},
  signup: () => {},
};

export const AuthContext = createContext<IAuthContext>(defaultAuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const storedAuth = localStorage.getItem("isAuthenticated");
  const initialAuthState = storedAuth ? JSON.parse(storedAuth) : false;
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthState);
  const storedEmail = localStorage.getItem("email");
  const initialEmailState = storedEmail ? storedEmail : "";
  const [email, setEmail] = useState(initialEmailState);
  const storedUserName = localStorage.getItem("userName");
  const initialUserNameState = storedUserName ? storedUserName : "";
  const [userName, setUserName] = useState(initialUserNameState);

  const login = (email: string) => {
    setIsAuthenticated(true);
    setEmail(email);
    localStorage.setItem("isAuthenticated", "true");
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
  };

  const signup = (email: string, password: string, userName: string) => {
    setUserName(userName);
    setEmail(email);
    localStorage.setItem("email", email);
    localStorage.setItem("password", password);
    localStorage.setItem("userName", userName);
  };
  return (
    <AuthContext.Provider value={{ isAuthenticated, email, userName, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};
