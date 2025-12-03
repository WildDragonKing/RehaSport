import { Link, useParams } from "react-router-dom";

import MarkdownContent from "../components/MarkdownContent";
import Button from "../components/ui/Button";
import { getExercise } from "../content/exercises";

function ExerciseDetailPage(): JSX.Element {
  const { exerciseSlug } = useParams();
  const exercise = exerciseSlug ? getExercise(exerciseSlug) : undefined;

  if (!exercise) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="empty-state-icon">🏋️</div>
          <h1 className="empty-state-title">Übung nicht gefunden</h1>
          <p className="empty-state-description">
            Die angeforderte Übung existiert nicht.
          </p>
          <Button to="/uebungen" variant="secondary">
            Zur Übungsbibliothek
          </Button>
        </div>
      </div>
    );
  }

  // Find alternative sections
  const kneeSection = exercise.sections.find(s => s.title.toLowerCase().includes("knie"));
  const shoulderSection = exercise.sections.find(s => s.title.toLowerCase().includes("schulter"));
  const otherSections = exercise.sections.filter(s =>
    !s.title.toLowerCase().includes("knie") &&
    !s.title.toLowerCase().includes("schulter")
  );

  return (
    <div className="container stack">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Navigation">
        <Link to="/" className="breadcrumb-link">Start</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/uebungen" className="breadcrumb-link">Übungen</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{exercise.title}</span>
      </nav>

      {/* Page Header */}
      <header className="stack-sm">
        <h1>{exercise.title}</h1>
        {exercise.summary && (
          <p className="text-muted" style={{ fontSize: "1.125rem", maxWidth: "640px" }}>
            {exercise.summary}
          </p>
        )}

        {/* Tags */}
        {exercise.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {exercise.tags.map((tag) => (
              <span key={tag} className="badge badge-primary">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Quick Info Cards */}
      <div className="quick-info-grid">
        {exercise.area && (
          <div className="quick-info-card">
            <div className="quick-info-card-title">Bereich</div>
            <div className="quick-info-card-content">{exercise.area}</div>
          </div>
        )}
        {exercise.focus && (
          <div className="quick-info-card">
            <div className="quick-info-card-title">Schwerpunkt</div>
            <div className="quick-info-card-content">{exercise.focus}</div>
          </div>
        )}
        {exercise.difficulty && (
          <div className="quick-info-card">
            <div className="quick-info-card-title">Schwierigkeit</div>
            <div className="quick-info-card-content">{exercise.difficulty}</div>
          </div>
        )}
        {exercise.duration && (
          <div className="quick-info-card">
            <div className="quick-info-card-title">Dauer</div>
            <div className="quick-info-card-content">{exercise.duration}</div>
          </div>
        )}
      </div>

      {/* Alternatives Section (prominent) */}
      {(kneeSection || shoulderSection) && (
        <section className="stack-sm">
          <h2>Alternativen bei Beschwerden</h2>
          <div className="alternatives-grid">
            {kneeSection && (
              <div className="alternative-card alternative-card-knee">
                <div className="alternative-card-header">
                  <span className="alternative-card-icon">🦵</span>
                  <span className="alternative-card-title">Bei Kniebeschwerden</span>
                </div>
                <div className="alternative-card-content">
                  <MarkdownContent nodes={kneeSection.nodes} />
                </div>
              </div>
            )}
            {shoulderSection && (
              <div className="alternative-card alternative-card-shoulder">
                <div className="alternative-card-header">
                  <span className="alternative-card-icon">💪</span>
                  <span className="alternative-card-title">Bei Schulterbeschwerden</span>
                </div>
                <div className="alternative-card-content">
                  <MarkdownContent nodes={shoulderSection.nodes} />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Other Content Sections */}
      {otherSections.length > 0 && (
        <section className="stack">
          {otherSections.map((section) => (
            <article key={section.id} id={section.id} className="card card-body">
              <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>{section.title}</h2>
              <div style={{ color: "var(--color-text-muted)" }}>
                <MarkdownContent nodes={section.nodes} />
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Related Exercises */}
      {exercise.related.length > 0 && (
        <section className="stack-sm">
          <h2>Verwandte Übungen</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {exercise.related.map((relatedSlug) => {
              const related = getExercise(relatedSlug);
              if (!related) return null;
              return (
                <Link
                  key={related.slug}
                  to={`/uebungen/${related.slug}`}
                  className="chip"
                >
                  {related.title}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Navigation */}
      <div style={{ paddingTop: "1rem" }}>
        <Button to="/uebungen" variant="ghost">
          ← Alle Übungen
        </Button>
      </div>
    </div>
  );
}

export default ExerciseDetailPage;
