import { useNavigate, useParams } from "react-router-dom";
import "./ApplicationDetails.css";
import { useEffect, useState } from "react";
import type { IApplication } from "../../types";

const ApplicationDetailsScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [jobTitle, setJobTitle] = useState();
  const [application, setApplication] = useState<IApplication | null>(null);

  const getApplicationById = async (id: string) => {
    const res = await fetch(`http://localhost:5000/applications/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log("a");
    
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
      <div className="application-details-header">
        <h2>Application Details</h2>
        <p>{jobTitle} Application</p>
      </div>
    </div>
  );
};

export default ApplicationDetailsScreen;
