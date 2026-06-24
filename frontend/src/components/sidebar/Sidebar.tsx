import "./Sidebar.css";
import BagIcon from "../../assets/icons/briefcase-bag.svg?react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import PostJobIcon from "../../assets/icons/plus-circle.svg?react";
import ApplicationsIcon from "../../assets/icons/persons.svg?react";
import LogoutIcon from "../../assets/icons/logout.svg?react";
import SavedIcon from "../../assets/icons/saved.svg?react";
import OpenSidebar from "../../assets/icons/sidebar-right.svg?react";
import UserCheckIcon from "../../assets/icons/user-check.svg?react";
import InterviewIcon from "../../assets/icons/interview.svg?react";
import CloseSidebarIcon from "../../assets/icons/sidebar-left.svg?react";
import UserIcon from "../../assets/icons/user.svg?react";
import CompanyIcon from "../../assets/icons/company.svg?react";
import JobsIcon from "../../assets/icons/list.svg?react";
import { AuthContext } from "../../context/authContext";
import { useContext, useEffect, useState } from "react";
const navItemsApplicant = [
  {
    path: "/jobs",
    label: "Jobs",
    icon: JobsIcon,
    requiresAuth: false,
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

const navItemsEmployer = [
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
];

const SIDEBAR_TABS = [
  {
    value: "applicant",
    label: "Applicant",
    icon: UserIcon,
  },
  {
    value: "employer",
    label: "Employer",
    icon: CompanyIcon,
  },
] as const;

type SidebarTab = (typeof SIDEBAR_TABS)[number]["value"];

const Sidebar = () => {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem("sidebar");
    return saved ? JSON.parse(saved) : true;
  });

  const DEFAULT_TAB = SIDEBAR_TABS[0].value;

  const [activeTab, setActiveTab] = useState<SidebarTab>(() => {
    const saved = localStorage.getItem("sidebar-tab");

    const validTab = SIDEBAR_TABS.find((tab) => tab.value === saved);

    return validTab?.value ?? DEFAULT_TAB;
  });

  useEffect(() => {
    localStorage.setItem("sidebar", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  useEffect(() => {
    localStorage.setItem("sidebar-tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    navItemsApplicant.map((item) => {
      if (item.path === pathname) {
        setActiveTab("applicant");
        return;
      }
    });
    navItemsEmployer.map((item) => {
      if (item.path === pathname) {
        setActiveTab("employer");
        return;
      }
    });
  }, [pathname]);

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

      {isAuthenticated && (
        <div className="sidebar-mode-switch">
          {SIDEBAR_TABS.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                className={`sidebar-mode ${
                  item.value === activeTab ? "active" : ""
                }`}
                onClick={() => {
                  if (activeTab !== item.value) {
                    const newActiveTab = item.value;
                    setActiveTab(newActiveTab);
                    if (newActiveTab === "applicant") {
                      navigate("/jobs");
                    } else {
                      navigate("/my-jobs");
                    }
                  }
                }}
              >
                <Icon className="sidebar-mode-icon" />
                <p>{item.label}</p>
              </button>
            );
          })}
        </div>
      )}

      {activeTab === "applicant" && (
        <nav className="sidebar-nav">
          {navItemsApplicant
            .filter((item) => (isAuthenticated ? true : !item.requiresAuth))
            .map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={`nav-item-container-${index}`}>
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
      )}

      {activeTab === "employer" && (
        <nav className="sidebar-nav">
          {navItemsEmployer
            .filter((item) => (isAuthenticated ? true : !item.requiresAuth))
            .map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={`nav-item-container-${index}`}>
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
      )}
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
