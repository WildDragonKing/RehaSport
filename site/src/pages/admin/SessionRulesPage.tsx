import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useAuth } from "../../contexts/AuthContext";

interface SessionPhaseConfig {
  id: string;
  name: string;
  duration: number; // in minutes
  description: string;
  minExercises: number;
  maxExercises: number;
}

interface SessionRulesConfig {
  totalDuration: number;
  phases: SessionPhaseConfig[];
  guidelines: string[];
  contraindications: string[];
  updatedAt: number;
  updatedBy: string;
}

const DEFAULT_CONFIG: SessionRulesConfig = {
  totalDuration: 45,
  phases: [
    {
      id: "warmup",
      name: "Aufwärmen",
      duration: 10,
      description: "Kreislauf aktivieren, Gelenke mobilisieren",
      minExercises: 3,
      maxExercises: 5,
    },
    {
      id: "main",
      name: "Hauptteil",
      duration: 15,
      description: "Kräftigung und funktionelle Übungen",
      minExercises: 4,
      maxExercises: 6,
    },
    {
      id: "focus",
      name: "Schwerpunkt",
      duration: 15,
      description: "Themenspezifische Übungen zum Tagesziel",
      minExercises: 3,
      maxExercises: 5,
    },
    {
      id: "cooldown",
      name: "Ausklang",
      duration: 5,
      description: "Dehnung, Entspannung, Atemübungen",
      minExercises: 2,
      maxExercises: 4,
    },
  ],
  guidelines: [
    "Jede Übung dokumentiert Alternativen für Knie- und Schulterbeschwerden",
    "Im Zweifel konservativ - medizinische Sicherheit hat Vorrang",
    "Klare Anweisungen zur Ausführung und Atmung",
    "Progression von einfach zu komplex innerhalb der Stunde",
  ],
  contraindications: [
    "Akute Schmerzen",
    "Fieber oder Infekte",
    "Stark erhöhter Blutdruck",
    "Schwindel oder Kreislaufprobleme",
  ],
  updatedAt: Date.now(),
  updatedBy: "",
};

