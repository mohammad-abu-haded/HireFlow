import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";

import LoginScreen from "./screens/Auth/login/login.screen";
import SignupScreen from "./screens/Auth/signup/signup.screen";
import DemoModeSetupScreen from "./screens/Onboarding/DemoModeSetup.screen";
import PostJobScreen from "./screens/PostJob/PostJob.screen";
import ApplicationsScreen from "./screens/Applications/Applications.screen";

import AuthGuard from "./routes/AuthGuard";
import AppLayout from "./components/Layouts/AppLayout";
import JobsScreen from "./screens/JobsScreen/Jobs.screen";
import MyJobsScreen from "./screens/MyJobsScreen/MyJobs.screen";
import NotFoundScreen from "./screens/NotFound/NotFound.screen";
import VerifyOtpScreen from "./screens/VerifyOtp/VerifyOtp.screen";
import JobDetailsScreen from "./screens/JobDetailsScreen/JobDetails.screen";
import ApplyJobScreen from "./screens/ApplyJob/ApplyJob.screen";
import ApplicationDetailsScreen from "./screens/ApplicationDetails/ApplicationDetails.screen";
import MyApplicationsScreen from "./screens/MyApplications/MyApplications.screen";
import InterviewsScreen from "./screens/Interviews/Interviews.screen";
import MyInterViewsScreen from "./screens/MyInterViews/MyInterViews.screen";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/jobs" replace />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/verify-otp" element={<VerifyOtpScreen />} />
        <Route element={<AppLayout />}>
          <Route path="/jobs" element={<JobsScreen />} />
        </Route>
        <Route element={<AuthGuard />}>
          <Route path="/demo-setup" element={<DemoModeSetupScreen />} />
          <Route element={<AppLayout />}>
            <Route path="/my-jobs" element={<MyJobsScreen />} />
            <Route path="/job-details/:id" element={<JobDetailsScreen />} />
            <Route path="/post-job" element={<PostJobScreen />} />
            <Route path="/update-job/:id" element={<PostJobScreen />} />
            <Route path="/applications" element={<ApplicationsScreen />} />
            <Route path="/my-applications" element={<MyApplicationsScreen />} />
            <Route path="/interviews" element={<InterviewsScreen />} />
            <Route path="/my-interviews" element={<MyInterViewsScreen />} />
            <Route path="/job/:id/applications" element={<ApplicationsScreen />} />
            <Route path="/applications-details/:id" element={<ApplicationDetailsScreen />} />
            <Route path="/apply-job/:id" element={<ApplyJobScreen />} />
            <Route path="/not-found" element={<NotFoundScreen />} />
            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
