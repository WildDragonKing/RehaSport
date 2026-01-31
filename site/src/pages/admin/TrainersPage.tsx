import { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { createInvitation, getPendingInvitations, getTrainers } from '../../firebase/firestore';
import type { User, Invitation } from '../../firebase/types';

export default function TrainersPage(): JSX.Element {
  const { user, isAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load from Firestore
  const [trainers, setTrainers] = useState<User[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [trainersList, invitationsList] = await Promise.all([
          getTrainers(),
          getPendingInvitations(),
        ]);
        setTrainers(trainersList);
        setPendingInvitations(invitationsList);
      } catch (err) {
        console.error('Error loading trainers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-sage-600 dark:text-sage-300">Nur Administratoren können Trainer verwalten.</p>
      </div>
    );
  }

  const handleInvite = async () => {
    if (!email.trim() || !user?.id) return;

    setInviting(true);
    setError(null);
    setSuccess(null);

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days validity

      await createInvitation({
        email: email.trim().toLowerCase(),
        role: 'trainer',
        invitedBy: user.id,
        expiresAt: Timestamp.fromDate(expiresAt),
      });

      setSuccess(`Einladung für ${email} erstellt. Der Trainer kann sich jetzt unter /login mit Google anmelden.`);
      setEmail('');

      // Reload invitations
      const invitations = await getPendingInvitations();
      setPendingInvitations(invitations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Erstellen der Einladung');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-sage-900 dark:text-sage-100">
          Trainer verwalten
        </h1>
        <p className="mt-2 text-sage-600 dark:text-sage-300">
          Lade neue Trainer ein und verwalte bestehende Zugänge
        </p>
      </div>

      {/* Invite Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-sage-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-sage-900 dark:text-sage-100 mb-4">Neuen Trainer einladen</h2>

        <div className="flex gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="trainer@beispiel.de"
            className="flex-1 px-4 py-3 border border-sage-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sage-500 dark:bg-gray-700 dark:text-sage-100"
          />
          <button
            onClick={handleInvite}
            disabled={!email.trim() || inviting}
            className="px-6 py-3 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
          >
            {inviting ? 'Lädt...' : 'Einladen'}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}

        {success && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        <p className="mt-4 text-sm text-sage-500 dark:text-sage-400">
          Der eingeladene Trainer kann sich dann unter <code className="bg-sage-100 dark:bg-gray-700 px-1 rounded">/login</code> mit seinem Google-Konto anmelden.
        </p>
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-sage-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-sage-900 dark:text-sage-100 mb-4">Offene Einladungen</h2>
          <div className="divide-y divide-sage-100 dark:divide-gray-700">
            {pendingInvitations.map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sage-800 dark:text-sage-100">{inv.email}</p>
                  <p className="text-sm text-sage-500 dark:text-sage-400">
                    Eingeladen am {inv.createdAt?.toDate?.().toLocaleDateString('de') || 'Unbekannt'}
                    {inv.expiresAt && (
                      <> • Gültig bis {inv.expiresAt.toDate().toLocaleDateString('de')}</>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Trainers */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-sage-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-sage-900 dark:text-sage-100 mb-4">Aktive Trainer</h2>

        {loading ? (
          <p className="text-sage-500 dark:text-sage-400 text-sm">Laden...</p>
        ) : trainers.length > 0 ? (
          <div className="divide-y divide-sage-100 dark:divide-gray-700">
            {trainers.map((trainer) => (
              <div key={trainer.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sage-800 dark:text-sage-100">
                    {trainer.displayName || trainer.email}
                  </p>
                  <p className="text-sm text-sage-500 dark:text-sage-400">
                    {trainer.role === 'admin' ? 'Administrator' : 'Trainer'}
                    {trainer.email && trainer.displayName && ` • ${trainer.email}`}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded ${
                  trainer.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-sage-100 dark:bg-gray-700 text-sage-700 dark:text-sage-300'
                }`}>
                  {trainer.role === 'admin' ? 'Admin' : 'Trainer'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sage-500 dark:text-sage-400 text-sm">Noch keine Trainer registriert.</p>
        )}
      </div>
    </div>
  );
}
