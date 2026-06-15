import type { JobCardProps } from "../../types";
import LocationIcon from "../../assets/icons/location.svg?react";
import SalaryIcon from "../../assets/icons/dollar-sign.svg?react";
import ClockIcon from "../../assets/icons/clock.svg?react";
import "./JobCard.css";
import { formatText } from "../../utils/text";
import { formatSalary } from "../../utils/formatSalary";
import { getTimeAgo } from "../../utils/formatTimeAgo";
import { useNavigate } from "react-router-dom";

const JobCard = (props: JobCardProps) => {  
  const navigate = useNavigate();
  return (
    <div className="job-card-container">
      <div className="job-card-header">
        <div className="job-card-profile">{props.companyName[0]}</div>

        <div className="job-card-info">
          <div className="job-card-title">{props.jobTitle}</div>
          <div className="job-card-work-settings">
            <div className="job-card-company">{props.companyName}</div>

            <div className="job-card-location">
              <p>•</p>
              <LocationIcon className="job-card-location-icon" />
              <p>
                {props.location} (
                {formatText(props.workSetting, { capitalizeWords: true })})
              </p>
            </div>
            <div className="job-card-type">
              {formatText(props.jobType, {
                replaceSeparators: true,
                capitalizeWords: true,
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="job-card-meta">
        <div className="job-card-salary">
          <SalaryIcon className="job-card-salary-icon" />
          {formatSalary(props.salaryMin, props.salaryMax)}
        </div>

        <div className="job-card-date">
          <ClockIcon className="job-card-date-icon" />
          {getTimeAgo(props.createdAt)}
        </div>
      </div>

      <div className="job-card-actions">
        <button
          className="job-card-action job-card-action-apply"
          onClick={() => {navigate(`/apply-job/${props._id}`)}}
        >
          Apply Now
        </button>
        <button
          className="job-card-action job-card-action-view"
          onClick={() => navigate(`/job-details/${props._id}`)}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default JobCard;
