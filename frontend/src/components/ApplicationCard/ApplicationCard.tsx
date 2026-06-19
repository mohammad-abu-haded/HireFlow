import { ApplicationStatus } from "../../types";
import "./ApplicationCard.css";
import CalenderIcon from "../../assets/icons/calender.svg?react";
import ClockIcon from "../../assets/icons/clock.svg?react";
import AcceptedIcon from "../../assets/icons/clock.svg?react";
import RejectIcon from "../../assets/icons/delete.svg?react";
import { useNavigate } from "react-router-dom";
import { ApplicationsScope } from "../../screens/Applications/Applications.screen";

interface IProps {
  _id: string;
  jobId: number;
  fullName: string;
  email: string;
  createdAt: string;
  status: ApplicationStatus;
  jobTitle: string;
  cvFile?: {
    filename: string;
    originalName: string;
    path: string;
    mimetype: string;
    size: number;
  } | null;
  applicationsScope: ApplicationsScope;
}

export const APPLICATION_STATUS_CONFIG = {
  [ApplicationStatus.PENDING]: {
    label: "Pending",
    icon: ClockIcon,
    background_color: "#DBEAFE",
    color: "#1D4ED8",
    border: "#BFDBFE",
  },
  [ApplicationStatus.INTERVIEW]: {
    label: "Interview",
    icon: CalenderIcon,
    background_color: "#F3E8FF",
    color: "#7E22CE",
    border: "#E9D5FF",
  },
  [ApplicationStatus.ACCEPTED]: {
    label: "Accepted",
    icon: AcceptedIcon,
    background_color: "#DCFCE7",
    color: "#15803D",
    border: "#BBF7D0",
  },
  [ApplicationStatus.REJECTED]: {
    label: "Rejected",
    icon: RejectIcon,
    background_color: "#FEE2E2",
    color: "#B91C1C",
    border: "#FECACA",
  },
};
const ApplicationCard = (props: IProps) => {
  const config = APPLICATION_STATUS_CONFIG[props.status];
  const label = config.label;
  const Icon = config.icon;
  const background_color = config.background_color;
  const color = config.color;
  const border = config.border;
  const navigate = useNavigate();

  const openCV = async () => {
    const res = await fetch(
      `http://localhost:5000/applications/applications/${props._id}/cv`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    if (!res.ok) return;

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url);
  };

  return (
    <div className="application-card-container">
      <div className="application-card-header">
        <div className="application-card-profile-container">
          <div className="application-card-profile">
            {props.fullName && props.fullName[0]}
          </div>
          <div className="application-card-info">
            <div className="application-card-name">{props.fullName}</div>

            <div className="application-card-email">{props.email}</div>
          </div>
        </div>

        <div
          className="application-card-status"
          style={{
            backgroundColor: background_color,
            color: color,
            border: `1px solid ${border}`,
          }}
        >
          <Icon className="application-card-status-icon" />
          <p>{label}</p>
        </div>
      </div>

      <div className="application-card-title-date-container">
        { props.applicationsScope === ApplicationsScope.AllApplications &&
          <div className="application-card-job-title">
            <p>APPLIED FOR</p>
            <h2>{props.jobTitle}</h2>
          </div>
        }

        <div>
          <p>DATE APPLIED</p>
          <h2 style={{ fontWeight: 500 }}>{props.createdAt}</h2>
        </div>
      </div>

      <div className="application-card-actions">
        <button
          className="application-card-action"
          onClick={() => {
            navigate(`/applications-details/${props._id}`);
          }}
        >
          Application Details
        </button>
        {props.applicationsScope === ApplicationsScope.AllApplications && (
          <button
            className="application-card-action"
            onClick={() => {
              navigate(`/job-details/${props.jobId}`);
            }}
          >
            Job Details
          </button>
        )}
        <button
          className="application-card-action"
          disabled={props.cvFile ? false : true}
          onClick={() => openCV()}
        >
          {props.cvFile ? "View Resume" : "No CV uploaded"}
        </button>
      </div>
    </div>
  );
};

export default ApplicationCard;
