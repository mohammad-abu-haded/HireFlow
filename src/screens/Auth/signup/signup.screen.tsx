import { useState } from "react";
import eye from "../../../assets/icons/eye.svg";
import eyeClosed from "../../../assets/icons/eye-closed.svg";
import errorMessageIcon from "../../../assets/icons/emblem-important.svg";
import "./signup.css";
import { Link, useNavigate } from "react-router-dom";
const SignupScreen = () => {
  const signupHandler = (event: any) => {
    event.preventDefault();
    const storedEmail = localStorage.getItem("email");
    if (email === storedEmail) {
      setErrorMessage("An account with this email already exists.");
    } else if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please try again.");
    } else {
      localStorage.setItem("fullName", fullName);
      localStorage.setItem("email", email);
      localStorage.setItem("password", password);
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setErrorMessage("");
      navigate("/login");
    }
  };
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  return (
    <div className="signup-screen">
      <div
        className={
          errorMessage
            ? "signup-screen-container with-error"
            : "signup-screen-container"
        }
      >
        <form onSubmit={signupHandler} className="signup-screen-form">
          <div className="signup-screen-logo">
            <img src="/hireflow-favicon.png" alt="HireFlow Logo" />
            <h2>HireFlow</h2>
          </div>
          <div className="signup-screen-content">
            <h2>Create your account</h2>
            <p>
              Join thousands of professionals finding their next career move.
            </p>
          </div>
          <div
            className={errorMessage ? "signup-form with-error" : "signup-form"}
          >
            <div className="signup-input">
              <div className="fullname-input">
                <label htmlFor="signup-fullname">Full Name</label>
                <input
                  type="text"
                  id="signup-fullname"
                  placeholder="Alex Thompson"
                  onChange={(e) => setFullName(e.target.value)}
                  value={fullName}
                  required
                />
              </div>
              <div className="email-input">
                <label htmlFor="signup-email">Email Address</label>
                <input
                  type="email"
                  id="signup-email"
                  placeholder="admin@careerhub.io"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  required
                />
              </div>
              <div className="password-input">
                <div className="password-label">
                  <label htmlFor="signup-password">Password</label>
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
                    id="signup-password"
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                  />
                </div>
              </div>
              <div className="password-input">
                <div className="password-label">
                  <label htmlFor="signup-confirm-password">Confirm Password</label>
                </div>
                <div className="password-field">
                  {confirmPassword.length > 0 && (
                    <img
                      src={!showConfirmPassword ? eye : eyeClosed}
                      alt="Toggle Password Visibility"
                      className="eye-icon"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  )}
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="signup-confirm-password"
                    placeholder="••••••••"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    value={confirmPassword}
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
            <div className="signup-actions">
              <input type="submit" id="signup-button" value="Create Account" />
            </div>
          </div>
        </form>
        <div className="signin-link">
          <p>
          Already have an account? 
          </p>
          <Link to={"/login"}>Sign in instead</Link>
        </div>
        <div className="security-notes">
          <p className="security-note">
            By clicking "Create Account", you agree to our{" "}
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

export default SignupScreen;
