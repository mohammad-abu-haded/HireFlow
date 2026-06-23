import { useEffect, useState } from "react";
import { InterviewType, type IApplication, type IInterview } from "../../types";
import "./InterViewCard.css";
import { useNavigate } from "react-router-dom";
import LocationIcon from "../../assets/icons/location.svg?react";
import CameraIcon from "../../assets/icons/camera.svg?react";
import CalenderIcon from "../../assets/icons/calender.svg?react";
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

const InterViewCard = (props: IInterview) => {
  const [application, setApplication] = useState<IApplication | null>(null);
  const [jobTitle, setJobTitle] = useState();
  const navigate = useNavigate();
  const getApplicationById = async (id: string) => {
    const res = await fetch(`http://localhost:5000/applications/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!res.ok) {
      navigate("/not-found", {
        state: { message: "Application not found" },
      });
      return null;
    }

    const data = await res.json();

    return data;
  };

  const getJobTitleById = async (jobId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/jobs/${jobId}/title`, {
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

      return data.jobTitle;
    } catch (err) {
      console.error(err);

      navigate("/not-found", {
        state: { message: "Job not found" },
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getApplicationById(props.applicationId);

      if (data) {
        setApplication(data);
        const title = await getJobTitleById(data?.jobId);
        if (title) {
          setJobTitle(title);
        }
      }
    };

    fetchData();
  }, [props]);

  return (
    <div className="interview-card-container">
      <div className="interview-card-header">
        <div className="interview-card-profile">{application?.fullName[0]}</div>
        <div className="interview-card-applicant-info">
          <h2>{application?.fullName}</h2>
          <p>{jobTitle}</p>
        </div>
      </div>

      <div className={`interview-card-type ${props.type.toLocaleLowerCase()}`}>
        {props.type === InterviewType.ONLINE ? (
          <>
            <CameraIcon className="interview-card-type-icon" />
            <p>Online</p>
          </>
        ) : (
          <>
            <LocationIcon className="interview-card-type-icon" />
            <p>Onsite</p>
          </>
        )}
      </div>

      <div className="interview-card-date">
        <CalenderIcon className="interview-card-date-icon" />
        <p>{formatDisplayDateTime(props.scheduledAt)}</p>
      </div>

      <div className="interview-card-settings-container">
        <div className="interview-card-settings">
          {props.type === InterviewType.ONLINE ? (
            <>
              <h2>Meeting Link</h2>
              <p>{props.meetingLink}</p>
            </>
          ) : (
            <>
              <h2>Location</h2>
              <p>{props.location}</p>
            </>
          )}
        </div>

        <button
          className={`interview-card-settings-action ${props.type.toLocaleLowerCase()}`}
          onClick={() => {
            props.type === InterviewType.ONLINE
              ? props.meetingLink && openLink(props.meetingLink)
              : props.location && searchInGoogle(props.location);
          }}
        >
          {props.type === InterviewType.ONLINE ? (
            <>
              <CameraIcon className="interview-card-settings-action-icon" />
              <p>Join Interview</p>
            </>
          ) : (
            <>
              <LocationIcon className="interview-card-settings-action-icon" />
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

export default InterViewCard;
