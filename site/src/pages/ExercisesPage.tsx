import { Link } from "react-router-dom";

import Button from "../components/ui/Button";
import SearchBar from "../components/search/SearchBar";
import FilterPanel from "../components/search/FilterPanel";
import { useExerciseSearch } from "../hooks/useSearch";

// Get gradient based on exercise focus area
function getExerciseGradient(area?: string): string {
  const gradients: Record<string, string> = {
    Rücken:
      "linear-gradient(135deg, var(--color-sage-100) 0%, var(--color-sage-50) 100%)",
    Schulter:
      "linear-gradient(135deg, var(--color-phase-focus-bg) 0%, var(--color-sand-50) 100%)",
    Balance:
      "linear-gradient(135deg, var(--color-phase-cooldown-bg) 0%, var(--color-sage-50) 100%)",
    Ganzkörper:
      "linear-gradient(135deg, var(--color-sage-200) 0%, var(--color-sage-50) 100%)",
    Mobilisation:
      "linear-gradient(135deg, var(--color-phase-warmup-bg) 0%, var(--color-sand-50) 100%)",
    Dehnung:
      "linear-gradient(135deg, var(--color-phase-cooldown-bg) 0%, var(--color-sand-50) 100%)",
  };
  return (
    gradients[area || ""] ||
    "linear-gradient(135deg, var(--color-surface-muted) 0%, var(--color-surface) 100%)"
  );
}

function getAreaIcon(area?: string): string {
  const icons: Record<string, string> = {
    Rücken: "🌿",
    Schulter: "🌸",
    Balance: "🍃",
    Ganzkörper: "🌳",
    Mobilisation: "☀️",
    Dehnung: "🌙",
    Kräftigung: "💪",
    Koordination: "🎯",
  };
  return icons[area || ""] || "🌱";
}

function ExercisesPage(): JSX.Element {
  const {
    filteredExercises,
    query,
    setQuery,
    selectedPhases,
    setSelectedPhases,
    selectedDifficulty,
    setSelectedDifficulty,
    clearFilters,
    hasActiveFilters,
    loading,
  } = useExerciseSearch();

  if (loading) {
    return (
      <div className="container stack">
        <div className="exercises-empty animate-fade-up fill-backwards">
          <div className="exercises-empty-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="animate-spin"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
          <h2 className="exercises-empty-title">Lade Übungen...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container stack">
      {/* Page Header */}
      <header className="exercises-header animate-fade-up fill-backwards">
        <div className="exercises-header-content">
          <h1 className="exercises-title">Übungsbibliothek</h1>
          <p className="exercises-subtitle">
            {filteredExercises.length} dokumentierte Übungen mit Alternativen
            für Knie- und Schulterprobleme
          </p>
        </div>
        <div className="exercises-search animate-fade-up fill-backwards delay-100">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Übung suchen..."
          />
        </div>
      </header>

      {/* Filters */}
      <div className="animate-fade-up fill-backwards delay-200">
        <FilterPanel
          selectedPhases={selectedPhases}
          onPhasesChange={setSelectedPhases}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          onClear={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Results Info */}
      <div className="exercises-results-info animate-fade-up fill-backwards delay-300">
        <span className="exercises-results-count">
          {filteredExercises.length}{" "}
          {filteredExercises.length === 1 ? "Übung" : "Übungen"}
        </span>
        {hasActiveFilters && (
          <span className="exercises-results-filter">mit aktiven Filtern</span>
        )}
      </div>

      {/* Exercises Grid */}
      {filteredExercises.length > 0 ? (
        <ul className="exercises-grid" aria-label="Übungen">
          {filteredExercises.map((exercise, index) => {
            const delayClass =
              index < 6 ? `delay-${(index % 6) * 100 + 100}` : "";

            return (
              <li
                key={exercise.slug}
                className={`animate-fade-up fill-backwards ${delayClass}`}
              >
                <article className="exercise-card">
                  {/* Card Header with Gradient */}
                  <div
                    className="exercise-card-header"
                    style={{ background: getExerciseGradient(exercise.area) }}
                  >
                    <div className="exercise-card-area">
                      <span className="exercise-card-area-icon">
                        {getAreaIcon(exercise.area)}
                      </span>
                      <span className="exercise-card-area-name">
                        {exercise.area || "Übung"}
                      </span>
                    </div>
                    {exercise.difficulty && (
                      <div className="exercise-card-difficulty">
                        {exercise.difficulty}
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="exercise-card-body">
                    <h2 className="exercise-card-title">
                      <Link to={`/uebungen/${exercise.slug}`}>
                        {exercise.title}
                      </Link>
                    </h2>

                    {exercise.summary && (
                      <p className="exercise-card-description">
                        {exercise.summary}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="exercise-card-meta">
                      {exercise.focus && (
                        <div className="exercise-card-meta-item">
                          <span className="exercise-card-meta-label">
                            Schwerpunkt
                          </span>
                          <span className="exercise-card-meta-value">
                            {exercise.focus}
                          </span>
                        </div>
                      )}
                      {exercise.duration && (
                        <div className="exercise-card-meta-item">
                          <span className="exercise-card-meta-label">
                            Dauer
                          </span>
                          <span className="exercise-card-meta-value">
                            {exercise.duration}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {exercise.tags.length > 0 && (
                      <div className="exercise-card-tags">
                        {exercise.tags.slice(0, 3).map((tag) => (
                          <span
                            key={`${exercise.slug}-${tag}`}
                            className="exercise-card-tag"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CTA Link */}
                    <Link
                      to={`/uebungen/${exercise.slug}`}
                      className="exercise-card-link"
                    >
                      <span>Details ansehen</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="exercises-empty animate-fade-up fill-backwards">
          <div className="exercises-empty-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
          <h2 className="exercises-empty-title">Keine Übungen gefunden</h2>
          <p className="exercises-empty-text">
            Versuche andere Suchbegriffe oder ändere die Filter.
          </p>
          {hasActiveFilters && (
            <Button variant="secondary" onClick={clearFilters}>
              Filter zurücksetzen
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default ExercisesPage;
