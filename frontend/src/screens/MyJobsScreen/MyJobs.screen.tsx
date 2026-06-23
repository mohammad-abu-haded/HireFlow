import StatCard from "../../components/StatCard/StatCard ";
import "./MyJobs.css";
import JobIcon from "../../assets/icons/briefcase-bag.svg?react";
import UserIcon from "../../assets/icons/persons.svg?react";
import PlusIcon from "../../assets/icons/plus.svg?react";
import SearchIcon from "../../assets/icons/search.svg?react";
import {
  JobDetailStatus,
  type IForm,
  type StatusFilterOption,
} from "../../types";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/authContext";
import MyJobCard from "../../components/MyJobCard/MyJobCard";
import { formatSalary } from "../../utils/formatSalary";
import { getPagination } from "../../utils/getPaginationRange";
import Pagination from "../../components/Pagination/Pagination";
import StatusFilter from "../../components/StatusFilter/StatusFilter";

const MyJobsScreen = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { token } = useContext(AuthContext);
  const [jobs, setJobs] = useState<IForm[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalJobsActive, setTotalJobsActive] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [applicationsSubtitle, setApplicationsSubtitle] = useState(
    "No change vs last week",
  );
  const limit = 6;

  const [pagination, setPagination] = useState<number[]>([]);

  const deleteJob = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/jobs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        const newTotalJobs = totalJobs - 1;
        setTotalJobs(newTotalJobs);
        fetchJobs(page);
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const fetchJobs = async (pageNumber = 1) => {
    if (!token) return;

    const query = params.get("q") || "";
    const status = params.get("status") || "";
    const res = await fetch(
      `http://localhost:5000/jobs/range?limit=${limit}&page=${pageNumber}&q=${query}&status=${status}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await res.json();
    setTotalJobs(data.total);
    setTotalJobsActive(data.activeCount);
    setJobs(data.data);
  };

  const fetchTotalApplications = async () => {
    if (!token) return;

    try {
      const res = await fetch(
        "http://localhost:5000/applications/my/applications/count",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();
      setTotalApplications(data.totalApplications);
    } catch (error) {
      console.error("Error fetching total applications:", error);
    }
  };

  const fetchApplicationsStats = async () => {
    if (!token) return;

    try {
      const res = await fetch(
        "http://localhost:5000/applications/stats/applications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (data.difference > 0) {
        setApplicationsSubtitle(`↑ +${data.percentage}% vs last week`);
      } else if (data.difference < 0) {
        setApplicationsSubtitle(
          `↓ -${Math.abs(data.percentage)}% vs last week`,
        );
      } else {
        setApplicationsSubtitle("No change vs last week");
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchJobs(page);
  }, [token, page, params]);

  useEffect(() => {
    if (!token) return;

    const pagesCount = Math.ceil(totalJobs / limit);
    setTotalPages(pagesCount);
  }, [token, params, totalJobs]);

  useEffect(() => {
    if (totalPages < page && totalPages > 0) {
      setPage(page - 1);
    }
  }, [totalPages]);

  useEffect(() => {
    setPagination(getPagination(page, totalPages));
  }, [page, totalPages]);

  useEffect(() => {
    if (!token) return;
    fetchTotalApplications();
  }, [token, jobs]);

  useEffect(() => {
    if (!token) return;

    fetchApplicationsStats();
  }, [token]);

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

  const activeJobs = jobs.filter(
    (job: IForm) => job.status.toUpperCase() === "ACTIVE",
  );
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
      value: totalJobsActive,
      subtitle: subtitle,
      icon: JobIcon,
    },
    {
      title: "Total Applications",
      value: totalApplications,
      subtitle: applicationsSubtitle,
      icon: UserIcon,
    },
  ];

  const STATUS_FILTER_CONFIG: StatusFilterOption[] = [
    {
      label: "ALL",
      isAll: true,
    },
    {
      label: JobDetailStatus.ACTIVE,
    },
    {
      label: JobDetailStatus.CLOSED,
    },
    {
      label: JobDetailStatus.EXPIRED,
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
        <div className="jobs-search-container">
          <form>
            <input
              className="jobs-search-input"
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
          </form>
          <SearchIcon className="jobs-search-icon" />
        </div>

        <StatusFilter
          STATUS_FILTER_CONFIG={STATUS_FILTER_CONFIG}
          params={params}
          setParams={setParams}
          setPage={setPage}
        />
      </div>

      <div className="my-jobs-list">
        {jobs.length === 0 ? (
          params.get("q") || params.get("status") ? (
            <p className="no-jobs-message">No jobs match your search/filter.</p>
          ) : (
            <p className="no-jobs-message">You have not posted any jobs yet.</p>
          )
        ) : (
          jobs.map((job) => (
            <MyJobCard
              key={job._id}
              jobId={job._id!}
              jobTitle={job.jobTitle}
              companyName={job.companyName}
              location={job.location}
              workSetting={job.workSetting}
              status={job.status}
              applicationsCount={job.applicationsCount}
              createdAt={job.createdAt}
              deleteJob={deleteJob}
              salary={formatSalary(job.salaryMin, job.salaryMax)}
            />
          ))
        )}
      </div>
      <Pagination
        page={page}
        setPage={setPage}
        pagination={pagination}
        totalPages={totalPages}
        totalItems={totalJobs}
        limit={limit}
        displayedItems={jobs.length}
      />
    </div>
  );
};

export default MyJobsScreen;
