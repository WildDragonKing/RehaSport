import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

/**
 * Setup-Seite für den ersten Admin-User
 * Diese Seite sollte nur einmal verwendet werden!
 */
export default function SetupPage(): JSX.Element {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null);

  const navigate = useNavigate();

  // Check if admin already exists
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const adminDoc = await getDoc(doc(db, 'config', 'admin'));
        setHasAdmin(adminDoc.exists());
      } catch {
        setHasAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    if (password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    setLoading(true);

    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // 2. Create Firestore user document with admin role
      await setDoc(doc(db, 'users', userId), {
        email,
        displayName: displayName || email.split('@')[0],
        role: 'admin',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // 3. Mark that admin has been set up
      await setDoc(doc(db, 'config', 'admin'), {
        userId,
        createdAt: Timestamp.now(),
      });

      setSuccess(true);

      // Redirect to admin after 2 seconds
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } catch (err) {
      console.error('Setup error:', err);
      if (err instanceof Error) {
        if (err.message.includes('auth/email-already-in-use')) {
          setError('Diese E-Mail-Adresse wird bereits verwendet');
        } else if (err.message.includes('auth/invalid-email')) {
          setError('Ungültige E-Mail-Adresse');
        } else if (err.message.includes('auth/weak-password')) {
          setError('Passwort ist zu schwach');
        } else if (err.message.includes('auth/operation-not-allowed')) {
          setError('Email/Password-Anmeldung ist nicht aktiviert. Bitte aktiviere sie in der Firebase Console unter Authentication > Sign-in method');
        } else {
          setError(err.message);
        }
      } else {
        setError('Ein unbekannter Fehler ist aufgetreten');
      }
    } finally {
      setLoading(false);
    }
  };

  if (hasAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sage-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-600" />
      </div>
    );
  }

  if (hasAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-sand-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-display font-bold text-sage-800 mb-4">
            Setup bereits abgeschlossen
          </h1>
          <p className="text-sage-600 mb-6">
            Ein Administrator wurde bereits eingerichtet.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-3 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-lg transition-colors"
          >
            Zum Login
          </a>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-sand-100 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-display font-bold text-sage-800 mb-2">
            Setup erfolgreich!
          </h1>
          <p className="text-sage-600">
            Du wirst zum Admin-Bereich weitergeleitet...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sage-50 to-sand-100 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-sage-800">
              Admin-Setup
            </h1>
            <p className="mt-2 text-sage-600">
              Erstelle den ersten Administrator-Account
            </p>
          </div>

          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Wichtig:</strong> Diese Seite sollte nur einmal verwendet werden, um den ersten Admin anzulegen.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-sage-700 mb-2">
                Anzeigename
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                placeholder="Dein Name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-sage-700 mb-2">
                E-Mail-Adresse
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                placeholder="admin@beispiel.de"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-sage-700 mb-2">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                placeholder="Mindestens 8 Zeichen"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-sage-700 mb-2">
                Passwort bestätigen
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
                placeholder="Passwort wiederholen"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Erstelle Account...' : 'Admin-Account erstellen'}
            </button>
          </form>
        </div>

        <div className="mt-6 p-4 bg-white/50 rounded-xl text-sm text-sage-600">
          <p className="font-medium mb-2">Voraussetzung:</p>
          <p>
            Email/Password-Anmeldung muss in der{' '}
            <a
              href="https://console.firebase.google.com/project/rehasport-trainer/authentication/providers"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sage-800 underline"
            >
              Firebase Console
            </a>{' '}
            aktiviert sein.
          </p>
        </div>
      </div>
    </div>
  );
}
