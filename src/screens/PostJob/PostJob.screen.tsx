import "./PostJob.css";
import PostJobForm from "../../components/post-job-form/PostJobForm";
const PostJobScreen = () => {
  return (
    <div className="post-job-container">
      <div className="post-job-header">
        <h2>Post a New Opportunity</h2>
        <p>
          Fill in the details below to reach thousands of qualified candidates.
        </p>
      </div>
      <PostJobForm />
    </div>
  );
};

export default PostJobScreen;
