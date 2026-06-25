import "./DemoModeSetup.css";
import BagIcon from "../../assets/icons/briefcase-bag.svg?react";
import Plus from "../../assets/icons/plus-circle.svg?react";
import RightArrow from "../../assets/icons/right-arrow.svg?react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router";
import { seedDevAccounts, seedApplications } from "../../utils/seedDummyData";
import { AuthContext } from "../../context/authContext";
import Loader from "../../components/Loader/Loader";
const DemoModeSetupScreen = () => {
  const [loading, setLoading] = useState(false);
  const { email } = useContext(AuthContext);
  const navigate = useNavigate();
  const handleSampleWorkspaceClick = async () => {
    setLoading(true);
    await seedDevAccounts(email);
    await seedApplications(email);
    completeOnboarding();
  };
  const handleBlankWorkspaceClick = async () => {
    setLoading(true);
    await seedDevAccounts();
    completeOnboarding();
  };
  const featuresSamples = [
    "5 demo accounts with 75 jobs",
    "100+ pre-filled applications",
    "Complete interview workflows",
    "All statuses & interview types",
  ];

  const featuresBlank = [
    "5 fresh demo accounts ready to use",
    "75 sample jobs across all accounts",
    "Clean, pre-configured job board",
    "No applications - start your first one",
  ];

  const completeOnboarding = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/auth/onboarding/complete",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await res.json();

      if (data.success) {
        navigate("/jobs");
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="demo-mode-setup">
      <div className="demo-mode-setup-content">
        <h1>Welcome to Demo Mode</h1>
        <p>
          You're currently using a demo version of your account. We've tailored
          two distinct ways for you to explore the platform. Choose how you'd
          like to start your personal workspace:
        </p>
      </div>
      <div className="mode-cards">
        <div className="mode-item with-sample">
          <div className="mode-label">Recommended</div>
          <div className="mode-icon with-sample">
            <BagIcon className="mode-icon-sample" />
          </div>
          <h2>Start with Sample Data</h2>
          <p>
            Explore the app with preloaded jobs, applications, and analytics.
          </p>
          <div className="features-items">
            {featuresSamples.map((feature, index) => (
              <div key={index} className="feature-item">
                <div className="feature-dot"></div>
                <p>{feature}</p>
              </div>
            ))}
          </div>
          <div
            className="explore-button with-sample"
            onClick={handleSampleWorkspaceClick}
          >
            <p>Explore Sample Workspace</p>
            <RightArrow className="explore-button-icon" />
          </div>
        </div>
        <div className="mode-item without-sample">
          <div className="mode-icon without-sample">
            <Plus className="plus-icon" />
          </div>
          <h2>Start Fresh</h2>
          <p>
            Begin with a clean workspace and add your own data from scratch.
            Ideal for real setup.
          </p>
          <div className="features-items">
            {featuresBlank.map((feature, index) => (
              <div key={index} className="feature-item">
                <div className="feature-dot without-sample"></div>
                <p>{feature}</p>
              </div>
            ))}
          </div>
          <div
            className="explore-button without-sample"
            onClick={handleBlankWorkspaceClick}
          >
            <p>Create Blank Workspace</p>
            <RightArrow className="explore-button-icon without-sample" />
          </div>
        </div>
      </div>
      {
        loading && <Loader />
      }
    </div>
  );
};

export default DemoModeSetupScreen;
