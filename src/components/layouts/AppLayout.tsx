import { Outlet } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import "./AppLayout.css";
const AppLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content"><Outlet /></main>
    </div>
  );
};

export default AppLayout;
