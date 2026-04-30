import StatCard from "../../components/StatCard/StatCard ";
import "./MyJobs.css";
import JobIcon from "../../assets/icons/briefcase-bag.svg?react";
import UserIcon from "../../assets/icons/persons.svg?react";
import CalendarIcon from "../../assets/icons/calender.svg?react";
import PlusIcon from "../../assets/icons/plus.svg?react";
import SearchIcon from "../../assets/icons/search.svg?react";
import type { IForm } from "../../types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/authContext";
import MyJobCard from "../../components/myJobCard/MyJobCard";
const MyJobsScreen = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { email } = useContext(AuthContext);
  const handleEdit = (jobId: string) => {
    localStorage.setItem("jobFormEdit", JSON.stringify(myJobs.find((job: IForm) => job.id === parseInt(jobId))));
    navigate("/post-job");
  };
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const handleDelete = (jobId: string) => {
    const newJobs = myJobs.filter((job : IForm) => job.id !== parseInt(jobId));
    localStorage.setItem("Jobs", JSON.stringify(newJobs));
    setIsDeleteMode(true);
  }
  const [myJobsFiltered, setMyJobsFiltered] = useState<IForm[]>([]);
  useEffect(() => {
    if (isDeleteMode) {
      setIsDeleteMode(false);
    }
    const query = (params.get("q") || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
    const queryWords = query.split(" ").filter(Boolean);
    const status = params.get("status");
    const jobs = JSON.parse(localStorage.getItem("Jobs") || "[]") as IForm[];
    const myJobs = jobs.filter((job: IForm) => job.email === email);
    let filtered = myJobs;
    if (query) {
      filtered = filtered.filter((job) => {
        const searchableText = [
          job.jobTitle,
          job.companyName,
          job.location,
          job.jobType,
          job.workSetting,
          job.experienceLevel,
        ]
          .join(" ")
          .toLowerCase();

        return queryWords.every((word) => searchableText.includes(word));
      });
    }
    filtered = filtered.filter((job) => {
      if (!status) return true;
      const jobStatus = getStatus(job);
      if (status === "Active") {
        return jobStatus === "ACTIVE";
      }
      if (status === "Closed") {
        return jobStatus === "CLOSED";
      }
      if (status === "Expired") {
        return jobStatus === "EXPIRED";
      }
      return true;
    });
    setMyJobsFiltered(filtered);
  }, [params, isDeleteMode]);
  const getJobsStats = (jobs: IForm[]) => {
    const now = new Date();

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    let currentCount = 0;
    let lastCount = 0;

    jobs.forEach((job) => {
      const jobDate = new Date(job.createdAt);

      const jobMonth = jobDate.getMonth();
      const jobYear = jobDate.getFullYear();

      if (jobMonth === currentMonth && jobYear === currentYear) {
        currentCount++;
      }

      if (jobMonth === lastMonth && jobYear === lastMonthYear) {
        lastCount++;
      }
    });

    const diff = currentCount - lastCount;

    return diff;
  };
  const getStatus = (job: IForm) => {
    if (job.status === "CLOSED") return "CLOSED";

    if (new Date() > new Date(job.applicationDeadline)) {
      return "EXPIRED";
    }

    return "ACTIVE";
  };
  const jobs = JSON.parse(localStorage.getItem("Jobs") || "[]");
  const myJobs = jobs.filter((job: IForm) => job.email === email);
  const activeJobs = myJobs.filter((job: IForm) => getStatus(job) === "ACTIVE");
  const diff = getJobsStats(activeJobs);
  const subtitle: string =
    diff > 0
      ? `↑ +${diff} this month`
      : diff < 0
        ? `↓ ${diff} this month`
        : "No change this month";
  const DASHBOARD_STATS = [
    {
      title: "Total Active Jobs",
      value: activeJobs.length,
      subtitle: subtitle,
      icon: JobIcon,
    },
    {
      title: "Total Applications",
      value: 452,
      subtitle: "+12% vs last week",
      icon: UserIcon,
    },
    {
      title: "Time to Hire",
      value: "18d",
      subtitle: "",
      icon: CalendarIcon,
    },
  ];
  return (
    <div className="my-jobs">
      <div className="my-jobs-header-container">
        <div className="my-jobs-header">
          <h2>My Job Postings</h2>
          <p>Manage your active listings and track incoming applications.</p>
        </div>
        <button
          className="post-job-button"
          onClick={() => navigate("/post-job")}
        >
          <PlusIcon className="plus-icon-button-post" />
          <p>Post New Job</p>
        </button>
      </div>
      <div className="my-jobs-stats">
        {DASHBOARD_STATS.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
          />
        ))}
      </div>
      <div className="filters-container">
        <div className="search-container">
          <input
            className="search-input"
            type="text"
            placeholder="Search by job title, company or keyword..."
            value={params.get("q") || ""}
            onChange={(e) => {
              params.set("q", e.target.value);
              setParams(params);
              if (e.target.value === "") {
                params.delete("q");
                setParams(params);
              }
            }}
          />
          <SearchIcon className="search-icon" />
        </div>
        <div className="status-filter-container">
          <div
            onClick={() => {
              params.delete("status");
              setParams(params);
            }}
            className={`${!params.get("status") ? "status-filter-active" : ""} status-filter`}
          >
            All
          </div>
          <div
            onClick={() => {
              params.set("status", "Active");
              setParams(params);
            }}
            className={`${params.get("status") === "Active" ? "status-filter-active" : ""} status-filter`}
          >
            Active
          </div>
          <div
            onClick={() => {
              params.set("status", "Closed");
              setParams(params);
            }}
            className={`${params.get("status") === "Closed" ? "status-filter-active" : ""} status-filter`}
          >
            Closed
          </div>
          <div
            onClick={() => {
              params.set("status", "Expired");
              setParams(params);
            }}
            className={`${params.get("status") === "Expired" ? "status-filter-active" : ""} status-filter`}
          >
            Expired
          </div>
        </div>
      </div>
      <div className="my-jobs-list">
        {myJobsFiltered.length === 0 ? (
          <p className="no-jobs-message">You have not posted any jobs yet.</p>
        ) : (
          myJobsFiltered.map((job) => (
            <MyJobCard
              key={job.id}
              jobId={job.id!}
              jobTitle={job.jobTitle}
              companyName={job.companyName}
              location={job.location}
              workSetting={job.workSetting}
              status={getStatus(job)}
              applicationsCount={job.applicationsCount}
              createdAt={job.createdAt}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MyJobsScreen;
