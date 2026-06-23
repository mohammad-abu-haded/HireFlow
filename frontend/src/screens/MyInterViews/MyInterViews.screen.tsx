import { useContext, useEffect, useState } from "react";
import "./MyInterViews.css";
import {
  InterviewType,
  type IInterview,
  type StatusFilterOption,
} from "../../types";
import MyInterViewCard from "../../components/MyInterViewCard/MyInterViewCard";
import StatusFilter from "../../components/StatusFilter/StatusFilter";
import { useSearchParams } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import Pagination from "../../components/Pagination/Pagination";
import { getPagination } from "../../utils/getPaginationRange";

const MyInterViewsScreen = () => {
  const [myInterviews, setMyInterviews] = useState<IInterview[]>([]);
  const { token } = useContext(AuthContext);
  const [params, setParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [totalMyInterviews, setTotalMyInterviews] = useState(0);
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

    if (params.get("status")) query.set("status", params.get("status")!);

    query.set("page", page.toString());
    query.set("limit", limit.toString());

    const baseUrl = `http://localhost:5000/applications/my-interviews`;
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
        setMyInterviews(data.data);        
        setTotalMyInterviews(data.total);
        setTotalPages(data.totalPages);
      }
    };

    fetchData();
  }, [params, page]);

  useEffect(() => {
    setPagination(getPagination(page, totalPages));
  }, [page, totalPages]);

  return (
    <div className="my-interviews-main">
      <div className="my-applications-filters">
        <StatusFilter
          STATUS_FILTER_CONFIG={STATUS_FILTER_CONFIG}
          params={params}
          setParams={setParams}
          setPage={setPage}
        />
      </div>
      <div className="my-interviews-cards-container">
        {myInterviews && myInterviews?.length > 0 ? (
          myInterviews.map((item, index) => <MyInterViewCard {...item} key={index}/>)
        ) : (
          <p>You don't have any interviews yet.</p>
        )}
      </div>
      <Pagination
        limit={limit}
        displayedItems={myInterviews?.length}
        page={page}
        setPage={setPage}
        totalItems={totalMyInterviews}
        totalPages={totalPages}
        pagination={pagination}
      />
    </div>
  );
};

export default MyInterViewsScreen;
