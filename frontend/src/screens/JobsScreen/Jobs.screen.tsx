import "./Jobs.screen.css";
import { useSearchParams } from "react-router-dom";
import SearchIcon from "../../assets/icons/search.svg?react";
import { useContext, useEffect, useState } from "react";
import FilterSidebar from "../../components/FilterSidebar/FilterSidebar";
import type { FilterSection, JobCardProps } from "../../types";
import FilterIcon from "../../assets/icons/filter.svg?react";
import { AuthContext } from "../../context/authContext";
import JobCard from "../../components/JobCard/JobCard";
import Pagination from "../../components/Pagination/Pagination";
import { getPagination } from "../../utils/getPaginationRange";

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
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const [clear, setClear] = useState(false);
  const [jobs, setJobs] = useState<JobCardProps[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const { token } = useContext(AuthContext);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 6;

  const [pagination, setPagination] = useState<number[]>([]);
  const handleSearch = (e: any) => {
    e.preventDefault();
    params.set("q", search);
    setParams(params);
    setPage(1);
    if (search === "") {
      params.delete("q");
      setParams(params);
    }
  };

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
          <form onSubmit={handleSearch}>
            <div className="search-job-container">
              <SearchIcon
                className="search-job-icon"
                onClick={() => document.getElementById("search")?.focus()}
              />
              <input
                className="search-jobs"
                type="text"
                id="search"
                placeholder="Job title or keywords"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value === "") {
                    params.delete("q");
                    setParams(params);
                  }
                }}
              />
              <div className="search-job-button-container">
                <input
                  className="search-job-button"
                  value="Search"
                  type="submit"
                />
              </div>
            </div>
          </form>
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
          <div className="job-search-sidebar-header-title">
            SHOWING <b>{totalJobs}</b> ACTIVE OPPORTUNITIES
          </div>
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

        <div className="jobs-results-container">
          <div className="jobs-container">
            {jobs.map((job, index) => (
              <JobCard {...job} key={index} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              page={page}
              setPage={setPage}
              pagination={pagination}
              totalPages={totalPages}
              totalJobs={totalJobs}
              limit={limit}
              displayedJobs={jobs.length}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsScreen;
