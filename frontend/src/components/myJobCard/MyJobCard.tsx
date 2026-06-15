import "./MyJobCard.css";
import LocationIcon from "../../assets/icons/location.svg?react";
import ViewIcon from "../../assets/icons/external-link.svg?react";
import EditIcon from "../../assets/icons/edit.svg?react";
import ClockIcon from "../../assets/icons/clock.svg?react";
import SalaryIcon from "../../assets/icons/dollar-sign.svg?react";
import DeleteIcon from "../../assets/icons/trash.svg?react";
import { useLocation, useNavigate } from "react-router-dom";
import { getTimeAgo } from "../../utils/formatTimeAgo";
interface IProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  location: string;
  workSetting: string;
  status: "ACTIVE" | "CLOSED" | "EXPIRED" | "";
  createdAt: string;
  applicationsCount: number;
  salary: string;
  deleteJob: (id: string) => void;
}

const MyJobCard = (props: IProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  let jobLocation = "";
  switch (props.workSetting) {
    case "on-site":
      jobLocation = props.location;
      break;
    case "remote":
      jobLocation = "Remote";
      break;
    case "hybrid":
      jobLocation = `Hybrid - ${props.location}`;
      break;
  }
  return (
    <div className="my-job-card">
      <div className="job-title-card">
        <h3>{props.jobTitle}</h3>
      </div>
      <div className="job-meta">
        <div className={`status ${props.status.toLowerCase()}`}>
          <p>{props.status}</p>
        </div>
        <div className="post-date-container">
          <ClockIcon className="post-date-clock-icon" />
          <div className="post-date">{getTimeAgo(props.createdAt)}</div>
        </div>
      </div>
      <div className="company-name-card"><p>{props.companyName}</p></div>
      <div className="job-location-salary">
        <div className="location-container">
          <LocationIcon className="location-icon" />
          <p>{jobLocation}</p>
        </div>
        <div className="salary-range">
          <SalaryIcon className="salary-icon" />
          <p>{props.salary}</p>
        </div>
      </div>
      <div className="actions-container">
        <div className="edit-delete-container">
          <button
            className="edit-button"
            title="Edit Job"
            onClick={() => 
              navigate(`/update-job/${props.jobId}`,
                {state: {from: location.pathname}}
              )}
          >
            <EditIcon className="edit-icon-myJobCard" />
            <p>Edit</p>
          </button>
          <button
            className="delete-button"
            title="Delete Job"
            onClick={() => props.deleteJob(props.jobId.toString())}
          >
            <DeleteIcon className="delete-icon-myJobCard" />
            <p>Delete</p>
          </button>
        </div>
        <button 
        className="view-button"
        onClick={() => navigate(`/job-details/${props.jobId}`)}
        >
          <ViewIcon className="view-icon-myJobCard" />
          <p>View Details</p>
        </button>
      </div>
    </div>
  );
};

export default MyJobCard;
