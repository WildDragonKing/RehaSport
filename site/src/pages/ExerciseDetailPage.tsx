import { Link, useParams } from "react-router-dom";

import MarkdownContent from "../components/MarkdownContent";
import Button from "../components/ui/Button";
import { getExercise } from "../content/exercises";

function ExerciseDetailPage(): JSX.Element {
  const { exerciseSlug } = useParams();
  const exercise = exerciseSlug ? getExercise(exerciseSlug) : undefined;

  if (!exercise) {
    return (
      <div className="container stack">
        <header className="page-header">
          <h1>Übung nicht gefunden</h1>
          <p className="page-lead">Die angeforderte Übung existiert nicht.</p>
        </header>
        <Button to="/uebungen" variant="secondary">
          Zur Übersicht
        </Button>
      </div>
    );
  }

  return (
    <div className="container stack">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Navigation">
        <ol>
          <li>
            <Link to="/">Start</Link>
          </li>
          <li>
            <Link to="/uebungen">Übungen</Link>
          </li>
          <li aria-current="page">{exercise.title}</li>
        </ol>
      </nav>

      {/* Page Header */}
      <header className="page-header">
        <p className="page-eyebrow">Übung</p>
        <h1>{exercise.title}</h1>
        {exercise.summary ? <p className="page-lead">{exercise.summary}</p> : null}

        {/* Meta Info */}
        <dl className="session-info">
          {exercise.area ? (
            <div>
              <dt>Bereich</dt>
              <dd>{exercise.area}</dd>
            </div>
          ) : null}
          {exercise.focus ? (
            <div>
              <dt>Schwerpunkt</dt>
              <dd>{exercise.focus}</dd>
            </div>
          ) : null}
          {exercise.duration ? (
            <div>
              <dt>Dauer</dt>
              <dd>{exercise.duration}</dd>
            </div>
          ) : null}
          {exercise.difficulty ? (
            <div>
              <dt>Schwierigkeit</dt>
              <dd>{exercise.difficulty}</dd>
            </div>
          ) : null}
        </dl>

        {/* Tags */}
        {exercise.tags.length > 0 ? (
          <ul className="tag-list" aria-label="Tags">
            {exercise.tags.map((tag) => (
              <li key={`${exercise.slug}-tag-${tag}`} className="tag">
                #{tag}
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      {/* Content Sections */}
      <section className="exercise-content">
        {exercise.sections.map((section) => (
          <article key={section.id} id={section.id} className="exercise-section">
            <h2>{section.title}</h2>
            <MarkdownContent nodes={section.nodes} />
          </article>
        ))}
      </section>

      {/* Related Exercises */}
      {exercise.related.length > 0 ? (
        <section className="exercise-related">
          <h2>Verwandte Übungen</h2>
          <ul className="exercise-related__list">
            {exercise.related.map((relatedSlug) => {
              const related = getExercise(relatedSlug);
              if (!related) return null;
              return (
                <li key={related.slug}>
                  <Link to={`/uebungen/${related.slug}`}>{related.title}</Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* Navigation */}
      <div className="exercise-navigation">
        <Button to="/uebungen" variant="secondary">
          Alle Übungen
        </Button>
      </div>
    </div>
  );
}

export default ExerciseDetailPage;
