import "./Loader.css";

const Loader = () => {
  return (
    <div className="loader-overlay">
      <div className="loader-content">
        <div className="loader-spinner"></div>
        <h3>Preparing your workspace...</h3>
        <p>Please wait a few moments.</p>
      </div>
    </div>
  );
};

export default Loader;