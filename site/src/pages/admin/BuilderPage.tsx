import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useContent } from '../../contexts/ContentContext';

type BuilderMode = 'full' | 'suggest';

export default function BuilderPage(): JSX.Element {
  const { user } = useAuth();
  const { categories, exercises } = useContent();

  const [mode, setMode] = useState<BuilderMode>('full');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('mittel');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setGenerating(true);
    // TODO: Call Gemini API via Cloud Function
    setTimeout(() => {
      setGenerating(false);
      alert('KI-Integration kommt in Phase 5! Die Grundstruktur steht.');
    }, 1500);
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-sage-900">
          KI-Stunden-Builder
        </h1>
        <p className="mt-2 text-sage-600">
          Erstelle neue Trainingsstunden mit Hilfe von KI oder lass dir passende Übungen vorschlagen.
        </p>
      </div>

      {/* Mode Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-sage-200 p-6">
        <h2 className="text-lg font-semibold text-sage-900 mb-4">Was möchtest du erstellen?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setMode('full')}
            className={`p-6 rounded-xl border-2 text-left transition-colors ${
              mode === 'full'
                ? 'border-sage-500 bg-sage-50'
                : 'border-sage-200 hover:border-sage-300'
            }`}
          >
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-semibold text-sage-800">Komplette Stunde</h3>
            <p className="mt-1 text-sm text-sage-600">
              KI generiert eine vollständige 45-Minuten-Stunde
            </p>
          </button>

          <button
            onClick={() => setMode('suggest')}
            className={`p-6 rounded-xl border-2 text-left transition-colors ${
              mode === 'suggest'
                ? 'border-sage-500 bg-sage-50'
                : 'border-sage-200 hover:border-sage-300'
            }`}
          >
            <div className="text-2xl mb-2">🔍</div>
            <h3 className="font-semibold text-sage-800">Übungen vorschlagen</h3>
            <p className="mt-1 text-sm text-sage-600">
              KI schlägt passende Übungen aus der Bibliothek vor
            </p>
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-sage-200 p-6">
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
              className="w-full px-4 py-3 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
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
                className="w-full px-4 py-3 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
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
              className="w-full px-4 py-3 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500"
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
                Generiere...
              </>
            ) : (
              <>
                ✨ {mode === 'full' ? 'Stunde generieren' : 'Übungen vorschlagen'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-sage-50 rounded-xl p-6">
        <h3 className="font-medium text-sage-800 mb-2">Wie funktioniert der Builder?</h3>
        <ul className="text-sm text-sage-600 space-y-2">
          <li>• Die KI kennt alle {exercises.length} Übungen aus der Bibliothek</li>
          <li>• Jede generierte Stunde folgt dem 45-Minuten-Schema (10-15-15-5)</li>
          <li>• Alternativen für Knie- und Schulterbeschwerden werden automatisch berücksichtigt</li>
          <li>• Generierte Stunden werden als Entwurf gespeichert und müssen freigegeben werden</li>
        </ul>
      </div>
    </div>
  );
}
