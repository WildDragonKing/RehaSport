import { NavLink } from "react-router-dom";

import ThemeSwitcher from "../ui/ThemeSwitcher";

const NAV_ITEMS = [
  { path: "/", label: "Start", shortLabel: "Start" },
  { path: "/uebungen", label: "Übungen", shortLabel: "Übungen" },
  { path: "/info", label: "Hinweise", shortLabel: "Info" }
];

function Header(): JSX.Element {
  return (
    <header className="site-header" role="banner">
      <div className="site-header__inner">
        <NavLink to="/" className="site-header__brand" aria-label="RehaSport Reader Startseite">
          <span className="site-header__logo" aria-hidden="true">R</span>
          <span className="site-header__brand-text">RehaSport</span>
        </NavLink>
        <div className="site-header__controls">
          <nav className="site-header__nav" aria-label="Hauptnavigation">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    "site-header__link",
                    isActive ? "site-header__link--active" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")
                }
              >
                <span className="site-header__link-full">{item.label}</span>
                <span className="site-header__link-short">{item.shortLabel}</span>
              </NavLink>
            ))}
          </nav>
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}

export default Header;
