import { Link, useParams } from "react-router-dom";

import MarkdownContent from "../components/MarkdownContent";
import Button from "../components/ui/Button";
import StarRating from "../components/ui/StarRating";
import { getExercise } from "../content/exercises";
import { useRatings } from "../hooks/useRatings";

function ExerciseDetailPage(): JSX.Element {
  const { exerciseSlug } = useParams();
  const exercise = exerciseSlug ? getExercise(exerciseSlug) : undefined;
  const { getRating, setRating } = useRatings();

  const currentRating = exerciseSlug ? getRating(exerciseSlug, "exercise") : null;

  const handleRate = (rating: number) => {
    if (exerciseSlug) {
      setRating(exerciseSlug, "exercise", rating);
    }
  };

  if (!exercise) {
    return (
      <div className="container">
        <div className="exercises-empty animate-fade-up fill-backwards">
          <div className="exercises-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6M9 9l6 6" />
            </svg>
          </div>
          <h1 className="exercises-empty-title">Übung nicht gefunden</h1>
          <p className="exercises-empty-text">
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
      <nav className="breadcrumb animate-fade-up fill-backwards" aria-label="Navigation">
        <Link to="/" className="breadcrumb-link">Start</Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/uebungen" className="breadcrumb-link">Übungen</Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{exercise.title}</span>
      </nav>

      {/* Page Header */}
      <header className="exercise-detail-header animate-fade-up fill-backwards delay-100">
        <h1 className="exercise-detail-title">{exercise.title}</h1>
        {exercise.summary && (
          <p className="exercise-detail-summary">{exercise.summary}</p>
        )}

        {/* Tags */}
        {exercise.tags.length > 0 && (
          <div className="exercise-detail-tags">
            {exercise.tags.map((tag) => (
              <span key={tag} className="exercise-card-tag">#{tag}</span>
            ))}
          </div>
        )}
      </header>

      {/* Quick Info Cards */}
      <div className="quick-info-grid animate-fade-up fill-backwards delay-200">
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
        <section className="stack-sm animate-fade-up fill-backwards delay-300">
          <h2 className="exercise-detail-section-title">Alternativen bei Beschwerden</h2>
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
        <section className="stack animate-fade-up fill-backwards delay-400">
          {otherSections.map((section) => (
            <article key={section.id} id={section.id} className="exercise-detail-section">
              <h2 className="exercise-detail-section-title">{section.title}</h2>
              <div className="exercise-detail-section-content">
                <MarkdownContent nodes={section.nodes} />
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Related Exercises */}
      {exercise.related.length > 0 && (
        <section className="stack-sm animate-fade-up fill-backwards delay-500">
          <h2 className="exercise-detail-section-title">Verwandte Übungen</h2>
          <div className="exercise-detail-related">
            {exercise.related.map((relatedSlug) => {
              const related = getExercise(relatedSlug);
              if (!related) return null;
              return (
                <Link
                  key={related.slug}
                  to={`/uebungen/${related.slug}`}
                  className="exercise-detail-related-link"
                >
                  {related.title}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Rating Section */}
      <section className="rating-card animate-fade-up fill-backwards">
        <div className="rating-card-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" style={{ color: "var(--color-rating-star)" }} />
          </svg>
          <span className="rating-card-title">Wie hilfreich war diese Übung?</span>
        </div>
        <p className="rating-card-subtitle">
          Gut bewertete Übungen dienen als Inspiration für neue Stunden.
        </p>
        <StarRating rating={currentRating} onRate={handleRate} size="md" />
      </section>

      {/* Navigation */}
      <div className="animate-fade-up fill-backwards">
        <Link to="/uebungen" className="category-back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Alle Übungen
        </Link>
      </div>
    </div>
  );
}

export default ExerciseDetailPage;
