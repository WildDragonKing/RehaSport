import { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useContent } from '../../contexts/ContentContext';
import { functions, db } from '../../firebase/config';

interface RateLimitStatus {
  used: number;
  remaining: number;
  total: number;
  resetsAt: number | null;
}

type BuilderMode = 'full' | 'suggest';

interface GeneratedExercise {
  title: string;
  duration: string;
  repetitions?: string;
  description: string;
  kneeAlternative?: string;
  shoulderAlternative?: string;
}

interface GeneratedPhase {
  title: string;
  duration: string;
  exercises: GeneratedExercise[];
}

interface GeneratedSession {
  title: string;
  description: string;
  duration: string;
  focus: string;
  category: string;
  phases: GeneratedPhase[];
}

interface ExerciseSuggestion {
  title: string;
  reason: string;
  matchScore: number;
}

export default function BuilderPage(): JSX.Element {
  const { user } = useAuth();
  const { categories, exercises, refresh } = useContent();

  const [mode, setMode] = useState<BuilderMode>('full');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('mittel');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Results
  const [generatedSession, setGeneratedSession] = useState<GeneratedSession | null>(null);
  const [suggestions, setSuggestions] = useState<ExerciseSuggestion[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [usedModel, setUsedModel] = useState<string | null>(null);

  // Rate limit status
  const [rateLimit, setRateLimit] = useState<RateLimitStatus | null>(null);

  const fetchRateLimit = async () => {
    try {
      const getRateLimitStatus = httpsCallable(functions, 'getRateLimitStatus');
      const result = await getRateLimitStatus({});
      setRateLimit(result.data as RateLimitStatus);
    } catch (err) {
      console.error('Failed to fetch rate limit:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRateLimit();
    }
  }, [user]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setGenerating(true);
    setError(null);
    setGeneratedSession(null);
    setSuggestions(null);

    try {
      if (mode === 'full') {
        const generateSession = httpsCallable(functions, 'generateSession');
        const result = await generateSession({
          topic,
          category: selectedCategory || topic,
          difficulty,
          additionalNotes,
          exercises: exercises.map(e => ({
            title: e.title,
            area: e.area,
            focus: e.focus,
            difficulty: e.difficulty,
            summary: e.summary,
          })),
        });

        const data = result.data as { success: boolean; session: GeneratedSession; model?: string };
        if (data.success && data.session) {
          setGeneratedSession(data.session);
          setUsedModel(data.model || null);
        }
      } else {
        const suggestExercises = httpsCallable(functions, 'suggestExercises');
        const result = await suggestExercises({
          topic,
          difficulty,
          additionalNotes,
          exercises: exercises.map(e => ({
            title: e.title,
            area: e.area,
            focus: e.focus,
            difficulty: e.difficulty,
            summary: e.summary,
          })),
        });

        const data = result.data as { success: boolean; suggestions: ExerciseSuggestion[]; model?: string };
        if (data.success && data.suggestions) {
          setSuggestions(data.suggestions);
          setUsedModel(data.model || null);
        }
      }
    } catch (err: unknown) {
      console.error('Generation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
      if (errorMessage.includes('resource-exhausted')) {
        setError('Rate-Limit erreicht. Bitte warte eine Stunde und versuche es erneut.');
        fetchRateLimit(); // Refresh rate limit display
      } else if (errorMessage.includes('unauthenticated')) {
        setError('Bitte melde dich an, um die KI zu nutzen.');
      } else {
        setError(`Fehler: ${errorMessage}`);
      }
    } finally {
      setGenerating(false);
      fetchRateLimit(); // Always refresh rate limit after attempt
    }
  };

  const handleSaveAsDraft = async () => {
    if (!generatedSession || !user?.id) return;

    setSaving(true);
    try {
      await addDoc(collection(db, 'drafts'), {
        ...generatedSession,
        categorySlug: selectedCategory || topic,
        categoryTitle: categories.find(c => c.slug === selectedCategory)?.title || topic,
        status: 'pending',
        createdBy: user.id,
        createdVia: 'ai',
        createdAt: Date.now(),
      });

      alert('Entwurf gespeichert! Ein Admin muss ihn freigeben.');
      setGeneratedSession(null);
      await refresh();
    } catch (err) {
      console.error('Save error:', err);
      setError('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-sage-900">
          KI-Stunden-Builder
        </h1>
        <p className="mt-2 text-sage-600 dark:text-sage-300">
          Erstelle neue Trainingsstunden mit Hilfe von KI oder lass dir passende Übungen vorschlagen.
        </p>
      </div>

      {/* Rate Limit Display */}
      {rateLimit && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-sage-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚡</div>
            <div>
              <p className="text-sm font-medium text-sage-700">KI-Anfragen</p>
              <p className="text-xs text-sage-500 dark:text-sage-400">
                {rateLimit.resetsAt ? (
                  `Reset in ${Math.ceil((rateLimit.resetsAt - Date.now()) / 60000)} Min.`
                ) : (
                  'Voll verfügbar'
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: rateLimit.total }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-6 rounded-sm ${
                    i < rateLimit.remaining
                      ? 'bg-green-500'
                      : 'bg-sage-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-sage-700 ml-2">
              {rateLimit.remaining}/{rateLimit.total}
            </span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Mode Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-sage-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-sage-900 mb-4">Was möchtest du erstellen?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setMode('full')}
            className={`p-6 rounded-xl border-2 text-left transition-colors ${
              mode === 'full'
                ? 'border-sage-500 bg-sage-50 dark:bg-gray-900'
                : 'border-sage-200 dark:border-gray-700 hover:border-sage-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-semibold text-sage-800 dark:text-sage-100">Komplette Stunde</h3>
            <p className="mt-1 text-sm text-sage-600 dark:text-sage-300">
              KI generiert eine vollständige 45-Minuten-Stunde
            </p>
          </button>

          <button
            onClick={() => setMode('suggest')}
            className={`p-6 rounded-xl border-2 text-left transition-colors ${
              mode === 'suggest'
                ? 'border-sage-500 bg-sage-50 dark:bg-gray-900'
                : 'border-sage-200 dark:border-gray-700 hover:border-sage-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="text-2xl mb-2">🔍</div>
            <h3 className="font-semibold text-sage-800 dark:text-sage-100">Übungen vorschlagen</h3>
            <p className="mt-1 text-sm text-sage-600 dark:text-sage-300">
              KI schlägt passende Übungen aus der Bibliothek vor
            </p>
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-sage-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-sage-900 mb-4">
          {mode === 'full' ? 'Stunde konfigurieren' : 'Übungen suchen'}
        </h2>

        <div className="space-y-6">
          {/* Topic */}
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-sage-700 mb-2">
              Thema / Fokus
            </label>
            <select
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-3 border border-sage-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 dark:bg-gray-700 dark:text-sage-100"
            >
              <option value="">Thema wählen...</option>
              <option value="ruecken">Rückengesundheit</option>
              <option value="balance">Balance & Sturzprophylaxe</option>
              <option value="schulter">Schulter-Mobilität</option>
              <option value="knie-huefte">Knie & Hüfte</option>
              <option value="ganzkoerper">Ganzkörperkräftigung</option>
              <option value="herz-kreislauf">Herz-Kreislauf</option>
              <option value="sitzgymnastik">Sitzgymnastik</option>
            </select>
          </div>

          {/* Category (for full mode) */}
          {mode === 'full' && (
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-sage-700 mb-2">
                Kategorie für die Stunde
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 border border-sage-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 dark:bg-gray-700 dark:text-sage-100"
              >
                <option value="">Kategorie wählen...</option>
                {categories.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-2">
              Schwierigkeit
            </label>
            <div className="flex gap-4">
              {['leicht', 'mittel', 'schwer'].map((level) => (
                <label key={level} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={difficulty === level}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="text-sage-600 focus:ring-sage-500"
                  />
                  <span className="text-sm capitalize">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-sage-700 mb-2">
              Besondere Wünsche (optional)
            </label>
            <textarea
              id="notes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-sage-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 dark:bg-gray-700 dark:text-sage-100"
              placeholder="z.B. Mit Theraband, Fokus auf Tiefenmuskulatur, Keine Bodenübungen..."
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!topic || generating}
            className="w-full py-3 px-4 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generiere mit KI...
              </>
            ) : (
              <>
                ✨ {mode === 'full' ? 'Stunde generieren' : 'Übungen vorschlagen'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Session Result */}
      {generatedSession && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-sage-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-sage-900">{generatedSession.title}</h2>
              <p className="text-sage-600 dark:text-sage-300 mt-1">{generatedSession.description}</p>
            </div>
            <button
              onClick={handleSaveAsDraft}
              disabled={saving}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg disabled:opacity-50"
            >
              {saving ? 'Speichern...' : 'Als Entwurf speichern'}
            </button>
          </div>

          <div className="text-sm text-sage-500 dark:text-sage-400 mb-4 flex items-center gap-3">
            <span>{generatedSession.duration} • Fokus: {generatedSession.focus}</span>
            {usedModel && (
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                usedModel.includes('gemini-3')
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {usedModel.includes('gemini-3') ? '⚡ Gemini 3' : '💨 Gemini 2.5'}
              </span>
            )}
          </div>

          <div className="space-y-6">
            {generatedSession.phases.map((phase, phaseIndex) => (
              <div key={phaseIndex} className="border border-sage-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-sage-50 dark:bg-gray-900 px-4 py-3 border-b border-sage-200 dark:border-gray-700">
                  <h3 className="font-semibold text-sage-800 dark:text-sage-100">
                    {phase.title} <span className="font-normal text-sage-500 dark:text-sage-400">({phase.duration})</span>
                  </h3>
                </div>
                <div className="divide-y divide-sage-100">
                  {phase.exercises.map((exercise, exIndex) => (
                    <div key={exIndex} className="px-4 py-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-sage-800 dark:text-sage-100">{exercise.title}</h4>
                          <p className="text-sm text-sage-500 dark:text-sage-400">{exercise.duration}</p>
                        </div>
                      </div>
                      <p className="text-sm text-sage-600 dark:text-sage-300 mt-2">{exercise.description}</p>
                      {(exercise.kneeAlternative || exercise.shoulderAlternative) && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                          {exercise.kneeAlternative && (
                            <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded">
                              🦵 {exercise.kneeAlternative}
                            </span>
                          )}
                          {exercise.shoulderAlternative && (
                            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                              💪 {exercise.shoulderAlternative}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions Result */}
      {suggestions && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-sage-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-sage-900 mb-4">
            Empfohlene Übungen ({suggestions.length})
          </h2>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-sage-50 dark:bg-gray-900 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-sage-200 dark:bg-gray-700 rounded-lg text-sage-700 dark:text-sage-300 font-bold">
                  {suggestion.matchScore}%
                </div>
                <div>
                  <h3 className="font-medium text-sage-800 dark:text-sage-100">{suggestion.title}</h3>
                  <p className="text-sm text-sage-600 dark:text-sage-300 mt-1">{suggestion.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-sage-50 dark:bg-gray-900 rounded-xl p-6">
        <h3 className="font-medium text-sage-800 dark:text-sage-100 mb-2">Wie funktioniert der Builder?</h3>
        <ul className="text-sm text-sage-600 dark:text-sage-300 space-y-2">
          <li>• Die KI nutzt <span className="font-medium text-purple-700">Gemini 3 Flash</span> (kostenlos, hohe Qualität) mit Fallback auf <span className="font-medium text-blue-700">2.5 Flash</span></li>
          <li>• Alle {exercises.length} Übungen aus der Bibliothek sind der KI bekannt</li>
          <li>• Jede generierte Stunde folgt dem konfigurierten Schema</li>
          <li>• Alternativen für Knie- und Schulterbeschwerden werden automatisch vorgeschlagen</li>
          <li>• Generierte Stunden werden als Entwurf gespeichert und müssen freigegeben werden</li>
          <li>• Rate-Limit: 10 Anfragen pro Stunde</li>
        </ul>
      </div>
    </div>
  );
}
