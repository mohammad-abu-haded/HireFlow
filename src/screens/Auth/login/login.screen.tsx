import { useContext, useState } from "react";
import eye from "../../../assets/icons/eye.svg";
import eyeClosed from "../../../assets/icons/eye-closed.svg";
import leftArrow from "../../../assets/icons/left-arrow.svg";
import errorMessageIcon from "../../../assets/icons/emblem-important.svg";
import "./login.css";
import { AuthContext } from "../../../context/authContext";
import { useNavigate } from "react-router-dom";
const LoginScreen = () => {
  const { login } = useContext(AuthContext);
  const loginHandler = (event: any) => {
    event.preventDefault();
    if (login(email, password)) {
      setEmail("");
      setPassword("");
      setErrorMessage("");
      navigate("/demo-setup");
    } else {
      setErrorMessage("Invalid email or password. Please try again.");
    }
  };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  return (
    <div className="login-screen">
      <div
        className={
          errorMessage
            ? "login-screen-container with-error"
            : "login-screen-container"
        }
      >
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
          <div className={errorMessage ? "login-form with-error" : "login-form"}>
            <div className="login-input">
              <div className="email-input">
                <label htmlFor="login-email">Email Address</label>
                <input
                  type="email"
                  id="login-email"
                  placeholder="admin@careerhub.io"
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  required
                />
              </div>
              <div className="password-input">
                <div className="password-label">
                  <label htmlFor="login-password">Password</label>
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
                    id="login-password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                  />
                </div>
              </div>
            </div>
            {errorMessage && (
              <div className="error-container">
                <img src={errorMessageIcon} alt="Error" />
                {errorMessage}
              </div>
            )}
            <div className="login-actions">
            <input type="submit" id="login-button" value="Sign In" />
            <button className="create-account-button" type="button" onClick={() => navigate("/signup")}>
              Create New Account
            </button>
            </div>
          </div>
        </form>
        <div className="or-divider">
          <span>or</span>
        </div>
        <button className="back-to-portal" onClick={() => navigate("/")}>
          <img src={leftArrow} alt="Left Arrow" />
          Back to Careers Portal
        </button>
        <div className="security-notes">
          <p className="security-note">
            Protected by HireFlow Enterprise Security.
          </p>
          <p className="security-note">
            By signing in, you agree to our{" "}
            <span className="policy-link">Terms of Service</span> and{" "}
            <span className="policy-link">Privacy Policy</span>.
          </p>
        </div>
      </div>
      <p className="copyright">
        HireFlow &copy; 2026 • Recruitment Management System
      </p>
    </div>
  );
};

export default LoginScreen;
