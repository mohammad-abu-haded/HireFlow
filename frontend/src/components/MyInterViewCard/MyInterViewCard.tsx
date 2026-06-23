import { useEffect, useState } from "react";
import { InterviewType, type IForm, type IInterview } from "../../types";
import "./MyInterViewCard.css";
import { useNavigate } from "react-router-dom";
import CalenderIcon from "../../assets/icons/calender.svg?react";
import CameraIcon from "../../assets/icons/camera.svg?react";
import LocationIcon from "../../assets/icons/location.svg?react";
import LinkIcon from "../../assets/icons/external-link.svg?react";
import { formatDisplayDateTime } from "../../utils/dateFormatter";
const searchInGoogle = (text: string) => {
  if (!text.trim()) return;

  const query = encodeURIComponent(text);
  window.open(`https://www.google.com/search?q=${query}`, "_blank");
};

const openLink = (link: string) => {
  if (!link) return;

  const formattedLink = link.startsWith("http") ? link : `https://${link}`;

  window.open(formattedLink, "_blank", "noopener,noreferrer");
};

const MyInterViewCard = (props: IInterview) => {
  const [job, setJob] = useState<IForm>();
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
    <div className="my-interview-card-container">
      <div className="my-interview-card-header">
        <div className="my-interview-card-profile">{job?.companyName[0]}</div>
        <div className="my-interview-card-type-container">
          <div
            className={`my-interview-card-type ${props.type.toLocaleLowerCase()}`}
          >
            {props.type}
          </div>
        </div>
        <div className="my-interview-card-job-info">
          <h2>{job?.jobTitle}</h2>
          <p>{job?.companyName}</p>
        </div>
      </div>
      <div className="my-interview-card-divider" />
      <div className="my-interview-card-info">
        <CalenderIcon className="my-interview-card-icon" />
        <p>{formatDisplayDateTime(props.scheduledAt)}</p>
      </div>
      <div className="my-interview-card-divider" />
      <div className="my-interview-card-settings-container">
        <div className="my-interview-card-setting-view">
          {props.type === InterviewType.ONLINE ? (
            <>
              <CameraIcon className="my-interview-card-setting-icon" />
              <p>{props.meetingLink}</p>
            </>
          ) : (
            <>
              <LocationIcon className="my-interview-card-setting-icon" />
              <p>{props.location}</p>
            </>
          )}
        </div>

        <button
          className={`my-interview-card-setting-action ${props.type.toLocaleLowerCase()}`}
          onClick={() => {
            props.type === InterviewType.ONLINE
              ? props.meetingLink && openLink(props.meetingLink)
              : props.location && searchInGoogle(props.location);
          }}
        >
          {props.type === InterviewType.ONLINE ? (
            <>
              <LinkIcon className="my-interview-card-setting-action-icon" />
              <p>Join Interview</p>
            </>
          ) : (
            <>
              <LocationIcon className="my-interview-card-setting-action-icon" />
              <p>View Location</p>
            </>
          )}
        </button>
      </div>
      <div className="my-interview-card-divider" />
      <div className="my-interview-card-actions">
        <div
          className="my-interview-card-action"
          onClick={() => {
            navigate(`/job-details/${props.jobId}`);
          }}
        >
          Job Details
        </div>
        <div
          className="my-interview-card-action"
          onClick={() => {
            navigate(`/applications-details/${props.applicationId}`);
          }}
        >
          Application Details
        </div>
      </div>
    </div>
  );
};

export default MyInterViewCard;
