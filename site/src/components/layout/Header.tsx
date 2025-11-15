import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/", label: "Ordner" },
  { path: "/info", label: "Hinweise" }
];

function Header(): JSX.Element {
  return (
    <header className="site-header" role="banner">
      <div className="container site-header__inner">
        <NavLink to="/" className="site-header__brand" aria-label="RehaSport Reader Startseite">
          <span aria-hidden="true">📘</span>
          <span>RehaSport Reader</span>
        </NavLink>
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
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;