export default function SessionRulesPage(): JSX.Element {
  const { user, isAdmin } = useAuth();
  const [config, setConfig] = useState<SessionRulesConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const docRef = doc(db, "config", "sessionRules");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConfig(docSnap.data() as SessionRulesConfig);
      }
    } catch (error) {
      console.error("Failed to load config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id || !isAdmin) return;

    setSaving(true);
    setMessage(null);

    try {
      const updatedConfig = {
        ...config,
        updatedAt: Date.now(),
        updatedBy: user.id,
      };

      await setDoc(doc(db, "config", "sessionRules"), updatedConfig);
      setConfig(updatedConfig);
      setMessage({ type: "success", text: "Einstellungen gespeichert!" });
    } catch (error) {
      console.error("Failed to save config:", error);
      setMessage({ type: "error", text: "Fehler beim Speichern" });
    } finally {
      setSaving(false);
    }
  };

  const updatePhase = (
    index: number,
    field: keyof SessionPhaseConfig,
    value: string | number,
  ) => {
    const newPhases = [...config.phases];
    newPhases[index] = { ...newPhases[index], [field]: value };
    setConfig({ ...config, phases: newPhases });
  };

  const addPhase = () => {
    const newPhase: SessionPhaseConfig = {
      id: `phase_${Date.now()}`,
      name: "Neue Phase",
      duration: 5,
      description: "",
      minExercises: 2,
      maxExercises: 4,
    };
    setConfig({ ...config, phases: [...config.phases, newPhase] });
  };

  const removePhase = (index: number) => {
    if (config.phases.length <= 1) return;
    const newPhases = config.phases.filter((_, i) => i !== index);
    setConfig({ ...config, phases: newPhases });
  };

  const movePhase = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= config.phases.length) return;
    const newPhases = [...config.phases];
    [newPhases[index], newPhases[newIndex]] = [
      newPhases[newIndex],
      newPhases[index],
    ];
    setConfig({ ...config, phases: newPhases });
  };

  const updateGuidelines = (text: string) => {
    const guidelines = text.split("\n").filter((line) => line.trim());
    setConfig({ ...config, guidelines });
  };

  const updateContraindications = (text: string) => {
    const contraindications = text.split("\n").filter((line) => line.trim());
    setConfig({ ...config, contraindications });
  };

  const totalPhaseDuration = config.phases.reduce(
    (sum, p) => sum + p.duration,
    0,
  );

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <p className="text-sage-600">
          Nur Administratoren können die Stunden-Regeln verwalten.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-sage-900">
            Stunden-Regeln
          </h1>
          <p className="mt-2 text-sage-600">
            Konfiguriere das Schema für Trainingsstunden
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
        >
          {saving ? "Speichern..." : "Speichern"}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}
        >
          {message.text}
        </div>
      )}

      {/* Duration Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-sage-200 p-6">
        <h2 className="text-lg font-semibold text-sage-900 mb-4">
          Gesamtdauer
        </h2>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1">
              Stundenlänge (Minuten)
            </label>
            <input
              type="number"
              value={config.totalDuration}
              onChange={(e) =>
                setConfig({
                  ...config,
                  totalDuration: parseInt(e.target.value) || 45,
                })
              }
              min={15}
              max={120}
              className="w-24 px-3 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500"
            />
          </div>
          <div
            className={`px-4 py-2 rounded-lg ${totalPhaseDuration === config.totalDuration ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}
          >
            <span className="font-medium">
              Phasen-Summe: {totalPhaseDuration} Min
            </span>
            {totalPhaseDuration !== config.totalDuration && (
              <span className="ml-2 text-sm">
                ({totalPhaseDuration > config.totalDuration ? "+" : ""}
                {totalPhaseDuration - config.totalDuration} Min)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Phases */}
      <div className="bg-white rounded-xl shadow-sm border border-sage-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-sage-900">Phasen</h2>
          <button
            onClick={addPhase}
            className="px-3 py-1.5 text-sm bg-sage-100 hover:bg-sage-200 text-sage-700 rounded-lg transition-colors"
          >
            + Phase hinzufügen
          </button>
        </div>

        <div className="space-y-4">
          {config.phases.map((phase, index) => (
            <div
              key={phase.id}
              className="p-4 bg-sage-50 rounded-lg border border-sage-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 flex items-center justify-center bg-sage-200 text-sage-700 text-sm font-medium rounded">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={phase.name}
                    onChange={(e) => updatePhase(index, "name", e.target.value)}
                    className="font-medium text-sage-800 bg-transparent border-b border-transparent hover:border-sage-300 focus:border-sage-500 focus:outline-none px-1"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => movePhase(index, "up")}
                    disabled={index === 0}
                    className="p-1 text-sage-400 hover:text-sage-600 disabled:opacity-30"
                    title="Nach oben"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => movePhase(index, "down")}
                    disabled={index === config.phases.length - 1}
                    className="p-1 text-sage-400 hover:text-sage-600 disabled:opacity-30"
                    title="Nach unten"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removePhase(index)}
                    disabled={config.phases.length <= 1}
                    className="p-1 text-red-400 hover:text-red-600 disabled:opacity-30 ml-2"
                    title="Entfernen"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs text-sage-600 mb-1">
                    Dauer (Min)
                  </label>
                  <input
                    type="number"
                    value={phase.duration}
                    onChange={(e) =>
                      updatePhase(
                        index,
                        "duration",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    min={1}
                    max={60}
                    className="w-full px-2 py-1.5 text-sm border border-sage-300 rounded focus:ring-1 focus:ring-sage-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-sage-600 mb-1">
                    Min. Übungen
                  </label>
                  <input
                    type="number"
                    value={phase.minExercises}
                    onChange={(e) =>
                      updatePhase(
                        index,
                        "minExercises",
                        parseInt(e.target.value) || 1,
                      )
                    }
                    min={1}
                    max={20}
                    className="w-full px-2 py-1.5 text-sm border border-sage-300 rounded focus:ring-1 focus:ring-sage-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-sage-600 mb-1">
                    Max. Übungen
                  </label>
                  <input
                    type="number"
                    value={phase.maxExercises}
                    onChange={(e) =>
                      updatePhase(
                        index,
                        "maxExercises",
                        parseInt(e.target.value) || 1,
                      )
                    }
                    min={1}
                    max={20}
                    className="w-full px-2 py-1.5 text-sm border border-sage-300 rounded focus:ring-1 focus:ring-sage-500"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-xs text-sage-600 mb-1">
                    Beschreibung
                  </label>
                  <input
                    type="text"
                    value={phase.description}
                    onChange={(e) =>
                      updatePhase(index, "description", e.target.value)
                    }
                    placeholder="Kurze Beschreibung..."
                    className="w-full px-2 py-1.5 text-sm border border-sage-300 rounded focus:ring-1 focus:ring-sage-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-white rounded-xl shadow-sm border border-sage-200 p-6">
        <h2 className="text-lg font-semibold text-sage-900 mb-4">
          Richtlinien
        </h2>
        <p className="text-sm text-sage-600 mb-3">Eine Richtlinie pro Zeile</p>
        <textarea
          value={config.guidelines.join("\n")}
          onChange={(e) => updateGuidelines(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500"
          placeholder="Richtlinien für die Stunden-Erstellung..."
        />
      </div>

      {/* Contraindications */}
      <div className="bg-white rounded-xl shadow-sm border border-sage-200 p-6">
        <h2 className="text-lg font-semibold text-sage-900 mb-4">
          Allgemeine Kontraindikationen
        </h2>
        <p className="text-sm text-sage-600 mb-3">
          Eine Kontraindikation pro Zeile
        </p>
        <textarea
          value={config.contraindications.join("\n")}
          onChange={(e) => updateContraindications(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-sage-500"
          placeholder="Wann sollte nicht trainiert werden..."
        />
      </div>

      {/* Preview */}
      <div className="bg-sage-50 rounded-xl border border-sage-200 p-6">
        <h2 className="text-lg font-semibold text-sage-900 mb-4">
          Vorschau: Stunden-Schema
        </h2>
        <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
          {config.phases.map((phase, index) => {
            const percentage = (phase.duration / config.totalDuration) * 100;
            const colors = [
              "bg-sage-300",
              "bg-sage-400",
              "bg-sage-500",
              "bg-sage-600",
              "bg-sage-700",
            ];
            return (
              <div
                key={phase.id}
                style={{ width: `${percentage}%` }}
                className={`${colors[index % colors.length]} flex items-center justify-center text-xs text-white font-medium`}
                title={`${phase.name}: ${phase.duration} Min`}
              >
                {phase.duration}′
              </div>
            );
          })}
        </div>
        <div className="flex gap-1 mt-2">
          {config.phases.map((phase, index) => {
            const percentage = (phase.duration / config.totalDuration) * 100;
            return (
              <div
                key={phase.id}
                style={{ width: `${percentage}%` }}
                className="text-xs text-sage-600 text-center truncate"
              >
                {phase.name}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
