import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import "./AppLayout.css";
import Topbar from "../Topbar/Topbar";
const AppLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="content-container">
        <Topbar />
      <main className="main-content"><Outlet /></main>
      </div>
    </div>
  );
};

export default AppLayout;
