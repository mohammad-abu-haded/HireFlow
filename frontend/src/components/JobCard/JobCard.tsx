import type { JobCardProps } from "../../types";
import LocationIcon from '../../assets/icons/location.svg?react'
import "./JobCard.css";

const JobCard = (props: JobCardProps) => {
  return (
    <div className="job-card-container">
      <div className="job-card-header">
        <div className="job-card-profile">
          {props.companyName[0]}
        </div>

        <div className="job-card-info">
          <div className="job-card-title">
            {props.jobTitle}
          </div>
          <div className="job-card-work-settings">
            <div className="job-card-company">
              {props.companyName}
            </div>

            <div className="job-card-location">
              <p>•</p>
              <LocationIcon className="job-card-location-icon" />
              <p>{props.location} ({props.workSetting})</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
// formatSalary(props.salaryMin, props.salaryMax)