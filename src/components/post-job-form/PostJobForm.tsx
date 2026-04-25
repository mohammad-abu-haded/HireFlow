import "./PostJobForm.css";
import TitleIcon from "../../assets/icons/title.svg?react";
import DollarIcon from "../../assets/icons/dollar-sign.svg?react";
import ConfigurationIcon from "../../assets/icons/configuration.svg?react";
import DetailsIcon from "../../assets/icons/details.svg?react";
import ContentIcon from "../../assets/icons/content.svg?react";
import DoneIcon from "../../assets/icons/done.svg?react";
import { useEffect, useState } from "react";
import DynamicList from "../DynamicList/DynamicList";
const PostJobForm = () => {
  interface IForm {
    jobTitle: string;
    companyName: string;
    location: string;
    jobType: string;
    workSetting: string;
    experienceLevel: string;
    employmentType: string;
    duration: string;
    salaryMin: string;
    salaryMax: string;
    applicationDeadline: string;
    jobDescription: string;
    requirements: string[];
    skills: string[];
    benefits: string[];
    keyResponsibilities: string[];
  }
  const initialState = {
    jobTitle: "",
    companyName: "",
    location: "",
    jobType: "",
    workSetting: "",
    experienceLevel: "",
    employmentType: "",
    duration: "",
    salaryMin: "",
    salaryMax: "",
    applicationDeadline: "",
    jobDescription: "",
    requirements: [],
    skills: [],
    benefits: [],
    keyResponsibilities: [],
  };
  const [form, setForm] = useState<IForm>(() => {
    const storedData = localStorage.getItem("jobForm");
    if (!storedData) return initialState;
    try {
      return JSON.parse(storedData);
    } catch {
      localStorage.removeItem("jobForm");
      return initialState;
    }
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const handleSubmit = (e: any) => {
    e.preventDefault();

    const oldJobs = JSON.parse(localStorage.getItem("myJobs") || "[]");

    const newJob = {
      id: Date.now(),
      ...form,
    };

    localStorage.setItem("myJobs", JSON.stringify([...oldJobs, newJob]));

    setForm(initialState);
    localStorage.removeItem("jobForm");
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
    }, 3000);
  };

  const handleCancel = () => {
    setForm(initialState);
  };

  useEffect(() => {
    localStorage.setItem("jobForm", JSON.stringify(form));
  }, [form]);
  return (
    <div className="post-job-form">
      <div className={isSubmitted ? "success-message" : ""}>
        {isSubmitted && <DoneIcon />}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="section-header">
          <TitleIcon className="form-icon" />
          <p>Job Basics</p>
        </div>
        <div className="job-basics form-section">
          <div className="form-group job-title">
            <label htmlFor="job-title">Job Title</label>
            <input
              type="text"
              id="job-title"
              placeholder="e.g. Senior Frontend Developer"
              value={form.jobTitle}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, jobTitle: e.target.value }))
              }
              required
            />
          </div>
          <div className="form-group company-name">
            <label htmlFor="company-name">Company Name</label>
            <input
              type="text"
              id="company-name"
              placeholder="e.g. Acme Corp"
              value={form.companyName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, companyName: e.target.value }))
              }
              required
            />
          </div>
          <div className="form-group location">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              placeholder="e.g. San Francisco"
              value={form.location}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, location: e.target.value }))
              }
              required
            />
          </div>
        </div>
        <div className="section-header">
          <ConfigurationIcon className="form-icon" />
          <p>Job Configuration</p>
        </div>
        <div className="configuration form-section">
          <div className="form-group job-type">
            <label htmlFor="job-type">Job Type</label>
            <select
              id="job-type"
              value={form.jobType}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  jobType: e.target.value,
                  employmentType: "",
                  duration: "",
                  workSetting: "",
                  experienceLevel: "",
                }));
              }}
              required
            >
              <option value="" disabled hidden>
                Job type
              </option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="work-setting">Work Setting</label>
            <select
              id="work-setting"
              value={form.workSetting}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, workSetting: e.target.value }))
              }
              required
            >
              <option value="" disabled hidden>
                Work setting
              </option>
              <option value="on-site">On-site</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="experience-level">Experience Level</label>
            <select
              id="experience-level"
              value={form.experienceLevel}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  experienceLevel: e.target.value,
                }))
              }
              required
            >
              <option value="" disabled hidden>
                Experience level
              </option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
            </select>
          </div>
          {["full-time", "part-time"].includes(form.jobType) && (
            <div className="form-group">
              <label htmlFor="employment-type">Employment Type</label>
              <select
                id="employment-type"
                value={form.employmentType}
                onChange={(e) => {
                  setForm((prev) => ({
                    ...prev,
                    employmentType: e.target.value,
                    duration: "",
                  }));
                }}
                required
              >
                <option value="" disabled hidden>
                  Employment type
                </option>
                <option value="permanent">Permanent</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>
          )}
          {(form.employmentType === "temporary" ||
            ["contract", "internship"].includes(form.jobType)) && (
            <div className="form-group">
              <label htmlFor="duration">Duration</label>
              <input
                type="text"
                placeholder="e.g. 6 months"
                value={form.duration}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, duration: e.target.value }))
                }
                id="duration"
                required
              />
            </div>
          )}
        </div>
        <div className="section-header">
          <DollarIcon className="form-icon" />
          <p>Compensation</p>
        </div>
        <div className="compensation form-section">
          <div className="form-group salary-min">
            <label htmlFor="salary-min">Minimum Salary (USD)</label>
            <input
              type="number"
              id="salary-min"
              value={form.salaryMin}
              placeholder="e.g. 60000"
              onChange={(e) =>
                setForm((prev) => ({ ...prev, salaryMin: e.target.value }))
              }
              min={0}
              required
            />
          </div>
          <div className="form-group salary-max">
            <label htmlFor="salary-max">Maximum Salary (USD)</label>
            <input
              type="number"
              id="salary-max"
              value={form.salaryMax}
              placeholder="e.g. 120000"
              onChange={(e) =>
                setForm((prev) => ({ ...prev, salaryMax: e.target.value }))
              }
              min={Number(form.salaryMin) || 0}
              required
            />
          </div>
        </div>
        <div className="section-header">
          <DetailsIcon className="form-icon" />
          <p>Application Details</p>
        </div>
        <div className="application-details form-section">
          <div className="form-group">
            <label htmlFor="application-deadline">Application Deadline</label>
            <input
              type="date"
              id="application-deadline"
              value={form.applicationDeadline}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  applicationDeadline: e.target.value,
                }))
              }
              required
            />
          </div>
        </div>
        <div className="section-header">
          <ContentIcon className="form-icon" />
          <p>Job Content</p>
        </div>
        <div className="job-content form-section">
          <div className="form-group">
            <label htmlFor="job-description">Job Description</label>
            <textarea
              id="job-description"
              placeholder="Provide a clear overview of the role, the team, and what the candidate will be working on."
              value={form.jobDescription}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, jobDescription: e.target.value }))
              }
            />
          </div>
          <DynamicList
            state={form.keyResponsibilities}
            setState={(newVal) =>
              setForm((prev) => ({ ...prev, keyResponsibilities: newVal }))
            }
            label="Key Responsibilities"
            placeholder="Responsibility"
          />
          <DynamicList
            state={form.requirements}
            setState={(newVal) =>
              setForm((prev) => ({ ...prev, requirements: newVal }))
            }
            label="Requirements"
            placeholder="Requirement"
          />
          <DynamicList
            state={form.skills}
            setState={(newVal) =>
              setForm((prev) => ({ ...prev, skills: newVal }))
            }
            label="Skills"
            placeholder="Skill"
          />
          <DynamicList
            state={form.benefits}
            setState={(newVal) =>
              setForm((prev) => ({ ...prev, benefits: newVal }))
            }
            label="Benefits"
            placeholder="Benefits"
          />
        </div>
        <div className="form-actions">
          <button
            type="button"
            className="cancel-publish-job-posting"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <input
            type="submit"
            value="Publish Job Posting"
            id="publish-job-posting"
          />
        </div>
      </form>
    </div>
  );
};

export default PostJobForm;
