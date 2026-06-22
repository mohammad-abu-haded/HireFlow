import { useNavigate, useParams } from "react-router-dom";
import "./ApplicationDetails.css";
import { useEffect, useState } from "react";
import type { IApplication } from "../../types";
import ApplicantInfoCard from "../../components/ApplicantInfoCard/ApplicantInfoCard";
import CoverLetter from "../../components/CoverLetter/CoverLetter";
import EmailIcon from "../../assets/icons/email-verify.svg?react";
import PhoneIcon from "../../assets/icons/phone.svg?react";
import LinkedInIcon from "../../assets/icons/linkedin.svg?react";
import GithubIcon from "../../assets/icons/github.svg?react";
import ContactDetails from "../../components/ContactDetails/ContactDetails";

interface ContactConfig {
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  label: string;
  item: string;
  isLink?: boolean;
}

const ApplicationDetailsScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [jobTitle, setJobTitle] = useState();
  const [application, setApplication] = useState<IApplication | null>(null);
  const [CONTACT_CONFIG, setCONTACT_CONFIG] = useState<ContactConfig[]>([]);

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
      const data = await getApplicationById(id!);
      
      if (data) {
        setApplication(data);
        const contact_config: ContactConfig[] = [
          {
            icon: EmailIcon,
            label: "EMAIL ADDRESS",
            item: data?.email || "",
          },
          {
            icon: PhoneIcon,
            label: "PHONE NUMBER",
            item: data?.phone || "",
          },
          {
            icon: LinkedInIcon,
            label: "LINKEDIN ",
            item: data?.linkedIn || "",
            isLink: true,
          },
          {
            icon: GithubIcon,
            label: "GITHUB",
            item: data?.github || "",
            isLink: true,
          },
        ];
        setCONTACT_CONFIG(contact_config);
        const title = await getJobTitleById(data?.jobId);
        if (title) {
          setJobTitle(title);
        }
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="application-details-main">
      {application && (
        <div className="application-details-main">
          <ApplicantInfoCard {...application} jobTitle={jobTitle || ""} />
          <div className="application-details-items">
            <div className="application-details-cover-letter">
              <CoverLetter CoverLetter={application.coverLetter} />
            </div>
            <div className="application-details-contact">
              <ContactDetails contacts={CONTACT_CONFIG}/>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetailsScreen;
