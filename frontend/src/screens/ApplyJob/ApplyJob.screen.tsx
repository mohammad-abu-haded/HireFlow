import { useNavigate, useParams } from "react-router-dom";
import type { IForm } from "../../types";
import "./ApplyJob.css";
import { useEffect, useState } from "react";
import { initialState } from "../../constants/formInitialState";
import { formatText } from "../../utils/text";
import ApplyJobForm from "../../components/ApplyJobForm/ApplyJobForm";

const ApplyJob = () => {
  const navigate = useNavigate();
  const [job, setJob] = useState<IForm>(initialState);
  const { id } = useParams();
  const getJobById = async (id: string) => {
    const res = await fetch(`http://localhost:5000/jobs/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (!res.ok) {
      navigate("/not-found", {
        state: { message: "Job not found" },
      });
    }
    const data = await res.json();

    return data;
  };
  useEffect(() => {
    const fetchData = async () => {
      const data: IForm = await getJobById(id!);
      setJob(data);
    };

    fetchData();
  }, [id]);

  const renderJobTypeInfo = (): string => {
    const showDuration =
      ["contract", "internship"].includes(job.jobType) ||
      job.employmentType === "temporary";

    return `${job.jobType} • ${
      showDuration ? job.duration || "" : "Permanent"
    }`;
  };

  return (
    <div className="apply-job-container">
      <div className="apply-job-header">
        <p className="apply-job-title">
          {formatText("Applying for", { uppercase: true })}
        </p>
        <div className="apply-job-title-info">
          <h2>{job.jobTitle}</h2>
          <div className="apply-job-type-info">
            <p>{formatText(renderJobTypeInfo(), { capitalizeWords: true })}</p>
          </div>
        </div>
        <p className="apply-job-company-location">
          {formatText(
            `${job.companyName} | ${job.location} (${job.workSetting})`,
            { capitalizeWords: true },
          )}
        </p>
      </div>
      <div className="apply-job-instructions">
        <h2>Apply for this position</h2>
        <p>
          Please complete the form below to submit your application. Fields
          marked with an asterisk (*) are required.
        </p>
      </div>

      <ApplyJobForm />
    </div>
  );
};

export default ApplyJob;
