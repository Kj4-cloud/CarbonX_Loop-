import { useLocation, Link } from "react-router-dom";
import { useTheme } from "../../hooks/useStore";
import "./NavRail.css";

/**
 * NavRail - Compact vertical icon-only navigation rail.
 * Used by Photo Verification and similar screens.
 *
 * @param {Array} props.items - Array of { path, icon, label, filled }
 * @param {string} [props.logoIcon] - Material icon for logo
 */
export default function NavRail({ items = [], logoIcon = "eco" }) {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="nav-rail">
      <div className="nav-rail-logo">
        <span
          className="material-symbols-outlined text-primary"
          style={{ fontSize: "1.75rem", fontWeight: 700 }}
        >
          {logoIcon}
        </span>
      </div>
      <div className="nav-rail-items">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-rail-link ${isActive ? "active" : ""}`}
            >
              <span
                className={`material-symbols-outlined ${item.filled && isActive ? "filled" : ""}`}
                style={{ fontSize: "1.5rem" }}
              >
                {item.icon}
              </span>
              <span className="nav-rail-link-label">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <div className="nav-rail-bottom">
        <button
          className="nav-rail-bottom-btn"
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          <span
            className="material-symbols-outlined"
            style={{ color: "var(--slate-400)" }}
          >
            {isDark ? "light_mode" : "dark_mode"}
          </span>
        </button>
        <button className="nav-rail-bottom-btn">
          <span
            className="material-symbols-outlined"
            style={{ color: "var(--slate-400)" }}
          >
            help_outline
          </span>
        </button>
        <div className="nav-rail-avatar"></div>
      </div>
    </nav>
  );
}
