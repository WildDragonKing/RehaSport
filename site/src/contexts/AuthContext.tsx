import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthChange, signIn, signOut, signInWithGoogle, isAdmin, isTrainer, AuthUser } from '../firebase/auth';
import { getUser } from '../firebase/firestore';
import type { User } from '../firebase/types';

interface AuthContextType {
  // Firebase auth user
  authUser: AuthUser | null;
  // Firestore user document with role info
  user: User | null;
  // Loading state
  loading: boolean;
  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  // Role checks
  isAdmin: boolean;
  isTrainer: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.email || 'logged out');
      setAuthUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Fetch user document from Firestore
          const userData = await getUser(firebaseUser.uid);
          console.log('User data loaded:', userData);
          setUser(userData);
        } catch (error) {
          console.error('Error loading user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userData = await signIn(email, password);
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const userData = await signInWithGoogle();
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    authUser,
    user,
    loading,
    login,
    loginWithGoogle,
    logout,
    isAdmin: isAdmin(user),
    isTrainer: isTrainer(user),
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: ('admin' | 'trainer')[]
) {
  return function ProtectedComponent(props: P) {
    const { user, loading, isAdmin, isTrainer } = useAuth();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600"></div>
        </div>
      );
    }

    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return null;
    }

    if (requiredRoles) {
      const hasRequiredRole =
        (requiredRoles.includes('admin') && isAdmin) ||
        (requiredRoles.includes('trainer') && isTrainer);

      if (!hasRequiredRole) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600">Zugriff verweigert</h1>
              <p className="mt-2 text-gray-600">
                Du hast nicht die erforderlichen Berechtigungen für diese Seite.
              </p>
            </div>
          </div>
        );
      }
    }

    return <Component {...props} />;
  };
}
