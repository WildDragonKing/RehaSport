import { Link } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';

export default function SessionsManagePage(): JSX.Element {
  const { sessions, categories } = useContent();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-sage-900">
            Meine Stunden
          </h1>
          <p className="mt-2 text-sage-600">
            Verwalte deine Trainingsstunden
          </p>
        </div>
        <Link
          to="/admin/builder"
          className="px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-lg transition-colors"
        >
          + Neue Stunde
        </Link>
      </div>

      {/* Sessions by Category */}
      {categories.map((category) => (
        <div key={category.slug} className="bg-white rounded-xl shadow-sm border border-sage-200 overflow-hidden">
          <div className="px-6 py-4 bg-sage-50 border-b border-sage-200">
            <h2 className="text-lg font-semibold text-sage-800">{category.title}</h2>
            <p className="text-sm text-sage-600">{category.sessions.length} Stunden</p>
          </div>
          <div className="divide-y divide-sage-100">
            {category.sessions.map((session) => (
              <div key={session.slug} className="px-6 py-4 flex items-center justify-between hover:bg-sage-50">
                <div>
                  <Link
                    to={`/ordner/${session.categorySlug}/${session.slug}`}
                    className="font-medium text-sage-800 hover:text-sage-600"
                  >
                    {session.title}
                  </Link>
                  <p className="text-sm text-sage-500 mt-1">
                    {session.duration} • {session.phases.length} Phasen • {session.exercises.length} Übungen
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                    Veröffentlicht
                  </span>
                  <button className="p-2 text-sage-400 hover:text-sage-600 transition-colors">
                    ✏️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {sessions.length === 0 && (
        <div className="text-center py-12 bg-sage-50 rounded-xl">
          <p className="text-sage-600">Noch keine Stunden vorhanden.</p>
          <Link
            to="/admin/builder"
            className="mt-4 inline-block text-sage-700 hover:text-sage-900 font-medium"
          >
            Erste Stunde erstellen →
          </Link>
        </div>
      )}
    </div>
  );
}
