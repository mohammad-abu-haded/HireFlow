import "./Sidebar.css";
import BagIcon from "../../assets/icons/briefcase-bag.svg?react";
import { NavLink } from "react-router-dom";
import DashboardIcon from "../../assets/icons/dashboard.svg?react";
import PostJobIcon from "../../assets/icons/plus-circle.svg?react";
import ApplicationsIcon from "../../assets/icons/persons.svg?react";
import LogoutIcon from "../../assets/icons/logout.svg?react";
import JobsIcon from "../../assets/icons/list.svg?react";
const navItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: DashboardIcon,
  },
  {
    path: "/post-job",
    label: "Post Jobs",
    icon: PostJobIcon,
  },
  {
    path: "/applications",
    label: "Applications",
    icon: ApplicationsIcon,
  },
  {
    path: "/jobs",
    label: "Jobs",
    icon: JobsIcon,
  },
];
const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon-container">
          <BagIcon className="logo-icon-sidebar" />
        </div>
        <h2 className="logo-text">HireFlow</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
            >
              <Icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-logout">
        <LogoutIcon className="logout-icon" />
        <span className="logout-label">Logout</span>
      </div>
    </div>
  );
};

export default Sidebar;
