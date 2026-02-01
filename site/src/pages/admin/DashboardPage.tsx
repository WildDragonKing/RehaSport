import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useContent } from "../../contexts/ContentContext";
import { hasFirestoreData } from "../../firebase/migration";
import { exportFirestoreData, type ExportResult } from "../../firebase/export";

export default function DashboardPage(): JSX.Element {
  const { user, isAdmin } = useAuth();
  const { categories, sessions, exercises, isFirestoreAvailable } =
    useContent();

  const [firestoreStats, setFirestoreStats] = useState<{
    sessions: number;
    exercises: number;
  } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);

  useEffect(() => {
    const checkFirestore = async () => {
      const stats = await hasFirestoreData();
      setFirestoreStats(stats);
    };
    checkFirestore();
  }, []);

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
        error: error instanceof Error ? error.message : "Unbekannter Fehler",
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
          Willkommen, {user?.displayName || user?.email?.split("@")[0]}!
        </h1>
        <p className="mt-2 text-sage-600 dark:text-sage-300">
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
          subtitle={isFirestoreAvailable ? "verbunden" : "nicht verfügbar"}
          color="terracotta"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-sage-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-sage-900 mb-4">
          Schnellaktionen
        </h2>
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

      {/* Admin Tools */}
      {isAdmin && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-sage-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-sage-900 mb-4">
            Admin-Tools
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Firestore Status */}
            <div className="p-4 bg-sage-50 dark:bg-gray-900 rounded-lg">
              <h3 className="font-medium text-sage-800 dark:text-sage-100 mb-2">
                Firestore-Datenbank
              </h3>
              {firestoreStats ? (
                <>
                  <p className="text-sm text-sage-600 dark:text-sage-300">
                    {firestoreStats.sessions} Stunden,{" "}
                    {firestoreStats.exercises} Übungen
                  </p>
                  <p className="text-xs text-sage-500 dark:text-sage-400 mt-1">
                    {isFirestoreAvailable ? "Verbunden" : "Nicht verfügbar"}
                  </p>
                </>
              ) : (
                <p className="text-sm text-sage-600 dark:text-sage-300">
                  Lädt...
                </p>
              )}
            </div>

            {/* Export */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">
                Backup erstellen
              </h3>
              <p className="text-sm text-blue-700 mb-3">
                Alle Daten als ZIP exportieren.
              </p>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
              >
                {exporting ? "Exportiere..." : "Backup erstellen"}
              </button>
            </div>
          </div>

          {/* Export Result */}
          {exportResult && (
            <div
              className={`mt-4 p-4 rounded-lg ${exportResult.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
            >
              {exportResult.success ? (
                <>
                  <p className="font-medium text-green-800">
                    Export erfolgreich!
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    {exportResult.collections
                      .map((c) => `${c.count} ${c.name}`)
                      .join(", ")}
                  </p>
                </>
              ) : (
                <p className="text-red-800">Fehler: {exportResult.error}</p>
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
  color: "sage" | "sand" | "terracotta";
}

function StatCard({
  title,
  value,
  subtitle,
  link,
  color,
}: StatCardProps): JSX.Element {
  const colorClasses = {
    sage: "bg-sage-50 dark:bg-gray-900 border-sage-200 dark:border-gray-700",
    sand: "bg-sand-50 dark:bg-gray-900 border-sand-200 dark:border-gray-700",
    terracotta:
      "bg-terracotta-50 dark:bg-gray-900 border-terracotta-200 dark:border-gray-700",
  };

  const content = (
    <div
      className={`p-6 rounded-xl border ${colorClasses[color]} transition-shadow hover:shadow-md`}
    >
      <p className="text-sm font-medium text-sage-500 dark:text-sage-400">
        {title}
      </p>
      <p className="mt-2 text-3xl font-bold text-sage-900">{value}</p>
      <p className="mt-1 text-sm text-sage-600 dark:text-sage-300">
        {subtitle}
      </p>
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

function QuickAction({
  to,
  title,
  description,
  icon,
}: QuickActionProps): JSX.Element {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 p-4 bg-sage-50 dark:bg-gray-900 rounded-lg hover:bg-sage-100 dark:hover:bg-gray-700 transition-colors group"
    >
      <div className="w-10 h-10 flex items-center justify-center bg-sage-200 rounded-lg text-sage-700 font-bold group-hover:bg-sage-300 transition-colors">
        {icon}
      </div>
      <div>
        <p className="font-medium text-sage-800 dark:text-sage-100">{title}</p>
        <p className="text-sm text-sage-600 dark:text-sage-300">
          {description}
        </p>
      </div>
    </Link>
  );
}
