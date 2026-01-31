import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useContent } from '../../contexts/ContentContext';
import { hasFirestoreData, migrateAll, type MigrationResult } from '../../firebase/migration';
import { exportFirestoreData, type ExportResult } from '../../firebase/export';

export default function DashboardPage(): JSX.Element {
  const { user, isAdmin } = useAuth();
  const { categories, sessions, exercises, dataSource, isFirestoreAvailable, refresh } = useContent();

  const [firestoreStats, setFirestoreStats] = useState<{ sessions: number; exercises: number } | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);

  useEffect(() => {
    const checkFirestore = async () => {
      const stats = await hasFirestoreData();
      setFirestoreStats(stats);
    };
    checkFirestore();
  }, []);

  const handleMigration = async () => {
    if (!user?.id || !isAdmin) return;

    if (!confirm('Möchtest du wirklich alle lokalen Daten nach Firestore migrieren? Bestehende Daten werden überschrieben.')) {
      return;
    }

    setMigrating(true);
    setMigrationResult(null);

    try {
      const result = await migrateAll(user.id);
      setMigrationResult(result);
      // Refresh stats
      const stats = await hasFirestoreData();
      setFirestoreStats(stats);
      // Refresh content
      await refresh();
    } catch (error) {
      setMigrationResult({
        sessions: 0,
        exercises: 0,
        errors: [error instanceof Error ? error.message : 'Unbekannter Fehler'],
      });
    } finally {
      setMigrating(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setExportResult(null);

    try {
      const result = await exportFirestoreData();
      setExportResult(result);
    } catch (error) {
      setExportResult({
        success: false,
        collections: [],
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-sage-900">
          Willkommen, {user?.displayName || user?.email?.split('@')[0]}!
        </h1>
        <p className="mt-2 text-sage-600">
          Hier findest du eine Übersicht deiner Aktivitäten und Schnellzugriffe.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Stunden"
          value={sessions.length}
          subtitle={`in ${categories.length} Kategorien`}
          link="/admin/stunden"
          color="sage"
        />
        <StatCard
          title="Übungen"
          value={exercises.length}
          subtitle="in der Bibliothek"
          link="/uebungen"
          color="sand"
        />
        <StatCard
          title="Datenquelle"
          value="Firestore"
          subtitle={isFirestoreAvailable ? 'verbunden' : 'nicht verfügbar'}
          color="terracotta"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-sage-200 p-6">
        <h2 className="text-lg font-semibold text-sage-900 mb-4">Schnellaktionen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            to="/admin/builder"
            title="Neue Stunde"
            description="Mit KI erstellen"
            icon="+"
          />
          <QuickAction
            to="/admin/gruppen"
            title="Gruppe anlegen"
            description="Für Teilnehmer"
            icon="G"
          />
          <QuickAction
            to="/admin/entwuerfe"
            title="Entwürfe"
            description="Prüfen & freigeben"
            icon="E"
          />
          <QuickAction
            to="/uebungen"
            title="Übungen"
            description="Bibliothek durchsuchen"
            icon="B"
          />
        </div>
      </div>

      {/* Firestore Migration (Admin only) */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-sage-200 p-6">
          <h2 className="text-lg font-semibold text-sage-900 mb-4">Datenbank-Status</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Local Data */}
            <div className="p-4 bg-sage-50 rounded-lg">
              <h3 className="font-medium text-sage-800 mb-2">Lokale Daten</h3>
              <p className="text-sm text-sage-600">
                {sessions.length} Stunden, {exercises.length} Übungen
              </p>
              <p className="text-xs text-sage-500 mt-1">
                Aus Markdown-Dateien
              </p>
            </div>

            {/* Firestore Data */}
            <div className="p-4 bg-sand-50 rounded-lg">
              <h3 className="font-medium text-sand-800 mb-2">Firestore-Daten</h3>
              {firestoreStats ? (
                <>
                  <p className="text-sm text-sand-600">
                    {firestoreStats.sessions} Stunden, {firestoreStats.exercises} Übungen
                  </p>
                  <p className="text-xs text-sand-500 mt-1">
                    {firestoreStats.sessions > 0 ? 'Bereit zur Nutzung' : 'Noch nicht migriert'}
                  </p>
                </>
              ) : (
                <p className="text-sm text-sand-600">Lädt...</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-wrap gap-4">
            {/* Migration Button */}
            <div className="flex-1 min-w-[250px] p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 mb-3">
                {firestoreStats && firestoreStats.sessions === 0
                  ? 'Lokale Daten nach Firestore migrieren.'
                  : 'Migration erneut ausführen.'}
              </p>
              <button
                onClick={handleMigration}
                disabled={migrating}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                {migrating ? 'Migriere...' : firestoreStats && firestoreStats.sessions > 0 ? 'Erneut migrieren' : 'Daten migrieren'}
              </button>
            </div>

            {/* Export Button */}
            <div className="flex-1 min-w-[250px] p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-3">
                Alle Firestore-Daten als ZIP exportieren.
              </p>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                {exporting ? 'Exportiere...' : 'Backup erstellen'}
              </button>
            </div>
          </div>

          {/* Export Result */}
          {exportResult && (
            <div className={`mt-4 p-4 rounded-lg ${exportResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              {exportResult.success ? (
                <>
                  <p className="font-medium text-green-800">Export erfolgreich!</p>
                  <p className="text-sm text-green-700 mt-1">
                    {exportResult.collections.map(c => `${c.count} ${c.name}`).join(', ')}
                  </p>
                </>
              ) : (
                <p className="text-red-800">Fehler: {exportResult.error}</p>
              )}
            </div>
          )}

          {/* Migration Result */}
          {migrationResult && (
            <div className={`mt-4 p-4 rounded-lg ${migrationResult.errors.length > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              <h4 className="font-medium mb-2">
                {migrationResult.errors.length > 0 ? 'Migration mit Fehlern abgeschlossen' : 'Migration erfolgreich!'}
              </h4>
              <p className="text-sm">
                {migrationResult.sessions} Stunden und {migrationResult.exercises} Übungen migriert.
              </p>
              {migrationResult.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="text-sm text-red-600 cursor-pointer">
                    {migrationResult.errors.length} Fehler anzeigen
                  </summary>
                  <ul className="mt-2 text-xs text-red-600 list-disc list-inside">
                    {migrationResult.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  link?: string;
  color: 'sage' | 'sand' | 'terracotta';
}

function StatCard({ title, value, subtitle, link, color }: StatCardProps): JSX.Element {
  const colorClasses = {
    sage: 'bg-sage-50 border-sage-200',
    sand: 'bg-sand-50 border-sand-200',
    terracotta: 'bg-terracotta-50 border-terracotta-200',
  };

  const content = (
    <div className={`p-6 rounded-xl border ${colorClasses[color]} transition-shadow hover:shadow-md`}>
      <p className="text-sm font-medium text-sage-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-sage-900">{value}</p>
      <p className="mt-1 text-sm text-sage-600">{subtitle}</p>
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }

  return content;
}

interface QuickActionProps {
  to: string;
  title: string;
  description: string;
  icon: string;
}

function QuickAction({ to, title, description, icon }: QuickActionProps): JSX.Element {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 p-4 bg-sage-50 rounded-lg hover:bg-sage-100 transition-colors group"
    >
      <div className="w-10 h-10 flex items-center justify-center bg-sage-200 rounded-lg text-sage-700 font-bold group-hover:bg-sage-300 transition-colors">
        {icon}
      </div>
      <div>
        <p className="font-medium text-sage-800">{title}</p>
        <p className="text-sm text-sage-600">{description}</p>
      </div>
    </Link>
  );
}
