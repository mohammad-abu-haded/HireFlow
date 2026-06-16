import { ApplicationStatus } from "../../types";
import "./ApplicationCard.css";
import CalenderIcon from "../../assets/icons/calender.svg?react";
import ClockIcon from "../../assets/icons/clock.svg?react";
import AcceptedIcon from "../../assets/icons/clock.svg?react";
import RejectIcon from "../../assets/icons/delete.svg?react";

interface IProps {
  _id: string;
  jobId?: number;
  fullName: string;
  email: string;
  appliedAt: string;
  status: ApplicationStatus;
}

const APPLICATION_STATUS_CONFIG = {
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
          style={{ backgroundColor: background_color, color: color, border: `1px solid ${border}` }}
        >
          <Icon className="application-card-status-icon"/>
          <p>{label}</p>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;
