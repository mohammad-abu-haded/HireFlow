import StatusFilter from "../../components/StatusFilter/StatusFilter";
import "./MyApplications.css";
import { useSearchParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import {
  ApplicationStatus,
  type IApplication,
  type StatusFilterOption,
} from "../../types";
import { AuthContext } from "../../context/authContext";
import Pagination from "../../components/Pagination/Pagination";
import MyApplicationCard from "../../components/MyApplicationCard/MyApplicationCard";
import { getPagination } from "../../utils/getPaginationRange";
const MyApplicationsScreen = () => {
  const [myApplications, setMyApplications] = useState<IApplication[]>([]);
  const { token } = useContext(AuthContext);
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [totalMyApplications, setTotalMyApplications] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pagination, setPagination] = useState<number[]>([]);
  const limit = 9;

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

  const getMyApplications = async () => {
    const token = localStorage.getItem("token");

    const query = new URLSearchParams();

    if (params.get("status")) query.set("status", params.get("status")!);

    query.set("page", page.toString());
    query.set("limit", limit.toString());

    const baseUrl = `http://localhost:5000/applications/my-applications`;
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
      const data = await getMyApplications();

      if (data) {
        setMyApplications(data.data);
        setTotalMyApplications(data.total);
        setTotalPages(data.totalPages);
      }
    };

    fetchData();
  }, [params, page]);

  useEffect(() => {
    setPagination(getPagination(page, totalPages));
  }, [page, totalPages]);

  return (
    <div className="my-applications-main">
      <div className="my-applications-filters">
        <StatusFilter
          STATUS_FILTER_CONFIG={STATUS_FILTER_CONFIG}
          params={params}
          setParams={setParams}
          setPage={setPage}
        />
      </div>
      <div className="my-application-cards-container">
        {myApplications.length > 0 ? (
          myApplications.map((item, index) => <MyApplicationCard {...item} key={index}/>)
        ) : (
          <div>No applications available yet</div>
        )}
      </div>
      <Pagination
        limit={limit}
        displayedItems={myApplications.length}
        page={page}
        setPage={setPage}
        totalItems={totalMyApplications}
        totalPages={totalPages}
        pagination={pagination}
      />
    </div>
  );
};

export default MyApplicationsScreen;
