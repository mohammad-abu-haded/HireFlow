import { useContext, useEffect, useState } from "react";
import LocationIcon from "../../assets/icons/location.svg?react";
import "./JobDetails.css";
import EditIcon from "../../assets/icons/edit.svg?react";
import OpenIcon from "../../assets/icons/open.svg?react";
import CloseIcon from "../../assets/icons/close.svg?react";
import ClockPlusIcon from "../../assets/icons/clock-plus.svg?react";
import UserIcon from "../../assets/icons/persons.svg?react";
import EyeIcon from "../../assets/icons/eye.svg?react";
import ClockIcon from "../../assets/icons/clock.svg?react";
import RightIcon from "../../assets/icons/right-arrow.svg?react";
import CorrectIcon from "../../assets/icons/correct.svg?react";
import type { IForm } from "../../types";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import StatCard from "../../components/StatCard/StatCard ";
import { getDaysAgo } from "../../utils/getDaysAgo";
import JobDetailSection from "../../components/JobDetailSection/JobDetailSection";
import JobBenefitsCard from "../../components/JobBenefitsCard/JobBenefitsCard";
import DeleteIcon from "../../assets/icons/trash.svg?react";
import JobOverviewCard from "../../components/JobOverviewCard/JobOverviewCard";
import { formatSalary } from "../../utils/formatSalary";
import { formatText } from "../../utils/text";

const JobDetails = () => {
  const deleteJob = async () => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/jobs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        navigate("/my-jobs", {
          state: {
            message: "Job deleted successfully",
          },
        });
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const [job, setJob] = useState<IForm>();
  const [buttonLabel, setButtonLabel] = useState("");
  const [buttonIcon, setButtonIcon] = useState<React.ReactNode>(null);
  const [totalApplications, setTotalApplications] = useState(0);
  const [isOwner, setIsOwner] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const checkIsOwner = async (jobId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/jobs/${jobId}/ownership`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        setIsOwner(false);
        return false;
      }

      const data = await res.json();
      setIsOwner(data.isOwner);

      return data.isOwner;
    } catch (err) {
      console.error("Error checking ownership:", err);
      setIsOwner(false);
      return false;
    }
  };

  const getJobById = async (id: string, isOwner?: boolean) => {
    try {
      let url = "";

      if (isOwner) {
        url = `http://localhost:5000/jobs/${id}`;
      } else {
        url = `http://localhost:5000/jobs/public/jobs/${id}`;
      }

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

      setTotalApplications(data.applicationsCount || 0);

      return data;
    } catch (err) {
      console.error(err);
      navigate("/not-found", {
        state: { message: "Job not found" },
      });
    }
  };

  const updateButtonData = (status: IForm["status"]) => {
    if (status === "ACTIVE") {
      setButtonLabel("Close Job");
      setButtonIcon(<CloseIcon className="close-open-icon-job-details" />);
    } else if (status === "CLOSED") {
      setButtonLabel("Open Job");
      setButtonIcon(<OpenIcon className="close-open-icon-job-details" />);
    } else {
      setButtonLabel("Extend Deadline");
      setButtonIcon(<ClockPlusIcon className="close-open-icon-job-details" />);
    }
  };
  const updateStatus = async (status: IForm["status"]) => {
    const response = await fetch(`http://localhost:5000/jobs/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    if (data.success) {
      const data: IForm = await getJobById(id!, isOwner);
      setJob(data);
      updateButtonData(data.status);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      const isOwnerResult = await checkIsOwner(id);
      setIsOwner(isOwnerResult);

      const data: IForm = await getJobById(id, isOwnerResult);

      setJob(data);
      updateButtonData(data.status);
    };

    loadData();
  }, [id]);

  const DASHBOARD_STATS = [
    {
      title: "Total Applicants",
      value: totalApplications,
      icon: UserIcon,
    },
    {
      title: "Days Active",
      value: getDaysAgo(job?.createdAt),
      icon: ClockIcon,
    },
    {
      title: "Profile Views",
      value: job?.profileViews || 0,
      subtitle: "",
      icon: EyeIcon,
    },
  ];

  return (
    <div className="job-details-main">
      <div className="header-job-details">
        <div className="job-details-meta">
          <h2 className="job-details-title">{job?.jobTitle}</h2>
          <div className="company-location-details">
            <p>{job?.companyName} •</p>
            <div className="location-details">
              <LocationIcon className="location-icon-details" />
              <p>{job?.location}&nbsp;</p>
              {["remote", "hybrid"].some((setting) =>
                job?.workSetting?.includes(setting),
              ) ? (
                <p>({formatText(job?.workSetting, { capitalizeWords: true })})</p>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
        {isOwner ? (
          <div className="job-details-actions">
            <div className="status-job-details">{job?.status}</div>
            <button
              className="edit-button-job-details"
              title="Edit Job"
              onClick={() =>
                navigate(`/update-job/${job?._id}`, {
                  state: { from: location.pathname },
                })
              }
            >
              <EditIcon className="edit-icon-job-details" />
              <p>Edit Job</p>
            </button>
            <button
              className="delete-button"
              title="Delete Job"
              onClick={() => deleteJob()}
            >
              <DeleteIcon className="delete-icon-myJobCard" />
              <p>Delete</p>
            </button>
            <button
              className="close-open-button-job-details"
              title={buttonLabel}
              onClick={() => {
                if (job?.status === "ACTIVE") {
                  updateStatus("CLOSED");
                } else if (job?.status === "CLOSED") {
                  updateStatus("ACTIVE");
                } else if (job?.status === "EXPIRED") {
                  navigate(`/update-job/${job?._id}`, {
                    state: { from: location.pathname, scrollToDate: true },
                  });
                }
              }}
            >
              {buttonIcon}
              <p>{buttonLabel}</p>
            </button>
          </div>
        ) : (
          <div className="job-details-actions">
            <button
              className="job-details-action-apply"
              onClick={() => {
                navigate(`/apply-job/${id}`);
              }}
            >
              Apply Now
            </button>
          </div>
        )}
      </div>
      {isOwner && (
        <div className="my-jobs-stats">
          {DASHBOARD_STATS.map((stat) => (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
            />
          ))}
        </div>
      )}
      <div className="job-details-body">
        <div className="job-details-content">
          <JobDetailSection
            title="Job Description"
            type="DESCRIPTION"
            content={job?.jobDescription}
          />
          <JobDetailSection
            title="Key Responsibilities"
            type="KEY_RESPONSIBILITIES"
            list={job?.keyResponsibilities}
            Icon={CorrectIcon}
          />
          <JobDetailSection
            title="Requirements"
            type="REQUIREMENTS"
            list={job?.requirements}
            Icon={RightIcon}
          />
          <JobDetailSection title="Skills" type="SKILLS" list={job?.skills} />
        </div>
        <div className="job-details-overview">
          <JobOverviewCard
            jobType={job?.jobType || ""}
            salaryRange={formatSalary(
              job?.salaryMin || "0",
              job?.salaryMax || "0",
            )}
            workSetting={job?.workSetting || ""}
            experienceLevel={job?.experienceLevel || ""}
            deadline={job?.applicationDeadline || ""}
            employmentType={job?.employmentType || ""}
            duration={job?.duration || ""}
            durationUnit={job?.durationUnit || ""}
          />
          {job?.benefits && job?.benefits.length > 0 && <JobBenefitsCard benefits={job?.benefits || []} />}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
