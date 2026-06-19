import type { IApplication } from "../../types";
import "./ApplicantInfoCard.css";
import LocationIcon from "../../assets/icons/location.svg?react";
import BagIcon from "../../assets/icons/briefcase-bag.svg?react";
import DateIcon from "../../assets/icons/calender.svg?react";
import EditIcon from "../../assets/icons/edit.svg?react";
import DucIcon from "../../assets/icons/document.svg?react";
import { APPLICATION_STATUS_CONFIG } from "../ApplicationCard/ApplicationCard";
import { formatDisplayDateTime } from "../../utils/dateFormatter";
export interface IProps extends Pick<
  IApplication,
  | "_id"
  | "fullName"
  | "email"
  | "location"
  | "phone"
  | "linkedIn"
  | "github"
  | "coverLetter"
  | "createdAt"
  | "status"
  | "cvFile"
> {
  jobTitle: string;
}

const openCV = async (id: string) => {
  const res = await fetch(
    `http://localhost:5000/applications/applications/${id}/cv`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    },
  );

  if (!res.ok) return;

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  console.log(url);

  window.open(url);
};
const ApplicantInfoCard = (props: IProps) => {
  const config = APPLICATION_STATUS_CONFIG[props.status];
  const label = config.label;
  const Icon = config.icon;
  const background_color = config.background_color;
  const color = config.color;
  const border = config.border;
  return (
    <div className="applicant-card">
      <div className="applicant-card-info-container">
        <div className="applicant-card-profile">
          {props.fullName[0].toLocaleUpperCase()}
        </div>

        <div className="applicant-card-info">
          <div className="applicant-card-name-status">
            <div className="applicant-card-name">{props.fullName}</div>
            <div
              className="applicant-card-status"
              style={{
                backgroundColor: background_color,
                color: color,
                border: `1px solid ${border}`,
              }}
            >
              <Icon className="applicant-card-status-icon" />
              <p>{label}</p>
            </div>
          </div>
          <div className="applicant-card-items">
            <div className="applicant-card-item">
              <BagIcon className="applicant-card-icon" />
              {props.jobTitle}
            </div>
            <div className="applicant-card-item">
              <LocationIcon className="applicant-card-icon" />
              {props.location}
            </div>
            <div className="applicant-card-item">
              <DateIcon className="applicant-card-icon" />
              {formatDisplayDateTime(props.createdAt)}
            </div>
          </div>
        </div>
      </div>
      <div className="applicant-card-actions">
        <button className="applicant-card-action applicant-card-action-update-status">
          <EditIcon className="applicant-card-action-icon" />
          Update Status
        </button>
        <button
          className="applicant-card-action applicant-card-action-open-cv"
          onClick={() => openCV(props._id)}
          disabled={props?.cvFile ? false : true}
        >
          <DucIcon className="applicant-card-action-icon" />
          {props?.cvFile ? "View Resume" : "No CV uploaded"}
        </button>
      </div>
    </div>
  );
};

export default ApplicantInfoCard;
