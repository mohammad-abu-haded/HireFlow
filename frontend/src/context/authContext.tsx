import { createContext, useState, useEffect } from "react";

interface IAuthContext {
  isAuthenticated: boolean;
  email: string;
  userName: string;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    confirmPassword: string,
    userName: string
  ) => Promise<{ success: boolean; message?: string }>;
}

export const AuthContext = createContext<IAuthContext>(null!);

const API = "http://localhost:5000/auth";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || ""
  );

  const isAuthenticated = !!token;

  // LOGIN
  const login = async (email: string, password: string) => {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!data.success) return false;

    localStorage.setItem("token", data.token);
    localStorage.setItem("email", data.user.email);
    localStorage.setItem("userName", data.user.userName);

    setToken(data.token);
    setEmail(data.user.email);
    setUserName(data.user.userName);

    return true;
  };

  // SIGNUP
  const signup = async (
    email: string,
    password: string,
    confirmPassword: string,
    userName: string
  ) => {
    if (password !== confirmPassword) {
      return { success: false, message: "Passwords do not match" };
    }

    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, userName }),
    });

    const data = await res.json();

    if (!data.success) {
      return { success: false, message: data.message };
    }

    return { success: true };
  };

  // LOGOUT
  const logout = async () => {
    if (!token) return;

    await fetch(`${API}/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    localStorage.clear();
    setToken(null);
    setEmail("");
    setUserName("");
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedEmail = localStorage.getItem("email");
    const storedUser = localStorage.getItem("userName");

    if (storedToken) setToken(storedToken);
    if (storedEmail) setEmail(storedEmail);
    if (storedUser) setUserName(storedUser);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        email,
        userName,
        token,
        login,
        logout,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};