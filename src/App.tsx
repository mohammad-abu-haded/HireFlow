import "./App.css";
import LoginScreen from "./screens/Auth/login/login.screen";
import { Route, Routes } from "react-router-dom";
import SignupScreen from "./screens/Auth/signup/signup.screen";
import DemoModeSetup from "./screens/onboarding/demoModeSetup.screen";
import AuthGuard from "./routes/AuthGuard";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/demo-setup" element={<AuthGuard> <DemoModeSetup /> </AuthGuard>} />
      </Routes>
    </div>
  );
}

export default App;
