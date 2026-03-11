import { useLocation, Link } from "react-router-dom";
import { useTheme } from "../../hooks/useStore";
import "./Sidebar.css";

/**
 * Sidebar - A fully responsive sidebar navigation component.
 * On mobile: shows icon-only rail. On desktop: shows full labels.
 *
 * @param {Object} props
 * @param {string} props.appName - Application logo/name
 * @param {string} props.appIcon - Material icon name for logo
 * @param {Array} props.navItems - Array of { path, icon, label, filled }
 * @param {Object} [props.userInfo] - Optional user info { name, subtitle, avatar }
 * @param {Function} [props.onSignOut] - Callback for sign out
 */
export default function Sidebar({
  appName = "carbon",
  appIcon = "eco",
  navItems = [],
  userInfo,
  onSignOut,
}) {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <img src="/applogo.png" alt="CarbonX Logo" className="h-15 ml-4" />
        <h1 className="sidebar-logo-text">{appName}</h1>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav-list">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav-item ${isActive ? "active" : ""}`}
            >
              <span
                className={`material-symbols-outlined ${item.filled ? "filled" : ""}`}
                style={{ fontSize: "1.5rem" }}
              >
                {item.icon}
              </span>
              <span className="sidebar-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User / Sign Out */}
      <div className="sidebar-footer">
        {userInfo && (
          <div className="sidebar-user">
            {userInfo.avatar ? (
              <img
                src={userInfo.avatar}
                alt={userInfo.name}
                className="sidebar-user-avatar"
              />
            ) : (
              <div className="sidebar-user-avatar-placeholder">
                <span
                  className="material-symbols-outlined"
                  style={{ color: "var(--slate-600)" }}
                >
                  person
                </span>
              </div>
            )}
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{userInfo.name}</p>
              {userInfo.subtitle && (
                <p className="sidebar-user-subtitle">{userInfo.subtitle}</p>
              )}
            </div>
          </div>
        )}
        <button
          className="sidebar-nav-item"
          onClick={toggleTheme}
          style={{ color: "var(--slate-500)" }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "1.5rem" }}
          >
            {isDark ? "light_mode" : "dark_mode"}
          </span>
          <span className="sidebar-nav-label">
            {isDark ? "Light Mode" : "Dark Mode"}
          </span>
        </button>
        {onSignOut && (
          <button
            className="sidebar-nav-item sidebar-signout"
            onClick={onSignOut}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "1.5rem" }}
            >
              logout
            </span>
            <span className="sidebar-nav-label">Sign Out</span>
          </button>
        )}
      </div>
    </aside>
  );
}
