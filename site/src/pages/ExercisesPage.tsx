import { Link } from "react-router-dom";

import Button from "../components/ui/Button";
import SearchBar from "../components/search/SearchBar";
import FilterPanel from "../components/search/FilterPanel";
import { useExerciseSearch } from "../hooks/useSearch";

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
    hasActiveFilters
  } = useExerciseSearch();

  return (
    <div className="container stack">
      {/* Page Header with Search */}
      <header className="stack-sm">
        <h1>Übungsbibliothek</h1>
        <p className="text-muted" style={{ maxWidth: "600px" }}>
          Alle dokumentierten Übungen mit Alternativen für Knie- und Schulterprobleme.
        </p>
        <div style={{ maxWidth: "480px" }}>
          <SearchBar value={query} onChange={setQuery} />
        </div>
      </header>

      {/* Filters */}
      <FilterPanel
        selectedPhases={selectedPhases}
        onPhasesChange={setSelectedPhases}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={setSelectedDifficulty}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Results Count */}
      <p className="text-muted" style={{ fontSize: "0.875rem" }}>
        {filteredExercises.length} {filteredExercises.length === 1 ? "Übung" : "Übungen"} gefunden
      </p>

      {/* Exercises Grid */}
      {filteredExercises.length > 0 ? (
        <ul className="grid-exercises" aria-label="Übungen">
          {filteredExercises.map((exercise) => (
            <li key={exercise.slug}>
              <article className="card card-hover card-body" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <header style={{ flex: 1 }}>
                  <h2 style={{ fontSize: "1.125rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                    <Link
                      to={`/uebungen/${exercise.slug}`}
                      style={{ color: "var(--color-text)" }}
                    >
                      {exercise.title}
                    </Link>
                  </h2>
                  {exercise.summary && (
                    <p className="text-muted" style={{ fontSize: "0.9375rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {exercise.summary}
                    </p>
                  )}
                </header>

                {/* Meta Grid */}
                <dl style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem", marginTop: "1rem", fontSize: "0.875rem" }}>
                  {exercise.area && (
                    <div>
                      <dt className="text-light" style={{ fontSize: "0.75rem" }}>Bereich</dt>
                      <dd style={{ fontWeight: 500 }}>{exercise.area}</dd>
                    </div>
                  )}
                  {exercise.focus && (
                    <div>
                      <dt className="text-light" style={{ fontSize: "0.75rem" }}>Schwerpunkt</dt>
                      <dd style={{ fontWeight: 500 }}>{exercise.focus}</dd>
                    </div>
                  )}
                  {exercise.duration && (
                    <div>
                      <dt className="text-light" style={{ fontSize: "0.75rem" }}>Dauer</dt>
                      <dd style={{ fontWeight: 500 }}>{exercise.duration}</dd>
                    </div>
                  )}
                  {exercise.difficulty && (
                    <div>
                      <dt className="text-light" style={{ fontSize: "0.75rem" }}>Schwierigkeit</dt>
                      <dd style={{ fontWeight: 500 }}>{exercise.difficulty}</dd>
                    </div>
                  )}
                </dl>

                {/* Tags */}
                {exercise.tags.length > 0 && (
                  <ul style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginTop: "1rem" }}>
                    {exercise.tags.slice(0, 3).map((tag) => (
                      <li key={`${exercise.slug}-${tag}`} className="badge badge-primary">
                        #{tag}
                      </li>
                    ))}
                  </ul>
                )}

                {/* CTA */}
                <div style={{ marginTop: "1rem" }}>
                  <Button to={`/uebungen/${exercise.slug}`} size="sm">
                    Details ansehen
                  </Button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h2 className="empty-state-title">Keine Übungen gefunden</h2>
          <p className="empty-state-description">
            Versuche andere Suchbegriffe oder Filter.
          </p>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters}>
              Filter zurücksetzen
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default ExercisesPage;
