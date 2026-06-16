import { useEffect, useState } from "react";
import type { IApplication } from "../../types";
import ApplicationCard from "../../components/ApplicationCard/ApplicationCard";
import "./Applications.screen.css";
const ApplicationsScreen = () => {
  // const getApplicationById = async (id: string) => {
  //   const res = await fetch(`http://localhost:5000/applications/${id}`, {
  //     headers: {
  //       Authorization: `Bearer ${localStorage.getItem("token")}`,
  //     },
  //   });

  //   if (!res.ok) {
  //     navigate("/not-found", {
  //       state: { message: "Application not found" },
  //     });
  //     return null;
  //   }

  //   const data = await res.json();

  //   return data;
  // };
  // useEffect(() => {
  //   const fetchData = async () => {
  //     const data = await getApplicationById(id!);

  //     if (data) {
  //       setApplication(data);
  //     }

  //     setLoading(false);
  //   };

  //   fetchData();
  // }, [id]);
  // const [application, setApplication] = useState<IApplication | null>(null);

  const [applications, setApplications] = useState<IApplication[]>([]);

  const getApplications = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:5000/applications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch applications");
      }

      return await res.json();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getApplications();

      if (data) {
        setApplications(data);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="application-cards-container">
      {applications.map((application, index) => (
        <ApplicationCard
          key={index}
          _id={application?._id}
          appliedAt={application?.appliedAt}
          email={application?.email}
          fullName={application?.fullName}
          status={application?.status}
        />
      ))}
    </div>
  );
};

export default ApplicationsScreen;
