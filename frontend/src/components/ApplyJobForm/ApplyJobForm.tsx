import "./ApplyJobForm.css";
import PersonalIcon from "../../assets/icons/persons.svg?react";
import DocumentIcon from "../../assets/icons/document.svg?react";
import UploadIcon from "../../assets/icons/upload.svg?react";
import CoverIcon from "../../assets/icons/document-general-letter.svg?react";
import FileUpload from "../FileUpload/FileUpload";
import { useState } from "react";
import { useParams } from "react-router-dom";
import NotificationOverlay from "../NotificationOverlay/NotificationOverlay";
import type { NotificationType } from "../../types";
const ApplyJobForm = () => {
  const [resume, setResume] = useState<File | null>(null);
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<NotificationType>("success");
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const form = e.currentTarget;

    const formData = new FormData();

    formData.append("jobId", id!);

    formData.append(
      "fullName",
      (form.elements.namedItem("fullName") as HTMLInputElement).value,
    );

    formData.append(
      "email",
      (form.elements.namedItem("email") as HTMLInputElement).value,
    );

    formData.append(
      "phoneNumber",
      (form.elements.namedItem("phoneNumber") as HTMLInputElement).value,
    );

    formData.append(
      "linkedinProfile",
      (form.elements.namedItem("linkedinProfile") as HTMLInputElement).value,
    );

    formData.append(
      "coverLetter",
      (form.elements.namedItem("coverLetter") as HTMLTextAreaElement).value,
    );

    if (resume) {
      formData.append("resume", resume);
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/applications/apply", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      console.log(data);

      if (data.success) {
        form.reset();
        setResume(null);

        let seconds = 3;
        setMessage(
          `Application submitted successfully! Closing in ${seconds}s`,
        );
        setMessageType("success");

        const interval = setInterval(() => {
          seconds--;

          if (seconds > 0) {
            setMessage(
              `Application submitted successfully! Closing in ${seconds}s`,
            );
          } else {
            clearInterval(interval);
            setMessage("");
          }
        }, 1000);
      }
    } catch (err) {
      setMessage("Failed to submit application.");
      setMessageType("error");
      console.error(err);
    }
  };
  return (
    <div className="apply-job-form-container">
        <form onSubmit={handleSubmit}>
          <div className="apply-job-form-content">
            <div className="fieldset-apply-job-form-container">
              <div className="apply-job-form-section-heading">
                <div className="fieldset-icon-container">
                  <PersonalIcon className="fieldset-icon" />
                </div>
                <h2>Personal Information</h2>
              </div>

              <div className="input-apply-job-form-container">
                <div className="input-apply-job-form-group">
                  <div className="apply-job-form-group">
                    <label htmlFor="fullName">
                      Full Name <span>&nbsp;*</span>
                    </label>
                    <input
                      placeholder="John Doe"
                      type="text"
                      id="fullName"
                      name="fullName"
                      required
                    />
                  </div>
                  <div className="apply-job-form-group">
                    <label htmlFor="email">
                      Email Address <span>&nbsp;*</span>
                    </label>
                    <input
                      placeholder="john@example.com"
                      type="email"
                      autoComplete="email"
                      id="email"
                      name="email"
                      required
                    />
                  </div>
                </div>
                <div className="input-apply-job-form-group">
                  <div className="apply-job-form-group">
                    <label htmlFor="phoneNumber">
                      Phone Number <span>&nbsp;*</span>
                    </label>
                    <input
                      placeholder="123-456-7890"
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      required
                    />
                  </div>
                  <div className="apply-job-form-group">
                    <label htmlFor="linkedinProfile">LinkedIn Profile</label>
                    <input
                      placeholder="linkedin.com/in/username"
                      type="url"
                      autoComplete="url"
                      id="linkedinProfile"
                      name="linkedinProfile"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="fieldset-apply-job-form-container">
              <div className="apply-job-form-section-heading">
                <div className="fieldset-icon-container">
                  <DocumentIcon className="fieldset-icon" />
                </div>
                <h2>Professional Documents</h2>
              </div>

              <div className="apply-job-form-group">
                <div className="apply-job-form-group-label">Resume / CV</div>
                <FileUpload
                  accept=".pdf,.doc,.docx"
                  helperText="Upload your resume or CV (PDF, DOC, DOCX)"
                  uploadIcon={UploadIcon}
                  onFileChange={setResume}
                  value={resume}
                />
              </div>
            </div>

            <div className="fieldset-apply-job-form-container">
              <div className="apply-job-form-section-heading">
                <div className="fieldset-icon-container">
                  <CoverIcon className="fieldset-icon" />
                </div>
                <h2>Cover Letter</h2>
              </div>

              <div className="apply-job-form-group">
                <div className="apply-job-form-group-label">
                  Why are you a great fit for this role?
                </div>
                <textarea
                  placeholder="Tell us about your experience and motivation..."
                  id="coverLetter"
                  name="coverLetter"
                  rows={6}
                />
              </div>

              <input
                type="submit"
                value="Submit Application"
                className="submit-apply-job-form-button"
              />
            </div>
          </div>
        </form>
        {
          message !== "" &&
          (
            <NotificationOverlay message={message} type={messageType} />
          )
        }
    </div>
  );
};

export default ApplyJobForm;
