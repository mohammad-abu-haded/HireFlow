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
import JobsScreen from "./screens/JobsScreen/Jobs.screen";
import MyJobsScreen from "./screens/MyJobsScreen/MyJobs.screen";
import NotFoundScreen from "./screens/NotFound/NotFound.screen";
import VerifyOtp from "./screens/VerifyOtp/VerifyOtp.screen";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/jobs" replace />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route element={<AppLayout />}>
          <Route path="/jobs" element={<JobsScreen />} />
        </Route>
        <Route element={<AuthGuard />}>
          <Route path="/demo-setup" element={<DemoModeSetupScreen />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardScreen />} />
            <Route path="/my-jobs" element={<MyJobsScreen />} />
            <Route path="/post-job" element={<PostJobScreen />} />
            <Route path="/update-job/:id" element={<PostJobScreen />} />
            <Route path="/applications" element={<ApplicationsScreen />} />
            <Route path="/not-found" element={<NotFoundScreen />} />
            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
