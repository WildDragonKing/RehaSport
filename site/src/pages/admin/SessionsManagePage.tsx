import { useState } from 'react';
import { Link } from 'react-router-dom';
import { httpsCallable } from 'firebase/functions';
import { doc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useContent } from '../../contexts/ContentContext';
import { useAuth } from '../../contexts/AuthContext';
import { functions, db } from '../../firebase/config';
import type { Session } from '../../firebase/types';

interface AIEditRequest {
  action: 'improve' | 'updateRules' | 'regenerate';
  sessionId: string;
  instructions?: string;
}

export default function SessionsManagePage(): JSX.Element {
  const { sessions, categories, exercises, refresh } = useContent();
  const { user } = useAuth();

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiAction, setAIAction] = useState<'improve' | 'updateRules' | 'regenerate'>('improve');
  const [aiInstructions, setAIInstructions] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usedModel, setUsedModel] = useState<string | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });

  const openAIEditor = (session: Session, action: 'improve' | 'updateRules' | 'regenerate') => {
    setSelectedSession(session);
    setAIAction(action);
    setAIInstructions('');
    setError(null);
    setUsedModel(null);
    setShowAIModal(true);
  };

  const handleAIEdit = async () => {
    if (!selectedSession || !user) return;

    setProcessing(true);
    setError(null);

    try {
      const generateSession = httpsCallable(functions, 'generateSession');

      let prompt = '';
      if (aiAction === 'improve') {
        prompt = `Verbessere diese Stunde: ${selectedSession.title}. ${aiInstructions || 'Mache sie abwechslungsreicher und effektiver.'}`;
      } else if (aiAction === 'updateRules') {
        prompt = `Aktualisiere die Stunde "${selectedSession.title}" auf die aktuellen Regeln. Behalte das Thema und den Fokus bei.`;
      } else {
        prompt = `Erstelle eine komplett neue Stunde zum Thema: ${selectedSession.focus || selectedSession.title}. ${aiInstructions || ''}`;
      }

      const result = await generateSession({
        topic: selectedSession.focus || selectedSession.title,
        category: selectedSession.categorySlug,
        difficulty: 'mittel',
        additionalNotes: prompt,
        exercises: exercises.map(e => ({
          title: e.title,
          area: e.area,
          focus: e.focus,
          difficulty: e.difficulty,
          summary: e.summary,
        })),
      });

      const data = result.data as { success: boolean; session: Session; model?: string };

      if (data.success && data.session) {
        // Update the session in Firestore
        const sessionRef = doc(db, 'sessions', selectedSession.slug);
        await updateDoc(sessionRef, {
          title: data.session.title,
          description: data.session.description,
          phases: data.session.phases,
          focus: data.session.focus,
          updatedAt: Date.now(),
          updatedBy: user.id,
          updatedVia: 'ai',
        });

        setUsedModel(data.model || null);
        await refresh();

        setTimeout(() => {
          setShowAIModal(false);
          setSelectedSession(null);
        }, 2000);
      }
    } catch (err: unknown) {
      console.error('AI Edit error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
      if (errorMessage.includes('resource-exhausted')) {
        setError('Rate-Limit erreicht. Bitte warte eine Stunde.');
      } else {
        setError(`Fehler: ${errorMessage}`);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkUpdateToRules = async () => {
    if (!user || !confirm('Möchtest du wirklich ALLE Stunden auf die aktuellen Regeln aktualisieren? Dies kann nicht rückgängig gemacht werden.')) {
      return;
    }

    setBulkUpdating(true);
    setBulkProgress({ current: 0, total: sessions.length });
    setError(null);

    const generateSession = httpsCallable(functions, 'generateSession');

    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      setBulkProgress({ current: i + 1, total: sessions.length });

      try {
        const result = await generateSession({
          topic: session.focus || session.title,
          category: session.categorySlug,
          difficulty: 'mittel',
          additionalNotes: `Aktualisiere die Stunde "${session.title}" auf die aktuellen Regeln. Behalte Thema und Fokus bei.`,
          exercises: exercises.map(e => ({
            title: e.title,
            area: e.area,
            focus: e.focus,
            difficulty: e.difficulty,
            summary: e.summary,
          })),
        });

        const data = result.data as { success: boolean; session: Session };

        if (data.success && data.session) {
          const sessionRef = doc(db, 'sessions', session.slug);
          await updateDoc(sessionRef, {
            title: data.session.title,
            description: data.session.description,
            phases: data.session.phases,
            focus: data.session.focus,
            updatedAt: Date.now(),
            updatedBy: user.id,
            updatedVia: 'ai-bulk-update',
          });
        }
      } catch (err) {
        console.error(`Failed to update session ${session.title}:`, err);
        // Continue with next session
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setBulkUpdating(false);
    await refresh();
  };

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
        <div className="flex items-center gap-3">
          {user?.role === 'admin' && (
            <button
              onClick={handleBulkUpdateToRules}
              disabled={bulkUpdating || sessions.length === 0}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {bulkUpdating ? (
                `Aktualisiere ${bulkProgress.current}/${bulkProgress.total}...`
              ) : (
                '🔄 Alle auf Regeln aktualisieren'
              )}
            </button>
          )}
          <Link
            to="/admin/builder"
            className="px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-lg transition-colors"
          >
            + Neue Stunde
          </Link>
        </div>
      </div>

      {/* Sessions by Category */}
      {categories.map((category) => (
        <div key={category.slug} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-sage-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 bg-sage-50 dark:bg-gray-900 border-b border-sage-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-sage-800 dark:text-sage-100">{category.title}</h2>
            <p className="text-sm text-sage-600 dark:text-sage-300">{category.sessions.length} Stunden</p>
          </div>
          <div className="divide-y divide-sage-100">
            {category.sessions.map((session) => (
              <div key={session.slug} className="px-6 py-4 flex items-center justify-between hover:bg-sage-50 dark:hover:bg-gray-700">
                <div>
                  <Link
                    to={`/ordner/${session.categorySlug}/${session.slug}`}
                    className="font-medium text-sage-800 dark:text-sage-100 hover:text-sage-600 dark:hover:text-sage-300"
                  >
                    {session.title}
                  </Link>
                  <p className="text-sm text-sage-500 dark:text-sage-400 mt-1">
                    {session.duration} • {session.phases.length} Phasen • {session.exercises.length} Übungen
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                    Veröffentlicht
                  </span>

                  {/* KI-Actions Dropdown */}
                  <div className="relative group">
                    <button className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded transition-colors">
                      ✨
                    </button>
                    <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-sage-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <button
                        onClick={() => openAIEditor(session, 'improve')}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-sage-50 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <span>💡</span> Mit KI verbessern
                      </button>
                      <button
                        onClick={() => openAIEditor(session, 'updateRules')}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-sage-50 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <span>🔄</span> Auf Regeln aktualisieren
                      </button>
                      <button
                        onClick={() => openAIEditor(session, 'regenerate')}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-sage-50 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <span>🔮</span> Komplett neu generieren
                      </button>
                    </div>
                  </div>

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
        <div className="text-center py-12 bg-sage-50 dark:bg-gray-900 rounded-xl">
          <p className="text-sage-600 dark:text-sage-300">Noch keine Stunden vorhanden.</p>
          <Link
            to="/admin/builder"
            className="mt-4 inline-block text-sage-700 hover:text-sage-900 font-medium"
          >
            Erste Stunde erstellen →
          </Link>
        </div>
      )}

      {/* AI Editor Modal */}
      {showAIModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-sage-900">
                {aiAction === 'improve' && '💡 Stunde verbessern'}
                {aiAction === 'updateRules' && '🔄 Auf Regeln aktualisieren'}
                {aiAction === 'regenerate' && '🔮 Neu generieren'}
              </h2>
              <button
                onClick={() => setShowAIModal(false)}
                className="text-sage-400 hover:text-sage-600"
              >
                ✕
              </button>
            </div>

            <p className="text-sage-600 dark:text-sage-300 mb-4">
              <strong>{selectedSession.title}</strong>
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {usedModel && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-green-700 text-sm">
                  ✓ Erfolgreich aktualisiert mit {usedModel.includes('gemini-3') ? 'Gemini 3 Flash' : 'Gemini 2.5 Flash'}
                </p>
              </div>
            )}

            {aiAction !== 'updateRules' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-sage-700 dark:text-sage-300 mb-2">
                  Anweisungen (optional)
                </label>
                <textarea
                  value={aiInstructions}
                  onChange={(e) => setAIInstructions(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-sage-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 dark:bg-gray-700 dark:text-sage-100"
                  placeholder={
                    aiAction === 'improve'
                      ? 'z.B. Mehr Übungen für den unteren Rücken, weniger Bodenübungen...'
                      : 'z.B. Fokus auf Balance, Schwierigkeit erhöhen...'
                  }
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAIModal(false)}
                className="px-4 py-2 text-sage-600 dark:text-sage-300 hover:text-sage-800 dark:hover:text-sage-100"
              >
                Abbrechen
              </button>
              <button
                onClick={handleAIEdit}
                disabled={processing}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {processing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generiere...
                  </>
                ) : (
                  <>
                    ✨ {aiAction === 'improve' ? 'Verbessern' : aiAction === 'updateRules' ? 'Aktualisieren' : 'Generieren'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
