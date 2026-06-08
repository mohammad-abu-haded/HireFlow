import "./PostJob.css";
import PostJobForm from "../../components/PostJobForm/PostJobForm";
import { useLocation } from "react-router-dom";
const PostJobScreen = () => {
  const location = useLocation();
  return (
    <div className="post-job-container">
      <div className="post-job-header">
        {location.pathname === "/post-job" ? (
          <>
            <h2>Post a New Opportunity</h2>
            <p>
              Fill in the details below to reach thousands of qualified
              candidates.
            </p>
          </>
        ) : (
          <>
            <h2>Update Job Posting</h2>
            <p>
              Update the details below to modify your job posting.
            </p>
          </>
        )}
      </div>
      <PostJobForm />
    </div>
  );
};

export default PostJobScreen;
