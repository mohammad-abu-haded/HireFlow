import { ApplicationStatus, InterviewType, type IInterview } from "../../types";
import "./ApplicationStatusUpdate.css";
import DeleteIcon from "../../assets/icons/delete.svg?react";
import LocationIcon from "../../assets/icons/location.svg?react";
import CameraIcon from "../../assets/icons/camera.svg?react";
import { useContext, useEffect, useState } from "react";
import { APPLICATION_STATUS_CONFIG } from "../ApplicationCard/ApplicationCard";
import { formatDateTimeLocal } from "../../utils/dateFormatter";
import { initialInterviewState } from "../../constants/initialInterviewState";
import { AuthContext } from "../../context/authContext";
interface IProps {
  applicationId: string;
  fullName: string;
  status: ApplicationStatus;
  setIsUpdateStatusOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setStatus: React.Dispatch<React.SetStateAction<ApplicationStatus>>;
  showNotification: (type: "success" | "error", message: string, duration?: number) => void
}

const STATUS_LABELS = {
  [ApplicationStatus.PENDING]: "Pending",
  [ApplicationStatus.INTERVIEW]: "Interview",
  [ApplicationStatus.ACCEPTED]: "Accepted",
  [ApplicationStatus.REJECTED]: "Rejected",
};

const ApplicationStatusUpdate = (props: IProps) => {

  const [status, setStatus] = useState<ApplicationStatus>(props.status);
  const [interview, setInterview] = useState<IInterview>(initialInterviewState);
  const { token } = useContext(AuthContext);
  const statusConfig = APPLICATION_STATUS_CONFIG[status];
  const StatusIcon = statusConfig.icon;
  const statusBorder = statusConfig.border;
  const statusColor = statusConfig.color;
  const INTERVIEW_TYPE_CONFIG = {
    [InterviewType.ONLINE]: {
      label: "Online",
      icon: CameraIcon,
    },
    [InterviewType.ONSITE]: {
      label: "On-Site",
      icon: LocationIcon,
    },
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    updateApplicationStatus();
  };

  const getInterview = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/applications/${props.applicationId}/interview`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch interview");
      }

      return data.interview;
    } catch (err) {
      console.error("Error fetching interview:", err);
      throw err;
    }
  };

  const updateApplicationStatus = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/applications/${props.applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            interview,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update status");
      }
      props.setStatus(status);
      props.showNotification("success", "Status updated successfully", 3);
      props.setIsUpdateStatusOpen(false);
    } catch (err) {
      console.error("Update status error:", err);
      props.showNotification(
        "error",
        err instanceof Error ? err.message : "Something went wrong",
        3,
      );
      throw err;
    }
  };


  useEffect(() => {
    const fetchInterview = async () => {
      if (props.status === ApplicationStatus.INTERVIEW) {
        try {
          const data = await getInterview();
          setInterview(data);
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchInterview();
  }, [props.status]);
  return (
    <div className="application-status-update">
      <div className="application-status-update-card">
        <form onSubmit={handleSubmit}>
          <div className="application-status-update-card-header">
            <div className="application-status-update-card-header-title">
              <h2>Update Status</h2>
              <p>
                <span>Applicant:</span> {props.fullName}
              </p>
            </div>
            <div>
              <button
                className="application-status-update-close-button"
                onClick={() => props.setIsUpdateStatusOpen(false)}
              >
                <DeleteIcon className="application-status-update-close-icon" />
              </button>
            </div>
          </div>
          <div className="application-status-update-card-divider" />
          <div className="application-status-update-content">
            <p>Current Stage</p>
            <div className="application-status-update-select-container">
              <StatusIcon
                className="application-status-update-select-icon"
                style={{ color: statusColor }}
              />
              <select
                value={status}
                style={{ border: `1px solid ${statusBorder}` }}
                onChange={(e) => {
                  const stateSelected = e.target.value as ApplicationStatus;
                  setStatus(stateSelected);
                }}
              >
                {Object.values(ApplicationStatus).map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {status === ApplicationStatus.INTERVIEW && (
            <>
              <div className="application-status-update-card-divider" />
              <div className="application-status-update-content">
                <p>Interview Type</p>
                <div className="application-status-update-radio-container">
                  {Object.values(InterviewType).map((item) => {
                    const typeConfig = INTERVIEW_TYPE_CONFIG[item];
                    const TypeIcon = typeConfig.icon;
                    const typeLabel = typeConfig.label;
                    return (
                      <div
                        key={item}
                        className={`application-status-update-radio ${item === interview.type && "checked"}`}
                        onClick={() => {
                          setInterview((prev) => ({
                            ...prev,
                            type: item,
                          }));
                        }}
                      >
                        <TypeIcon className="application-status-update-radio-icon" />
                        <p>{typeLabel}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              {interview.type && (
                <div className="application-status-update-content">
                  <label htmlFor="date">DATE</label>
                  <input
                    type="datetime-local"
                    id="date"
                    value={formatDateTimeLocal(interview?.scheduledAt)}
                    onChange={(e) =>
                      setInterview((prev) => ({
                        ...prev,
                        scheduledAt: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              )}
              {interview.type === InterviewType.ONLINE ? (
                <div className="application-status-update-content">
                  <label htmlFor="link">MEETING LINK (OPTIONAL)</label>
                  <input
                    type="text"
                    id="link"
                    value={interview.meetingLink}
                    onChange={(e) =>
                      setInterview((prev) => ({
                        ...prev,
                        meetingLink: e.target.value,
                      }))
                    }
                  />
                </div>
              ) : (
                <div className="application-status-update-content">
                  <label htmlFor="location">OFFICE LOCATION</label>
                  <input
                    type="text"
                    id="location"
                    value={interview.location}
                    onChange={(e) =>
                      setInterview((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              )}
            </>
          )}

          <div className="application-status-update-card-divider" />
          <div className="application-status-update-card-actions">
            <button
              className="application-status-update-card-action cancel"
              onClick={() => props.setIsUpdateStatusOpen(false)}
            >
              Cancel
            </button>
            <input
              className="application-status-update-card-action save"
              type="submit"
              value="Save Changes"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationStatusUpdate;
