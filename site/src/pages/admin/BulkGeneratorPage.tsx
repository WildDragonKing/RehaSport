import { useState, useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "../../firebase/config";
import { useAuth } from "../../contexts/AuthContext";

interface GenerationIdea {
  title: string;
  summary: string;
  area?: string;
  focus?: string;
  difficulty?: string;
  selected?: boolean;
}

interface GenerationJob {
  id: string;
  type: "exercise" | "session";
  status: "pending" | "processing" | "completed" | "failed";
  userPrompt: string;
  ideas: GenerationIdea[];
  totalCount: number;
  completedCount: number;
  generatedIds: string[];
  errors: { index: number; message: string }[];
  createdAt: { seconds: number };
  completedAt?: { seconds: number };
}

export default function BulkGeneratorPage(): JSX.Element {
  const { user } = useAuth();
  const [type, setType] = useState<"exercise" | "session">("exercise");
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(5);
  const [ideas, setIdeas] = useState<GenerationIdea[]>([]);
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [generating, setGenerating] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  // Load user's jobs on mount
  useEffect(() => {
    if (user) {
      loadJobs();
    }
  }, [user]);

  // Poll for job updates
  useEffect(() => {
    const activeJobs = jobs.filter(
      (j) => j.status === "pending" || j.status === "processing",
    );
    if (activeJobs.length === 0) return;

    const interval = setInterval(() => {
      loadJobs();
    }, 3000);

    return () => clearInterval(interval);
  }, [jobs]);

  const loadJobs = async () => {
    try {
      const getUserJobs = httpsCallable<unknown, { jobs: GenerationJob[] }>(
        functions,
        "getUserJobs",
      );
      const result = await getUserJobs({});
      setJobs(result.data.jobs);
    } catch (err) {
      console.error("Failed to load jobs:", err);
    }
  };

  const handleGenerateIdeas = async () => {
    if (!prompt.trim()) {
      setError("Bitte gib eine Idee ein");
      return;
    }

    setGenerating(true);
    setError("");
    setIdeas([]);

    try {
      const generateIdeas = httpsCallable<
        { prompt: string; type: string; count: number },
        { ideas: GenerationIdea[] }
      >(functions, "generateIdeas");

      const result = await generateIdeas({ prompt, type, count });
      setIdeas(result.data.ideas.map((idea) => ({ ...idea, selected: true })));
    } catch (err) {
      console.error("Generate ideas error:", err);
      setError("Ideen-Generierung fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setGenerating(false);
    }
  };

  const toggleIdea = (index: number) => {
    setIdeas((prev) =>
      prev.map((idea, i) =>
        i === index ? { ...idea, selected: !idea.selected } : idea,
      ),
    );
  };

  const handleStartGeneration = async () => {
    const selectedIdeas = ideas.filter((i) => i.selected);
    if (selectedIdeas.length === 0) {
      setError("Bitte wähle mindestens eine Idee aus");
      return;
    }

    setStarting(true);
    setError("");

    try {
      const startBulkGeneration = httpsCallable<
        { ideas: GenerationIdea[]; type: string; userPrompt: string },
        { jobId: string }
      >(functions, "startBulkGeneration");

      await startBulkGeneration({
        ideas: selectedIdeas,
        type,
        userPrompt: prompt,
      });

      // Clear form and reload jobs
      setIdeas([]);
      setPrompt("");
      await loadJobs();
    } catch (err: unknown) {
      console.error("Start generation error:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Generierung konnte nicht gestartet werden";
      setError(message);
    } finally {
      setStarting(false);
    }
  };

  const selectedCount = ideas.filter((i) => i.selected).length;
  const activeJob = jobs.find(
    (j) => j.status === "pending" || j.status === "processing",
  );

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-sage-900 dark:text-sage-100">
          Bulk Generator
        </h1>
        <p className="mt-2 text-sage-600 dark:text-sage-300">
          Generiere mehrere Übungen oder Stunden auf einmal im Hintergrund.
        </p>
      </div>

      {/* Active Job Warning */}
      {activeJob && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <p className="text-amber-800 dark:text-amber-200">
            ⏳ Du hast einen aktiven Job. Bitte warte bis dieser fertig ist
            bevor du einen neuen startest.
          </p>
        </div>
      )}

      {/* Type Selection */}
      <div className="bg-white dark:bg-sage-900 rounded-xl shadow-sm border border-sage-200 dark:border-sage-800 p-6">
        <h2 className="text-lg font-semibold text-sage-900 dark:text-sage-100 mb-4">
          Was möchtest du generieren?
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setType("exercise")}
            disabled={!!activeJob}
            className={`p-4 rounded-xl border-2 text-left transition-colors disabled:opacity-50 ${
              type === "exercise"
                ? "border-lime-500 bg-lime-50 dark:bg-lime-900/20"
                : "border-sage-200 dark:border-sage-800 hover:border-sage-300 dark:hover:border-gray-600"
            }`}
          >
            <div className="text-2xl mb-2">🏋️</div>
            <h3 className="font-semibold text-sage-800 dark:text-sage-100">
              Übungen
            </h3>
            <p className="text-sm text-sage-600 dark:text-sage-300">
              Neue Übungen für die Bibliothek
            </p>
          </button>

          <button
            onClick={() => setType("session")}
            disabled={!!activeJob}
            className={`p-4 rounded-xl border-2 text-left transition-colors disabled:opacity-50 ${
              type === "session"
                ? "border-lime-500 bg-lime-50 dark:bg-lime-900/20"
                : "border-sage-200 dark:border-sage-800 hover:border-sage-300 dark:hover:border-gray-600"
            }`}
          >
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-semibold text-sage-800 dark:text-sage-100">
              Stunden
            </h3>
            <p className="text-sm text-sage-600 dark:text-sage-300">
              Komplette Trainingsstunden
            </p>
          </button>
        </div>
      </div>

      {/* Idea Input */}
      <div className="bg-white dark:bg-sage-900 rounded-xl shadow-sm border border-sage-200 dark:border-sage-800 p-6">
        <h2 className="text-lg font-semibold text-sage-900 dark:text-sage-100 mb-4">
          Idee eingeben
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-sage-700 dark:text-sage-300 mb-2">
              Thema / Beschreibung
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              disabled={!!activeJob}
              placeholder={
                type === "exercise"
                  ? "z.B. Schulterübungen für Senioren mit eingeschränkter Beweglichkeit"
                  : "z.B. Rückenstunde mit Fokus auf Stabilisation und Kräftigung"
              }
              className="w-full px-4 py-3 border border-sage-300 dark:border-sage-700 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 dark:bg-sage-800 dark:text-sage-100 disabled:opacity-50"
            />
          </div>

          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-sage-700 dark:text-sage-300 mb-2">
                Anzahl
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                disabled={!!activeJob}
                className="px-4 py-2 border border-sage-300 dark:border-sage-700 rounded-lg focus:ring-2 focus:ring-lime-500 focus:border-lime-500 dark:bg-sage-800 dark:text-sage-100 disabled:opacity-50"
              >
                {[3, 5, 7, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} Ideen
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerateIdeas}
              disabled={generating || !prompt.trim() || !!activeJob}
              className="mt-6 px-6 py-2 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              {generating ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Generiere...
                </>
              ) : (
                <>✨ Ideen generieren</>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Generated Ideas */}
      {ideas.length > 0 && (
        <div className="bg-white dark:bg-sage-900 rounded-xl shadow-sm border border-sage-200 dark:border-sage-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-sage-900 dark:text-sage-100">
              Generierte Ideen ({ideas.length})
            </h2>
            <span className="text-sm text-sage-500 dark:text-sage-400">
              {selectedCount} ausgewählt
            </span>
          </div>

          <div className="space-y-3">
            {ideas.map((idea, index) => (
              <label
                key={index}
                className={`flex items-start gap-4 p-4 rounded-lg cursor-pointer transition-colors ${
                  idea.selected
                    ? "bg-lime-50 dark:bg-lime-900/20 border border-lime-200 dark:border-lime-800"
                    : "bg-sage-50 dark:bg-sage-950 border border-transparent hover:border-sage-200 dark:hover:border-gray-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={idea.selected}
                  onChange={() => toggleIdea(index)}
                  className="mt-1 w-5 h-5 rounded border-sage-300 text-lime-600 focus:ring-lime-500"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-sage-800 dark:text-sage-100">
                    {idea.title}
                  </h3>
                  <p className="text-sm text-sage-600 dark:text-sage-300 mt-1">
                    {idea.summary}
                  </p>
                  {type === "exercise" && (
                    <div className="flex gap-2 mt-2">
                      {idea.area && (
                        <span className="text-xs px-2 py-1 bg-sage-200 dark:bg-sage-800 text-sage-700 dark:text-sage-300 rounded">
                          {idea.area}
                        </span>
                      )}
                      {idea.focus && (
                        <span className="text-xs px-2 py-1 bg-sage-200 dark:bg-sage-800 text-sage-700 dark:text-sage-300 rounded">
                          {idea.focus}
                        </span>
                      )}
                      {idea.difficulty && (
                        <span className="text-xs px-2 py-1 bg-sage-200 dark:bg-sage-800 text-sage-700 dark:text-sage-300 rounded">
                          {idea.difficulty}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleStartGeneration}
              disabled={starting || selectedCount === 0 || !!activeJob}
              className="px-6 py-3 btn-lime rounded-lg disabled:opacity-50 flex items-center gap-2"
            >
              {starting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Starte...
                </>
              ) : (
                <>
                  🚀 {selectedCount}{" "}
                  {type === "exercise" ? "Übungen" : "Stunden"} im Hintergrund
                  generieren
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Jobs */}
      {jobs.length > 0 && (
        <div className="bg-white dark:bg-sage-900 rounded-xl shadow-sm border border-sage-200 dark:border-sage-800 p-6">
          <h2 className="text-lg font-semibold text-sage-900 dark:text-sage-100 mb-4">
            Deine Jobs
          </h2>

          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className={`p-4 rounded-lg border ${
                  job.status === "processing"
                    ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20"
                    : job.status === "completed"
                      ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20"
                      : job.status === "failed"
                        ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20"
                        : "border-sage-200 dark:border-sage-800 bg-sage-50 dark:bg-sage-950"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {job.status === "processing" && "🔄"}
                      {job.status === "completed" && "✅"}
                      {job.status === "failed" && "❌"}
                      {job.status === "pending" && "⏳"}
                    </span>
                    <span className="font-medium text-sage-800 dark:text-sage-100">
                      {job.type === "exercise" ? "Übungen" : "Stunden"}
                    </span>
                    <span className="text-sm text-sage-500 dark:text-sage-400">
                      • {job.userPrompt.substring(0, 40)}
                      {job.userPrompt.length > 40 ? "..." : ""}
                    </span>
                  </div>
                  <span className="text-sm text-sage-500 dark:text-sage-400">
                    {new Date(job.createdAt.seconds * 1000).toLocaleDateString(
                      "de-DE",
                      {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-sage-600 dark:text-sage-300">
                      {job.completedCount} / {job.totalCount} fertig
                    </span>
                    <span className="text-sage-500 dark:text-sage-400">
                      {Math.round((job.completedCount / job.totalCount) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-sage-200 dark:bg-sage-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        job.status === "completed"
                          ? "bg-green-500"
                          : job.status === "failed"
                            ? "bg-red-500"
                            : "bg-lime-500"
                      }`}
                      style={{
                        width: `${(job.completedCount / job.totalCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Errors */}
                {job.errors.length > 0 && (
                  <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                    {job.errors.length} Fehler aufgetreten
                  </div>
                )}

                {/* Results Link */}
                {job.status === "completed" && job.generatedIds.length > 0 && (
                  <div className="mt-2">
                    <a
                      href={
                        job.type === "exercise"
                          ? "/admin/uebungen"
                          : "/admin/entwuerfe"
                      }
                      className="text-sm text-lime-600 dark:text-lime-400 hover:underline"
                    >
                      {job.generatedIds.length}{" "}
                      {job.type === "exercise" ? "Übungen" : "Entwürfe"} ansehen
                      →
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-sage-50 dark:bg-sage-950 rounded-xl p-6">
        <h3 className="font-medium text-sage-800 dark:text-sage-100 mb-2">
          Wie funktioniert der Bulk Generator?
        </h3>
        <ul className="text-sm text-sage-600 dark:text-sage-300 space-y-2">
          <li>
            • Gib eine Idee ein und lass dir mehrere Variationen generieren
          </li>
          <li>• Wähle aus welche du erstellen möchtest (max. 10 pro Job)</li>
          <li>
            • Die Generierung läuft im Hintergrund - du kannst die Seite
            schließen
          </li>
          <li>• Übungen werden direkt in die Bibliothek gespeichert</li>
          <li>
            • Stunden werden als Entwürfe gespeichert und müssen freigegeben
            werden
          </li>
          <li>• Nur ein aktiver Job pro User möglich</li>
        </ul>
      </div>
    </div>
  );
}
