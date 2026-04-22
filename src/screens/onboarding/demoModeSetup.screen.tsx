import "./demoModeSetup.css";
import bag from "../../assets/icons/briefcase-bag.svg";
import plus from "../../assets/icons/plus-circle.svg";
import rightArrow from "../../assets/icons/right-arrow.svg";
const DemoModeSetup = () => {
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
            <img src={bag} alt="HireFlow Icon" />
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
          <div className="explore-button with-sample">
            <p>Explore Sample Workspace</p>
            <img src={rightArrow} alt="Right Arrow" />
          </div>
        </div>
        <div className="mode-item without-sample">
          <div className="mode-icon without-sample">
            <img src={plus} alt="HireFlow Icon" />
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
          <div className="explore-button without-sample">
            <p>Create Blank Workspace</p>
            <img src={rightArrow} alt="Right Arrow" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoModeSetup;
