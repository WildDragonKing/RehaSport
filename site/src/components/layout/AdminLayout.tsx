import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

const navItems: NavItem[] = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/builder', label: 'Stunden-Builder' },
  { to: '/admin/generator', label: 'Bulk Generator' },
  { to: '/admin/stunden', label: 'Meine Stunden' },
  { to: '/admin/uebungen', label: 'Übungen verwalten' },
  { to: '/admin/gruppen', label: 'Gruppen' },
  { to: '/admin/entwuerfe', label: 'Entwürfe' },
];

const adminOnlyItems: NavItem[] = [
  { to: '/admin/kategorien', label: 'Kategorien' },
  { to: '/admin/regeln', label: 'Stunden-Regeln' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/trainer', label: 'Trainer verwalten' },
];

export default function AdminLayout(): JSX.Element {
  const { user, logout, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [loading, user, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sage-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600 dark:border-sage-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sage-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600 dark:border-sage-400" />
      </div>
    );
  }

  const allNavItems = isAdmin ? [...navItems, ...adminOnlyItems] : navItems;

  return (
    <div className="min-h-screen bg-sage-50 dark:bg-gray-900">
      {/* Top Navigation */}
      <header className="bg-white dark:bg-gray-800 border-b border-sage-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
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
              <div className="text-sm text-sage-600 dark:text-sage-400">
                <span className="font-medium">{user.displayName || user.email}</span>
                <span className="ml-2 text-xs text-sage-400 dark:text-sage-500">
                  ({isAdmin ? 'Admin' : 'Trainer'})
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm text-sage-600 dark:text-sage-400 hover:text-sage-800 dark:hover:text-sage-200 hover:bg-sage-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-sage-200 dark:border-gray-700 min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-1">
            {allNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sage-100 dark:bg-sage-800 text-sage-900 dark:text-sage-100'
                      : 'text-sage-600 dark:text-sage-400 hover:bg-sage-50 dark:hover:bg-gray-700 hover:text-sage-800 dark:hover:text-sage-200'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Quick Links */}
          <div className="p-4 border-t border-sage-100 dark:border-gray-700 mt-4">
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
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
