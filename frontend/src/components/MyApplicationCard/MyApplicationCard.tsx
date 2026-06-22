import { useEffect, useState } from "react";
import type { IApplication, IForm } from "../../types";
import "./MyApplicationCard.css";
import { APPLICATION_STATUS_CONFIG } from "../ApplicationCard/ApplicationCard";
import LocationIcon from "../../assets/icons/location.svg?react";
import BagIcon from "../../assets/icons/briefcase-bag.svg?react";
import GoIcon from "../../assets/icons/right-arrow.svg?react";
import { formatText } from "../../utils/text";
import { formatDisplayDateTime } from "../../utils/dateFormatter";
import { useNavigate } from "react-router-dom";
interface IProps extends Pick<
  IApplication,
  "_id" | "jobId" | "status" | "createdAt"
> {}

const MyApplicationCard = (props: IProps) => {
  const [job, setJob] = useState<IForm>();
  const config = APPLICATION_STATUS_CONFIG[props.status];
  const label = config.label;
  const Icon = config.icon;
  const background_color = config.background_color;
  const color = config.color;
  const border = config.border;
  const navigate = useNavigate();

  const getJobById = async () => {
    try {
      let url = `http://localhost:5000/jobs/public/jobs/${props.jobId}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        navigate("/not-found", {
          state: { message: "Job not found" },
        });
        return;
      }

      const data = await res.json();

      setJob(data);
    } catch (err) {
      console.error(err);
      navigate("/not-found", {
        state: { message: "Job not found" },
      });
    }
  };

  useEffect(() => {
    getJobById();
  }, [props]);

  return (
    <div className="my-application-card-container">
      <div className="my-application-card-header">
        <div className="my-application-profile-container">
          <div className="my-application-profile">{job?.companyName[0]}</div>
          <div className="my-application-profile-info">
            <h2>{job?.jobTitle}</h2>
            <p>{job?.companyName}</p>
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

      <div className="my-application-job-info">
        {
          <div className="my-application-job-info-item">
            <LocationIcon className="my-application-job-info-icon" />
            <p>
              {job?.location} (
              <span>
                {formatText(job?.workSetting, { capitalizeFirstOnly: true })})
              </span>
            </p>
          </div>
        }
        {
          <div className="my-application-job-info-item">
            <BagIcon className="my-application-job-info-icon" />
            <p>{job?.jobType}</p>
          </div>
        }
      </div>

      <div className="my-application-card-footer">
        <p>
          <span>Applied at </span>
          {formatDisplayDateTime(props.createdAt)}
        </p>
        <div className="my-application-card-actions">
          <button
            className="my-application-card-action"
            onClick={() => {
              navigate(`/applications-details/${props._id}`);
            }}
          >
            View Details
            <GoIcon className="my-application-card-action-icon"/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyApplicationCard;
