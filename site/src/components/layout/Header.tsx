import { NavLink } from "react-router-dom";

import ThemeSwitcher from "../ui/ThemeSwitcher";

const NAV_ITEMS = [
  { path: "/", label: "Start", shortLabel: "Start" },
  { path: "/stunden", label: "Stunden", shortLabel: "Stunden" },
  { path: "/uebungen", label: "Übungen", shortLabel: "Übungen" },
  { path: "/info", label: "Info", shortLabel: "Info" }
];

// Leaf icon for logo
function LeafIcon(): JSX.Element {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function Header(): JSX.Element {
  return (
    <header className="glass-header" role="banner">
      <div className="container header-inner">
        {/* Logo */}
        <NavLink
          to="/"
          className="header-logo"
          aria-label="RehaSport Reader Startseite"
        >
          <span className="header-logo-icon" aria-hidden="true">
            <LeafIcon />
          </span>
          <span className="hidden sm:inline">RehaSport</span>
        </NavLink>

        {/* Navigation */}
        <nav className="header-nav" aria-label="Hauptnavigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.shortLabel}</span>
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="header-actions">
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}

export default Header;
