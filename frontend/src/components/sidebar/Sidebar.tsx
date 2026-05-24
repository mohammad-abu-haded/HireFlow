import "./Sidebar.css";
import BagIcon from "../../assets/icons/briefcase-bag.svg?react";
import { NavLink, useNavigate } from "react-router-dom";
import DashboardIcon from "../../assets/icons/dashboard.svg?react";
import PostJobIcon from "../../assets/icons/plus-circle.svg?react";
import ApplicationsIcon from "../../assets/icons/persons.svg?react";
import LogoutIcon from "../../assets/icons/logout.svg?react";
import JobsIcon from "../../assets/icons/list.svg?react";
import { AuthContext } from "../../context/authContext";
import { useContext } from "react";
const navItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: DashboardIcon,
    requiresAuth: true,
  },
  {
    path: "/my-jobs",
    label: "My Jobs",
    icon: BagIcon,
    requiresAuth: true,
  },
  {
    path: "/post-job",
    label: "Post Jobs",
    icon: PostJobIcon,
    requiresAuth: true,
  },
  {
    path: "/applications",
    label: "Applications",
    icon: ApplicationsIcon,
    requiresAuth: true,
  },
  {
    path: "/jobs",
    label: "Jobs",
    icon: JobsIcon,
    requiresAuth: false,
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useContext(AuthContext);
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon-container">
          <BagIcon className="logo-icon-sidebar" />
        </div>
        <h2 className="logo-text">HireFlow</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.filter((item) => (isAuthenticated? true: !item.requiresAuth))
        .map((item) => {
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
      {isAuthenticated && (
        <div className="sidebar-auth logout" onClick={handleLogout}>
          <LogoutIcon className="auth-icon" />
          <span className="logout-label">Logout</span>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
