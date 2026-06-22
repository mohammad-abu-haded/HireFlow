import "./Jobs.css";
import { useSearchParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import FilterSidebar from "../../components/FilterSidebar/FilterSidebar";
import type { FilterSection, JobCardProps } from "../../types";
import FilterIcon from "../../assets/icons/filter.svg?react";
import { AuthContext } from "../../context/authContext";
import JobCard from "../../components/JobCard/JobCard";
import Pagination from "../../components/Pagination/Pagination";
import { getPagination } from "../../utils/getPaginationRange";
import Search from "../../components/Search/Search";

export const JOB_FILTERS_DATA: FilterSection[] = [
  {
    id: "job_type",
    title: "JOB TYPE",
    items: [
      { id: "full-time", label: "Full-time" },
      { id: "contract", label: "Contract" },
      { id: "part-time", label: "Part-time" },
      { id: "internship", label: "Internship" },
    ],
  },
  {
    id: "salary_range",
    title: "SALARY RANGE",
    items: [
      { id: "50k-80k", label: "$50k - $80k" },
      { id: "80k-120k", label: "$80k - $120k" },
      { id: "120k-160k", label: "$120k - $160k" },
      { id: "160k+", label: "$160k+" },
    ],
  },
  {
    id: "experience",
    title: "EXPERIENCE LEVEL",
    items: [
      { id: "entry", label: "Entry Level" },
      { id: "mid", label: "Mid Level" },
      { id: "senior", label: "Senior" },
    ],
  },
  {
    id: "date_posted",
    title: "DATE POSTED",
    items: [
      { id: "24h", label: "Last 24 Hours" },
      { id: "7d", label: "Last 7 Days" },
    ],
  },
];

const JobsScreen = () => {
  const { token } = useContext(AuthContext);
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const [clear, setClear] = useState(false);
  const [jobs, setJobs] = useState<JobCardProps[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 6;

  const [pagination, setPagination] = useState<number[]>([]);

  const clearSearch = () => {
    setClear(true);
    JOB_FILTERS_DATA.map((item) => {
      params.delete(item.id);
    });
    setParams(params);
  };

  const fetchJobs = async (
    query: string | null,
    selectedFilters: string[][],
    page: number,
    limit: number,
  ) => {
    const params = new URLSearchParams();

    params.set("page", page.toString());
    params.set("limit", limit.toString());

    if (query?.trim()) {
      params.set("q", query.trim());
    }

    selectedFilters.forEach((values, index) => {
      const filterId = JOB_FILTERS_DATA[index].id;

      values.forEach((value) => {
        params.append(filterId, value);
      });
    });

    const res = await fetch(
      `http://localhost:5000/jobs/jobs?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) throw new Error("Failed to fetch jobs");

    const response = await res.json();

    setJobs(response.data);
    setTotalJobs(response.total);

    return response;
  };

  useEffect(() => {
    const searchQuery = params.get("q");

    const selectedFilters = JOB_FILTERS_DATA.map((filter) =>
      params.getAll(filter.id),
    );

    fetchJobs(searchQuery, selectedFilters, page, limit);
  }, [params, page]);

  useEffect(() => {
    if (!token) return;

    const pagesCount = Math.ceil(totalJobs / limit);
    setTotalPages(pagesCount);
  }, [token, params, totalJobs]);

  useEffect(() => {
    setPagination(getPagination(page, totalPages));
  }, [page, totalPages]);

  return (
    <div className="jobs-screen-container">
      <div className="job-header">
        <div className="job-header-container">
          <h2>
            Find your next <span>career-defining</span> role.
          </h2>
          <p>
            Browse thousands of high-quality job opportunities from leading
            companies and startups around the globe.
          </p>
          <div className="job-search-container">
            <Search
              params={params}
              placeholder="Job title or keywords"
              search={search}
              setParams={setParams}
              setSearch={setSearch}
              setPage={setPage}
            />
          </div>
        </div>
      </div>

      <div className="job-main">
        <div className="job-search-sidebar-header">
          <div className="job-search-sidebar-header-title">
            <FilterIcon className="job-search-sidebar-icon" />
            <p>Filters</p>
          </div>
          <button onClick={clearSearch} className="job-search-sidebar-clear">
            Clear All
          </button>
        </div>

        <div className="job-search-sidebar-header">
          {totalJobs > 0 ? (
            <div className="job-search-sidebar-header-title">
              SHOWING <b>{totalJobs}</b> ACTIVE OPPORTUNITIES
            </div>
          ) : (
            <div className="job-search-sidebar-empty">
              No active jobs available yet
            </div>
          )}
        </div>

        <div className="job-search-sidebar-content">
          {JOB_FILTERS_DATA.map((item) => (
            <FilterSidebar
              key={item.id}
              section={item}
              setClear={setClear}
              clear={clear}
              setParams={setParams}
              params={params}
            />
          ))}
        </div>

        {jobs.length > 0 && (
          <div className="jobs-results-container">
            <div className="jobs-container">
              {jobs.map((job, index) => (
                <JobCard {...job} key={index} />
              ))}
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
        )}
      </div>
    </div>
  );
};

export default JobsScreen;
