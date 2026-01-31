import { useAuth } from '../../contexts/AuthContext';

interface Draft {
  id: string;
  title: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: Date;
}

export default function DraftsPage(): JSX.Element {
  const { isAdmin } = useAuth();

  // Placeholder data - will be loaded from Firestore
  const drafts: Draft[] = [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-sage-900">
          Entwürfe
        </h1>
        <p className="mt-2 text-sage-600">
          {isAdmin
            ? 'Prüfe und genehmige Stunden-Entwürfe von Trainern'
            : 'Deine KI-generierten Stunden-Entwürfe'}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-sage-200">
        <button className="px-4 py-2 text-sage-800 border-b-2 border-sage-600 font-medium">
          Ausstehend
        </button>
        <button className="px-4 py-2 text-sage-500 hover:text-sage-700">
          Genehmigt
        </button>
        <button className="px-4 py-2 text-sage-500 hover:text-sage-700">
          Abgelehnt
        </button>
      </div>

      {/* Drafts List */}
      {drafts.length > 0 ? (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="bg-white rounded-xl shadow-sm border border-sage-200 p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-sage-800">{draft.title}</h3>
                  <p className="text-sm text-sage-500 mt-1">
                    Kategorie: {draft.category} • Erstellt: {draft.createdAt.toLocaleDateString('de')}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    draft.status === 'pending'
                      ? 'bg-amber-100 text-amber-700'
                      : draft.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {draft.status === 'pending'
                    ? 'Ausstehend'
                    : draft.status === 'approved'
                    ? 'Genehmigt'
                    : 'Abgelehnt'}
                </span>
              </div>

              {draft.status === 'pending' && (
                <div className="mt-4 flex gap-3">
                  <button className="px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Vorschau
                  </button>
                  {isAdmin && (
                    <>
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                        Genehmigen
                      </button>
                      <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
                        Ablehnen
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-sage-50 rounded-xl">
          <p className="text-sage-600">Keine Entwürfe vorhanden.</p>
          <p className="mt-2 text-sm text-sage-500">
            Entwürfe erscheinen hier, wenn du mit dem KI-Builder eine Stunde generierst.
          </p>
        </div>
      )}
    </div>
  );
}
