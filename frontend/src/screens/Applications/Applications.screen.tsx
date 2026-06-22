import { useContext, useEffect, useState } from "react";
import {
  ApplicationStatus,
  type IApplication,
  type StatusFilterOption,
} from "../../types";
import ApplicationCard from "../../components/ApplicationCard/ApplicationCard";
import "./Applications.css";
import StatusFilter from "../../components/StatusFilter/StatusFilter";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import FilterIcon from "../../assets/icons/filter.svg?react";
import Search from "../../components/Search/Search";
import Pagination from "../../components/Pagination/Pagination";
import { getPagination } from "../../utils/getPaginationRange";
import { AuthContext } from "../../context/authContext";
import { formatDisplayDateTime } from "../../utils/dateFormatter";

export enum ApplicationsScope {
  AllApplications = "allApplications",
  JobApplications = "jobApplications",
  NoApplications = "noApplications",
}
const ApplicationsScreen = () => {
  const [applications, setApplications] = useState<IApplication[]>([]);
  const { token } = useContext(AuthContext);
  const [params, setParams] = useSearchParams();
  const pathname = useLocation().pathname;
  const { id } = useParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const [page, setPage] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pagination, setPagination] = useState<number[]>([]);
  const [jobTitles, setJobTitles] = useState<Record<string, string>>({});
  const [applicationsScope, setApplicationsScope] = useState<ApplicationsScope>(
    ApplicationsScope.NoApplications,
  );
  const navigate = useNavigate();
  const limit = 9;

  const getJobTitleById = async (id: number | string) => {
    try {
      const res = await fetch(`http://localhost:5000/jobs/${id}/title`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        navigate("/not-found", {
          state: { message: "Job not found" },
        });
        return;
      }

      const data = await res.json();

      return data.jobTitle;
    } catch (err) {
      console.error(err);

      navigate("/not-found", {
        state: { message: "Job not found" },
      });
    }
  };

  const getApplications = async (applicationsScope: ApplicationsScope) => {
    const token = localStorage.getItem("token");

    const query = new URLSearchParams();

    if (params.get("q")) query.set("q", params.get("q")!);
    if (params.get("status")) query.set("status", params.get("status")!);

    query.set("page", page.toString());
    query.set("limit", limit.toString());

    const baseUrl =
      applicationsScope == ApplicationsScope.JobApplications
        ? `http://localhost:5000/applications/job/${id}`
        : applicationsScope == ApplicationsScope.AllApplications
          ? `http://localhost:5000/applications`
          : "";
    try {
      const res = await fetch(`${baseUrl}?${query.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch applications");
      }

      return await res.json();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!token) return;
    const scope =
      pathname === "/applications"
        ? ApplicationsScope.AllApplications
        : pathname === `/job/${id}/applications`
          ? ApplicationsScope.JobApplications
          : ApplicationsScope.NoApplications;
    setApplicationsScope(scope);
    const fetchData = async () => {
      const data =
        scope !== ApplicationsScope.NoApplications &&
        (await getApplications(scope));

      if (data) {
        setApplications(data.data);
        setTotalApplications(data.total);
        setTotalPages(data.totalPages);
      }
    };

    fetchData();
  }, [params, page, pathname]);

  useEffect(() => {
    setPagination(getPagination(page, totalPages));
  }, [page, totalPages]);

  useEffect(() => {
    const loadData = async () => {
      if (!applications.length) {
        if (id) {
          const title = await getJobTitleById(id);

          setJobTitles({
            [id]: title,
          });
        }

        return;
      }
    };

    loadData();

    const fetchTitles = async () => {
      const titles: Record<string, string> = {};

      await Promise.all(
        applications.map(async (item) => {
          const title = await getJobTitleById(item.jobId);
          if (title) {
            titles[item.jobId] = title;
          }
        }),
      );

      setJobTitles(titles);
    };

    fetchTitles();
  }, [applications, id]);

  const STATUS_FILTER_CONFIG: StatusFilterOption[] = [
    {
      label: "ALL",
      isAll: true,
    },
    {
      label: ApplicationStatus.ACCEPTED,
    },
    {
      label: ApplicationStatus.INTERVIEW,
    },
    {
      label: ApplicationStatus.PENDING,
    },
    {
      label: ApplicationStatus.REJECTED,
    },
  ];

  return (
    <div className="applications-main">
      <div className="applications-cards-container-title">
        {id ? (
          <p>
            Applications submitted for <span>{jobTitles[id]}</span>.
          </p>
        ) : (
          <p>Applications submitted across all your job postings.</p>
        )}
      </div>

      <div className="applications-filters">
        <div className="applications-search-filter-container">
          <Search
            params={params}
            placeholder="Search applications..."
            search={search}
            setParams={setParams}
            setSearch={setSearch}
            setPage={setPage}
          />
        </div>
        <StatusFilter
          STATUS_FILTER_CONFIG={STATUS_FILTER_CONFIG}
          params={params}
          setParams={setParams}
          setPage={setPage}
        />

        <FilterIcon className="applications-filters-icon" />
      </div>
      <div className="application-cards-container">
        {totalApplications > 0 ? (
          applications.map((application, index) => (
            <ApplicationCard
              key={index}
              _id={application?._id}
              createdAt={formatDisplayDateTime(application?.createdAt)}
              email={application?.email}
              fullName={application?.fullName}
              status={application?.status}
              jobTitle={jobTitles[application.jobId]}
              jobId={application.jobId}
              cvFile={application.cvFile}
              applicationsScope={applicationsScope}
            />
          ))
        ) : (
          <div>No applications available yet</div>
        )}
      </div>

      <Pagination
        limit={limit}
        displayedItems={applications.length}
        page={page}
        setPage={setPage}
        totalItems={totalApplications}
        totalPages={totalPages}
        pagination={pagination}
      />
    </div>
  );
};

export default ApplicationsScreen;
