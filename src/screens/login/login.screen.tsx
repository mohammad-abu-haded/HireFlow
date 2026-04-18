import { useContext, useState } from "react";
import eye from "../../assets/icons/eye.svg";
import eyeClosed from "../../assets/icons/eye-closed.svg";
import leftArrow from "../../assets/icons/left-arrow.svg";
import "./login.css";
import { AuthContext } from "../../context/authContext";
const LoginScreen = () => {
  const { login } = useContext(AuthContext);
  const loginHandler = (event: any) => {
    setEmail("");
    setPassword("");
    event.preventDefault();
    login();
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="login-screen">
      <div className="login-screen-container">
        <form onSubmit={loginHandler} className="login-screen-form">
          <div className="login-screen-logo">
            <img src="/hireflow-favicon.png" alt="HireFlow Logo" />
            <h2>HireFlow</h2>
          </div>
          <div className="login-screen-content">
            <h2>Admin Portal</h2>
            <p>
              Sign in to manage your job listings and review applicant profiles.
            </p>
          </div>
          <div className="login-form">
            <div className="login-input">
              <div className="email-input">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="admin@careerhub.io"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  required
                />
              </div>
              <div className="password-input">
                <div className="password-label">
                  <label htmlFor="password">Password</label>
                  <p className="forgot-password">Forgot password?</p>
                </div>
                <div className="password-field">
                  {password.length > 0 && (
                    <img
                      src={!showPassword ? eye : eyeClosed}
                      alt="Toggle Password Visibility"
                      className="eye-icon"
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  )}
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                  />
                </div>
              </div>
            </div>
            <input type="submit" id="login-button" value="Sign In" />
          </div>
        </form>
        <div className="or-divider">
          <span>or</span>
        </div>
        <div className="back-to-portal">
          <img src={leftArrow} alt="Left Arrow" />
          Back to Careers Portal
        </div>
        <p className="security-note">
          Protected by HireFlow Enterprise Security.
        </p>
        <p className="security-note">
          By signing in, you agree to our{" "}
          <span className="policy-link">Terms of Service</span> and{" "}
          <span className="policy-link">Privacy Policy</span>.
        </p>
      </div>
      <p className="copyright">HireFlow &copy; 2026 • Recruitment Management System</p>
    </div>
  );
};

export default LoginScreen;
