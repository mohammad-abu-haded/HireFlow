import { useLocation } from "react-router-dom";
import './NotFound.css';
const NotFoundScreen = () => {
  const location = useLocation();
  const message = location.state?.message;

  return (
    <div className="not-found">
      <h1>404</h1>
      <p>{message || "Page not found"}</p>
    </div>
  );
};

export default NotFoundScreen;