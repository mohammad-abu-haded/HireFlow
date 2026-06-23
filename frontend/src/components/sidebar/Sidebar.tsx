import "./Sidebar.css";
import BagIcon from "../../assets/icons/briefcase-bag.svg?react";
import { NavLink, useNavigate } from "react-router-dom";
import PostJobIcon from "../../assets/icons/plus-circle.svg?react";
import ApplicationsIcon from "../../assets/icons/persons.svg?react";
import LogoutIcon from "../../assets/icons/logout.svg?react";
import SavedIcon from "../../assets/icons/saved.svg?react";
import OpenSidebar from "../../assets/icons/sidebar-right.svg?react";
import UserCheckIcon from "../../assets/icons/user-check.svg?react";
import InterviewIcon from "../../assets/icons/interview.svg?react";
import CloseSidebarIcon from "../../assets/icons/sidebar-left.svg?react";
import JobsIcon from "../../assets/icons/list.svg?react";
import { AuthContext } from "../../context/authContext";
import { useContext, useEffect, useState } from "react";
const navItems = [
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
    path: "/interviews",
    label: "Interviews",
    icon: UserCheckIcon,
    requiresAuth: true,
  },
  {
    path: "/jobs",
    label: "Jobs",
    icon: JobsIcon,
    requiresAuth: false,
    section: "new-section",
  },
  {
    path: "/my-applications",
    label: "My Applications",
    icon: SavedIcon,
    requiresAuth: true,
  },
  {
    path: "/my-interviews",
    label: "My Interviews",
    icon: InterviewIcon,
    requiresAuth: true,
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("sidebar");
    return saved ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("sidebar", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div className={`sidebar ${!isSidebarOpen && "sidebar-closed"}`}>
      {isSidebarOpen ? (
        <CloseSidebarIcon
          className="sidebar-toggle"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
        />
      ) : (
        <OpenSidebar
          className="sidebar-toggle"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
        />
      )}
      <div className="sidebar-logo">
        <div className="logo-icon-container">
          <BagIcon className="logo-icon-sidebar" />
        </div>
        <h2 className="logo-text">HireFlow</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems
          .filter((item) => (isAuthenticated ? true : !item.requiresAuth))
          .map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={`nav-item-container-${index}`}>
              {item.section && item.section === 'new-section' && (<div className="nav-divider" key={`nav-divider-${index}`}/>)}
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={(e) => {
                    if (location.pathname === item.path) {
                      e.preventDefault();
                    }
                  }}
                  className={({ isActive }) =>
                    isActive ? "nav-item active" : "nav-item"
                  }
                >
                  <Icon className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              </div>
            );
          })}
      </nav>
      {isAuthenticated && (
        <button className="sidebar-auth sidebar-logout" onClick={handleLogout}>
          <LogoutIcon className="auth-icon" />
          <span className="logout-label">Logout</span>
        </button>
      )}
    </div>
  );
};

export default Sidebar;
