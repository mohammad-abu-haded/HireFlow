import "./VerifyOtp.css";
import VerifyIcon from "../../assets/icons/security.svg?react";
import ErrorMessageIcon from "../../assets/icons/emblem-important.svg?react";
import TimerIcon from "../../assets/icons/timer.svg?react";
import ResendIcon from "../../assets/icons/resend-email.svg?react";
import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import NotificationOverlay from "../../components/NotificationOverlay/NotificationOverlay";

const VerifyOtpScreen = () => {
  const { verifyOtp, resendOtp } = useContext(AuthContext);
  const numberOfDigits = 6;
  const [code, setCode] = useState<string[]>(Array(numberOfDigits).fill(""));
  const [errorMessage, setErrorMessage] = useState<string | null>();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isResendClicked, setIsResendClicked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem("pendingEmail");
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => {
    const expiry = Number(localStorage.getItem("otpExpiresAt"));
    const updateTimer = () => {
      const diff = Math.floor((expiry - Date.now()) / 1000);
      setTimeLeft(diff > 0 ? diff : 0);
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    setTimeout(() => {
      inputsRef.current[0]?.focus();
    }, 0);
  }, []);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleVerify = async (e: any) => {
    e.preventDefault();
    const otp = code.join("");

    const result = await verifyOtp(email, otp);
    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    localStorage.removeItem("pendingEmail");
    localStorage.removeItem("otpExpiresAt");
    setErrorMessage("");
    setSuccessMessage("Account created successfully!");
    setTimeout(() => {
      setSuccessMessage("");
      navigate("/login");
    }, 3000);
  };
  return (
    <div className="verify-screen">
      <div className="verify-container">
        <div className="verify-icon-container">
          <VerifyIcon className="verify-icon" />
        </div>

        <div className="verify-info">
          <h2>Verify OTP</h2>

          <p>
            We've sent a 6-digit verification code to
            <strong> {email} </strong>. Check your inbox (or spam folder) and
            enter the code to continue.
          </p>
        </div>
        <form onSubmit={handleVerify}>
          <div className="verify-code-container">
            {Array.from({ length: numberOfDigits }).map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={code[index]}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                onChange={(e) => {
                  const value = e.target.value;

                  if (!/^\d*$/.test(value)) return;

                  const newCode = [...code];
                  newCode[index] = value;
                  setCode(newCode);

                  if (value && index < numberOfDigits - 1) {
                    inputsRef.current[index + 1]?.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace") {
                    e.preventDefault();

                    const newCode = [...code];

                    if (code[index]) {
                      newCode[index] = "";
                      setCode(newCode);
                      return;
                    }

                    if (index > 0) {
                      newCode[index - 1] = "";
                      setCode(newCode);
                      inputsRef.current[index - 1]?.focus();
                    }
                  }
                }}
                className={`verify-input ${code[index] ? "filled" : ""}`}
              />
            ))}
          </div>
          {errorMessage && (
            <div className="error-verify-container">
              <ErrorMessageIcon className="error-verify-icon" />
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="success-verify-container">
              <NotificationOverlay type="success" message={successMessage}/>
            </div>
          )}
          {resendMessage && (
            <div className="resend-success-container">
              <ResendIcon className="resend-success-icon" />
              {resendMessage}
            </div>
          )}
          <div className="otp-actions">
            <div className="timer-container">
              <TimerIcon className="timer-icon" />

              <span className="timer-text">
                Expires in {minutes}:{seconds.toString().padStart(2, "0")}
              </span>
            </div>
            <button
              type="button"
              className={`resend-email ${isResendClicked ? "clicked" : ""}`}
              disabled={isResendClicked}
              onClick={async () => {
                if (isResendClicked) return;

                setIsResendClicked(true);
                setErrorMessage(null);

                const result = await resendOtp(email);

                if (!result.success) {
                  setErrorMessage(result.message);
                  setIsResendClicked(false);
                  return;
                }

                setResendMessage(result.message || "Code resent successfully!");

                setTimeout(() => {
                  setResendMessage(null);
                  setIsResendClicked(false);
                }, 3000);
              }}
            >
              <ResendIcon className="resend-email-icon" />
              <p>Resend Code</p>
            </button>
          </div>
          <input
            type="submit"
            className="verify-button"
            value={"Verify and Continue"}
          />
        </form>
      </div>
    </div>
  );
};

export default VerifyOtpScreen;
