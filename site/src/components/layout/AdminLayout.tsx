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
  { to: '/admin/stunden', label: 'Meine Stunden' },
  { to: '/admin/gruppen', label: 'Gruppen' },
  { to: '/admin/entwuerfe', label: 'Entwürfe' },
];

const adminOnlyItems: NavItem[] = [
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
      <div className="min-h-screen flex items-center justify-center bg-sage-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sage-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600" />
      </div>
    );
  }

  const allNavItems = isAdmin ? [...navItems, ...adminOnlyItems] : navItems;

  return (
    <div className="min-h-screen bg-sage-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-sage-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <NavLink to="/" className="flex items-center gap-2">
                <span className="text-xl font-display font-bold text-sage-800">
                  RehaSport
                </span>
              </NavLink>
              <span className="px-2 py-1 text-xs font-medium bg-sage-100 text-sage-700 rounded">
                Admin
              </span>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-sage-600">
                <span className="font-medium">{user.displayName || user.email}</span>
                <span className="ml-2 text-xs text-sage-400">
                  ({isAdmin ? 'Admin' : 'Trainer'})
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm text-sage-600 hover:text-sage-800 hover:bg-sage-100 rounded-lg transition-colors"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white border-r border-sage-200 min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-1">
            {allNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sage-100 text-sage-900'
                      : 'text-sage-600 hover:bg-sage-50 hover:text-sage-800'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Quick Links */}
          <div className="p-4 border-t border-sage-100 mt-4">
            <p className="text-xs font-medium text-sage-400 uppercase tracking-wider mb-2">
              Schnellzugriff
            </p>
            <div className="space-y-1">
              <NavLink
                to="/stunden"
                className="block px-4 py-2 text-sm text-sage-500 hover:text-sage-700 transition-colors"
              >
                Öffentliche Stunden
              </NavLink>
              <NavLink
                to="/uebungen"
                className="block px-4 py-2 text-sm text-sage-500 hover:text-sage-700 transition-colors"
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
