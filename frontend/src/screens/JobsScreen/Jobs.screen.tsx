import "./Jobs.screen.css";
import { useSearchParams } from "react-router-dom";
import SearchIcon from "../../assets/icons/search.svg?react";
import { useEffect, useState } from "react";
const JobsScreen = () => {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const handleSearch = (e: any) => {
    e.preventDefault();
    params.set("q", search);
    setParams(params);
    if (search === "") {
      params.delete("q");
      setParams(params);
    } else {
      fetchJobs(search);
    }
  };

  const fetchJobs = (query: string | null) => {};

  useEffect(() => {
    const query = params.get("q");

    if (query) {
      fetchJobs(query);
    }
  }, []);
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
              <SearchIcon className="search-job-icon" onClick={() => document.getElementById("search")?.focus()}/>
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
                    fetchJobs(null);
                  }
                }}
              />
              <div
                className="search-job-button-container"
              >
                <input className="search-job-button" value="Search" type="submit"/>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobsScreen;
