import { useContext, useEffect, useState } from "react";
import Search from "../../components/Search/Search";
import StatusFilter from "../../components/StatusFilter/StatusFilter";
import "./Interviews.css";
import { getPagination } from "../../utils/getPaginationRange";
import FilterIcon from "../../assets/icons/filter.svg?react";
import Pagination from "../../components/Pagination/Pagination";
import {
  InterviewType,
  type IInterview,
  type StatusFilterOption,
} from "../../types";
import { AuthContext } from "../../context/authContext";
import { useSearchParams } from "react-router-dom";
import InterViewCard from "../../components/InterViewCard/InterViewCard";
const InterviewsScreen = () => {
  const [interviews, setInterviews] = useState<IInterview[]>([]);
  const { token } = useContext(AuthContext);
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const [page, setPage] = useState(1);
  const [totalInterviews, setTotalInterviews] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pagination, setPagination] = useState<number[]>([]);
  const limit = 6;

  const STATUS_FILTER_CONFIG: StatusFilterOption[] = [
    {
      label: "ALL",
      isAll: true,
    },
    {
      label: InterviewType.ONLINE,
    },
    {
      label: InterviewType.ONSITE,
    },
  ];

  const getApplications = async () => {
    const token = localStorage.getItem("token");

    const query = new URLSearchParams();

    if (params.get("q")) query.set("q", params.get("q")!);
    if (params.get("status")) query.set("status", params.get("status")!);

    query.set("page", page.toString());
    query.set("limit", limit.toString());

    const baseUrl = `http://localhost:5000/applications/my-supervised-interviews`;
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
    const fetchData = async () => {
      const data = await getApplications();

      if (data) {
        setInterviews(data.data);
        setTotalInterviews(data.total);
        setTotalPages(data.totalPages);
      }
    };

    fetchData();
  }, [params, page]);

  useEffect(() => {
    setPagination(getPagination(page, totalPages));
  }, [page, totalPages]);

  return (
    <div className="interviews-main">
      <div className="applications-filters">
        <div className="applications-search-filter-container">
          <Search
            params={params}
            placeholder="Search by name, email, job, or location..."
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

      <div className="interviews-cards-container">
        {interviews.length > 0 ? (
          interviews.map((item, index) => (
            <InterViewCard {...item} key={index} />
          ))
        ) : (
          <p>You don't have any interviews yet.</p>
        )}
      </div>
      <Pagination
        limit={limit}
        displayedItems={interviews?.length}
        page={page}
        setPage={setPage}
        totalItems={totalInterviews}
        totalPages={totalPages}
        pagination={pagination}
      />
    </div>
  );
};

export default InterviewsScreen;
