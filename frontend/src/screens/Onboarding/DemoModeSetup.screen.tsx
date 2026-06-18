import "./DemoModeSetup.css";
import BagIcon from "../../assets/icons/briefcase-bag.svg?react";
import Plus from "../../assets/icons/plus-circle.svg?react";
import RightArrow from "../../assets/icons/right-arrow.svg?react";
import { useNavigate } from "react-router";
const DemoModeSetupScreen = () => {
  const navigate = useNavigate();
  const handleSampleWorkspaceClick = () => {
    navigate('/jobs');
  };
  const handleBlankWorkspaceClick = () => {
    navigate('/jobs');
  };
  const featuresSamples = [
    "Full pipeline of 12 sample jobs",
    "45+ pre-populated applications",
    "Live visual analytics dashboard",
    "Automated testing workflows",
  ];

  const featuresBlank = [
    "Clean, distraction-free interface",
    "Step-by-step setup wizard",
    "Custom data import tools",
    "Direct API access ready",
  ];

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
          <div className="explore-button with-sample" onClick={handleSampleWorkspaceClick}>
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
          <div className="explore-button without-sample" onClick={handleBlankWorkspaceClick}>
            <p>Create Blank Workspace</p>
            <RightArrow className="explore-button-icon without-sample" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoModeSetupScreen;
