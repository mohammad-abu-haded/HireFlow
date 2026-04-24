import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";

import LoginScreen from "./screens/Auth/login/login.screen";
import SignupScreen from "./screens/Auth/signup/signup.screen";
import DemoModeSetupScreen from "./screens/Onboarding/DemoModeSetup.screen";
import PostJobScreen from "./screens/PostJob/PostJob.screen";
import DashboardScreen from "./screens/Dashboard/Dashboard.screen";
import ApplicationsScreen from "./screens/Applications/Applications.screen";

import AuthGuard from "./routes/AuthGuard";
import AppLayout from "./components/layouts/AppLayout";
import JobsScreen from "./screens/JobsScreen/JobsScreen";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route element={<AuthGuard />}>
          <Route path="/demo-setup" element={<DemoModeSetupScreen />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/post-job" element={<PostJobScreen />} />
            <Route path="/applications" element={<ApplicationsScreen />} />
            <Route path="/jobs" element={<JobsScreen />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
