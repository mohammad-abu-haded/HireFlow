import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/authContext";

const AuthCheck = ({ children }: { children: React.ReactNode }) => {
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:5000/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => {
      if (!res.ok) {
        localStorage.clear();
        window.location.href = "/login";
      }
    });
  }, [token]);

  return children;
};

export default AuthCheck;
