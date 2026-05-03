import { createContext, useState } from "react";
import type { IUser } from "../types";
type AuthResult = {
  success: boolean;
  message?: string;
};
interface IAuthContext {
  isAuthenticated: boolean;
  email: string;
  userName: string;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  signup: (email: string, password: string, confirmPassword : string, userName: string) => AuthResult;
}

const defaultAuthContext = {
  isAuthenticated: false,
  email: "",
  userName: "",
  login: () => false,
  logout: () => {},
  signup: () => ({success: false}),
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

  const login = (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]") as IUser[];
    const foundUser = users.find(
      (user) => user.email === email && user.password === password,
    );
    if (!foundUser) {
      return false;
    }
    setIsAuthenticated(true);
    setEmail(email);
    setUserName(foundUser.userName);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("email", foundUser.email);
    localStorage.setItem("userName", foundUser.userName);
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setEmail("");
    setUserName("");
    localStorage.removeItem("email");
    localStorage.removeItem("userName");
    localStorage.removeItem("password");
    localStorage.removeItem("isAuthenticated");
  };

  const signup = (email: string, password: string, confirmPassword: string , userName: string) => {
    const users: IUser[] = JSON.parse(localStorage.getItem("users") || "[]");
    const userExists = users.some((user) => user.email === email);

    if (userExists) {
      return {
        success: false,
        message: "An account with this email already exists.",
      };
    }

    if (password !== confirmPassword) {
      return {
        success: false,
        message: "Passwords do not match. Please try again.",
      };
    }
    const newUser: IUser = {
      email,
      password,
      userName,
    };
    localStorage.setItem("users", JSON.stringify([...users, newUser]));
    setEmail("");
    setUserName("");
    localStorage.setItem("email", email);
    localStorage.setItem("password", password);
    localStorage.setItem("userName", userName);
    return { success: true };
  };
  return (
    <AuthContext.Provider
      value={{ isAuthenticated, email, userName, login, logout, signup }}
    >
      {children}
    </AuthContext.Provider>
  );
};
