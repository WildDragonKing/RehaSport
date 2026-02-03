import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/builder", label: "Stunden-Builder" },
  { to: "/admin/generator", label: "Bulk Generator" },
  { to: "/admin/stunden", label: "Meine Stunden" },
  { to: "/admin/uebungen", label: "Übungen verwalten" },
  { to: "/admin/gruppen", label: "Gruppen" },
  { to: "/admin/entwuerfe", label: "Entwürfe" },
];

const adminOnlyItems: NavItem[] = [
  { to: "/admin/kategorien", label: "Kategorien" },
  { to: "/admin/regeln", label: "Stunden-Regeln" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/trainer", label: "Trainer verwalten" },
];

// Hamburger Icon
function HamburgerIcon(): JSX.Element {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

// Close Icon
function CloseIcon(): JSX.Element {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function AdminLayout(): JSX.Element {
  const { user, logout, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { state: { from: location.pathname } });
    }
  }, [loading, user, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sage-50 dark:bg-sage-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600 dark:border-sage-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sage-50 dark:bg-sage-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600 dark:border-sage-400" />
      </div>
    );
  }

  const allNavItems = isAdmin ? [...navItems, ...adminOnlyItems] : navItems;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-sage-100 dark:bg-sage-800 text-sage-900 dark:text-sage-100"
        : "text-sage-600 dark:text-sage-400 hover:bg-sage-50 dark:hover:bg-sage-900 hover:text-sage-800 dark:hover:text-sage-200"
    }`;

  return (
    <div className="min-h-screen bg-sage-50 dark:bg-sage-950">
      {/* Top Navigation */}
      <header className="bg-white dark:bg-sage-900 border-b border-sage-200 dark:border-sage-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side: Hamburger + Logo */}
            <div className="flex items-center gap-4">
              {/* Hamburger button - mobile only */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 text-sage-600 dark:text-sage-400 hover:text-sage-800 dark:hover:text-sage-200 hover:bg-sage-100 dark:hover:bg-sage-800 rounded-lg transition-colors"
                aria-label="Menü öffnen"
              >
                <HamburgerIcon />
              </button>

              <NavLink to="/" className="flex items-center gap-2">
                <span className="text-xl font-display font-bold text-sage-800 dark:text-sage-200">
                  RehaSport
                </span>
              </NavLink>
              <span className="px-2 py-1 text-xs font-medium bg-sage-100 dark:bg-sage-800 text-sage-700 dark:text-sage-300 rounded">
                Admin
              </span>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-sm text-sage-600 dark:text-sage-400">
                <span className="font-medium">
                  {user.displayName || user.email}
                </span>
                <span className="ml-2 text-xs text-sage-400 dark:text-sage-500">
                  ({isAdmin ? "Admin" : "Trainer"})
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm text-sage-600 dark:text-sage-400 hover:text-sage-800 dark:hover:text-sage-200 hover:bg-sage-100 dark:hover:bg-sage-800 rounded-lg transition-colors"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Sidebar Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={`
            fixed md:sticky top-0 md:top-16 left-0
            w-64 h-full md:h-[calc(100vh-4rem)]
            bg-white dark:bg-sage-900
            border-r border-sage-200 dark:border-sage-800
            z-50 md:z-auto
            transform transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          `}
        >
          {/* Mobile header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-sage-200 dark:border-sage-800 md:hidden">
            <span className="text-lg font-display font-semibold text-sage-800 dark:text-sage-200">
              Menü
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 -mr-2 text-sage-600 dark:text-sage-400 hover:text-sage-800 dark:hover:text-sage-200 hover:bg-sage-100 dark:hover:bg-sage-800 rounded-lg transition-colors"
              aria-label="Menü schließen"
            >
              <CloseIcon />
            </button>
          </div>

          <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-8rem)] md:h-auto">
            {allNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={navLinkClass}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Quick Links */}
          <div className="p-4 border-t border-sage-100 dark:border-sage-800 mt-4">
            <p className="text-xs font-medium text-sage-400 dark:text-sage-500 uppercase tracking-wider mb-2">
              Schnellzugriff
            </p>
            <div className="space-y-1">
              <NavLink
                to="/stunden"
                className="block px-4 py-2 text-sm text-sage-500 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 transition-colors"
              >
                Öffentliche Stunden
              </NavLink>
              <NavLink
                to="/uebungen"
                className="block px-4 py-2 text-sm text-sage-500 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 transition-colors"
              >
                Übungsbibliothek
              </NavLink>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
