import { useState, useEffect } from "react";
import { getAnalyticsData, type AnalyticsData } from "../../hooks/useAnalytics";
import { useAuth } from "../../contexts/AuthContext";

export default function AnalyticsPage(): JSX.Element {
  const { isAdmin } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const analytics = await getAnalyticsData();
      setData(analytics);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-sage-600 dark:text-sage-400">
          Nur Administratoren können Analytics einsehen.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600 dark:border-sage-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-sage-900 dark:text-sage-50">
          Analytics
        </h1>
        <p className="mt-2 text-sage-600 dark:text-sage-300">
          Statistiken und Nutzungsdaten
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Seitenaufrufe"
          value={data?.totalViews || 0}
          icon="👁️"
          color="sage"
        />
        <StatCard
          title="Bewertungen"
          value={data?.totalRatings || 0}
          icon="⭐"
          color="amber"
        />
        <StatCard
          title="Top-Stunden"
          value={data?.topSessions?.length || 0}
          icon="📚"
          color="blue"
        />
        <StatCard
          title="Top-Übungen"
          value={data?.topExercises?.length || 0}
          icon="💪"
          color="green"
        />
      </div>

      {/* Top Sessions */}
      <div className="bg-white dark:bg-sage-900 rounded-xl shadow-sm border border-sage-200 dark:border-sage-800 p-6">
        <h2 className="text-lg font-semibold text-sage-900 dark:text-sage-50 mb-4">
          Beliebteste Stunden
        </h2>
        {data?.topSessions && data.topSessions.length > 0 ? (
          <div className="space-y-3">
            {data.topSessions.map((session, index) => (
              <div
                key={session.id}
                className="flex items-center justify-between py-2 border-b border-sage-100 dark:border-sage-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-sage-100 dark:bg-sage-800 text-sage-600 dark:text-sage-300 text-sm font-medium rounded">
                    {index + 1}
                  </span>
                  <span className="text-sage-800 dark:text-sage-100">
                    {session.title}
                  </span>
                </div>
                <span className="text-sage-500 dark:text-sage-400">
                  {session.views} Aufrufe
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sage-500 dark:text-sage-400">
            Noch keine Daten vorhanden.
          </p>
        )}
      </div>

      {/* Top Exercises */}
      <div className="bg-white dark:bg-sage-900 rounded-xl shadow-sm border border-sage-200 dark:border-sage-800 p-6">
        <h2 className="text-lg font-semibold text-sage-900 dark:text-sage-50 mb-4">
          Beliebteste Übungen
        </h2>
        {data?.topExercises && data.topExercises.length > 0 ? (
          <div className="space-y-3">
            {data.topExercises.map((exercise, index) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between py-2 border-b border-sage-100 dark:border-sage-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-sm font-medium rounded">
                    {index + 1}
                  </span>
                  <span className="text-sage-800 dark:text-sage-100">
                    {exercise.title}
                  </span>
                </div>
                <span className="text-sage-500 dark:text-sage-400">
                  {exercise.views} Aufrufe
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sage-500 dark:text-sage-400">
            Noch keine Daten vorhanden.
          </p>
        )}
      </div>

      {/* Recent Activity Chart */}
      {data?.recentActivity && data.recentActivity.length > 0 && (
        <div className="bg-white dark:bg-sage-900 rounded-xl shadow-sm border border-sage-200 dark:border-sage-800 p-6">
          <h2 className="text-lg font-semibold text-sage-900 dark:text-sage-50 mb-4">
            Aktivität (letzte 30 Tage)
          </h2>
          <div className="h-48 flex items-end gap-1">
            {data.recentActivity
              .slice()
              .reverse()
              .map((day) => {
                const maxViews = Math.max(
                  ...data.recentActivity.map((d) => d.views),
                  1,
                );
                const height = (day.views / maxViews) * 100;
                return (
                  <div
                    key={day.date}
                    className="flex-1 bg-sage-200 dark:bg-sage-700 hover:bg-sage-300 dark:hover:bg-sage-600 transition-colors rounded-t cursor-pointer group relative"
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${day.date}: ${day.views} Aufrufe`}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-sage-800 dark:bg-sage-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                      {day.date}: {day.views}
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-sage-500 dark:text-sage-400">
            <span>
              {data.recentActivity[data.recentActivity.length - 1]?.date}
            </span>
            <span>{data.recentActivity[0]?.date}</span>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-sage-50 dark:bg-sage-950 rounded-xl border border-sage-200 dark:border-sage-800 p-4">
        <p className="text-sm text-sage-600 dark:text-sage-300">
          💡 Analytics werden automatisch gesammelt, wenn Besucher Stunden oder
          Übungen aufrufen. Die Daten werden anonymisiert gespeichert.
        </p>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: "sage" | "amber" | "blue" | "green";
}

function StatCard({ title, value, icon, color }: StatCardProps): JSX.Element {
  const colorClasses = {
    sage: "bg-sage-50 dark:bg-sage-900 border-sage-200 dark:border-sage-800",
    amber:
      "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800",
    blue: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
    green:
      "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
  };

  return (
    <div className={`p-6 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-sage-900 dark:text-sage-50">
        {value.toLocaleString("de-DE")}
      </p>
      <p className="text-sm text-sage-600 dark:text-sage-300 mt-1">{title}</p>
    </div>
  );
}
