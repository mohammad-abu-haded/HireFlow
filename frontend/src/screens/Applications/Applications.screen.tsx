import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { IApplication } from "../../types";

const ApplicationsScreen = () => {
  const { id } = useParams();

  const [applications, setApplications] = useState<IApplication[]>([]);
  const [application, setApplication] = useState<IApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const token = localStorage.getItem("token");

        if (id) {
          // 🔹 single application
          console.log(id);
          
          const res = await fetch(
            `http://localhost:5000/applications/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await res.json();
          setApplication(data);
        } else {
          // 🔹 all applications
          const res = await fetch(
            `http://localhost:5000/applications`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data = await res.json();
          setApplications(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: "20px" }}>
      {/* ================= SINGLE ================= */}
      {id && application && (
        <div>
          <h2>{application.fullName}</h2>
          <p>{application.email}</p>
          <p>{application.phone}</p>
          <p>Status: {application.status}</p>
          <p>{application.coverLetter}</p>
        </div>
      )}

      {/* ================= LIST ================= */}
      {!id && (
        <div>
          <h2>All Applications</h2>

          {applications.map((app) => (
            <div
              key={app._id}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <h3>{app.fullName}</h3>
              <p>{app.email}</p>
              <p>Status: {app.status}</p>

              <a href={`/applications/${app._id}`}>
                View Details
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationsScreen;