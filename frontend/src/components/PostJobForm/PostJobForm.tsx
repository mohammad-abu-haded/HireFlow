import "./PostJobForm.css";
import TitleIcon from "../../assets/icons/title.svg?react";
import DollarIcon from "../../assets/icons/dollar-sign.svg?react";
import ConfigurationIcon from "../../assets/icons/configuration.svg?react";
import DetailsIcon from "../../assets/icons/details.svg?react";
import ContentIcon from "../../assets/icons/content.svg?react";
import NotificationOverlay from "../NotificationOverlay/NotificationOverlay";
import { useContext, useEffect, useRef, useState } from "react";
import DynamicList from "../DynamicList/DynamicList";
import type {
  EmploymentType,
  ExperienceLevel,
  IForm,
  JobType,
  WorkSetting,
} from "../../types";
import { AuthContext } from "../../context/authContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { formatDateTimeLocal } from "../../utils/dateFormatter";
import { initialState } from "../../constants/formInitialState";
const PostJobForm = () => {
  const { email } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const scrollToDate = location.state?.scrollToDate;
  const dateRef = useRef<HTMLInputElement>(null);
  const [highlightDate, setHighlightDate] = useState(false);
  const { id } = useParams();
  const [formData, setFormData] = useState<IForm | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [prevLocation, setPrevLocation] = useState<string>("");

  const [form, setForm] = useState<IForm>(initialState);
  const createJob = async (job: IForm) => {
    const res = await fetch("http://localhost:5000/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(job),
    });

    return await res.json();
  };

  const updateJob = async (id: string, updatedData: IForm) => {
    const res = await fetch(`http://localhost:5000/jobs/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(updatedData),
    });

    return await res.json();
  };
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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (formData) {
      await updateJob(form._id!, form);
      setForm(initialState);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        navigate(location.state?.from || "/");
      }, 3000);
      return;
    }
    const newJob: IForm = {
      ...form,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      email: email,
    };
    await createJob(newJob);
    setForm(initialState);
    localStorage.removeItem("jobForm");
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      navigate("/my-jobs");
    }, 3000);
  };

  const handleCancel = () => {
    setForm(initialState);
  };

  useEffect(() => {
    setPrevLocation(location.pathname);
  }, []);
  useEffect(() => {
    if (formData) {
      setForm({ ...formData });
    } else {
      const storedDataFromLocalStorage = localStorage.getItem("jobForm");
      if (storedDataFromLocalStorage) {
        const parsedData: IForm = JSON.parse(storedDataFromLocalStorage);
        setForm({ ...parsedData });
      }
    }
  }, [formData]);

  useEffect(() => {
    const fetchData = async () => {
      const data: IForm = await getJobById(id!);
      setFormData(data);
    };
    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    localStorage.setItem("jobForm", JSON.stringify(form));
    return () => {
      if (formData) {
        localStorage.removeItem("jobForm");
      }
    };
  }, [form]);

  useEffect(() => {
    if (
      prevLocation.includes("/update-job") &&
      location.pathname === "/post-job"
    ) {
      setForm(initialState);
      setFormData(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (scrollToDate && dateRef.current) {
      dateRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    if (scrollToDate) {
      setHighlightDate(true);

      const timer = setTimeout(() => {
        setHighlightDate(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [scrollToDate]);

  return (
    <div className="post-job-form">
      <div className={isSubmitted ? "success-message" : ""}>
        {isSubmitted && (
          <NotificationOverlay
            message="Job posting submitted successfully! Redirecting..."
            type="success"
          />
        )}
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
                const value = e.target.value as JobType;
                setForm((prev) => ({
                  ...prev,
                  jobType: value,
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
              onChange={(e) => {
                const value = e.target.value as WorkSetting;
                setForm((prev) => ({ ...prev, workSetting: value }));
              }}
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
              onChange={(e) => {
                const value = e.target.value as ExperienceLevel;
                setForm((prev) => ({
                  ...prev,
                  experienceLevel: value,
                }));
              }}
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
                  const value = e.target.value as EmploymentType;
                  setForm((prev) => ({
                    ...prev,
                    employmentType: value,
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
              autoComplete="off"
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
              autoComplete="off"
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
              type="datetime-local"
              ref={dateRef}
              id="application-deadline"
              className={highlightDate ? "date-highlight" : ""}
              value={formatDateTimeLocal(form.applicationDeadline)}
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
            pathname={location.pathname}
          />
          <DynamicList
            state={form.requirements}
            setState={(newVal) =>
              setForm((prev) => ({ ...prev, requirements: newVal }))
            }
            label="Requirements"
            placeholder="Requirement"
            pathname={location.pathname}
          />
          <DynamicList
            state={form.skills}
            setState={(newVal) =>
              setForm((prev) => ({ ...prev, skills: newVal }))
            }
            label="Skills"
            placeholder="Skill"
            pathname={location.pathname}
          />
          <DynamicList
            state={form.benefits}
            setState={(newVal) =>
              setForm((prev) => ({ ...prev, benefits: newVal }))
            }
            label="Benefits"
            placeholder="Benefits"
            pathname={location.pathname}
          />
        </div>
        <div className="form-actions">
          {location.pathname.includes("/update-job") && (
            <button
              type="button"
              className="cancel-publish-job-posting"
              onClick={() => navigate(location.state?.from || "/")}
            >
              Back
            </button>
          )}
          <button
            type="button"
            className="cancel-publish-job-posting"
            onClick={handleCancel}
          >
            Clear
          </button>
          <input
            type="submit"
            value={
              location.pathname.includes("/update-job")
                ? "Update Job Posting"
                : "Publish Job Posting"
            }
            id="publish-job-posting"
          />
        </div>
      </form>
    </div>
  );
};

export default PostJobForm;
