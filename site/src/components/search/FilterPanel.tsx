import { PHASE_OPTIONS, DIFFICULTY_OPTIONS } from "../../hooks/useSearch";

interface FilterPanelProps {
  selectedPhases: string[];
  onPhasesChange: (phases: string[]) => void;
  selectedDifficulty: string | null;
  onDifficultyChange: (difficulty: string | null) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

function FilterPanel({
  selectedPhases,
  onPhasesChange,
  selectedDifficulty,
  onDifficultyChange,
  onClear,
  hasActiveFilters
}: FilterPanelProps): JSX.Element {
  const togglePhase = (phaseId: string) => {
    if (selectedPhases.includes(phaseId)) {
      onPhasesChange(selectedPhases.filter((p) => p !== phaseId));
    } else {
      onPhasesChange([...selectedPhases, phaseId]);
    }
  };

  return (
    <div className="stack-sm">
      {/* Phase Filter Chips */}
      <fieldset>
        <legend className="sr-only">Phase</legend>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {PHASE_OPTIONS.map((phase) => (
            <label
              key={phase.id}
              className={`chip ${selectedPhases.includes(phase.id) ? "chip-active" : ""}`}
            >
              <input
                type="checkbox"
                checked={selectedPhases.includes(phase.id)}
                onChange={() => togglePhase(phase.id)}
                className="sr-only"
              />
              <span className="phase-dot" style={{
                backgroundColor: phase.id === "aufwärmen" ? "var(--color-phase-warmup)" :
                  phase.id === "hauptteil" ? "var(--color-phase-main)" :
                  phase.id === "schwerpunkt" ? "var(--color-phase-focus)" :
                  "var(--color-phase-cooldown)"
              }} />
              {phase.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Difficulty & Clear */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" }}>
        <fieldset>
          <legend className="sr-only">Schwierigkeit</legend>
          <select
            className="input"
            style={{ minWidth: "180px", width: "auto" }}
            value={selectedDifficulty || ""}
            onChange={(e) => onDifficultyChange(e.target.value || null)}
          >
            <option value="">Alle Schwierigkeiten</option>
            {DIFFICULTY_OPTIONS.map((diff) => (
              <option key={diff} value={diff}>
                {diff}
              </option>
            ))}
          </select>
        </fieldset>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClear}
          >
            Filter zurücksetzen
          </button>
        )}
      </div>
    </div>
  );
}

export default FilterPanel;
