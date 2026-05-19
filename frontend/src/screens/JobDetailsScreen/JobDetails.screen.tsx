import { useContext, useEffect, useState } from "react";
import LocationIcon from "../../assets/icons/location.svg?react";
import "./JobDetails.css";
import EditIcon from "../../assets/icons/edit.svg?react";
import OpenIcon from "../../assets/icons/open.svg?react";
import CloseIcon from "../../assets/icons/close.svg?react";
import ClockPlusIcon from "../../assets/icons/clock-plus.svg?react";
import type { IForm } from "../../types";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getStatus } from "../../utils/getStatus ";
import { AuthContext } from "../../context/authContext";
const JobDetails = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [job, setJob] = useState<IForm>();
  const [buttonLabel, setButtonLabel] = useState("");
  const [buttonIcon, setButtonIcon] = useState<React.ReactNode>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const getJobById = async (id: string) => {
    const res = await fetch(`http://localhost:5000/jobs/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    const data = await res.json();

    if (!res.ok) {
      navigate("/not-found", {
        state: { message: "Job not found" },
      });
    }

    return data;
  };

  const updateButtonData = (status: IForm["status"]) => {
    if (status === "ACTIVE") {
      setButtonLabel("Close Job");
      setButtonIcon(<CloseIcon className="close-open-icon-job-details" />);
    } else if (status === "CLOSED") {
      setButtonLabel("Open Job");
      setButtonIcon(<OpenIcon className="close-open-icon-job-details" />);
    } else {
      setButtonLabel("Extend Deadline");
      setButtonIcon(<ClockPlusIcon className="close-open-icon-job-details" />);
    }
  };
  const updateStatus = async (status: IForm["status"]) => {
    const response = await fetch(`http://localhost:5000/jobs/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    if (data.success) {
      setJob((oldValue) => {
        if (!oldValue) return oldValue;
        return {
          ...oldValue,
          status,
        };
      });
      updateButtonData(status);
    } else {
      console.log("Update failed");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data: IForm = await getJobById(id!);
      const status: IForm["status"] = getStatus(data);
      setJob({ ...data, status });
      updateButtonData(status);
    };
    if (id) {
      fetchData();
    }
  }, [id]);
  return (
    <div className="job-details-main">
      <div className="header-job-details">
        <div className="job-details-meta">
          <h2 className="job-details-title">{job?.jobTitle}</h2>
          <div className="company-location-details">
            <p>{job?.companyName} •</p>
            <div className="location-details">
              <LocationIcon className="location-icon-details" />
              <p>{job?.location}&nbsp;</p>
              {["remote", "hybrid"].some((setting) =>
                job?.workSetting?.includes(setting),
              ) ? (
                <p>({job?.workSetting})</p>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
        <div className="job-details-actions">
          <div className="status-job-details">{job?.status}</div>
          <button
            className="edit-button-job-details"
            title="Edit Job"
            onClick={() =>
              navigate(`/update-job/${job?._id}`, {
                state: { from: location.pathname },
              })
            }
          >
            <EditIcon className="edit-icon-job-details" />
            <p>Edit Job</p>
          </button>

          <button
            className="close-open-button-job-details"
            title={buttonLabel}
            onClick={() => {
              if (job?.status === "ACTIVE") {
                updateStatus("CLOSED");
              } else if (job?.status === "CLOSED") {
                updateStatus("ACTIVE");
              } else if (job?.status === "EXPIRED") {
                navigate(`/update-job/${job?._id}`, {
                  state: { from: location.pathname, scrollToDate: true },
                });
              }
            }}
          >
            {buttonIcon}
            <p>{buttonLabel}</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
