import { useContext } from "react";
import jobs from "../../data/jobs.json";
import { AuthContext } from "../../context/authContext";
const DashboardScreen = () => {
  const { email } = useContext(AuthContext);
  const storedJobs = JSON.parse(localStorage.getItem("jobs") || "[]");
  const allJobs = [...jobs, ...storedJobs];
  const otherJobs = allJobs.filter((job) => job.email !== email);
  return <div className="dashboard-screen">
    {otherJobs.length}
  </div>;
};

export default DashboardScreen;
