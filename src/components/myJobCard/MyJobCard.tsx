import "./MyJobCard.css";
import LocationIcon from "../../assets/icons/location.svg?react";
import PersonsIcon from "../../assets/icons/persons.svg?react";
import BagIcon from "../../assets/icons/briefcase-bag.svg?react";
import EyeIcon from "../../assets/icons/eye.svg?react";
import EditIcon from "../../assets/icons/edit.svg?react";
import DeleteIcon from "../../assets/icons/trash.svg?react";
interface IProps {
  jobId: number;
  jobTitle: string;
  companyName: string;
  location: string;
  workSetting: string;
  status: "ACTIVE" | "CLOSED" | "EXPIRED";
  createdAt: string;
  applicationsCount: number;
  handleEdit : (jobId: string) => void;
  handleDelete : (jobId: string) => void;
}

const formatPostedDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  const isSameYear = date.getFullYear() === now.getFullYear();

  const options: Intl.DateTimeFormatOptions = isSameYear
    ? { month: "short", day: "numeric" } // Oct 10
    : { month: "short", day: "numeric", year: "numeric" }; // Oct 10, 2024

  return date.toLocaleDateString("en-US", options);
};
const MyJobCard = (props: IProps) => {
  let location = "";
  switch (props.workSetting) {
    case "on-site":
      location = props.location;
      break;
    case "remote":
      location = "Remote";
      break;
    case "hybrid":
      location = `Hybrid - ${props.location}`;
      break;
  }

  return (
    <div className="my-job-card">
      <div className="icon-container">
        <BagIcon className="bag-icon" />
      </div>
      <div className="job-info">
        <h3>{props.jobTitle}</h3>
        <p>{props.companyName}</p>
      </div>
      <div className="location-container">
        <LocationIcon className="location-icon" />
        <p>{location}</p>
      </div>
      <div className={`status-container ${props.status.toLowerCase()}`}>
        <p>{props.status}</p>
      </div>
      <div className="applications-container">
        <div className="applications-count">
          <PersonsIcon className="persons-icon" />
          <p>{props.applicationsCount}</p>
        </div>
        <p>Applicants</p>
      </div>
      <div className="posted-container">
        <p className="posted-label">Posted</p>
        <p className="posted-date">{formatPostedDate(props.createdAt)}</p>
      </div>
      <button className="view-button">
        <EyeIcon className="eye-icon-myJobCard" />
        <p>View</p>
      </button>
      <div className="edit-delete-container">
        <button className="edit-button" title="Edit Job" onClick={() => props.handleEdit(props.jobId.toString())}>
          <EditIcon className="edit-icon-myJobCard" />
        </button>
        <button className="delete-button" title="Delete Job" onClick={() => props.handleDelete(props.jobId.toString())}>
          <DeleteIcon className="delete-icon-myJobCard" />
        </button>
      </div>
    </div>
  );
};

export default MyJobCard;
